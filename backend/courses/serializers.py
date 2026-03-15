from rest_framework import serializers
from .models import Course, CourseModule, CourseQuiz, CourseQuestion


class CourseQuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseQuestion
        fields = "__all__"


class CourseQuizSerializer(serializers.ModelSerializer):

    questions = CourseQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = CourseQuiz
        fields = "__all__"


class CourseModuleSerializer(serializers.ModelSerializer):

    quizzes = CourseQuizSerializer(many=True, read_only=True)

    class Meta:
        model = CourseModule
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):

    modules = CourseModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = "__all__"