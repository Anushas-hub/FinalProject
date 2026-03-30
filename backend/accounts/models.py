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


# ---------------- VIEWED TOPICS ----------------

class ViewedTopic(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-viewed_at"]

    def __str__(self):
        return f"{self.user.username} viewed {self.subject.title}"


# ---------------- QUIZ ATTEMPT HISTORY ----------------

class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)

    score = models.IntegerField()
    total_questions = models.IntegerField()
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-attempted_at"]

    def __str__(self):
        return f"{self.user.username} attempted {self.quiz.title}"


class Feedback(models.Model):
    username = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=50, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} - {self.created_at}"


# ---------------- AUTHOR PROFILE ----------------

class AuthorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    name = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)

    education = models.CharField(max_length=300, blank=True)
    experience = models.CharField(max_length=300, blank=True)
    skills = models.CharField(max_length=300, blank=True)

    profile_image = models.ImageField(upload_to="author_profiles/", blank=True, null=True)

    def __str__(self):
        return self.user.username


# ---------------- STUDY MATERIAL UPLOAD ----------------

class StudyMaterial(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    content = models.TextField(blank=True)
    file = models.FileField(upload_to="study_materials/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ---------------- 🆕 FOLLOW SYSTEM ----------------

class Follow(models.Model):
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="following"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="followers"
    )
    followed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "author")
        ordering = ["-followed_at"]

    def __str__(self):
        return f"{self.follower.username} follows {self.author.username}"