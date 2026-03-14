from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Subject, Module, Quiz, Question


# -------------------------
# USER ADMIN
# -------------------------

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff")
    search_fields = ("username", "email")


# -------------------------
# SUBJECT ADMIN
# -------------------------

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "description")
    search_fields = ("title",)


# -------------------------
# MODULE ADMIN
# -------------------------

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "subject")
    list_filter = ("subject",)
    search_fields = ("title",)


# -------------------------
# QUIZ ADMIN
# -------------------------

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "module")
    list_filter = ("module",)
    search_fields = ("title",)


# -------------------------
# QUESTION ADMIN (NEW)
# -------------------------

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "quiz")
    list_filter = ("quiz",)
    search_fields = ("question",)