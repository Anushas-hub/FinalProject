from rest_framework import serializers
from .models import Course, CourseModule, CourseQuiz, CourseQuestion


class CourseQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseQuestion
        fields = "__all__"


class CourseQuizSerializer(serializers.ModelSerializer):
    questions = CourseQuestionSerializer(many=True, read_only=True)
    total_questions = serializers.SerializerMethodField()

    class Meta:
        model = CourseQuiz
        fields = "__all__"

    def get_total_questions(self, obj):
        return obj.questions.count()


class CourseModuleSerializer(serializers.ModelSerializer):
    quizzes = CourseQuizSerializer(many=True, read_only=True)

    class Meta:
        model = CourseModule
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    modules = CourseModuleSerializer(many=True, read_only=True)
    total_modules = serializers.SerializerMethodField()
    total_quizzes = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = "__all__"

    def get_total_modules(self, obj):
        return obj.modules.count()

    def get_total_quizzes(self, obj):
        total = 0
        for module in obj.modules.all():
            total += module.quizzes.count()
        return total

    def get_thumbnail(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None