var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Ship = (function (_super) {
    __extends(Ship, _super);
    function Ship() {
        _super.call(this);
        this.shipFlame = null;
        this.shipBody = null;
        this.timeout = 0;
        this.thrust = 0;
        this.vX = 0;
        this.vY = 0;
        this.bounds = 0;
        this.hit = 0;
        this.init();
    }
    Ship.TOGGLE = 60;
    Ship.MAX_THRUST = 2;
    Ship.MAX_VELOCITY = 5;
    Ship.prototype.init = function () {
        (_super.prototype).initialize();
        this.shipFlame = new createjs.Shape();
        this.shipBody = new createjs.Shape();
        this.addChild(this.shipFlame);
        this.addChild(this.shipBody);
        this.makeShape();
        this.timeout = 0;
        this.thrust = 0;
        this.vX = 0;
        this.vY = 0;
    };
    Ship.prototype.makeShape = function () {
        var g = this.shipBody.graphics;
        g.clear();
        g.beginStroke("#FFFFFF");
        g.moveTo(0, 10);
        g.lineTo(5, -6);
        g.lineTo(0, -2);
        g.lineTo(-5, -6);
        g.closePath();
        var o = this.shipFlame;
        o.scaleX = 0.5;
        o.scaleY = 0.5;
        o.y = -5;
        g = o.graphics;
        g.clear();
        g.beginStroke("#FFFFFF");
        g.moveTo(2, 0);
        g.lineTo(4, -3);
        g.lineTo(2, -2);
        g.lineTo(0, -5);
        g.lineTo(-2, -2);
        g.lineTo(-4, -3);
        g.lineTo(-2, -0);
        this.bounds = 10;
        this.hit = this.bounds;
    };
    Ship.prototype.tick = function () {
        this.x += this.vX;
        this.y += this.vY;
        if(this.thrust > 0) {
            this.timeout++;
            this.shipFlame.alpha = 1;
            if(this.timeout > Ship.TOGGLE) {
                this.timeout = 0;
                if(this.shipFlame.scaleX == 1) {
                    this.shipFlame.scaleX = 0.5;
                    this.shipFlame.scaleY = 0.5;
                } else {
                    this.shipFlame.scaleX = 1;
                    this.shipFlame.scaleY = 1;
                }
            }
            this.thrust -= 0.5;
        } else {
            this.shipFlame.alpha = 0;
            this.thrust = 0;
        }
    };
    Ship.prototype.accelerate = function () {
        this.thrust += this.thrust + 0.6;
        if(this.thrust >= Ship.MAX_THRUST) {
            this.thrust = Ship.MAX_THRUST;
        }
        this.vX += Math.sin(this.rotation * (Math.PI / -180)) * this.thrust;
        this.vY += Math.cos(this.rotation * (Math.PI / -180)) * this.thrust;
        this.vX = Math.min(Ship.MAX_VELOCITY, Math.max(-Ship.MAX_VELOCITY, this.vX));
        this.vY = Math.min(Ship.MAX_VELOCITY, Math.max(-Ship.MAX_VELOCITY, this.vY));
    };
    Ship.prototype.decelerate = function () {
        this.thrust += this.thrust - 0.6;
        if(this.thrust <= -Ship.MAX_THRUST) {
            this.thrust = -Ship.MAX_THRUST;
        }
        this.vX += Math.sin(this.rotation * (Math.PI / -180)) * this.thrust;
        this.vY += Math.cos(this.rotation * (Math.PI / -180)) * this.thrust;
        this.vX = Math.max(-Ship.MAX_VELOCITY, Math.min(Ship.MAX_VELOCITY, this.vX));
        this.vY = Math.max(-Ship.MAX_VELOCITY, Math.min(Ship.MAX_VELOCITY, this.vY));
    };
    return Ship;
})(createjs.Container);
//@ sourceMappingURL=ship.js.map
