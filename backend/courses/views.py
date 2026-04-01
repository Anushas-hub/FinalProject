from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
import uuid

from .models import Course, CourseModule, CourseQuiz, CourseQuestion
from .models import QuizCompletion, CourseCompletion
from .serializers import CourseSerializer

User = get_user_model()


# ── Course List ────────────────────────────────────────────────────
@api_view(["GET"])
def courses_list(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True, context={"request": request})
    return Response(serializer.data)


# ── Course Detail ──────────────────────────────────────────────────
@api_view(["GET"])
def course_detail(request, id):
    try:
        course = Course.objects.get(id=id)
        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)


# ── Quiz Detail ────────────────────────────────────────────────────
@api_view(["GET"])
def course_quiz_detail(request, id):
    try:
        quiz = CourseQuiz.objects.get(id=id)
        questions = CourseQuestion.objects.filter(quiz=quiz)

        question_data = []
        for q in questions:
            question_data.append({
                "id": q.id,
                "question": q.question,
                "option1": q.option1,
                "option2": q.option2,
                "option3": q.option3,
                "option4": q.option4,
                "correct_answer": q.correct_answer,
            })

        return Response({
            "id": quiz.id,
            "title": quiz.title,
            "pass_percentage": quiz.pass_percentage,
            "module_title": quiz.module.title,
            "course_id": quiz.module.course.id,
            "course_title": quiz.module.course.title,
            "questions": question_data,
        })

    except CourseQuiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)


# ── Submit Quiz & Save Completion ──────────────────────────────────
@api_view(["POST"])
def submit_quiz(request):
    """
    Student submits quiz answers.
    Saves QuizCompletion record if passed.
    Returns score, passed status, and updated course progress.
    """
    try:
        username = request.data.get("username")
        quiz_id = request.data.get("quiz_id")
        answers = request.data.get("answers", {})  # { "question_id": "selected_option" }

        user = User.objects.get(username=username)
        quiz = CourseQuiz.objects.get(id=quiz_id)
        questions = CourseQuestion.objects.filter(quiz=quiz)

        score = 0
        total = questions.count()
        results = []

        for q in questions:
            selected = answers.get(str(q.id), "")
            is_correct = selected.strip() == q.correct_answer.strip()
            if is_correct:
                score += 1
            results.append({
                "question": q.question,
                "selected": selected,
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
            })

        percentage = round((score / total) * 100, 1) if total > 0 else 0
        passed = percentage >= quiz.pass_percentage

        # Save or update completion
        QuizCompletion.objects.update_or_create(
            user=user,
            quiz=quiz,
            defaults={
                "score": score,
                "total": total,
                "passed": passed,
            }
        )

        # Check if course is now fully completable
        course = quiz.module.course
        all_quizzes = CourseQuiz.objects.filter(module__course=course)
        passed_quizzes = QuizCompletion.objects.filter(
            user=user, quiz__in=all_quizzes, passed=True
        ).count()

        total_quizzes = all_quizzes.count()
        course_progress = round((passed_quizzes / total_quizzes) * 100, 1) if total_quizzes > 0 else 0
        certificate_unlocked = course_progress >= 70

        return Response({
            "score": score,
            "total": total,
            "percentage": percentage,
            "passed": passed,
            "pass_percentage": quiz.pass_percentage,
            "results": results,
            "course_progress": course_progress,
            "certificate_unlocked": certificate_unlocked,
        })

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except CourseQuiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ── Get Student Progress for a Course ─────────────────────────────
@api_view(["GET"])
def get_course_progress(request, course_id, username):
    """
    Returns which quizzes the student has passed and overall % progress.
    """
    try:
        user = User.objects.get(username=username)
        course = Course.objects.get(id=course_id)

        all_quizzes = CourseQuiz.objects.filter(module__course=course)
        completions = QuizCompletion.objects.filter(user=user, quiz__in=all_quizzes)

        passed_ids = list(
            completions.filter(passed=True).values_list("quiz_id", flat=True)
        )
        total_quizzes = all_quizzes.count()
        passed_count = len(passed_ids)
        progress = round((passed_count / total_quizzes) * 100, 1) if total_quizzes > 0 else 0
        certificate_unlocked = progress >= 70

        # Check if already completed/certified
        completion = CourseCompletion.objects.filter(user=user, course=course).first()

        return Response({
            "passed_quiz_ids": passed_ids,
            "passed_count": passed_count,
            "total_quizzes": total_quizzes,
            "progress": progress,
            "certificate_unlocked": certificate_unlocked,
            "already_certified": completion is not None,
            "certificate_id": completion.certificate_id if completion else None,
        })

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ── Generate Certificate ───────────────────────────────────────────
@api_view(["POST"])
def generate_certificate(request):
    """
    Called when student claims certificate after 70%+ progress.
    Creates CourseCompletion with unique cert ID.
    """
    try:
        username = request.data.get("username")
        course_id = request.data.get("course_id")

        user = User.objects.get(username=username)
        course = Course.objects.get(id=course_id)

        # Verify eligibility
        all_quizzes = CourseQuiz.objects.filter(module__course=course)
        passed_count = QuizCompletion.objects.filter(
            user=user, quiz__in=all_quizzes, passed=True
        ).count()
        total_quizzes = all_quizzes.count()
        progress = round((passed_count / total_quizzes) * 100, 1) if total_quizzes > 0 else 0

        if progress < 70:
            return Response(
                {"error": "Complete at least 70% quizzes to earn certificate"},
                status=400
            )

        # Create or get existing
        cert_id = f"SS-{uuid.uuid4().hex[:10].upper()}"
        completion, created = CourseCompletion.objects.get_or_create(
            user=user,
            course=course,
            defaults={"certificate_id": cert_id}
        )

        return Response({
            "message": "Certificate generated successfully!",
            "certificate_id": completion.certificate_id,
            "course_title": course.title,
            "student_name": username,
            "completed_at": completion.completed_at,
        })

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ── Get Certificate Data ───────────────────────────────────────────
@api_view(["GET"])
def get_certificate(request, certificate_id):
    """
    Fetch certificate data by certificate_id for preview/download.
    """
    try:
        completion = CourseCompletion.objects.select_related("user", "course").get(
            certificate_id=certificate_id
        )

        return Response({
            "certificate_id": completion.certificate_id,
            "student_name": completion.user.username,
            "course_title": completion.course.title,
            "certificate_title": completion.course.certificate_title or completion.course.title,
            "completed_at": completion.completed_at,
            "issued_by": "SmartStudy",
        })

    except CourseCompletion.DoesNotExist:
        return Response({"error": "Certificate not found"}, status=404)


# ── Student's All Certifications ───────────────────────────────────
@api_view(["GET"])
def get_my_certifications(request, username):
    try:
        user = User.objects.get(username=username)
        completions = CourseCompletion.objects.filter(user=user).select_related("course")

        data = []
        for c in completions:
            data.append({
                "certificate_id": c.certificate_id,
                "course_title": c.course.title,
                "completed_at": c.completed_at,
            })

        return Response(data)

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)