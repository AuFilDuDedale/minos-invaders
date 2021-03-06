var Alien = function (aType, aLine, aCol) {
    this.type = aType;
    this.points = 40 - 10 * aType;
    this.line = aLine;
    this.column = aCol;
    this.alive = true;
    this.height = 24;
    this.width = 28;
    this.positionX = 100 + this.width * this.column;
    this.positionY = 100 + 30 * this.line;
    this.direction = 1;
    this.state = 0;

    this.reset = function () {
        this.positionX = 100 + this.width * this.column;
        this.positionY = 100 + 30 * this.line;
    };

    this.changeState = function () { //change the state (2 different images for each alien)
        this.state = !this.state ? 20 : 0;
    };

    this.down = function () { //down the alien after changing direction
        this.positionY = this.positionY + 10;
    };

    this.move = function () { //set new position after moving and draw the alien
        if (this.positionY >= Game.height - 50) {
            Game.over();
        }
        this.positionX = this.positionX + 5 * Game.direction;
        this.changeState();
        if (this.alive) this.draw();
    };

    this.checkCollision = function () { //Check if the alien is killed by gun ray
        if (Gun.ray.active == true && this.alive == true) {
            if ((Gun.ray.positionX >= this.positionX && Gun.ray.positionX <= (this.positionX + this.width)) && (Gun.ray.positionY >= this.positionY && Gun.ray.positionY <= (this.positionY + this.height))) {
                this.kill();
                Gun.ray.destroy();
            }
        }
    };

    this.draw = function () { //draw the alien to his new position
        if (this.alive) { //draw the alien
            canvas.drawImage(
            pic,
            281,
            0,
            this.width,
            this.height,
            this.positionX,
            this.positionY,
            this.width,
            this.height);
        } else if (this.alive == null) { //draw the explosion
            canvas.clearRect(this.positionX, this.positionY, this.width, this.height);
            this.alive = false; //alien won't be displayed any more
        }
    };

    this.kill = function () { //kill the alien
        this.alive = null;
        canvas.clearRect(this.positionX, this.positionY, this.width, this.height);
        Game.refreshScore(this.points);
    }
};

Gun = {
    position: 220,
    toleft: false,
    toright: false,
    speed: 15,
    firestep: 0,
    animation: null,

    init: function () { //initialize the gun and his move
        this.draw();
        this.toLeft();
        this.toRight();
        setInterval("Gun.toLeft()", 30);
        setInterval("Gun.toRight()", 30);
    },

    animate: function() {
        this.firestep = this.firestep + 1;
	this.clear();
	if (this.firestep < 5) {
	    this.draw();
	} else {
	    this.firestep = 0;
            this.ray.create();
            clearInterval(this.animation);
	    this.animation = null;
	}
    },

    clear : function() {
	canvas.clearRect(this.position, 448, 40, 50);
    },

    draw: function () { //draws the gun
        canvas.drawImage(pic, 46 * this.firestep, 0, 46, 60, this.position, 448, 40, 45);
    },

    fire: function () { //shot
	if (this.firestep == 0 && !this.ray.active) {
            this.animation = setInterval("Gun.animate()", this.speed);
        }
    },

    toLeft: function () { //moves the gun to left
        if (this.toleft) {
            if (this.position - 5 > 0) {
		this.clear();
                this.position -= 5;
                this.draw();
            }
        }
    },

    toRight: function () { //moves the gun to right
        if (this.toright) {
            if (this.position + 30 < Game.width) {
		this.clear();
                this.position += 5;
                this.draw();
            }
        }
    },

    ray: { //gun ray
        positionX: 0,
        positionY: 465,
        length: 5,
        speed: 15,
        animation: null,
        active: false,
        create: function () { //created the ray if it does not exist
            if (!this.active) {
                this.positionX = Gun.position + 23;
                this.active = true;
                this.animation = setInterval("Gun.ray.animate()", this.speed);
            }

        },
        animate: function () { //animate the ray
            this.positionY -= this.length;
            if (this.positionY <= 5) this.destroy();
            else {
                Game.drawAliens();
                this.draw();
            }
        },
        draw: function () { //draw the ray and check collision with aliens
            if (this.active) {
                //canvas.beginPath();
                //canvas.strokeStyle = 'white';
                //canvas.lineWidth = 2;
                //canvas.moveTo(this.positionX, this.positionY);
                //canvas.lineTo(this.positionX, this.positionY + this.length);
                //canvas.stroke();
                canvas.drawImage(pic, 276, 0, 7, 32, this.positionX, this.positionY, 5, 33);
                //canvas.clearRect(0, 450, Game.width, 50);
		Gun.clear();
                Gun.draw();

                for (i = 0; i < 3; i++) {
                    for (j = 0; j < 11; j++) {
                        Game.aliens[i][j].checkCollision();
                    }
                }
            }
        },
        destroy: function () { //destroy the ray
            this.positionY = 465;
            this.active = false;
            clearInterval(this.animation);
            this.animation = null;
            Game.drawAliens();
        },
    }

};

Game = {
    types: [1, 2, 3], //define kinds of aliens
    aliens: [
        [11],
        [11],
        [11]
    ],
    height: 0,
    width: 0,
    interval: 0,
    intervalDefault: 500,
    direction: 1,
    animation: null,
    alives: 1,
    score: 0,
    level: 1,

    init: function (aWidth, aHeight) { //initialize default position and behaviour
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j] = new Alien(this.types[i], i, j);
                this.alives++;
                this.aliens[i][j].draw();
            }
        }
        this.width = aWidth;
        this.height = aHeight;
        this.play();
        Gun.init();
        this.refreshScore(0);
    },

    changeDirection: function () { //change the direction (left or right)
        if (this.direction == 1) { 
            this.direction = -1;
        } else {
            this.direction = 1;
        }
    },
    clearCanvas: function () { //clear the canvas (but not the gun)
        canvas.clearRect(0, 0, this.width, this.height - 50);
    },
    closeToLeft: function () { //check if the aliens reach the left border
        return (this.aliens[0][0].positionX - 10 < 0) ? true : false;
    },
    closeToRight: function () { //check if the aliens reach the right border
        return (this.aliens[2][10].positionX + 35 > this.width) ? true : false;
    },
    drawAliens: function () { //draw the aliens
        this.clearCanvas();
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j].draw();
            }
        }
    },
    animate: function () { //move the aliens
        this.clearCanvas();
	Gun.draw();
        Gun.ray.draw();
        this.checkAliens();
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j].move();
            }
        }
        if (this.closeToLeft() || this.closeToRight()) {
            this.changeDirection();
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 11; j++) {
                    this.aliens[i][j].down();
                }
            }
            this.increaseSpeed();
        }
    },
    play: function () { //play the game	
        this.interval = this.intervalDefault;
        this.interval = this.interval - (this.level * 20);
        this.animation = setInterval("Game.animate()", this.interval);
    },
    increaseSpeed: function (newInterval) { //increase the speed
        clearInterval(this.animation);
        if (newInterval === undefined) this.interval = this.interval - 10;
        else this.interval = newInterval;

        this.animation = setInterval("Game.animate()", this.interval);
    },
    onkeydown: function (ev) { //key down event
        if (ev.keyCode == 37) Gun.toleft = true;
        else if (ev.keyCode == 39) Gun.toright = true;
        else if (ev.keyCode == 32 && Gun.firestep == 0) {
	    Gun.fire();
            ev.preventDefault();
	}
        else return;
    },
    onkeyup: function (ev) { //key up event
        if (ev.keyCode == 37) Gun.toleft = false;
        else if (ev.keyCode == 39) Gun.toright = false;
        else return;
    },
    over: function () { //ends the game
        clearInterval(this.animation);
        canvas.clearRect(0, 0, this.width, this.height);
	document.getElementById("perdu").style.visibility='visible';
        document.getElementById("perdu").style.display='block';
    },
    checkAliens: function () { //check number of aliens
        if (this.alives == 0) {
	    clearInterval(this.animation);
            canvas.clearRect(0, 0, this.width, this.height);
	    document.getElementById("gagne").style.visibility='visible';
            document.getElementById("gagne").style.display='block';
	}
        else if (this.alives == 1) this.increaseSpeed(150 - (this.level * 10));
        else if (this.alives <= 10) this.increaseSpeed(200 - (this.level * 10));
        else if (this.alives <= 10) this.increaseSpeed(300 - (this.level * 10));
        else if (this.alives <= 25) this.increaseSpeed(500 - (this.level * 10));
    },
    refreshScore: function (points) { //display the score
        this.alives--;
        this.score += points;
    },
    nextLevel: function () {
        //resurect aliens
        this.alives = 0;
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 11; j++) {
                this.aliens[i][j].alive = true;
                this.aliens[i][j].reset()
                this.alives++;
            }
        }
        clearInterval(this.animation);
	Gun.clear();
	Gun.position = 220;
        this.play();
    }
};

//define the global context of the game
var element = document.getElementById('minos_invaders_canvas');
var canvas;
var pic;

function minos_invaders_init() {
    if (element.getContext) {
        canvas = element.getContext('2d');

        pic = new Image();
        pic.src = 'https://aufildudedale.fr/minos-invaders/sprite.png';

        Game.init(530, 500);

        document.body.onkeydown = function (ev) {
            Game.onkeydown(ev);
        };
        document.body.onkeyup = function (ev) {
            Game.onkeyup(ev);
        };

        var rejouer = document.getElementById("rejouer_button");
        rejouer.onclick = function() {
            Game.nextLevel();
	    document.getElementById("perdu").style.visibility='invisible';
            document.getElementById("perdu").style.display='none';
            document.getElementById("gagne").style.visibility='invisible';
            document.getElementById("gagne").style.display='none';
        }

	document.getElementById("perdu").style.visibility='invisible';
	document.getElementById("perdu").style.display='none';
	document.getElementById("gagne").style.visibility='invisible';
	document.getElementById("gagne").style.display='none';
    }
};
