
		/****************
		*   FUNCTIONS   *
		****************/


function RushHour() {
	var view = this;

	this.gameBoard = document.getElementById("gameBoard");
	this.boardSize = 6; // makes coordinates easy; grab the width/height from HTML tag (NOT CSS)
	this.blockSize = gameBoard.width / 6; 

	this.cars = [];

	this.board = function() { 
		var board = [
			[0, 0, 0, 0, 0, 0],
     		[0, 0, 0, 0, 0, 0],
     		[0, 0, 0, 0, 0, 0],
     		[0, 0, 0, 0, 0, 0],
    		[0, 0, 0, 0, 0, 0],
     		[0, 0, 0, 0, 0, 0]
		];

		return board; // make a grid for the board
	}();

	var mouseState = {};
	mouseState.moving = false;
	mouseState.car = this.cars[0];
	mouseState.offset = 0;

	/* find mouse location
	rounds out position coords to be basically global
	reuse this as much as possible - i know you'll forget and one day wind up writing something that uses decimal mouse locations which will just be awful? */
	function getMouse(e, canvas) {
		var board = canvas.getBoundingClientRect();
			return {
				x: Math.round((e.clientX - board.left) / (board.right - board.left) * canvas.width),
				y: Math.round((e.clientY - board.top) / (board.bottom - board.top) * canvas.width) 
			};
	}

	gameBoard.onmouseup = function(e) {
		if (mouseState.moving) {
			mouseState.moving = false;
			view.gridSnap(mouseState.car); // snap the car to the nearest in-bounds grid point
			view.draw(); //update canvas
		}
	};

	gameBoard.onmousedown = function(e) {
		var position = getMouse(e, gameBoard);

		for (var i = 0; i < view.cars.length; i++) {
			var car = view.cars[i]; 
			// like on the midi controller; this is an easier way of defining everything in an array without needing to define every single item. it's more useful here though, because different puzzles may have different amounts of cars
			
			if (car.x <= position.x && car.x + car.xSize >= position.x &&
				car.y <= position.y && car.y + car.ySize >= position.y) {
				mouseState.moving = true; 
				mouseState.car = car; //if you click while over a car, the mouse will go into 'moving' state, and will associate itself with the car in question

				if (car.vertical) {  
					mouseState.offset = position.y - car.y;
				} 
				else {
					mouseState.offset = position.x - car.x;
				}
				// if the car is vertical, the mouse will only register moving up and down, otherwise it will only go left/right

				view.resetCursor(car);
				break;
			}
		}
	};

	gameBoard.onmousemove = function(e) {
		if (!mouseState.moving) {
			return;
		} // this only matters if we're actually moving a car

		var position = getMouse(e, gameBoard);
		var location = view.whereIs(mouseState.car);
		var borderNear = 0;
		var borderFar = view.gameBoard.width;

		if (mouseState.car.vertical) {
			var newY = position.y - mouseState.offset;
		
			for (var i = location[1]; i >= 0; i--) {
				if (view.board[location[0]][i]) {
					borderNear = (i + 1) * view.blockSize;
					break;
				}
			}

			for (i = location[1] + mouseState.car.size; i < view.boardSize; i++) {
				if (view.board[location[0]][i]) {
					borderFar = i * view.blockSize;
					break;
				}
			}

			if (newY < borderNear) { newY = borderNear; } 
			// don't let it go through the top of the board
			else if (newY + mouseState.car.ySize > borderFar) {
				newY = borderFar - mouseState.car.ySize;
			} // don't let it go through the bottom of the board

			mouseState.car.y = newY; // drop the car at its new position
		} 
		else {
			var newX = position.x - mouseState.offset;
		
			for (i = location[0]; i >= 0; i--) {
				if (view.board[i][location[1]]) {
					borderNear = (i + 1) * view.blockSize;
					break;
				}
			}

			for (i = location[0] + mouseState.car.size; i < view.boardSize; i++) {
				if (view.board[i][location[1]]) {
					borderFar = i * view.blockSize;
					break;
				}
			}

			if (newX < borderNear) { newX = borderNear;	} 
			// don't let it go through the left of the board
			else if (newX + mouseState.car.xSize > borderFar) {
				newX = borderFar - mouseState.car.xSize;
			} // don't let it go through the right of the board

			mouseState.car.x = newX; //second verse, same as the first
		}

		view.draw();
	};

	this.car = function(positionX, positionY, vertical, size) {
		this.x = positionX * view.blockSize;
		this.y = positionY * view.blockSize;
		this.vertical = vertical;
		this.size = size;

		if (this.vertical) {
			this.ySize = size * view.blockSize; // if the car's vertical, it will be vertically sized accordingly
			this.xSize = view.blockSize;
		} 
		else {
			this.xSize = size * view.blockSize; // otherwise it'll be horizontally sized accordingly
			this.ySize = view.blockSize;
		}

		this.defaultColor = "#000000";
		this.color = this.defaultColor;
	};

	this.car.prototype = {
		constructor: view.car,
		changeColor: function(newColor) { this.color = newColor; } // ~*gotta make them pretty*~
	}; // build cars nice

} //end game's main function 





		/****************
		*   PROTOTYPES  *
		****************/



RushHour.prototype = { 
	constructor: RushHour,
	draw: function() {
		var context = gameBoard.getContext("2d");

		// clear the canvas
		this.gameBoard.width = this.gameBoard.width;

		// draw grid for each full block space
		context.strokeStyle = "#555555";
		for (var i = 0; i < this.boardSize; i++) {
			for (var j = 0; j < this.boardSize; j++) {
				context.strokeRect(i * this.blockSize, j * this.blockSize, this.blockSize, this.blockSize);
			}
		}

		// draw cars
		for (i = 0; i < this.cars.length; i++) {
			var car = this.cars[i];
			context.fillStyle = car.color;
			context.fillRect(car.x, car.y, car.xSize, car.ySize);
			context.strokeRect(car.x, car.y, car.xSize, car.ySize);
		}

		// draw edges
		context.lineWidth = 8;
		context.moveTo(0, 0);	
		context.lineTo(0, this.gameBoard.height);
		context.lineTo(this.gameBoard.width, this.gameBoard.height);
		context.lineTo(this.gameBoard.width, 3 * this.blockSize);
		context.moveTo(this.gameBoard.width, 2 * this.blockSize); //skip the exit point
		context.lineTo(this.gameBoard.width, 0);
		context.lineTo(0, 0);
		context.stroke();
	},

	load: function(puzzleParts) {
		
		function randomColor() { // randomly generate a color via hex string
		var letters = '0123456789ABCDEF'.split('');
		var colorString = '#';
			for (var i = 0; i < 6; i++ ) {
				colorString += letters[Math.round(Math.random() * 15)];
			}
			return colorString;
		}


		function getCars(view, puzzleParts){ // get all the cars ready to go
			var cars = [];

			for (var i = 0; i < puzzleParts.strings.length; i++) {
				var string = puzzleParts.strings[i];
				var boardCars = string.cars.concat(string.buses);
				var vertical = i < boardSize; // make the car go vertical only under certain condition

				for (var j = 0; j < boardCars.length; j++) {
					var boardCar = boardCars[j];

					if (i < boardSize) {
						cars.push(new view.car(i, boardCar.location, vertical, boardCar.size));
					} else {
						cars.push(new view.car(boardCar.location, i - boardSize, vertical, boardCar.size));
					}
				}

				// specifically make the one red car red
				if (i == view.boardSize + Math.floor(view.boardSize / 2) - 1) {
					cars[cars.length - 1].changeColor("#FF0000");			
				}
			}
			return cars;
		}

		function colorCars(cars) { // attach random colors to other cars
			for (var i = 0; i < cars.length; i++) {
				var colors = randomColor();
				if (cars[i].color == cars[i].defaultColor) {
					cars[i].changeColor(colors);
					}
				}
			return cars;
		}

		this.cars = getCars(this, puzzleParts);
		this.cars = colorCars(this.cars);
	},

	gridSnap: function(car) { // make sure each car winds up inside a grid space when you let go
		var here = this.whereIs(car);

		car.x = here[0] * this.blockSize;
		car.y = here[1] * this.blockSize;

		if (car.vertical) {
			for (var pos = 0; pos < car.size; pos++) {		
				this.board[here[0]][here[1] + pos] = true; 
				// put the car in the right grid space when you let go (if vertical)
			}
		} 
		else {
			for (pos = 0; pos < car.size; pos++) {		
				this.board[here[0] + pos][here[1]] = true;
			}
		}
	},

	whereIs: function(car) { // find the location of active active car
		var unrounded = car.y / this.blockSize;
		var roundY = unrounded - (unrounded % 1);
		if (unrounded % 1 >= 0.5) {
			roundY++; // always 'find' the car location by checking if it is more than 50% over/under any particular grid point vertically
		}

		unrounded = car.x / this.blockSize; // (you don't need the old unrounded variable anymore)
		var roundX = unrounded - (unrounded % 1);
		if (unrounded % 1 >= 0.5) {
			roundX++; // aaand horizontally
		}

		return [roundX, roundY];
	},


	resetCursor: function(car) { // stop the car from just flying out of screen after clicking something else
		var here = this.whereIs(car);

		if (car.vertical) {
			for (var j = 0; j < car.size; j++) {		
				this.board[here[0]][here[1] + j] = false;
			}
		} 
		else {
			for (j = 0; j < car.size; j++) {	
				this.board[here[0] + j][here[1]] = false;
			}
		}
	},

	// make the gameboard appear as an image to players
	showAsImage: function() {
		var img = this.gameBoard.toDataURL("image/png");
		document.write('<img src="' + img + '"/>');
	}
}; //end prototype/game definitions



		/****************
		*   LAUNCHING   *
		****************/


// run the game
rushHour = new RushHour();
rushHour.draw();