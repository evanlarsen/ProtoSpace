var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Bullet = (function (_super) {
    __extends(Bullet, _super);
    function Bullet() {
        _super.call(this);
        this.init();
    }
    Bullet.prototype.init = function () {
        (_super.prototype).initialize();
    };
    return Bullet;
})(createjs.Shape);
//@ sourceMappingURL=bullet.js.map
