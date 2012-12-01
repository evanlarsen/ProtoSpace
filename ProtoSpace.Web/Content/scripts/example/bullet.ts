/// <reference path="../libs/easel/easeljs.d.ts" />

class Bullet extends createjs.Shape {
    active: bool;
    entropy: number;

    constructor () {
        super();
        this.init();
    }

    init() {
        // createjs.Shape needs to be initialized
        (<any>super).initialize();
    }
}