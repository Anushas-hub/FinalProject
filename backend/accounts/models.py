from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("author", "Author"),
    )

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="student"
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# ---------------- SUBJECT ----------------

class Subject(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(default="Structured notes, quizzes and PYQs available.")

    def __str__(self):
        return self.title


# ---------------- MODULE ----------------

class Module(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=200)
    content = models.TextField()

    def __str__(self):
        return f"{self.subject.title} - {self.title}"


# ---------------- QUIZ ----------------

class Quiz(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="quizzes")
    title = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.module.title} - {self.title}"


# ---------------- QUESTION ----------------

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")

    question = models.TextField()

    option1 = models.CharField(max_length=200)
    option2 = models.CharField(max_length=200)
    option3 = models.CharField(max_length=200)
    option4 = models.CharField(max_length=200)

    correct_answer = models.CharField(max_length=200)

    def __str__(self):
        return self.question