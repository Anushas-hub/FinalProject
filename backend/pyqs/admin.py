from django.contrib import admin
from .models import PYQ


@admin.register(PYQ)
class PYQAdmin(admin.ModelAdmin):

    list_display = ("course", "semester", "subject", "year")
    list_filter = ("course", "semester", "year")
    search_fields = ("subject",)