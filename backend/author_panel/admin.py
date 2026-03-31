from django.contrib import admin
from .models import (
    AuthorStudyMaterial,
    AuthorQuiz,
    QuizQuestion,
    MaterialQuestion,   # 🆕
    MaterialAnswer,     # 🆕
    PeerComment,        # 🆕
)


# ================= EXISTING (UNCHANGED) =================

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


# ================= 🆕 Q&A SYSTEM =================

class MaterialAnswerInline(admin.TabularInline):
    """
    Show answers directly inside the question detail page in admin.
    """
    model = MaterialAnswer
    extra = 0
    readonly_fields = ('answered_by', 'answer', 'created_at')
    can_delete = False


@admin.register(MaterialQuestion)
class MaterialQuestionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'asked_by',
        'short_question',
        'material',
        'is_read',
        'answer_count',
        'created_at',
    )
    list_filter = ('is_read', 'created_at')
    search_fields = ('question', 'asked_by__username', 'material__title')
    readonly_fields = ('asked_by', 'material', 'question', 'created_at')
    list_editable = ('is_read',)
    ordering = ('-created_at',)

    # show answers inline inside question detail
    inlines = [MaterialAnswerInline]

    def short_question(self, obj):
        return obj.question[:60] + "..." if len(obj.question) > 60 else obj.question
    short_question.short_description = "Question"

    def answer_count(self, obj):
        return obj.answers.count()
    answer_count.short_description = "Replies"


@admin.register(MaterialAnswer)
class MaterialAnswerAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'answered_by',
        'short_answer',
        'question',
        'created_at',
    )
    search_fields = ('answer', 'answered_by__username', 'question__question')
    readonly_fields = ('answered_by', 'question', 'answer', 'created_at')
    ordering = ('-created_at',)

    def short_answer(self, obj):
        return obj.answer[:60] + "..." if len(obj.answer) > 60 else obj.answer
    short_answer.short_description = "Answer"


# ================= 🆕 PEER NOTES SYSTEM =================

@admin.register(PeerComment)
class PeerCommentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'commented_by',
        'short_comment',
        'material',
        'is_read',
        'created_at',
    )
    list_filter = ('is_read', 'created_at')
    search_fields = ('comment', 'commented_by__username', 'material__title')
    readonly_fields = ('commented_by', 'material', 'comment', 'created_at')
    list_editable = ('is_read',)
    ordering = ('-created_at',)

    def short_comment(self, obj):
        return obj.comment[:60] + "..." if len(obj.comment) > 60 else obj.comment
    short_comment.short_description = "Comment"