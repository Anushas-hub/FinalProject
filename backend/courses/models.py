from django.db import models

class Course(models.Model):

    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to="courses/")
    is_featured = models.BooleanField(default=False)

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

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class CourseQuiz(models.Model):

    module = models.ForeignKey(
        CourseModule,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )

    title = models.CharField(max_length=200)

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