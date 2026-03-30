from django.contrib import admin
from .models import AuthorStudyMaterial, AuthorQuiz, QuizQuestion


@admin.register(AuthorStudyMaterial)
class AuthorStudyMaterialAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'subject', 'user', 'created_at')
    search_fields = ('title', 'subject', 'user__username')
    list_filter = ('subject', 'created_at')


@admin.register(AuthorQuiz)
class AuthorQuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty', 'time_limit', 'link_type', 'user', 'created_at')
    search_fields = ('title', 'user__username')
    list_filter = ('difficulty', 'link_type', 'created_at')


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'quiz', 'question', 'correct_answer', 'marks')
    search_fields = ('question', 'quiz__title')
    list_filter = ('correct_answer',)