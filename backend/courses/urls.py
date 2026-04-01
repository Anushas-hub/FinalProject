from django.urls import path
from . import views

urlpatterns = [

    # ── Course APIs (unchanged) ──
    path("courses/", views.courses_list),
    path("courses/<int:id>/", views.course_detail),
    path("course-quiz/<int:id>/", views.course_quiz_detail),

    # ── 🆕 Progress & Certificate APIs ──
    path("course-submit-quiz/", views.submit_quiz),
    path("course-progress/<int:course_id>/<str:username>/", views.get_course_progress),
    path("generate-certificate/", views.generate_certificate),
    path("certificate/<str:certificate_id>/", views.get_certificate),
    path("my-certifications/<str:username>/", views.get_my_certifications),

]