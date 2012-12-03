/// <reference path="libs/easel/easeljs.d.ts" />
/// <reference path="libs/jquery/jquery.d.ts" />

module game {

    var canvas: HTMLCanvasElement;
    var stage: createjs.Stage;

    export function init(canvasId: string) {
        canvas = <HTMLCanvasElement>document.getElementById(canvasId);
	    stage = new createjs.Stage(canvas);


    }
}