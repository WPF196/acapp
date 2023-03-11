from django.http import HttpResponse


def index(request):
    line1 = '<h1 style="text-align: center">术士之战</h1>'
    line4 = '<a href="/play/">进入游戏界面</a>'
    line3 = '<hr>'
    line2 = '<img src="https://th.bing.com/th/id/OIP.i-meFDtJMvq33tiFKZgkTAHaIR?w=196&h=219&c=7&r=0&o=5&dpr=1.5&pid=1.7" width=200>'
    return HttpResponse(line1 + line4 + line3 + line2)


def play(request):
    line1 = '<h1 style="text-align: center">游戏界面</h1>'
    line3 = '<a href="/">返回主页面</a>'
    line2 = '<img src="https://th.bing.com/th/id/OIP.vaM2ge-wUDY7Us01z0EcwgHaIW?w=194&h=219&c=7&r=0&o=5&dpr=1.5&pid=1.7" width=200>'
    return HttpResponse(line1 + line3 + line2)

