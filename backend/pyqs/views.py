from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PYQ


@api_view(["GET"])
def get_pyq(request):

    course = request.GET.get("course")
    semester = request.GET.get("semester")
    subject = request.GET.get("subject")
    year = request.GET.get("year")

    pyqs = PYQ.objects.filter(
        course=course,
        semester=semester,
        subject=subject,
        year=year
    )

    data = []

    for p in pyqs:
        data.append({
            "pdf": p.pdf.url
        })

    return Response(data)


@api_view(["GET"])
def pyq_options(request):

    courses = [{"value": c[0], "label": c[1]} for c in PYQ.COURSE_CHOICES]
    semesters = [{"value": s[0], "label": s[1]} for s in PYQ.SEMESTER_CHOICES]
    years = [{"value": y[0], "label": y[1]} for y in PYQ.YEAR_CHOICES]

    return Response({
        "courses": courses,
        "semesters": semesters,
        "years": years
    })

@api_view(["GET"])
def pyq_subjects(request):

    course = request.GET.get("course")
    semester = request.GET.get("semester")

    subjects = PYQ.objects.filter(
        course=course,
        semester=semester
    ).values_list("subject", flat=True).distinct()

    data = []

    for s in subjects:
        data.append({
            "value": s,
            "label": s
        })

    return Response(data)
