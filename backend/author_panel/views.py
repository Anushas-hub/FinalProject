from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import AuthorStudyMaterial, AuthorQuiz, QuizQuestion
from django.http import FileResponse
from accounts.models import Follow, AuthorProfile

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
            file=request.FILES.get("file"),
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
                if m.file
                else None
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
                "created_at": m.created_at,
            })

        return Response(data)

    except:
        return Response([])


def view_pdf(request, material_id):
    try:
        material = AuthorStudyMaterial.objects.get(id=material_id)
        response = FileResponse(
            material.file.open("rb"), content_type="application/pdf"
        )
        response["Content-Disposition"] = (
            f'inline; filename="{material.file.name}"'
        )
        return response

    except AuthorStudyMaterial.DoesNotExist:
        from django.http import JsonResponse
        return JsonResponse({"error": "Not found"}, status=404)


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


# ================= QUIZ SYSTEM (UNCHANGED) =================

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
            try:
                linked_material = AuthorStudyMaterial.objects.get(id=material_id)
            except AuthorStudyMaterial.DoesNotExist:
                pass

        quiz = AuthorQuiz.objects.create(
            user=user,
            title=request.data.get("title"),
            description=request.data.get("description", ""),
            difficulty=request.data.get("difficulty", "easy"),
            time_limit=request.data.get("time_limit", 10),
            linked_material=linked_material,
            link_type="material",
        )

        return Response({"message": "Quiz created successfully", "quiz_id": quiz.id})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
def create_quiz_with_questions(request):
    try:
        username = request.data.get("username")
        if not username:
            return Response({"error": "Username required"}, status=400)

        user = User.objects.get(username=username)

        if user.role != "author":
            return Response({"error": "Only authors allowed"}, status=403)

        title = request.data.get("title", "").strip()
        if not title:
            return Response({"error": "Quiz title is required"}, status=400)

        questions = request.data.get("questions", [])
        if not questions:
            return Response({"error": "At least 1 question required"}, status=400)

        for i, q in enumerate(questions):
            if not q.get("question", "").strip():
                return Response(
                    {"error": f"Q{i+1}: Question text missing"}, status=400
                )
            if not q.get("option_a", "").strip() or not q.get("option_b", "").strip():
                return Response(
                    {"error": f"Q{i+1}: Options A & B required"}, status=400
                )
            if not q.get("correct_answer", "").strip():
                return Response(
                    {"error": f"Q{i+1}: Correct answer missing"}, status=400
                )

        if AuthorQuiz.objects.filter(user=user, title__iexact=title).exists():
            return Response(
                {"error": "Quiz with this title already exists"}, status=400
            )

        material_id = request.data.get("material_id")
        linked_material = None
        if material_id:
            try:
                linked_material = AuthorStudyMaterial.objects.get(id=material_id)
            except AuthorStudyMaterial.DoesNotExist:
                pass

        quiz = AuthorQuiz.objects.create(
            user=user,
            title=title,
            description=request.data.get("description", ""),
            difficulty=request.data.get("difficulty", "easy"),
            time_limit=int(request.data.get("time_limit", 10)),
            linked_material=linked_material,
            link_type="material",
            linked_id=None,
        )

        for q in questions:
            QuizQuestion.objects.create(
                quiz=quiz,
                question=q.get("question", "").strip(),
                option_a=q.get("option_a", "").strip(),
                option_b=q.get("option_b", "").strip(),
                option_c=q.get("option_c", "").strip(),
                option_d=q.get("option_d", "").strip(),
                correct_answer=q.get("correct_answer", "A").strip().upper(),
                marks=int(q.get("marks", 1)),
                explanation=q.get("explanation", "").strip(),
            )

        return Response({
            "message": "Quiz created successfully!",
            "quiz_id": quiz.id,
            "total_questions": len(questions),
        })

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


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
            marks=request.data.get("marks", 1),
            explanation=request.data.get("explanation", ""),
        )

        return Response({"message": "Question added successfully"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def get_my_quizzes(request, username):
    try:
        user = User.objects.get(username=username)
        quizzes = AuthorQuiz.objects.filter(user=user).order_by("-created_at")

        data = []
        for q in quizzes:
            data.append({
                "id": q.id,
                "title": q.title,
                "description": q.description,
                "difficulty": q.difficulty,
                "time_limit": q.time_limit,
                "created_at": q.created_at,
                "linked_material": q.linked_material.id if q.linked_material else None,
                "link_type": q.link_type,
                "total_questions": q.questions.count(),
            })

        return Response(data)

    except:
        return Response([])


@api_view(['DELETE'])
def delete_quiz(request, quiz_id):
    try:
        quiz = AuthorQuiz.objects.get(id=quiz_id)
        quiz.delete()
        return Response({"message": "Quiz deleted successfully"})

    except AuthorQuiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)


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
                "explanation": q.explanation,
            })

        return Response(data)

    except:
        return Response([])


# ================= 🆕 PUBLIC APIs (for student search) =================

@api_view(['GET'])
def get_all_author_materials(request):
    """
    Public API — returns all author materials with author info + follower count.
    Used in HomeStudyMaterial & StudentDashboard search bars.
    Supports ?search=keyword and ?author=username query params.
    """
    try:
        materials = AuthorStudyMaterial.objects.select_related("user").order_by("-created_at")

        search = request.GET.get("search", "").strip()
        author_filter = request.GET.get("author", "").strip()

        if search:
            materials = materials.filter(title__icontains=search) | \
                        materials.filter(subject__icontains=search)

        if author_filter:
            materials = materials.filter(user__username=author_filter)

        data = []
        for m in materials:
            profile = AuthorProfile.objects.filter(user=m.user).first()
            follower_count = Follow.objects.filter(author=m.user).count()

            image_url = None
            if profile and profile.profile_image:
                image_url = request.build_absolute_uri(profile.profile_image.url)

            file_url = (
                request.build_absolute_uri(f"/api/author/view-pdf/{m.id}/")
                if m.file
                else None
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
                "created_at": m.created_at,
                "author_username": m.user.username,
                "author_name": profile.name if profile and profile.name else m.user.username,
                "author_image": image_url,
                "follower_count": follower_count,
            })

        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def get_author_material_detail(request, material_id):
    """
    Public API — single author material detail with full author info.
    """
    try:
        m = AuthorStudyMaterial.objects.select_related("user").get(id=material_id)
        profile = AuthorProfile.objects.filter(user=m.user).first()
        follower_count = Follow.objects.filter(author=m.user).count()

        image_url = None
        if profile and profile.profile_image:
            image_url = request.build_absolute_uri(profile.profile_image.url)

        file_url = (
            request.build_absolute_uri(f"/api/author/view-pdf/{m.id}/")
            if m.file
            else None
        )

        data = {
            "id": m.id,
            "title": m.title,
            "subject": m.subject,
            "course": m.course,
            "semester": m.semester,
            "description": m.description,
            "content": m.content,
            "file": file_url,
            "created_at": m.created_at,
            "author_username": m.user.username,
            "author_name": profile.name if profile and profile.name else m.user.username,
            "author_image": image_url,
            "follower_count": follower_count,
        }

        return Response(data)

    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=400)