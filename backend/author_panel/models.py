from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class AuthorStudyMaterial(models.Model):

    COURSE_CHOICES = (
        ("bsc_it", "BSc IT"),
        ("bsc_cs", "BSc CS"),
    )

    SEMESTER_CHOICES = (
        ("sem1", "Semester 1"),
        ("sem2", "Semester 2"),
        ("sem3", "Semester 3"),
        ("sem4", "Semester 4"),
        ("sem5", "Semester 5"),
        ("sem6", "Semester 6"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    subject = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    course = models.CharField(max_length=20, choices=COURSE_CHOICES, default="bsc_it")
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES, default="sem1")
    content = models.TextField(blank=True)
    file = models.FileField(upload_to="author_materials/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ================= QUIZ SYSTEM =================

class AuthorQuiz(models.Model):

    DIFFICULTY_CHOICES = (
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    )

    LINK_TYPE_CHOICES = (
        ("material", "Study Material"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    difficulty = models.CharField(
        max_length=10, choices=DIFFICULTY_CHOICES, default="easy"
    )
    time_limit = models.IntegerField(help_text="Time in minutes", default=10)

    linked_material = models.ForeignKey(
        AuthorStudyMaterial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quizzes",
    )

    link_type = models.CharField(
        max_length=20,
        choices=LINK_TYPE_CHOICES,
        default="material",
    )

    linked_id = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):

    quiz = models.ForeignKey(
        AuthorQuiz, on_delete=models.CASCADE, related_name="questions"
    )
    question = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255, blank=True)
    option_d = models.CharField(max_length=255, blank=True)
    correct_answer = models.CharField(max_length=1)
    marks = models.IntegerField(default=1)
    explanation = models.TextField(blank=True)

    def __str__(self):
        return self.question[:50]


# ================= Q&A SYSTEM (Student → Author) =================

class MaterialQuestion(models.Model):
    material = models.ForeignKey(
        AuthorStudyMaterial,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    asked_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="asked_questions"
    )
    question = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Q by {self.asked_by} on {self.material.title[:30]}"


class MaterialAnswer(models.Model):
    question = models.ForeignKey(
        MaterialQuestion,
        on_delete=models.CASCADE,
        related_name="answers"
    )
    answered_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="given_answers"
    )
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ans by {self.answered_by} to Q#{self.question.id}"


# ================= PEER NOTES SYSTEM (Author ↔ Author) =================

class PeerComment(models.Model):
    material = models.ForeignKey(
        AuthorStudyMaterial,
        on_delete=models.CASCADE,
        related_name="peer_comments"
    )
    commented_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="peer_comments_made"
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"PeerComment by {self.commented_by} on {self.material.title[:30]}"


# ================= 🆕 ADMIN NOTIFICATION SYSTEM =================

class AdminNotification(models.Model):

    TYPE_CHOICES = (
        ("info", "Info"),           # general info / congratulations
        ("warning", "Warning"),     # content issue warning
        ("danger", "Danger"),       # account block / delete material
    )

    # None = broadcast to ALL authors, specific user = only that author
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="admin_notifications",
        null=True,
        blank=True,
        help_text="Leave blank to send to ALL authors"
    )

    title = models.CharField(max_length=200)
    message = models.TextField()

    notification_type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES,
        default="info"
    )

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        target = self.recipient.username if self.recipient else "ALL AUTHORS"
        return f"[{self.notification_type.upper()}] → {target}: {self.title[:40]}"