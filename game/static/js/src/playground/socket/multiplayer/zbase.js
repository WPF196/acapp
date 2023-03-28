class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;

        this.ws = new WebSocket("wss://app4971.acapp.acwing.com.cn/")
    }
}
