from django.urls import path
from .views import author_leaderboard
from .views import (
    # ── MATERIAL (UNCHANGED) ──
    upload_material, get_my_materials, delete_material,
    update_material, view_pdf,

    # ── QUIZ (UNCHANGED) ──
    create_quiz, create_quiz_with_questions, add_question,
    get_my_quizzes, delete_quiz, get_quiz_questions,

    # ── PUBLIC (UNCHANGED) ──
    get_all_author_materials, get_author_material_detail,

    # ── Q&A (UNCHANGED) ──
    ask_question, get_questions_for_material, answer_question,
    get_author_qa_notifications, mark_questions_read,

    # ── PEER NOTES (UNCHANGED) ──
    add_peer_comment, get_peer_comments,
    get_author_peer_notifications, mark_peer_comments_read,

    # ── 🆕 QUIZ ATTEMPT ──
    get_quizzes_for_material,
    get_author_quiz_detail,
    submit_author_quiz,
)

urlpatterns = [

    # ── MATERIAL ROUTES (UNCHANGED) ──
    path('upload-material/', upload_material),
    path('my-materials/<str:username>/', get_my_materials),
    path('delete-material/<int:material_id>/', delete_material),
    path('update-material/<int:material_id>/', update_material),
    path('view-pdf/<int:material_id>/', view_pdf),

    # ── QUIZ ROUTES (UNCHANGED) ──
    path('create-quiz/', create_quiz),
    path('add-question/', add_question),
    path('create-quiz-with-questions/', create_quiz_with_questions),
    path('my-quizzes/<str:username>/', get_my_quizzes),
    path('delete-quiz/<int:quiz_id>/', delete_quiz),
    path('quiz-questions/<int:quiz_id>/', get_quiz_questions),

    # ── PUBLIC ROUTES (UNCHANGED) ──
    path('public-materials/', get_all_author_materials),
    path('public-materials/<int:material_id>/', get_author_material_detail),

    # ── Q&A ROUTES (UNCHANGED) ──
    path('ask-question/', ask_question),
    path('questions/<int:material_id>/', get_questions_for_material),
    path('answer-question/', answer_question),
    path('qa-notifications/<str:username>/', get_author_qa_notifications),
    path('mark-questions-read/', mark_questions_read),

    #Leaderboard route (UNCHANGED)
    path('leaderboard/<str:username>/', author_leaderboard),
    
    
    # ── PEER NOTES ROUTES (UNCHANGED) ──
    path('peer-comment/', add_peer_comment),
    path('peer-comments/<int:material_id>/', get_peer_comments),
    path('peer-notifications/<str:username>/', get_author_peer_notifications),
    path('mark-peer-read/', mark_peer_comments_read),

    # ── 🆕 QUIZ ATTEMPT ROUTES ──
    path('material-quizzes/<int:material_id>/', get_quizzes_for_material),
    path('quiz-detail/<int:quiz_id>/', get_author_quiz_detail),
    path('submit-quiz/', submit_author_quiz),
]