from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Feedback
from .models import Subject, Module, Quiz, Question, ViewedTopic, QuizAttempt
from .models import AuthorProfile
from django.core.files.storage import default_storage
from .models import StudyMaterial
from .models import Follow
from .models import AuthorMaterialView, AuthorQuizAttempt  # 🆕

User = get_user_model()


# ---------------- AUTH ----------------

@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role', 'student')

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "User already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=role
    )

    return Response({
        "message": "Account created",
        "username": user.username,
        "role": user.role
    })


@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        return Response({
            "message": "Login success",
            "username": user.username,
            "role": user.role
        })

    return Response(
        {"error": "Invalid credentials"},
        status=status.HTTP_401_UNAUTHORIZED
    )


# ---------------- SUBJECTS ----------------

@api_view(['GET'])
def get_subjects(request):
    subjects = Subject.objects.all()
    data = []
    for subject in subjects:
        data.append({
            "id": subject.id,
            "title": subject.title,
            "description": subject.description
        })
    return Response(data)


# ---------------- MODULES ----------------

@api_view(['GET'])
def get_modules(request, subject_id):
    modules = Module.objects.filter(subject_id=subject_id)
    data = []
    for module in modules:
        data.append({
            "id": module.id,
            "title": module.title,
            "content": module.content,
            "subject_title": module.subject.title
        })
    return Response(data)


# ---------------- QUIZZES ----------------

@api_view(['GET'])
def get_quizzes(request, module_id):
    quizzes = Quiz.objects.filter(module_id=module_id)
    data = []
    for quiz in quizzes:
        data.append({
            "id": quiz.id,
            "title": quiz.title
        })
    return Response(data)


# ---------------- QUIZ PAGE ----------------

@api_view(['GET'])
def get_quiz(request, id):
    quiz = Quiz.objects.get(id=id)
    questions = Question.objects.filter(quiz=quiz)

    data = {
        "id": quiz.id,
        "title": quiz.title,
        "questions": []
    }

    for q in questions:
        data["questions"].append({
            "id": q.id,
            "question": q.question,
            "options": [q.option1, q.option2, q.option3, q.option4],
            "answer": q.correct_answer
        })

    return Response(data)


# ---------------- SAVE VIEWED TOPIC (Admin material) ----------------

@api_view(['POST'])
def save_viewed_topic(request):
    username = request.data.get("username")
    subject_id = request.data.get("subject_id")

    try:
        user = User.objects.get(username=username)
        subject = Subject.objects.get(id=subject_id)

        ViewedTopic.objects.update_or_create(
            user=user,
            subject=subject
        )

        return Response({"message": "Viewed topic saved"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ---------------- GET VIEWED TOPICS ----------------

@api_view(['GET'])
def get_viewed_topics(request, username):
    try:
        user = User.objects.get(username=username)
        history = ViewedTopic.objects.filter(user=user)
        data = []
        for item in history:
            data.append({
                "subject_id": item.subject.id,
                "title": item.subject.title,
                "viewed_at": item.viewed_at
            })
        return Response(data)
    except:
        return Response([])


# ---------------- SAVE QUIZ ATTEMPT (Admin quiz) ----------------

@api_view(['POST'])
def save_quiz_attempt(request):
    username = request.data.get("username")
    quiz_id = request.data.get("quiz_id")
    score = request.data.get("score")
    total = request.data.get("total")

    try:
        user = User.objects.get(username=username)
        quiz = Quiz.objects.get(id=quiz_id)

        QuizAttempt.objects.create(
            user=user,
            quiz=quiz,
            score=score,
            total_questions=total
        )

        return Response({"message": "Quiz attempt saved"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ---------------- GET QUIZ HISTORY ----------------

@api_view(['GET'])
def get_attempted_quizzes(request, username):
    try:
        user = User.objects.get(username=username)
        attempts = QuizAttempt.objects.filter(user=user)
        data = []
        for a in attempts:
            data.append({
                "quiz_title": a.quiz.title,
                "subject_title": a.quiz.module.subject.title,
                "subject_id": a.quiz.module.subject.id,
                "score": a.score,
                "total": a.total_questions,
                "attempted_at": a.attempted_at
            })
        return Response(data)
    except:
        return Response([])


# ---------------- 🆕 SAVE AUTHOR MATERIAL VIEW ----------------

@api_view(['POST'])
def save_author_material_view(request):
    """
    Call this when student opens/views any author study material.
    Tracks unique views per student per material.
    """
    username = request.data.get("username")
    material_id = request.data.get("material_id")
    material_title = request.data.get("material_title", "")

    try:
        user = User.objects.get(username=username)

        AuthorMaterialView.objects.update_or_create(
            user=user,
            material_id=material_id,
            defaults={"material_title": material_title}
        )

        return Response({"message": "Author material view saved"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ---------------- 🆕 SAVE AUTHOR QUIZ ATTEMPT ----------------

@api_view(['POST'])
def save_author_quiz_attempt(request):
    """
    Call this when student submits an author quiz.
    Saves every attempt with score.
    """
    username = request.data.get("username")
    quiz_id = request.data.get("quiz_id")
    quiz_title = request.data.get("quiz_title", "")
    score = request.data.get("score", 0)
    total_marks = request.data.get("total_marks", 0)

    try:
        user = User.objects.get(username=username)

        AuthorQuizAttempt.objects.create(
            user=user,
            quiz_id=quiz_id,
            quiz_title=quiz_title,
            score=score,
            total_marks=total_marks
        )

        return Response({"message": "Author quiz attempt saved"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ---------------- 🆕 UPDATED STUDENT ANALYTICS ----------------

@api_view(['GET'])
def student_analytics(request, username):
    """
    Now counts BOTH admin content AND author content.
    - topics_viewed     = admin subjects viewed + author materials viewed
    - quizzes_attempted = admin quizzes + author quizzes
    - certifications    = course completions
    """
    try:
        user = User.objects.get(username=username)

        # Admin content counts
        admin_topics = ViewedTopic.objects.filter(user=user).count()
        admin_quizzes = QuizAttempt.objects.filter(user=user).count()

        # Author content counts
        author_topics = AuthorMaterialView.objects.filter(user=user).count()
        author_quizzes = AuthorQuizAttempt.objects.filter(user=user).count()

        # Certifications — import here to avoid circular import
        try:
            from courses.models import CourseCompletion
            certification_count = CourseCompletion.objects.filter(user=user).count()
        except Exception:
            certification_count = 0

        data = {
            "topics_viewed": admin_topics + author_topics,
            "quizzes_attempted": admin_quizzes + author_quizzes,
            "certifications": certification_count,

            # breakdown for detailed view (optional use in frontend)
            "breakdown": {
                "admin_topics": admin_topics,
                "author_topics": author_topics,
                "admin_quizzes": admin_quizzes,
                "author_quizzes": author_quizzes,
            }
        }

        return Response(data)

    except Exception:
        return Response({
            "topics_viewed": 0,
            "quizzes_attempted": 0,
            "certifications": 0,
            "breakdown": {
                "admin_topics": 0,
                "author_topics": 0,
                "admin_quizzes": 0,
                "author_quizzes": 0,
            }
        })


# ---------------- 🆕 STUDENT LEADERBOARD ----------------

@api_view(['GET'])
def student_leaderboard(request):
    """
    Returns top students ranked by:
    score = (topics_viewed * 1) + (quizzes_attempted * 2) + (certifications * 5)
    """
    try:
        students = User.objects.filter(role="student")

        try:
            from courses.models import CourseCompletion
        except Exception:
            CourseCompletion = None

        leaderboard = []

        for student in students:
            admin_topics = ViewedTopic.objects.filter(user=student).count()
            author_topics = AuthorMaterialView.objects.filter(user=student).count()
            admin_quizzes = QuizAttempt.objects.filter(user=student).count()
            author_quizzes = AuthorQuizAttempt.objects.filter(user=student).count()

            certs = 0
            if CourseCompletion:
                certs = CourseCompletion.objects.filter(user=student).count()

            total_topics = admin_topics + author_topics
            total_quizzes = admin_quizzes + author_quizzes

            # Scoring formula
            score = (total_topics * 1) + (total_quizzes * 2) + (certs * 5)

            leaderboard.append({
                "username": student.username,
                "topics_viewed": total_topics,
                "quizzes_attempted": total_quizzes,
                "certifications": certs,
                "score": score,
            })

        # Sort by score descending
        leaderboard.sort(key=lambda x: x["score"], reverse=True)

        # Add rank
        for i, entry in enumerate(leaderboard):
            entry["rank"] = i + 1

        return Response(leaderboard)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@csrf_exempt
def submit_feedback(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username", "")
        role = data.get("role", "")
        message = data.get("message", "")

        Feedback.objects.create(
            username=username,
            role=role,
            message=message
        )

        return JsonResponse({"status": "success"})

    return JsonResponse({"error": "Invalid request"})


# ---------------- GET AUTHOR PROFILE ----------------

@api_view(['GET'])
def get_author_profile(request, username):
    try:
        user = User.objects.get(username=username)
        profile, created = AuthorProfile.objects.get_or_create(user=user)

        image_url = None
        if profile.profile_image:
            image_url = request.build_absolute_uri(profile.profile_image.url)

        follower_count = Follow.objects.filter(author=user).count()

        data = {
            "name": profile.name,
            "bio": profile.bio,
            "education": profile.education,
            "experience": profile.experience,
            "skills": profile.skills,
            "profile_image": image_url,
            "follower_count": follower_count,
        }

        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ---------------- SAVE AUTHOR PROFILE ----------------

@api_view(['POST'])
def save_author_profile(request):
    username = request.data.get("username")

    try:
        user = User.objects.get(username=username)
        profile, created = AuthorProfile.objects.get_or_create(user=user)

        profile.name = request.data.get("name", "")
        profile.bio = request.data.get("bio", "")
        profile.education = request.data.get("education", "")
        profile.experience = request.data.get("experience", "")
        profile.skills = request.data.get("skills", "")

        if "profile_image" in request.FILES:
            profile.profile_image = request.FILES["profile_image"]

        profile.save()

        return Response({"message": "Profile saved successfully"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
def delete_author_image(request):
    username = request.data.get("username")

    try:
        user = User.objects.get(username=username)
        profile = AuthorProfile.objects.get(user=user)

        if profile.profile_image:
            profile.profile_image.delete(save=False)
            profile.profile_image = None
            profile.save()

        return Response({"message": "Image deleted"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ---------------- UPLOAD STUDY MATERIAL ----------------

@api_view(['POST'])
def upload_study_material(request):
    try:
        username = request.data.get("username")
        user = User.objects.get(username=username)

        title = request.data.get("title")
        subject = request.data.get("subject")
        description = request.data.get("description")
        content = request.data.get("content")
        file = request.FILES.get("file")

        StudyMaterial.objects.create(
            user=user,
            title=title,
            subject=subject,
            description=description,
            content=content if content else "",
            file=file if file else None
        )

        return Response({"message": "Material uploaded successfully"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ---------------- FOLLOW SYSTEM ----------------

@api_view(['POST'])
def follow_author(request):
    try:
        follower_username = request.data.get("follower")
        author_username = request.data.get("author")

        follower = User.objects.get(username=follower_username)
        author = User.objects.get(username=author_username)

        if follower == author:
            return Response({"error": "Cannot follow yourself"}, status=400)

        if author.role != "author":
            return Response({"error": "Can only follow authors"}, status=400)

        follow, created = Follow.objects.get_or_create(
            follower=follower,
            author=author
        )

        if created:
            return Response({"message": "Followed successfully", "following": True})
        else:
            return Response({"message": "Already following", "following": True})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
def unfollow_author(request):
    try:
        follower_username = request.data.get("follower")
        author_username = request.data.get("author")

        follower = User.objects.get(username=follower_username)
        author = User.objects.get(username=author_username)

        Follow.objects.filter(follower=follower, author=author).delete()

        return Response({"message": "Unfollowed successfully", "following": False})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def check_follow_status(request, follower, author):
    try:
        follower_user = User.objects.get(username=follower)
        author_user = User.objects.get(username=author)

        is_following = Follow.objects.filter(
            follower=follower_user,
            author=author_user
        ).exists()

        return Response({"following": is_following})

    except User.DoesNotExist:
        return Response({"following": False})


@api_view(['GET'])
def get_author_followers(request, username):
    try:
        author = User.objects.get(username=username)
        followers = Follow.objects.filter(author=author).select_related("follower")

        data = []
        for f in followers:
            data.append({
                "username": f.follower.username,
                "followed_at": f.followed_at,
            })

        return Response({
            "author": username,
            "follower_count": len(data),
            "followers": data
        })

    except User.DoesNotExist:
        return Response({"error": "Author not found"}, status=404)


@api_view(['GET'])
def get_all_authors(request):
    try:
        authors = User.objects.filter(role="author")
        data = []

        for author in authors:
            profile = AuthorProfile.objects.filter(user=author).first()
            follower_count = Follow.objects.filter(author=author).count()

            image_url = None
            if profile and profile.profile_image:
                image_url = request.build_absolute_uri(profile.profile_image.url)

            data.append({
                "username": author.username,
                "name": profile.name if profile else author.username,
                "bio": profile.bio if profile else "",
                "profile_image": image_url,
                "follower_count": follower_count,
            })

        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)