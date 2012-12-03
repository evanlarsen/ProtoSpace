var game;
(function (game) {
    var canvas;
    var stage;
    function init(canvasId) {
        canvas = document.getElementById(canvasId);
        stage = new createjs.Stage(canvas);
    }
    game.init = init;
})(game || (game = {}));
//@ sourceMappingURL=game.js.map
