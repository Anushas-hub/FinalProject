from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Course, CourseModule, CourseQuiz, CourseQuestion
from .serializers import CourseSerializer


@api_view(["GET"])
def courses_list(request):

    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True)

    return Response(serializer.data)


@api_view(["GET"])
def course_detail(request, id):

    course = Course.objects.get(id=id)
    serializer = CourseSerializer(course)

    return Response(serializer.data)


@api_view(["GET"])
def course_quiz_detail(request, id):

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
            "correct_answer": q.correct_answer
        })

    data = {
        "id": quiz.id,
        "title": quiz.title,
        "questions": question_data
    }

    return Response(data)