from django.db import models


class PYQ(models.Model):

    COURSE_CHOICES = (
        ("BScIT", "Bachelor of Science in Information Technology"),
        ("BScCS", "Bachelor of Science in Computer Science"),
    )

    SEMESTER_CHOICES = (
        (1, "Semester 1"),
        (2, "Semester 2"),
        (3, "Semester 3"),
        (4, "Semester 4"),
        (5, "Semester 5"),
        (6, "Semester 6"),
    )

    YEAR_CHOICES = (
        (2025, "2025"),
        (2024, "2024"),
        (2023, "2023"),
        (2022, "2022"),
        (2021, "2021"),
        (2020, "2020"),
        (2019, "2019"),
        (2018, "2018"),
        (2017, "2017"),
        (2016, "2016"),
        (2015, "2015"),
    )

    course = models.CharField(
        max_length=20,
        choices=COURSE_CHOICES
    )

    semester = models.IntegerField(
        choices=SEMESTER_CHOICES
    )

    subject = models.CharField(max_length=200)

    year = models.IntegerField(
        choices=YEAR_CHOICES
    )

    pdf = models.FileField(upload_to="pyqs/")

    def __str__(self):
        return f"{self.get_course_display()} - Sem {self.semester} - {self.subject} ({self.year})"