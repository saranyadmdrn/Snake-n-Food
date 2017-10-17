//set up a grey canvas
document.addEventListener('DOMContentLoaded',function(){

	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext('2d');
	let score = document.getElementById('score');
	let lastScore = document.getElementById('lastScore');
	let scoreValue = Number(score.innerHTML);

	//size of the object on the canvas
	let pointSize = 20;

	let width = canvas.width;
	let height = canvas.height;

	//divide the canvas into cells
	let w = width / pointSize;
	let h = height / pointSize;
	let gameStarted = false;

	let drawCanvas = function(){
		ctx.fillStyle = "grey";
		ctx.fillRect(0,0,500,500);

		ctx.fillStyle = "white";
		ctx.font = "30px Arial";
		ctx.textAlign = "center";
		ctx.fillText("Press space bar to start the game",width/2,height/2);
	}

	//let's user place the snake on the canvas
	let drawSnakeByHand = document.getElementById('canvas');
	let snakeDrawn = false;

	/*
	Build the objects on the canvas.
	Snake is rectangle and gold in color.
	Food is round and red in color.
	*/
	class Roles{
		constructor(x,y){
			this.x = x;
			this.y = y;	
		}

		//draws and fills a rectangle(cell) on the canvas
		drawSnake(color){
			let x = this.x * pointSize;
			let y = this.y * pointSize;
			ctx.fillStyle = color;
			ctx.fillRect(x, y, pointSize, pointSize);
		}

		//draws and fills a circle(cell) on the canvas
		drawFood(color){
			let x = (this.x * pointSize) + (pointSize / 2);
			let y = (this.y * pointSize) + (pointSize / 2);
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(x, y, pointSize/2, 0, Math.PI * 2, false);
			ctx.fill();
		}

		/* 
		Collision detection compares one object with another.
		Checks if head of the snake has collided with its tail or wall or food.
		*/
		checkCollisionRoles(role){
			return this.x === role.x && this.y === role.y;
		}

	}

	/*
	Initially the Snake is built with a head and as 
	the snake feeds on the food, its size(tail) grows.
	*/
	class Snake extends Roles{
		constructor(){
			super();

			/*
			Represents the body of the snake.
			At the start of the game, this array contains one cell
			as the body of the snake.
			*/
			this.growth = [
				new Roles(7,5)
			];

			/*
			At the start of the game, the snake will move to the right.
			nextDirection stores the next legal direction that the snake will
			move during the animation.
			*/
			this.currDirection = 'right';
			this.nextDirection = 'right';
		}

		//draws a golden snake on the canvas based on length of growth array.
		draw(){
			//console.log(this.growth);
			for(let i = 0 ; i < this.growth.length ; i++){
				this.growth[i].drawSnake('gold');
			}
		}


		/*
		Move the snake by adding a new head at the beginning of the growth array
		and removing the end of the growth array. Also, checks for collision.
		*/
		moveSnake(){
			let head = this.growth[0];
			let newHead;
			
			/*
			sets the current direction to next direction and updates the direction of 
			the snake to the latest pressed direction by the player.
			*/
			this.currDirection = this.nextDirection;
			if(this.currDirection === 'right'){
				newHead = new Roles(head.x + 1, head.y);
			}
			else if(this.currDirection === 'left'){
				newHead = new Roles(head.x - 1, head.y);
			}
			else if(this.currDirection === 'down'){
				newHead = new Roles(head.x, head.y + 1);
			}
			else if(this.currDirection === 'up'){
				newHead = new Roles(head.x, head.y - 1);
			}

			//console.log(newHead);

			//checks if the snake has collided with itself or with the wall
			if(this.checkCollision(newHead)){
				endGame();
				return;
			}

			this.growth.unshift(newHead);

			//checks if the position of the head of the snake and food are same
			if(newHead.checkCollisionRoles(foodObj.position)){
				updateScore(++scoreValue);
				foodObj.moveFood();
			}
			else{
				this.growth.pop();
			}

		}

		checkCollision(head){
			let leftSide = (head.x === 0);
			let rightSide = (head.x === w-1);
			let top = (head.y === 0);
			let bottom = (head.y === h-1);

			let wall = leftSide || rightSide || top || bottom;

			let selfCollision = false;
			for(let i = 0 ; i < this.growth.length ; i++){
				if(head.checkCollisionRoles(this.growth[i])){
					selfCollision = true;
				}
			}

			return wall || selfCollision; 
		}

		//checks for illegal direction by the player
		handleMovement(keycode){
			if (this.currDirection === "up" && keycode === "down") {
	     		 return;
	    	} 
	    	else if (this.currDirection === "right" && keycode === "left") {
	      		return;
	    	} 
	    	else if (this.currDirection === "down" && keycode === "up") {
	      		return;
	   		 } 
	    	else if (this.currDirection === "left" && keycode === "right") {
	      		return;
	    	}
	    	else if(keycode === "space"){
	    		if(!gameStarted){
	    			update();
	    		}
	    		return;	
	    	}
	   		this.nextDirection = keycode;

		}
	}

	class Food extends Roles{
		constructor(){
			super();
			this.position = new Roles(10,10);
		}

		draw(color){
			this.position.drawFood('red');
		}

		//places food randomly on canvas away from the snake.
		moveFood(){

			let placeFood = false;
			while(!placeFood){
				let x = Math.floor(Math.random() * (w-2)) + 1;
				let y = Math.floor(Math.random() * (h-2)) + 1;
				this.position = new Roles(x,y);
				placeFood = true;
				for(let i = 0; i < snakeObj.growth.length; ++i){
					if(this.position.x == snakeObj.growth[i].x && this.position.y == snakeObj.growth[i].y){
						placeFood = false;
						break;
					}
				}

			}
			
		}
	}




	//let snakeObj = new Roles(3,4);
	//snakeObj.drawSnake("gold");
	let snakeObj;
	//snakeObj.draw();

	let foodObj;
	//foodObj.moveFood();
	//foodObj.draw();



	//lets the user position the snake on the canvas
	drawSnakeByHand.onclick = function(event){
		if(!snakeDrawn){
			drawSnakeHand(event);
		}
		else{
			console.log("snake already placed");
		}
		
	};

	//user positions the snake on the canvas
	function drawSnakeHand(event){
		snakeDrawn = true;
		let point = canvas.getBoundingClientRect();
		let x = event.clientX - point.left;
	    let y = event.clientY - point.top;
	    let ctx = canvas.getContext('2d');
	  	ctx.fillStyle = "gold";
	    ctx.beginPath();
	    ctx.arc(x, y, pointSize, 0, Math.PI * 2, false);
	    ctx.fill();
	};
	let startEngine;
	let update = function(){
		startEngine = setInterval(function(){
			gameStarted = true;
			ctx.clearRect(0, 0, width, height);
			canvasBorder();
			snakeObj.draw();
			snakeObj.moveSnake();
			foodObj.draw();
			//ctx.strokeRect(0, 0, width, height);
		},100);
	};

	let canvasBorder = function(){
		ctx.fillStyle = "grey";
	    ctx.fillRect(0, 0, width, pointSize);
	    ctx.fillRect(0, height - pointSize, width, pointSize);
	    ctx.fillRect(0, 0, pointSize, height);
	    ctx.fillRect(width - pointSize, 0, pointSize, height);
	}
	//update();
	let endGame = function(){
		clearInterval(startEngine);
		gameStarted = false;
		ctx.clearRect(0, 0, width, height);
		updateLastScore(scoreValue);
		scoreValue = 0;
		updateScore(scoreValue);
		drawCanvas();
		init();
	};

	let keyPress = {
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
			32: 'space'
	};

	let init = function(){
		snakeObj = new Snake();
		foodObj = new Food();
		snakeObj.draw();
		foodObj.moveFood();
		foodObj.draw();

	};

	document.addEventListener('keyup',function(event){
		let newDirection = keyPress[event.keyCode];
		if(newDirection !== undefined){
			snakeObj.handleMovement(newDirection);
		}	
		
	});

	let updateScore = function(value){
		score.innerHTML = value;
	}

	let updateLastScore = function(value){
		lastScore.innerHTML = value;
	}
	drawCanvas();
	init();
})


