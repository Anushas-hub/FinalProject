from django.urls import path
from .views import (
    upload_material,
    get_my_materials,
    delete_material,
    update_material,
    view_pdf
)

urlpatterns = [
    # ---------------- AUTHOR MATERIAL ----------------
    path('upload-material/', upload_material),
    path('my-materials/<str:username>/', get_my_materials),

    path('delete-material/<int:material_id>/', delete_material),
    path('update-material/<int:material_id>/', update_material),

    # 🔥 PDF VIEW (FIXED)
    path('view-pdf/<int:material_id>/', view_pdf),
]