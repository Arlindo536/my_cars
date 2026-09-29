from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.static import serve as static_serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/cars/', include('cars.urls')),
    # Serve uploaded car photos. For a small demo app this is fine; a
    # higher-traffic production app would instead have nginx read the
    # media folder directly from a shared volume.
    re_path(r'^media/(?P<path>.*)$', static_serve, {'document_root': settings.MEDIA_ROOT}),
]
