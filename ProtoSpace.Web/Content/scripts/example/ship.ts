/// <reference path="../libs/easel/easeljs.d.ts" />

class Ship extends createjs.Container{
    static TOGGLE = 60;
    static MAX_THRUST = 2;
    static MAX_VELOCITY = 5;

    shipFlame: createjs.Shape = null;
    shipBody: createjs.Shape = null;
    
    timeout = 0;
    thrust = 0;
    
    vX = 0;
    vY = 0;
    
    bounds = 0;
    hit = 0;

    constructor () {
        super();
        this.init();
    }

    init() {
        // createjs.Container needs to be initialized
        (<any>super).initialize();

		this.shipFlame = new createjs.Shape();
		this.shipBody = new createjs.Shape();
		
		this.addChild(this.shipFlame);
		this.addChild(this.shipBody);
		
		this.makeShape();
		this.timeout = 0;
		this.thrust = 0;
		this.vX = 0;
		this.vY = 0;
    }

    makeShape() {
		//draw ship body
		var g = this.shipBody.graphics;
		g.clear();
		g.beginStroke("#FFFFFF");
		
		g.moveTo(0, 10);	//nose
		g.lineTo(5, -6);	//rfin
		g.lineTo(0, -2);	//notch
		g.lineTo(-5, -6);	//lfin
		g.closePath(); // nose
		
		
		//draw ship flame
		var o = this.shipFlame;
		o.scaleX = 0.5;
		o.scaleY = 0.5;
		o.y = -5;
		
		g = o.graphics;
		g.clear();
		g.beginStroke("#FFFFFF");
		
		
		g.moveTo(2, 0);		//ship
		g.lineTo(4, -3);	//rpoint
		g.lineTo(2, -2);	//rnotch
		g.lineTo(0, -5);	//tip
		g.lineTo(-2, -2);	//lnotch
		g.lineTo(-4, -3);	//lpoint
		g.lineTo(-2, -0);	//ship
		
		//furthest visual element
		this.bounds = 10; 
		this.hit = this.bounds;
	}

    tick() {
		//move by velocity
		this.x += this.vX;
		this.y += this.vY;
		
		//with thrust flicker a flame every Ship.TOGGLE frames, attenuate thrust
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
	}

    accelerate() {
		//increase push amount for acceleration
		this.thrust += this.thrust + 0.6;
		if(this.thrust >= Ship.MAX_THRUST) {
			this.thrust = Ship.MAX_THRUST;
		}
		
		//accelerate
		this.vX += Math.sin(this.rotation*(Math.PI/-180))*this.thrust;
		this.vY += Math.cos(this.rotation*(Math.PI/-180))*this.thrust;
		
		//cap max speeds
		this.vX = Math.min(Ship.MAX_VELOCITY, Math.max(-Ship.MAX_VELOCITY, this.vX));
		this.vY = Math.min(Ship.MAX_VELOCITY, Math.max(-Ship.MAX_VELOCITY, this.vY));
	}

    decelerate() {
        //increase push amount for acceleration
		this.thrust += this.thrust - 0.6;
		if(this.thrust <= -Ship.MAX_THRUST) {
			this.thrust = -Ship.MAX_THRUST;
		}
		
		//accelerate
		this.vX += Math.sin(this.rotation*(Math.PI/-180))*this.thrust;
		this.vY += Math.cos(this.rotation*(Math.PI/-180))*this.thrust;
		
		//cap max speeds
		this.vX = Math.max(-Ship.MAX_VELOCITY, Math.min(Ship.MAX_VELOCITY, this.vX));
		this.vY = Math.max(-Ship.MAX_VELOCITY, Math.min(Ship.MAX_VELOCITY, this.vY));
    }
}