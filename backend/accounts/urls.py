from django.urls import path
from .views import get_author_profile, save_author_profile
from .views import (
    signup,
    login_view,
    get_subjects,
    get_modules,
    get_quizzes,
    get_quiz,
    save_viewed_topic,
    get_viewed_topics,
    save_quiz_attempt,
    get_attempted_quizzes,
    student_analytics,
    submit_feedback
)

urlpatterns = [

    path('author-profile/<str:username>/', get_author_profile),
    path('save-author-profile/', save_author_profile),
    path('signup/', signup),
    path('login/', login_view),

    path('subjects/', get_subjects),
    path('subjects/<int:subject_id>/modules/', get_modules),

    path('modules/<int:module_id>/quizzes/', get_quizzes),

    path('quizzes/<int:id>/', get_quiz),

    path('save-viewed-topic/', save_viewed_topic),

    path('viewed-topics/<str:username>/', get_viewed_topics),

    path('save-quiz-attempt/', save_quiz_attempt),

    path('attempted-quizzes/<str:username>/', get_attempted_quizzes),

    path('student-analytics/<str:username>/', student_analytics),

    # NEW FEEDBACK API
    path('submit-feedback/', submit_feedback),
]