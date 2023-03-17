#接收一个来自acwing的授权码(code)

from django.shortcuts import redirect


def receive_code(request):
    return redirect("index")

