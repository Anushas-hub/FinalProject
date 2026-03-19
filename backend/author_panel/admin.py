from django.contrib import admin
from .models import AuthorStudyMaterial


@admin.register(AuthorStudyMaterial)
class AuthorStudyMaterialAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'subject', 'user', 'created_at')
    search_fields = ('title', 'subject', 'user__username')
    list_filter = ('subject', 'created_at')