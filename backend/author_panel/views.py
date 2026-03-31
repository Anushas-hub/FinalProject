from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import AuthorStudyMaterial, AuthorQuiz, QuizQuestion
from .models import MaterialQuestion, MaterialAnswer, PeerComment
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
                return Response({"error": f"Q{i+1}: Question text missing"}, status=400)
            if not q.get("option_a", "").strip() or not q.get("option_b", "").strip():
                return Response({"error": f"Q{i+1}: Options A & B required"}, status=400)
            if not q.get("correct_answer", "").strip():
                return Response({"error": f"Q{i+1}: Correct answer missing"}, status=400)

        if AuthorQuiz.objects.filter(user=user, title__iexact=title).exists():
            return Response({"error": "Quiz with this title already exists"}, status=400)

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


# ================= PUBLIC APIs (UNCHANGED) =================

@api_view(['GET'])
def get_all_author_materials(request):
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
    try:
        m = AuthorStudyMaterial.objects.select_related("user").get(id=material_id)
        profile = AuthorProfile.objects.filter(user=m.user).first()
        follower_count = Follow.objects.filter(author=m.user).count()

        image_url = None
        if profile and profile.profile_image:
            image_url = request.build_absolute_uri(profile.profile_image.url)

        file_url = (
            request.build_absolute_uri(f"/api/author/view-pdf/{m.id}/")
            if m.file else None
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


# ================= Q&A SYSTEM (UNCHANGED) =================

@api_view(['POST'])
def ask_question(request):
    try:
        username = request.data.get("username")
        material_id = request.data.get("material_id")
        question_text = request.data.get("question", "").strip()

        if not question_text:
            return Response({"error": "Question cannot be empty"}, status=400)

        user = User.objects.get(username=username)
        material = AuthorStudyMaterial.objects.get(id=material_id)

        question = MaterialQuestion.objects.create(
            material=material,
            asked_by=user,
            question=question_text,
        )

        return Response({"message": "Question posted successfully", "question_id": question.id})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def get_questions_for_material(request, material_id):
    try:
        material = AuthorStudyMaterial.objects.get(id=material_id)
        questions = MaterialQuestion.objects.filter(material=material).order_by("-created_at")

        data = []
        for q in questions:
            answers = []
            for a in q.answers.all().order_by("created_at"):
                answers.append({
                    "id": a.id,
                    "answer": a.answer,
                    "answered_by": a.answered_by.username,
                    "created_at": a.created_at,
                })
            data.append({
                "id": q.id,
                "question": q.question,
                "asked_by": q.asked_by.username,
                "created_at": q.created_at,
                "answers": answers,
            })

        return Response(data)

    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
def answer_question(request):
    try:
        username = request.data.get("username")
        question_id = request.data.get("question_id")
        answer_text = request.data.get("answer", "").strip()

        if not answer_text:
            return Response({"error": "Answer cannot be empty"}, status=400)

        user = User.objects.get(username=username)
        question = MaterialQuestion.objects.get(id=question_id)

        if question.material.user != user:
            return Response({"error": "Only the material author can answer"}, status=403)

        answer = MaterialAnswer.objects.create(
            question=question,
            answered_by=user,
            answer=answer_text,
        )

        question.is_read = True
        question.save()

        return Response({"message": "Answer posted successfully", "answer_id": answer.id})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except MaterialQuestion.DoesNotExist:
        return Response({"error": "Question not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def get_author_qa_notifications(request, username):
    try:
        user = User.objects.get(username=username)
        my_materials = AuthorStudyMaterial.objects.filter(user=user)
        questions = MaterialQuestion.objects.filter(material__in=my_materials).order_by("-created_at")
        unread_count = questions.filter(is_read=False).count()

        data = []
        for q in questions:
            answers = []
            for a in q.answers.all().order_by("created_at"):
                answers.append({
                    "id": a.id,
                    "answer": a.answer,
                    "answered_by": a.answered_by.username,
                    "created_at": a.created_at,
                })
            data.append({
                "id": q.id,
                "question": q.question,
                "asked_by": q.asked_by.username,
                "material_id": q.material.id,
                "material_title": q.material.title,
                "created_at": q.created_at,
                "is_read": q.is_read,
                "answers": answers,
            })

        return Response({"unread_count": unread_count, "questions": data})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
def mark_questions_read(request):
    try:
        username = request.data.get("username")
        user = User.objects.get(username=username)
        my_materials = AuthorStudyMaterial.objects.filter(user=user)
        MaterialQuestion.objects.filter(material__in=my_materials, is_read=False).update(is_read=True)
        return Response({"message": "All marked as read"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ================= PEER NOTES SYSTEM (UNCHANGED) =================

@api_view(['POST'])
def add_peer_comment(request):
    try:
        username = request.data.get("username")
        material_id = request.data.get("material_id")
        comment_text = request.data.get("comment", "").strip()

        if not comment_text:
            return Response({"error": "Comment cannot be empty"}, status=400)

        user = User.objects.get(username=username)

        if user.role != "author":
            return Response({"error": "Only authors can add peer notes"}, status=403)

        material = AuthorStudyMaterial.objects.get(id=material_id)

        comment = PeerComment.objects.create(
            material=material,
            commented_by=user,
            comment=comment_text,
        )

        return Response({"message": "Peer note added successfully", "comment_id": comment.id})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def get_peer_comments(request, material_id):
    try:
        material = AuthorStudyMaterial.objects.get(id=material_id)
        comments = PeerComment.objects.filter(material=material).order_by("-created_at")

        data = []
        for c in comments:
            profile = AuthorProfile.objects.filter(user=c.commented_by).first()
            image_url = None
            if profile and profile.profile_image:
                image_url = request.build_absolute_uri(profile.profile_image.url)

            data.append({
                "id": c.id,
                "comment": c.comment,
                "commented_by": c.commented_by.username,
                "commenter_name": profile.name if profile and profile.name else c.commented_by.username,
                "commenter_image": image_url,
                "created_at": c.created_at,
                "is_read": c.is_read,
            })

        return Response(data)

    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def get_author_peer_notifications(request, username):
    try:
        user = User.objects.get(username=username)
        my_materials = AuthorStudyMaterial.objects.filter(user=user)
        comments = PeerComment.objects.filter(
            material__in=my_materials
        ).exclude(commented_by=user).order_by("-created_at")

        unread_count = comments.filter(is_read=False).count()

        data = []
        for c in comments:
            profile = AuthorProfile.objects.filter(user=c.commented_by).first()
            data.append({
                "id": c.id,
                "comment": c.comment,
                "commented_by": c.commented_by.username,
                "commenter_name": profile.name if profile and profile.name else c.commented_by.username,
                "material_id": c.material.id,
                "material_title": c.material.title,
                "created_at": c.created_at,
                "is_read": c.is_read,
            })

        return Response({"unread_count": unread_count, "comments": data})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
def mark_peer_comments_read(request):
    try:
        username = request.data.get("username")
        user = User.objects.get(username=username)
        my_materials = AuthorStudyMaterial.objects.filter(user=user)
        PeerComment.objects.filter(material__in=my_materials, is_read=False).update(is_read=True)
        return Response({"message": "All peer notes marked as read"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ================= 🆕 QUIZ FOR MATERIAL (PUBLIC) =================

@api_view(['GET'])
def get_quizzes_for_material(request, material_id):
    """
    Public API — returns all quizzes linked to a specific author material.
    Used in AuthorMaterialDetail page to show "Attempt Quiz" section.
    """
    try:
        material = AuthorStudyMaterial.objects.get(id=material_id)
        quizzes = AuthorQuiz.objects.filter(linked_material=material).order_by("-created_at")

        data = []
        for q in quizzes:
            data.append({
                "id": q.id,
                "title": q.title,
                "description": q.description,
                "difficulty": q.difficulty,
                "time_limit": q.time_limit,
                "total_questions": q.questions.count(),
                "total_marks": sum(qq.marks for qq in q.questions.all()),
                "created_at": q.created_at,
                "author_username": q.user.username,
            })

        return Response(data)

    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def get_author_quiz_detail(request, quiz_id):
    """
    Public API — returns quiz with all questions for attempt page.
    Does NOT send correct_answer to frontend (security).
    """
    try:
        quiz = AuthorQuiz.objects.get(id=quiz_id)
        questions = quiz.questions.all().order_by("id")

        data = {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "difficulty": quiz.difficulty,
            "time_limit": quiz.time_limit,
            "total_questions": questions.count(),
            "total_marks": sum(q.marks for q in questions),
            "author_username": quiz.user.username,
            "linked_material_id": quiz.linked_material.id if quiz.linked_material else None,
            "linked_material_title": quiz.linked_material.title if quiz.linked_material else None,
            "questions": [
                {
                    "id": q.id,
                    "question": q.question,
                    "option_a": q.option_a,
                    "option_b": q.option_b,
                    "option_c": q.option_c if q.option_c else None,
                    "option_d": q.option_d if q.option_d else None,
                    "marks": q.marks,
                    # correct_answer NOT sent — checked after submit
                }
                for q in questions
            ],
        }

        return Response(data)

    except AuthorQuiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
def submit_author_quiz(request):
    """
    Student submits quiz answers.
    Backend checks correct answers and returns score + explanation.
    """
    try:
        quiz_id = request.data.get("quiz_id")
        answers = request.data.get("answers", {})  # { question_id: "A" }

        quiz = AuthorQuiz.objects.get(id=quiz_id)
        questions = quiz.questions.all()

        score = 0
        total_marks = 0
        results = []

        for q in questions:
            total_marks += q.marks
            user_answer = answers.get(str(q.id), "").strip().upper()
            is_correct = user_answer == q.correct_answer.upper()

            if is_correct:
                score += q.marks

            results.append({
                "id": q.id,
                "question": q.question,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "your_answer": user_answer,
                "correct_answer": q.correct_answer.upper(),
                "is_correct": is_correct,
                "marks": q.marks,
                "marks_obtained": q.marks if is_correct else 0,
                "explanation": q.explanation,
            })

        percentage = round((score / total_marks * 100), 1) if total_marks > 0 else 0

        return Response({
            "quiz_title": quiz.title,
            "score": score,
            "total_marks": total_marks,
            "percentage": percentage,
            "total_questions": len(results),
            "correct_count": sum(1 for r in results if r["is_correct"]),
            "results": results,
        })

    except AuthorQuiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)