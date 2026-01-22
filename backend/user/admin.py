from django.contrib import admin
from .models import CustomUser, UserAddress

admin.site.register(CustomUser)

admin.site.register(UserAddress)
