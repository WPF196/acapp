#向acwing申请一个授权码（code）


from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache


def get_state():        #随机生成回调状态随机值，8位，每一位0~9
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res


def apply_code(request):
    # 传递的四个参数
    # 1.应用的唯一id
    appid = "4971"
    # 2.接收授权码的地址
    redirect_uri = quote("https://app4971.acapp.acwing.com.cn/settings/acwing/web/receive_code/")
    # 3.申请授权的范围
    scope = "userinfo"
    # 4.判断请求和回调状态（可以理解为暗号）
    state = get_state()

    cache.set(state, True, 7200)    # 把随机的状态码存入 redis 中，有效期 2 小时

    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })
