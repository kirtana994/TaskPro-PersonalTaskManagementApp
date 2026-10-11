
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet
from django.urls import include


router = DefaultRouter()
router.register('tasks', TaskViewSet, basename='task')
urlpatterns = [
    path('', views.welcome_page, name='welcome'),
    path('dashboard/', views.home, name='home'),

    #Registration and login routes
    path('register/', views.register_page, name='register'),
    path('api/auth/register/', views.RegisterView.as_view(),
         name='api_register'),

    path('login/', views.login_page, name='login'),

    #JWT authentication routes
    path('api/auth/token/', TokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(),
         name='token_refresh'),

    path('api/', include(router.urls)),
]

