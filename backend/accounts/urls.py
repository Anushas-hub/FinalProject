from django.urls import path
from .views import upload_study_material
from .views import get_author_profile, save_author_profile, delete_author_image
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
    submit_feedback,
)
from .views import (
    follow_author,
    unfollow_author,
    check_follow_status,
    get_author_followers,
    get_all_authors,
)

urlpatterns = [
    path('upload-material/', upload_study_material),

    path('author-profile/<str:username>/', get_author_profile),
    path('save-author-profile/', save_author_profile),
    path('delete-author-image/', delete_author_image),

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

    path('submit-feedback/', submit_feedback),

    # ========== 🆕 FOLLOW SYSTEM ==========
    path('follow/', follow_author),
    path('unfollow/', unfollow_author),
    path('follow-status/<str:follower>/<str:author>/', check_follow_status),
    path('author-followers/<str:username>/', get_author_followers),
    path('all-authors/', get_all_authors),
]