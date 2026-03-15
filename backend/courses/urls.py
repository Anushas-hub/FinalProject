from django.urls import path
from . import views

urlpatterns = [

    path("courses/", views.courses_list),
    path("courses/<int:id>/", views.course_detail),

    # Certification Quiz API
    path("course-quiz/<int:id>/", views.course_quiz_detail),

]