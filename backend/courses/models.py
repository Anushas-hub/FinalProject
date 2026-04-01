from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Course(models.Model):

    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to="courses/", blank=True, null=True)
    is_featured = models.BooleanField(default=False)

    # 🆕 extra fields for professional display
    duration = models.CharField(max_length=100, default="Self-paced")
    level = models.CharField(
        max_length=20,
        choices=(("beginner", "Beginner"), ("intermediate", "Intermediate"), ("advanced", "Advanced")),
        default="beginner"
    )
    skills = models.CharField(max_length=500, blank=True, help_text="Comma separated skills")
    certificate_title = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    def __str__(self):
        return self.title


class CourseModule(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="modules"
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.IntegerField(default=0)  # 🆕 for ordering modules

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class CourseQuiz(models.Model):

    module = models.ForeignKey(
        CourseModule,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )
    title = models.CharField(max_length=200)
    pass_percentage = models.IntegerField(default=60)  # 🆕 min % to pass

    def __str__(self):
        return self.title


class CourseQuestion(models.Model):

    quiz = models.ForeignKey(
        CourseQuiz,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    question = models.TextField()
    option1 = models.CharField(max_length=200)
    option2 = models.CharField(max_length=200)
    option3 = models.CharField(max_length=200)
    option4 = models.CharField(max_length=200)
    correct_answer = models.CharField(max_length=200)

    def __str__(self):
        return self.question


# ================= 🆕 PROGRESS TRACKING =================

class QuizCompletion(models.Model):
    """Tracks which quizzes a student has passed."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quiz_completions")
    quiz = models.ForeignKey(CourseQuiz, on_delete=models.CASCADE, related_name="completions")
    score = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "quiz")

    def __str__(self):
        return f"{self.user} - {self.quiz.title} - {'Pass' if self.passed else 'Fail'}"


class CourseCompletion(models.Model):
    """Tracks when a student completes a full course and gets certificate."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_completions")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="completions")
    completed_at = models.DateTimeField(auto_now_add=True)
    certificate_id = models.CharField(max_length=50, unique=True)  # unique cert ID

    class Meta:
        unique_together = ("user", "course")

    def __str__(self):
        return f"{self.user} completed {self.course.title}"