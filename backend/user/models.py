from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$', 
        message="Номер телефона должен быть в формате: '+999999999'."
    )
    
    phone_number = models.CharField(validators=[phone_regex], max_length=17, unique=True, verbose_name="Телефон", null=True, blank=True)
    is_verified = models.BooleanField(default=False, verbose_name="Подтвержден")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = []
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

class UserAddress(models.Model):
    """Адреса доставки пользователя"""
    user = models.ForeignKey(CustomUser, related_name='addresses', on_delete=models.CASCADE)
    region = models.CharField(max_length=100, verbose_name="Область/Регион")
    city = models.CharField(max_length=100, verbose_name="Город")
    street = models.CharField(max_length=150, verbose_name="Улица")
    house = models.CharField(max_length=20, verbose_name="Дом")
    apartment = models.CharField(max_length=20, blank=True, verbose_name="Квартира/Офис")
    postal_code = models.CharField(max_length=20, verbose_name="Индекс")
    is_default = models.BooleanField(default=False, verbose_name="Основной адрес")

    def __str__(self):
        return f"{self.city}, {self.street}, {self.house}"