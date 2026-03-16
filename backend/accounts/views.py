from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Subject, Module, Quiz, Question, ViewedTopic

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
            "options": [
                q.option1,
                q.option2,
                q.option3,
                q.option4
            ],
            "answer": q.correct_answer
        })

    return Response(data)


# ---------------- SAVE VIEWED TOPIC ----------------

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


# ---------------- GET USER HISTORY ----------------

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