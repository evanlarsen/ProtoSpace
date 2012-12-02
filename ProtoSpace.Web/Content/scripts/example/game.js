var game;
(function (game) {
    var DIFFICULTY = 2;
    var ROCK_TIME = 110;
    var SUB_ROCK_COUNT = 4;
    var BULLET_TIME = 5;
    var BULLET_ENTROPY = 100;
    var TURN_FACTOR = 7;
    var BULLET_SPEED = 17;
    var KEYCODE_SPACE = 32;
    var KEYCODE_UP = 38;
    var KEYCODE_LEFT = 37;
    var KEYCODE_RIGHT = 39;
    var KEYCODE_DOWN = 40;
    var KEYCODE_W = 87;
    var KEYCODE_A = 65;
    var KEYCODE_D = 68;
    var shootHeld;
    var lfHeld;
    var rtHeld;
    var fwdHeld;
    var bckHeld;
    var timeToRock;
    var nextRock;
    var nextBullet;
    var rockBelt;
    var bulletStream;
    var canvas;
    var stage;
    var ship;
    var alive;
    var messageField;
    var scoreField;
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        stage = new createjs.Stage(canvas);
        scoreField = new createjs.Text("0", "bold 12px Arial", "#FFFFFF");
        scoreField.textAlign = "right";
        scoreField.x = canvas.width - 10;
        scoreField.y = 22;
        messageField = new createjs.Text("Welcome:  Click to play", "bold 24px Arial", "#FFFFFF");
        messageField.textAlign = "center";
        messageField.x = canvas.width / 2;
        messageField.y = canvas.height / 2;
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
        watchRestart();
    }
    game.init = init;
    function watchRestart() {
        stage.addChild(messageField);
        stage.update();
        canvas.onclick = handleClick;
    }
    function handleClick() {
        canvas.onclick = null;
        stage.removeChild(messageField);
        restart();
    }
    function restart() {
        stage.removeAllChildren();
        scoreField.text = (0).toString();
        stage.addChild(scoreField);
        rockBelt = new Array();
        bulletStream = new Array();
        alive = true;
        ship = new Ship();
        ship.x = canvas.width / 2;
        ship.y = canvas.height / 2;
        timeToRock = ROCK_TIME;
        nextRock = 0;
        nextBullet = 0;
        shootHeld = false;
        lfHeld = false;
        rtHeld = false;
        fwdHeld = false;
        stage.clear();
        stage.addChild(ship);
        createjs.Ticker.addListener(tick);
    }
    function tick() {
        if(nextBullet <= 0) {
            if(alive && shootHeld) {
                nextBullet = BULLET_TIME;
                fireBullet();
            }
        } else {
            nextBullet--;
        }
        if(alive && lfHeld) {
            ship.rotation -= TURN_FACTOR;
        } else {
            if(alive && rtHeld) {
                ship.rotation += TURN_FACTOR;
            }
        }
        if(alive && fwdHeld) {
            ship.accelerate();
        } else {
            if(alive && bckHeld) {
                ship.decelerate();
            }
        }
        if(nextRock <= 0) {
            if(alive) {
                timeToRock -= DIFFICULTY;
                var index = getSpaceRock(SpaceRock.LRG_ROCK);
                rockBelt[index].floatOnScreen(canvas.width, canvas.height);
                nextRock = timeToRock + timeToRock * Math.random();
            }
        } else {
            nextRock--;
        }
        if(alive && outOfBounds(ship, ship.bounds)) {
            placeInBounds(ship, ship.bounds);
        }
        for(var bullet in bulletStream) {
            var o = bulletStream[bullet];
            if(!o || !o.active) {
                continue;
            }
            if(outOfBounds(o, ship.bounds)) {
                placeInBounds(o, ship.bounds);
            }
            o.x += Math.sin(o.rotation * (Math.PI / -180)) * BULLET_SPEED;
            o.y += Math.cos(o.rotation * (Math.PI / -180)) * BULLET_SPEED;
            if(--o.entropy <= 0) {
                stage.removeChild(o);
                o.active = false;
            }
        }
        for(var spaceRock in rockBelt) {
            var r = rockBelt[spaceRock];
            if(!r || !r.active) {
                continue;
            }
            if(outOfBounds(r, r.bounds)) {
                placeInBounds(r, r.bounds);
            }
            r.tick();
            if(alive && r.hitRadius(ship.x, ship.y, ship.hit)) {
                alive = false;
                stage.removeChild(ship);
                messageField.text = "You're dead:  Click to play again";
                stage.addChild(messageField);
                watchRestart();
                continue;
            }
            for(var bullet in bulletStream) {
                var p = bulletStream[bullet];
                if(!p || !p.active) {
                    continue;
                }
                if(r.hitPoint(p.x, p.y)) {
                    var newSize;
                    switch(r.size) {
                        case SpaceRock.LRG_ROCK: {
                            newSize = SpaceRock.MED_ROCK;
                            break;

                        }
                        case SpaceRock.MED_ROCK: {
                            newSize = SpaceRock.SML_ROCK;
                            break;

                        }
                        case SpaceRock.SML_ROCK: {
                            newSize = 0;
                            break;

                        }
                    }
                    if(alive) {
                        addScore(r.score);
                    }
                    if(newSize > 0) {
                        var i;
                        var index;
                        var offSet;
                        for(i = 0; i < SUB_ROCK_COUNT; i++) {
                            index = getSpaceRock(newSize);
                            offSet = (Math.random() * r.size * 2) - r.size;
                            rockBelt[index].x = r.x + offSet;
                            rockBelt[index].y = r.y + offSet;
                        }
                    }
                    stage.removeChild(r);
                    rockBelt[spaceRock].active = false;
                    stage.removeChild(p);
                    bulletStream[bullet].active = false;
                }
            }
        }
        ship.tick();
        stage.update();
    }
                function outOfBounds(o, bounds) {
        return o.x < bounds * -2 || o.y < bounds * -2 || o.x > canvas.width + bounds * 2 || o.y > canvas.height + bounds * 2;
    }
                function placeInBounds(o, bounds) {
        if(o.x > canvas.width + bounds * 2) {
            o.x = bounds * -2;
        } else {
            if(o.x < bounds * -2) {
                o.x = canvas.width + bounds * 2;
            }
        }
        if(o.y > canvas.height + bounds * 2) {
            o.y = bounds * -2;
        } else {
            if(o.y < bounds * -2) {
                o.y = canvas.height + bounds * 2;
            }
        }
    }
    function fireBullet() {
        var o = bulletStream[getBullet()];
        o.x = ship.x;
        o.y = ship.y;
        o.rotation = ship.rotation;
        o.entropy = BULLET_ENTROPY;
        o.active = true;
        o.graphics.beginStroke("#FFFFFF").moveTo(-1, 0).lineTo(1, 0);
    }
    function getSpaceRock(size) {
        var i = 0;
        var len = rockBelt.length;
        while(i <= len) {
            if(!rockBelt[i]) {
                rockBelt[i] = new SpaceRock(size);
                break;
            } else {
                if(!rockBelt[i].active) {
                    rockBelt[i].activate(size);
                    break;
                } else {
                    i++;
                }
            }
        }
        if(len == 0) {
            rockBelt[0] = new SpaceRock(size);
        }
        stage.addChild(rockBelt[i]);
        return i;
    }
    function getBullet() {
        var i = 0;
        var len = bulletStream.length;
        while(i <= len) {
            if(!bulletStream[i]) {
                bulletStream[i] = new Bullet();
                break;
            } else {
                if(!bulletStream[i].active) {
                    bulletStream[i].active = true;
                    break;
                } else {
                    i++;
                }
            }
        }
        if(len == 0) {
            bulletStream[0] = new Bullet();
        }
        stage.addChild(bulletStream[i]);
        return i;
    }
    function handleKeyDown(e) {
        if(!e) {
            var e = window.event;
        }
        switch(e.keyCode) {
            case KEYCODE_SPACE: {
                shootHeld = true;
                break;

            }
            case KEYCODE_A:
            case KEYCODE_LEFT: {
                lfHeld = true;
                break;

            }
            case KEYCODE_D:
            case KEYCODE_RIGHT: {
                rtHeld = true;
                break;

            }
            case KEYCODE_W:
            case KEYCODE_UP: {
                fwdHeld = true;
                break;

            }
            case KEYCODE_DOWN: {
                bckHeld = true;
                break;

            }
        }
    }
    function handleKeyUp(e) {
        if(!e) {
            var e = window.event;
        }
        switch(e.keyCode) {
            case KEYCODE_SPACE: {
                shootHeld = false;
                break;

            }
            case KEYCODE_A:
            case KEYCODE_LEFT: {
                lfHeld = false;
                break;

            }
            case KEYCODE_D:
            case KEYCODE_RIGHT: {
                rtHeld = false;
                break;

            }
            case KEYCODE_W:
            case KEYCODE_UP: {
                fwdHeld = false;
                break;

            }
            case KEYCODE_DOWN: {
                bckHeld = false;
                break;

            }
        }
    }
    function addScore(value) {
        scoreField.text = (Number(scoreField.text) + Number(value)).toString();
    }
})(game || (game = {}));
//@ sourceMappingURL=game.js.map
