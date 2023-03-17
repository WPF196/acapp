#存储Player数据表的信息

from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  #user和player一一对应，当User删除，与user关联的player一起删掉
    photo = models.URLField(max_length=256, blank=True)     #头像，最大长度256，可以为空
    openid = models.CharField(default="", max_length=256, blank=True, null=True)    #用户的openid信息，字符出类型（默认为空，最大长度32(多开)， 可以为空）

    def __str__(self):
        return str(self.user)
