from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import AuthorStudyMaterial, AuthorQuiz, QuizQuestion
from django.http import FileResponse

User = get_user_model()


# ================= MATERIAL SYSTEM (UNCHANGED) =================

@api_view(['POST'])
def upload_material(request):
    try:
        username = request.data.get("username")
        user = User.objects.get(username=username)

        if user.role != "author":
            return Response({"error": "Only authors can upload"}, status=403)

        AuthorStudyMaterial.objects.create(
            user=user,
            title=request.data.get("title"),
            subject=request.data.get("subject"),
            description=request.data.get("description"),
            course=request.data.get("course"),
            semester=request.data.get("semester"),
            content=request.data.get("content", ""),
            file=request.FILES.get("file")
        )

        return Response({"message": "Material uploaded successfully"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def get_my_materials(request, username):
    try:
        user = User.objects.get(username=username)
        materials = AuthorStudyMaterial.objects.filter(user=user)

        data = []

        for m in materials:
            file_url = (
                request.build_absolute_uri(f"/api/author/view-pdf/{m.id}/")
                if m.file else None
            )

            data.append({
                "id": m.id,
                "title": m.title,
                "subject": m.subject,
                "course": m.course,
                "semester": m.semester,
                "description": m.description,
                "content": m.content,
                "file": file_url,
                "created_at": m.created_at
            })

        return Response(data)

    except:
        return Response([])


def view_pdf(request, material_id):
    try:
        material = AuthorStudyMaterial.objects.get(id=material_id)

        response = FileResponse(material.file.open('rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{material.file.name}"'

        return response

    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(['DELETE'])
def delete_material(request, material_id):
    try:
        material = AuthorStudyMaterial.objects.get(id=material_id)

        if material.file:
            material.file.delete()

        material.delete()

        return Response({"message": "Deleted successfully"})

    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['PUT'])
def update_material(request, material_id):
    try:
        material = AuthorStudyMaterial.objects.get(id=material_id)

        material.title = request.data.get("title", material.title)
        material.subject = request.data.get("subject", material.subject)
        material.description = request.data.get("description", material.description)
        material.content = request.data.get("content", material.content)
        material.course = request.data.get("course", material.course)
        material.semester = request.data.get("semester", material.semester)

        remove_file = request.data.get("remove_file")

        if remove_file == "true":
            if material.file:
                material.file.delete()
                material.file = None

        elif request.FILES.get("file"):
            if material.file:
                material.file.delete()
            material.file = request.FILES.get("file")

        material.save()

        return Response({"message": "Material updated successfully"})

    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ================= QUIZ SYSTEM (NEW) =================

# -------- CREATE QUIZ --------
@api_view(['POST'])
def create_quiz(request):
    try:
        username = request.data.get("username")
        user = User.objects.get(username=username)

        if user.role != "author":
            return Response({"error": "Only authors can create quiz"}, status=403)

        material_id = request.data.get("material_id")

        linked_material = None
        if material_id:
            linked_material = AuthorStudyMaterial.objects.get(id=material_id)

        quiz = AuthorQuiz.objects.create(
            user=user,
            title=request.data.get("title"),
            description=request.data.get("description"),
            difficulty=request.data.get("difficulty"),
            time_limit=request.data.get("time_limit"),
            linked_material=linked_material
        )

        return Response({
            "message": "Quiz created successfully",
            "quiz_id": quiz.id
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# -------- ADD QUESTIONS --------
@api_view(['POST'])
def add_question(request):
    try:
        quiz_id = request.data.get("quiz_id")
        quiz = AuthorQuiz.objects.get(id=quiz_id)

        QuizQuestion.objects.create(
            quiz=quiz,
            question=request.data.get("question"),
            option_a=request.data.get("option_a"),
            option_b=request.data.get("option_b"),
            option_c=request.data.get("option_c"),
            option_d=request.data.get("option_d"),
            correct_answer=request.data.get("correct_answer"),
            marks=request.data.get("marks"),
            explanation=request.data.get("explanation", "")
        )

        return Response({"message": "Question added successfully"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# -------- GET MY QUIZZES --------
@api_view(['GET'])
def get_my_quizzes(request, username):
    try:
        user = User.objects.get(username=username)
        quizzes = AuthorQuiz.objects.filter(user=user)

        data = []

        for q in quizzes:
            data.append({
                "id": q.id,
                "title": q.title,
                "difficulty": q.difficulty,
                "time_limit": q.time_limit,
                "created_at": q.created_at,
                "linked_material": q.linked_material.id if q.linked_material else None
            })

        return Response(data)

    except:
        return Response([])


# -------- DELETE QUIZ --------
@api_view(['DELETE'])
def delete_quiz(request, quiz_id):
    try:
        quiz = AuthorQuiz.objects.get(id=quiz_id)
        quiz.delete()

        return Response({"message": "Quiz deleted successfully"})

    except AuthorQuiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)


# -------- GET QUESTIONS OF QUIZ --------
@api_view(['GET'])
def get_quiz_questions(request, quiz_id):
    try:
        quiz = AuthorQuiz.objects.get(id=quiz_id)
        questions = quiz.questions.all()

        data = []

        for q in questions:
            data.append({
                "id": q.id,
                "question": q.question,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "correct_answer": q.correct_answer,
                "marks": q.marks,
                "explanation": q.explanation
            })

        return Response(data)

    except:
        return Response([])