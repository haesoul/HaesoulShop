
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, MyTokenObtainPairSerializer, UserProfileSerializer        
from rest_framework_simplejwt.views import TokenObtainPairView
import random
from django.core.cache import cache
from django.conf import settings
from rest_framework import status, generics, views
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.db import transaction
import random
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        
        if email:
            try:
                existing_user = User.objects.get(email=email)
                
                if not existing_user.is_verified:
                    existing_user.delete()
                else:

                    pass
            except User.DoesNotExist:
                pass
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    user = serializer.save()
                    user.is_active = True  
                    user.save()
                    
                    verification_code = str(random.randint(100000, 999999))
                    
                    cache_key = f"verify_email_{user.email}"
                    cache.set(cache_key, verification_code, timeout=300)
                    
                    self.send_verification_email(user, verification_code)
                    
                return Response({
                    "message": "Пользователь создан. Код отправлен на email.",
                    "email": user.email
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response(
                    {"message": "Ошибка регистрации.", "error": str(e)}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_verification_email(self, user, code):
        """Вынесли отправку письма в отдельный метод для чистоты кода"""
        subject = 'Код подтверждения регистрации'
        html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
                <h3>Добро пожаловать, {user.email}!</h3> 
                <p>Ваш код подтверждения:</p>
                <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">{code}</h1>
                <p style="font-size: 12px; color: #777;">Код действителен в течение 5 минут.</p>
            </div>
        """
        text_content = strip_tags(html_content)
        msg = EmailMultiAlternatives(
            subject, text_content, settings.DEFAULT_FROM_EMAIL, [user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)


class VerifyEmailView(views.APIView):
    """
    Принимает email и code. Если всё ок — активирует юзера и выдает токены.
    """
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({"error": "Email и код обязательны."}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"verify_email_{email}"
        cached_code = cache.get(cache_key)

        if cached_code is None:
            return Response({"error": "Срок действия кода истек или он неверен."}, status=status.HTTP_400_BAD_REQUEST)
        
        if str(cached_code) != str(code):
            return Response({"error": "Неверный код."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Пользователь не найден."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_verified:
             return Response({"message": "Аккаунт уже подтвержден."}, status=status.HTTP_200_OK)

        user.is_verified = True
        user.save()

        cache.delete(cache_key)

        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "Аккаунт успешно подтвержден!",
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
        

class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class UserProfileView(RetrieveUpdateAPIView): 
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user