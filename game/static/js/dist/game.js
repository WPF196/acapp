class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            设置
        </div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}

let AC_GAME_OBJECTS = [];   //用于记录当前画布中，需要渲染的对象有哪些

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);  //将当前新建的对象，加入到全局的画布中去，参与渲染

        this.has_called_start = false;  //是否执行过 start 函数
        this.timedelta = 0;             //当前帧距离上一帧的时间间隔
        // 该数据记录是为了后续计算速度等参数的
    }
    start() {   //只会在第一帧执行一次

    }
    update() {  //每一帧均会执行一次

    }
    on_destroy() {  //在被销毁前执行一次

    }
    destroy() { //删掉该物体
        this.on_destroy();  //删掉该物体前，执行删前的操作

        // 在全局渲染物体中，找到该物体，并将其删掉
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] === this) {  //三等号，在js里额外加了一层类型相等约束
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;             //上一帧的时间间隔
let AC_GAME_ANIMATION = function(timestamp) {  // 回调函数，实现：每一帧重绘时，都会执行一遍
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) { //如果还未执行初始帧动作，就先执行
            obj.start();
            obj.has_called_start = true;
        }
        else {  //执行过初始帧，就执行每一帧的任务
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp; //更新最后一次时间戳
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);   // js提供的api，将1s等分成60分

class GameMap extends AcGameObject {    //继承自游戏引擎基类
    constructor(playground) {
        super();    //自函数功能：调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`); //创建一个canvas的jQuery对象，就是我们要实现的画布
        this.ctx = this.$canvas[0].getContext('2d'); //jQuery对象是一个数组，第一个索引是html对象
        //设置画布的宽高
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
    }
    update() {  //游戏地图每帧都要渲染
        this.render();
    }
    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
 }

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

class FireBall extends AcGameObject {
    constructor (playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) { // 坐标，半径、速度（矢量方向），颜色，模速度、射程距离，火球伤害值
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx; 
        this.vy = vy; 
        this.radius = radius;
        this.color = color;  
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;
    }   

    start() {
    }   

    update() {
        if (this.move_length < this.eps) {  // 如果已经移动完了，就需要销毁自己
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;  // 方向乘距离
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }
        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(obj) {
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        if (distance < this.radius + obj.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

class AcGamePlayground {
        constructor(root) {
                    this.root = root;
                    this.$playground = $(`<div class="ac-game-playground"></div>`);
                    //this.hide();
                    this.root.$ac_game.append(this.$playground);
                    this.width = this.$playground.width();
                    this.height = this.$playground.height();
                    this.game_map = new GameMap(this);
                    this.players = [];  // 存放当前游戏中的所有玩家
                    //将玩家加入游戏中
                    this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
                    this.start();
                }

        start() {
                }

        show() {  // 打开playground界面
                    this.$playground.show();
                }

        hide() {  // 关闭playground界面
                    this.$playground.hide();
                }
}

export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        //this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {
    }
}
