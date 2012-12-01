/// <reference path="../libs/easel/easeljs.d.ts" />
/// <reference path="spacerock.ts" />
/// <reference path="ship.ts" />
/// <reference path="bullet.ts" />

module game {
    var DIFFICULTY = 2;			//how fast the game gets mor difficult
    var ROCK_TIME = 110;		//aprox tick count untill a new asteroid gets introduced
    var SUB_ROCK_COUNT = 4;		//how many small rocks to make on rock death
    var BULLET_TIME = 5;		//ticks between bullets
    var BULLET_ENTROPY = 100;	//how much energy a bullet has before it runs out.

    var TURN_FACTOR = 7;		//how far the ship turns per frame
    var BULLET_SPEED = 17;		//how fast the bullets move

    var KEYCODE_SPACE = 32;		//usefull keycode
    var KEYCODE_UP = 38;		//usefull keycode
    var KEYCODE_LEFT = 37;		//usefull keycode
    var KEYCODE_RIGHT = 39;		//usefull keycode
    var KEYCODE_W = 87;			//usefull keycode
    var KEYCODE_A = 65;			//usefull keycode
    var KEYCODE_D = 68;			//usefull keycode

    var shootHeld: bool;		//is the user holding a shoot command
    var lfHeld: bool;			//is the user holding a turn left command
    var rtHeld: bool;			//is the user holding a turn right command
    var fwdHeld: bool;			//is the user holding a forward command

    var timeToRock: number;		//difficulty adjusted version of ROCK_TIME
    var nextRock: number;		//ticks left untill a new space rock arrives
    var nextBullet: number;		//ticks left untill the next shot is fired

    var rockBelt: SpaceRock[];  //space rock array
    var bulletStream: Bullet[]; //bullet array

    var canvas: HTMLCanvasElement;  //Main canvas
    var stage: createjs.Stage;      //Main display stage

    var ship: Ship;			//the actual ship
    var alive: bool;    //wheter the player is alive

    var messageField: createjs.Text;		//Message display field
    var scoreField: createjs.Text;			//score Field

    export function init(canvasId: string) {
	    //associate the canvas with the stage
	    canvas = <HTMLCanvasElement>document.getElementById(canvasId);
	    stage = new createjs.Stage(canvas);
	
	    scoreField = new createjs.Text("0", "bold 12px Arial", "#FFFFFF");
	    scoreField.textAlign = "right";
	    scoreField.x = canvas.width - 10;
	    scoreField.y = 22;
	
	    messageField = new createjs.Text("Welcome:  Click to play", "bold 24px Arial", "#FFFFFF");
	    messageField.textAlign = "center";
	    messageField.x = canvas.width / 2;
	    messageField.y = canvas.height / 2;

        //register key functions
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
	
	    watchRestart();
    }
    function watchRestart() {
	    //watch for clicks
	    stage.addChild(messageField);
	    stage.update(); 	//update the stage to show text
	    canvas.onclick = handleClick;
    }
    
    function handleClick() {
	    //prevent extra clicks and hide text
	    canvas.onclick = null;
	    stage.removeChild(messageField);
	
	    restart();
    }

    //reset all game logic
    function restart() {
	    //hide anything on stage and show the score
	    stage.removeAllChildren();
	    scoreField.text = (0).toString();
	    stage.addChild(scoreField);
	
	    //new arrays to dump old data
	    rockBelt = new Array();
	    bulletStream = new Array();
	
	    //create the player
	    alive = true;
	    ship = new Ship();
	    ship.x = canvas.width / 2;
	    ship.y = canvas.height / 2;
	
	    //log time untill values
	    timeToRock = ROCK_TIME;
	    nextRock = 0;
	    nextBullet = 0;
	
	    //reset key presses
	    shootHeld =	false;
	    lfHeld =	false;
	    rtHeld =	false;
	    fwdHeld =	false;
	    //dnHeld =	false;
	
	    //ensure stage is blank and add the ship
	    stage.clear();
	    stage.addChild(ship);
	
	    //start game timer
	    createjs.Ticker.addListener(tick);
    }

    function tick() {
	    //handle firing
	    if(nextBullet <= 0) {
		    if(alive && shootHeld){
			    nextBullet = BULLET_TIME;
			    fireBullet();
		    }
	    } else {
		    nextBullet--;
	    }
	
	    //handle turning
	    if(alive && lfHeld){
		    ship.rotation -= TURN_FACTOR;
	    } else if(alive && rtHeld) {
		    ship.rotation += TURN_FACTOR;
	    }
	
	    //handle thrust
	    if(alive && fwdHeld){
		    ship.accelerate();
	    }
	
	    //handle new spaceRocks
	    if(nextRock <= 0) {
		    if(alive){
			    timeToRock -= DIFFICULTY;	//reduce spaceRock spacing slowly to increase difficulty with time
			    var index = getSpaceRock(SpaceRock.LRG_ROCK);
			    rockBelt[index].floatOnScreen(canvas.width, canvas.height);
			    nextRock = timeToRock + timeToRock*Math.random();
		    }
	    } else {
		    nextRock--;
	    }
	
	    //handle ship looping
	    if(alive && outOfBounds(ship, ship.bounds)) {
		    placeInBounds(ship, ship.bounds);
	    }
	
	    //handle bullet movement and looping
	    for(var bullet in bulletStream) {
		    var o = <Bullet>bulletStream[bullet];
		    if(!o || !o.active) { continue; }
		    if(outOfBounds(o, ship.bounds)) {
			    placeInBounds(o, ship.bounds);
		    }
		    o.x += Math.sin(o.rotation*(Math.PI/-180))*BULLET_SPEED;
		    o.y += Math.cos(o.rotation*(Math.PI/-180))*BULLET_SPEED;
		
		    if(--o.entropy <= 0) {
			    stage.removeChild(o);
			    o.active = false;
		    }
	    }
	
	    //handle spaceRocks (nested in one loop to prevent excess loops)
	    for(var spaceRock in rockBelt) {
		    var r = <SpaceRock>rockBelt[spaceRock];
		    if(!r || !r.active) { continue; }
		
		    //handle spaceRock movement and looping
		    if(outOfBounds(r, r.bounds)) {
			    placeInBounds(r, r.bounds);
		    }
		    r.tick();
		
		
		    //handle spaceRock ship collisions
		    if(alive && r.hitRadius(ship.x, ship.y, ship.hit)) {
			    alive = false;
			
			    stage.removeChild(ship);
			    messageField.text = "You're dead:  Click to play again";
			    stage.addChild(messageField);
			    watchRestart();
			
			    continue;
		    }
		
		    //handle spaceRock bullet collisions
		    for(var bullet in bulletStream) {
			    var p = bulletStream[bullet];
			    if(!p || !p.active) { continue; }
			
			    if(r.hitPoint(p.x, p.y)) {
				    var newSize;
				    switch(r.size) {
					    case SpaceRock.LRG_ROCK: newSize = SpaceRock.MED_ROCK;
						    break;
					    case SpaceRock.MED_ROCK: newSize = SpaceRock.SML_ROCK;
						    break;
					    case SpaceRock.SML_ROCK: newSize = 0;
						    break;
				    }
				
				    //score
				    if(alive) {
					    addScore(r.score);
				    }
				
				    //create more
				    if(newSize > 0) {
					    var i;
					    var index;
					    var offSet;
					
					    for(i=0; i < SUB_ROCK_COUNT; i++){
						    index = getSpaceRock(newSize);
						    offSet = (Math.random() * r.size*2) - r.size;
						    rockBelt[index].x = r.x + offSet;
						    rockBelt[index].y = r.y + offSet;
					    }
				    }
				
				    //remove
				    stage.removeChild(r);
				    rockBelt[spaceRock].active = false;
				
				    stage.removeChild(p);
				    bulletStream[bullet].active = false;
			    }
		    }
	    }
	
	    //call sub ticks
	    ship.tick();
	    stage.update();
    }

    function outOfBounds(o: Ship, bounds: number): bool;
    function outOfBounds(o: Bullet, bounds: number): bool;
    function outOfBounds(o: SpaceRock, bounds: number): bool;
    function outOfBounds(o: any, bounds: number): bool {
	    //is it visibly off screen
	    return o.x < bounds*-2 || o.y < bounds*-2 || o.x > canvas.width+bounds*2 || o.y > canvas.height+bounds*2;
    }

    function placeInBounds(o: Ship, bounds: number);
    function placeInBounds(o: Bullet, bounds: number);
    function placeInBounds(o: SpaceRock, bounds: number);
    function placeInBounds(o: any, bounds: number) {
	    //if its visual bounds are entirely off screen place it off screen on the other side
	    if(o.x > canvas.width+bounds*2) {
		    o.x = bounds*-2;
	    } else if(o.x < bounds*-2) {
		    o.x = canvas.width+bounds*2;
	    }
	
	    //if its visual bounds are entirely off screen place it off screen on the other side
	    if(o.y > canvas.height+bounds*2) {
		    o.y = bounds*-2;
	    } else if(o.y < bounds*-2) {
		    o.y = canvas.height+bounds*2;
	    }
    }

    function fireBullet() {
	    //create the bullet
	    var o = bulletStream[getBullet()];
	    o.x = ship.x;
	    o.y = ship.y;
	    o.rotation = ship.rotation;
	    o.entropy = BULLET_ENTROPY;
	    o.active = true;
	
	    //draw the bullet
	    o.graphics.beginStroke("#FFFFFF").moveTo(-1, 0).lineTo(1, 0);
    }
	
    function getSpaceRock(size: number): number {
	    var i = 0;
	    var len = rockBelt.length;
	
	    //pooling approach
	    while(i <= len){
		    if(!rockBelt[i]) {
			    rockBelt[i] = new SpaceRock(size);
			    break;
		    } else if(!rockBelt[i].active) {
			    rockBelt[i].activate(size);
			    break;
		    } else {
			    i++;
		    }
	    }
	
	    if(len == 0) {
		    rockBelt[0] = new SpaceRock(size);
	    }
	
	    stage.addChild(rockBelt[i]);
	    return i;
    }

    function getBullet(): number {
	    var i = 0;
	    var len = bulletStream.length;
	
	    //pooling approach
	    while(i <= len){
		    if(!bulletStream[i]) {
			    bulletStream[i] = new Bullet();
			    break;
		    } else if(!bulletStream[i].active) {
			    bulletStream[i].active = true;
			    break;
		    } else {
			    i++;
		    }
	    }
	
	    if(len == 0) {
		    bulletStream[0] = new Bullet();
	    }
	
	    stage.addChild(bulletStream[i]);
	    return i;
    }

    //allow for WASD and arrow control scheme
    function handleKeyDown(e: KeyboardEvent) {
	    //cross browser issues exist
	    if(!e){ var e = window.event; }
	    switch(e.keyCode) {
		    case KEYCODE_SPACE:	shootHeld = true; break;
		    case KEYCODE_A:
		    case KEYCODE_LEFT:	lfHeld = true; break;
		    case KEYCODE_D:
		    case KEYCODE_RIGHT: rtHeld = true; break;
		    case KEYCODE_W:
		    case KEYCODE_UP:	fwdHeld = true; break;
	    }
    }

    function handleKeyUp(e: KeyboardEvent) {
	    //cross browser issues exist
	    if(!e){ var e = window.event; }
	    switch(e.keyCode) {
		    case KEYCODE_SPACE:	shootHeld = false; break;
		    case KEYCODE_A:
		    case KEYCODE_LEFT:	lfHeld = false; break;
		    case KEYCODE_D:
		    case KEYCODE_RIGHT: rtHeld = false; break;
		    case KEYCODE_W:
		    case KEYCODE_UP:	fwdHeld = false; break;
	    }
    }

    function addScore(value: number) {
	    //trust the field will have a number and add the score
	    scoreField.text = (Number(scoreField.text) + Number(value)).toString();
    }

} // end of module Example






