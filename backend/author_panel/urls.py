from django.urls import path
from .views import (
    upload_material,
    get_my_materials,
    delete_material,
    update_material,
    view_pdf,

    # ✅ QUIZ IMPORTS (NEW)
    create_quiz,
    add_question,
    get_my_quizzes,
    delete_quiz,
    get_quiz_questions,
)

urlpatterns = [
    # ================= MATERIAL ROUTES (UNCHANGED) =================
    path('upload-material/', upload_material),
    path('my-materials/<str:username>/', get_my_materials),

    path('delete-material/<int:material_id>/', delete_material),
    path('update-material/<int:material_id>/', update_material),

    path('view-pdf/<int:material_id>/', view_pdf),

    # ================= QUIZ ROUTES (NEW) =================

    # 🔥 CREATE QUIZ
    path('create-quiz/', create_quiz),

    # 🔥 ADD QUESTION
    path('add-question/', add_question),

    # 🔥 GET MY QUIZZES
    path('my-quizzes/<str:username>/', get_my_quizzes),

    # 🔥 DELETE QUIZ
    path('delete-quiz/<int:quiz_id>/', delete_quiz),

    # 🔥 GET QUESTIONS OF QUIZ
    path('quiz-questions/<int:quiz_id>/', get_quiz_questions),
]