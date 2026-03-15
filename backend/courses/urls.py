from django.urls import path
from .views import courses_list, course_detail

urlpatterns = [
    path("courses/", courses_list),
    path("courses/<int:id>/", course_detail),
]