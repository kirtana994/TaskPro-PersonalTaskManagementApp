
from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import RegisterSerializer
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer



def home(request):
    return render(request, 'home.html')

#view for handling user registration via API
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    'message': 'Registration successful.',
                    'username': user.username,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

#view for rendering the registration page
def register_page(request):
    return render(request, 'register.html')

#view for rendering the login page
def login_page(request):
    return render(request, 'login.html')

#view for rendering the welcome page
def welcome_page(request):
    return render(request, 'welcome.html')

#viewset for handling CRUD operations on Task model
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['due_date']
    ordering = ['due_date']

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)

        # Filter tasks by status: pending or completed.
        status_filter = self.request.query_params.get('status')
        if status_filter in ['pending', 'completed']:
            queryset = queryset.filter(status=status_filter)

        # Filter tasks by priority: low, medium or high.
        priority_filter = self.request.query_params.get('priority')
        if priority_filter in ['low', 'medium', 'high']:
            queryset = queryset.filter(priority=priority_filter)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
