from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Course, CourseModule

@api_view(["GET"])
def courses_list(request):

    courses = Course.objects.all()

    data = []

    for c in courses:
        data.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "thumbnail": c.thumbnail.url if c.thumbnail else None
        })

    return Response(data)


@api_view(["GET"])
def course_detail(request, id):

    course = Course.objects.get(id=id)

    modules = CourseModule.objects.filter(course=course)

    module_data = []

    for m in modules:
        module_data.append({
            "id": m.id,
            "title": m.title,
            "content": m.content
        })

    return Response({
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "modules": module_data
    })