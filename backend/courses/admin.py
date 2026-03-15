from django.contrib import admin
from .models import Course, CourseModule, CourseQuiz, CourseQuestion


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "is_featured"
    )


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "course"
    )


@admin.register(CourseQuiz)
class CourseQuizAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "module"
    )


@admin.register(CourseQuestion)
class CourseQuestionAdmin(admin.ModelAdmin):

    list_display = (
        "question",
        "quiz"
    )