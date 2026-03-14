from django.urls import path
from .views import (
    signup,
    login_view,
    get_subjects,
    get_modules,
    get_quizzes,
    get_quiz
)

urlpatterns = [

    path('signup/', signup),
    path('login/', login_view),

    path('subjects/', get_subjects),
    path('subjects/<int:subject_id>/modules/', get_modules),
    path('modules/<int:module_id>/quizzes/', get_quizzes),

    path('quizzes/<int:id>/', get_quiz),
]