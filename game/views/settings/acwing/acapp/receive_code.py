# 接收一个来自acwing的授权码(code)

from django.http import JsonResponse
from django.core.cache import cache
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint
import requests

def receive_code(request):
    data = request.GET

    if "errcode" in data:
        return JsonResponse({
            'result': "apply failed",
            'errcode': data['errcode'],
            'errmsg': data['errmsg']
        })

    code = data.get('code')
    state = data.get('state')

    # 如果缓存中没有这个状态回调值  则返回初始界面
    if not cache.has_key(state):
        return JsonResponse({
            'result': "state not exist"
        })
    cache.delete(state)


    # 申请密令的链接 和 参数
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': "4971",
        'secret': "11ce8de5219f4f13a07cd74ffa35b477",
        'code': code
    }
    # 获取密令全部信息
    access_token_res = requests.get(apply_access_token_url, params=params).json()

    # 获取密令
    access_token = access_token_res['access_token']
    # 获取openid
    openid = access_token_res['openid']


    # 如果用户存在，则直接登录即可
    players = Player.objects.filter(openid=openid)
    if players.exists():
        player = players[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })

    #获取用户信息链接 和 相关参数
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }

    # 通过相关路由获取用户信息，主要提取用户名和头像
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    # 如果有重名，则通过添加数字后缀的形式来区分
    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))

    # 用获取的用户信息来创建用户和玩家
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)


    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })

