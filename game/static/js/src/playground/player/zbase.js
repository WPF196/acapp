class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        //把信息都存下来
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;      //剩余移动距离
        this.color = color;
        this.speed = speed;
        this.radius = radius;
        this.is_me = is_me;
        //用于浮点数运算
        this.eps = 0.1;
        this.cur_skill = null;  //记录当前选择的技能
    }

    start() {
        if (this.is_me) {   //对于用户玩家，加上监听函数
            this.add_listening_events();
        }
    }

    add_listening_events() {
        let outer = this;
        //把鼠标右键调出菜单栏的功能关掉
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        //把右键控制移动功能加上
        this.playground.game_map.$canvas.mousedown(function(e) {
            // 左键:1 中键:2 右键:3
            if (e.which === 3) {
                outer.move_to(e.clientX, e.clientY);
            } else if (e.which === 1) {     //鼠标左键事件
                if (outer.cur_skill === "fireball") {   //当前已经选中火球技能
                     outer.shoot_fireball(e.clientX, e.clientY);
                }
            }
            outer.cur_skill = null; //清空当前技能
        });
        $(window).keydown(function(e) {
            if (e.which === 81) {       //键盘按下事件
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        //确定火球的参数
        let x = this.x, y = this.y; //火球发射点就是当前玩家的位置
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1.0;
        //let damage = this.playground.height * 0.01;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length);
    }


    get_dist (x1, y1, x2, y2) { //求两点的欧几里得距离
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(tx, ty) {
        // 计算移动距离
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        // 计算移动角度，api接口：atan2(dy, dx)
        let angle = Math.atan2(ty - this.y, tx - this.x);
        // 位移 1 个单位长度（向着矢量方向移动到单位圆上）
        this.vx = Math.cos(angle);  //极直互化
        this.vy = Math.sin(angle);
    }
    update() {
        //浮点数精度运算
        if (this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
        } else {
            // 计算单位帧里的移动距离
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            // 还要减掉移动的距离
            this.move_length -= moved;
        }
        this.render();
    }



    render() {  //渲染一个圆
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    on_destroy() {
    }
}

