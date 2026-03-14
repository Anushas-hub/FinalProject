from django.urls import path
from .views import get_pyq, pyq_options, pyq_subjects

urlpatterns = [
    path("pyqs/", get_pyq),
    path("pyq-options/", pyq_options),
    path("pyq-subjects/", pyq_subjects),

]