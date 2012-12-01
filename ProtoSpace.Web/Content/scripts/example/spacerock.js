var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var SpaceRock = (function (_super) {
    __extends(SpaceRock, _super);
    function SpaceRock(size) {
        _super.call(this);
        this.bounds = 0;
        this.hit = 0;
        this.size = 0;
        this.spin = 0;
        this.score = 0;
        this.vX = 0;
        this.vY = 0;
        this.active = false;
        this.init(size);
    }
    SpaceRock.LRG_ROCK = 40;
    SpaceRock.MED_ROCK = 20;
    SpaceRock.SML_ROCK = 10;
    SpaceRock.prototype.init = function (size) {
        (_super.prototype).initialize();
        this.activate(size);
    };
    SpaceRock.prototype.getShape = function (size) {
        var angle = 0;
        var radius = size;
        this.size = size;
        this.hit = size;
        this.bounds = 0;
        this.graphics.clear();
        this.graphics.beginStroke("#FFFFFF");
        this.graphics.moveTo(0, size);
        while(angle < (Math.PI * 2 - 0.5)) {
            angle += 0.25 + (Math.random() * 100) / 500;
            radius = size + (size / 2 * Math.random());
            this.graphics.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
            if(radius > this.bounds) {
                this.bounds = radius;
            }
            this.hit = (this.hit + radius) / 2;
        }
        this.graphics.closePath();
        this.hit *= 1.1;
    };
    SpaceRock.prototype.activate = function (size) {
        this.getShape(size);
        var angle = Math.random() * (Math.PI * 2);
        this.vX = Math.sin(angle) * (5 - size / 10);
        this.vY = Math.cos(angle) * (5 - size / 10);
        this.spin = (Math.random() + 0.2) * this.vX;
        this.score = (5 - size / 10) * 100;
        this.active = true;
    };
    SpaceRock.prototype.tick = function () {
        this.rotation += this.spin;
        this.x += this.vX;
        this.y += this.vY;
    };
    SpaceRock.prototype.floatOnScreen = function (width, height) {
        if(Math.random() * (width + height) > width) {
            if(this.vX > 0) {
                this.x = -2 * this.bounds;
            } else {
                this.x = 2 * this.bounds + width;
            }
            if(this.vY > 0) {
                this.y = Math.random() * height * 0.5;
            } else {
                this.y = Math.random() * height * 0.5 + 0.5 * height;
            }
        } else {
            if(this.vY > 0) {
                this.y = -2 * this.bounds;
            } else {
                this.y = 2 * this.bounds + height;
            }
            if(this.vX > 0) {
                this.x = Math.random() * width * 0.5;
            } else {
                this.x = Math.random() * width * 0.5 + 0.5 * width;
            }
        }
    };
    SpaceRock.prototype.hitPoint = function (tX, tY) {
        return this.hitRadius(tX, tY, 0);
    };
    SpaceRock.prototype.hitRadius = function (tX, tY, tHit) {
        if(tX - tHit > this.x + this.hit) {
            return;
        }
        if(tX + tHit < this.x - this.hit) {
            return;
        }
        if(tY - tHit > this.y + this.hit) {
            return;
        }
        if(tY + tHit < this.y - this.hit) {
            return;
        }
        return this.hit + tHit > Math.sqrt(Math.pow(Math.abs(this.x - tX), 2) + Math.pow(Math.abs(this.y - tY), 2));
    };
    return SpaceRock;
})(createjs.Shape);
//@ sourceMappingURL=spacerock.js.map
