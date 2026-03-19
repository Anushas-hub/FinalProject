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