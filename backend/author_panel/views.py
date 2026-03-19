from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import AuthorStudyMaterial

User = get_user_model()


# ---------------- UPLOAD ----------------
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


# ---------------- GET MY MATERIALS ----------------
@api_view(['GET'])
def get_my_materials(request, username):
    try:
        user = User.objects.get(username=username)
        materials = AuthorStudyMaterial.objects.filter(user=user)

        data = []

        for m in materials:
            file_url = request.build_absolute_uri(m.file.url) if m.file else None

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


# ---------------- DELETE (FIXED) ----------------
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


# ---------------- UPDATE ----------------
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

        if "file" in request.FILES:
            material.file = request.FILES["file"]

        material.save()

        return Response({"message": "Material updated successfully"})

    except AuthorStudyMaterial.DoesNotExist:
        return Response({"error": "Material not found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=400)