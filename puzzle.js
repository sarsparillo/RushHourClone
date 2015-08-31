var boardSize = 6;


		/****************
		*   FUNCTIONS   *
		****************/


function Car(location) {
	this.location = location;
	this.size = 2;
} // all cars are small


function Bus(location) {
	this.location = location;
	this.size = 3;
} // al buses are bigger!

function Connection(currentString, initialString) { // explain to html that cars take up more than one grid space
	this.currentString = currentString;
	this.initialString = initialString;
	this.requirements = function(currentString, initialString) {
		var requirements = [];

		var carStartingPoint = currentString.cars.concat(currentString.buses);
		var carEndingPoint = initialString.cars.concat(initialString.buses);

		for (var i = 0; i < carStartingPoint.length; i++) {
			var distance = Math.abs(carStartingPoint[i].location - carEndingPoint[i].location);

			if (carStartingPoint[i].location < carEndingPoint[i].location) {
				 for (var j = 0; j < distance; j++) {
					requirements.push(carStartingPoint[i].location + carStartingPoint[i].size + j);	 	
				 }
			}
			else if (carStartingPoint[i].location > carEndingPoint[i].location) {
				 for (var j = 0; j < distance; j++) {
					requirements.push(carStartingPoint[i].location - j);	 	
				 }
			}
		}

		return requirements;
	}(this.currentString, this.initialString);
} //end connection

function String(lineID) { //creates a line, either vertical or horizontal
	this.identifier = lineID;
	this.connections = []; 

	this.occupied = function(identifier) { 
		var occupied = []; //creates a localized array to check if a location is blocked
		var previous = false;

		for (var i = 0; i < identifier.length; i++) { 
			var codeElement = identifier[i];
			occupied.push(previous || codeElement);
			previous = codeElement;
		} // 
		return occupied;
	}(this.identifier); //end String function

	this.cars = []; // array of all cars
	this.buses = []; // array of all buses

	this.order = function(identifier, cars, buses) {
		var length = 0;
		var placement = 0;

		for (var i = 0; i < identifier.length; i++) {
			if (identifier[i]) {
				length += 1;
			}  // add one to length each time the identifier is equal to the current loop
			else if (length > 0) {
				length += 1;
				if (length == 2) {
					var thisCar = new Car(i - length + 1); // the car's location value
					cars.push(thisCar);
					placement *= 10;
					placement += thisCar.size; 
				} 
				if (length == 3) {
					var thisBus = new Bus(i - length + 1);
					buses.push(thisBus);
					placement *= 10;
					placement += thisBus.size;
				}
				length = 0;
			}
		}
		return placement;
	}(this.identifier, this.cars, this.buses); // end function to order cars and buses in their arrays

} // end line function

function Board(strings) {
	this.strings = strings;
	this.size = strings.length / 2;
}



function generateStrings() {
	function doesWork(identifier) { // basically, checking to make sure nothing weird's happened with assigning strings. remember that crispy helped you with these checks, so ask him
		var length = 0;
		var previous = false;

		for (var i = 0; i < identifier.length; i++) {
			var element = identifier[i];

			if (element) {
				length += 1;
			}
			else if (previous) {
				length += 1;
				if (length < 2 || length > 3) {
					return false;
				}
				length = 0; 
			}
 
			previous = element; 
		}

		if (identifier[identifier.length - 1]) {
			return false;
		}

		return true;
	}

	function intToStr(number) {
		var bits = [];
	    for (var i = boardSize - 1; i >= 0; i--) {
	        bits.push((number & (1 << i)) != 0);
	    }
	    return bits;
	}
	
	function connectStrings(strings) {
		for (var i = 0; i < strings.length; i++) {
			for (var j = 0; j < strings.length; j++) {
				strings[i].joinSquares(strings[j]);
			}
		}
	}

	var strings = [];
	for (var i = 0; i < Math.pow(2, boardSize); i++) {
		var identifier = intToStr(i);
		if (doesWork(identifier)) {
			strings.push(new String(identifier));
		}
	}

	connectStrings(strings);

	return strings;
} // end generateStrings

function generateBoard() {
	var boardStrings = [];
	for (var i = 0; i < 2 * boardSize; i++) {
		boardStrings.push(strings[1]);
	}
	boardStrings[8] = strings[1];

	return new Board(boardStrings);
}



		/****************
		*   PROTOTYPES  *
		****************/


String.prototype = { // make the objects on each line
	constructor: String,
	
	isBlocked: function(pos) { // check if a space is blocked
		if (pos < 0 || pos >= occupied.length) {
			return false;
		}
		return occupied[pos];
	},

	joinSquares: function(initialString) { // there's a lot of text, because html grids don't automatically know that things are longer than one square
		if (this.identifier == initialString.identifier) { 
			return false;
		} // if this line section shares the same ID as the initial parts of this, don't connect - we only create the first part of any vehicle, and the game generates the rest of each vehicle 

		if (this.cars.length != initialString.cars.length || this.buses.length != initialString.buses.length) {
			return false;
		} // if the length of this car, or the INITIAL car length, etc, is different from what we did, do nothing - basically, if you're moving one car, only move the other square associated with it, not other cars/buses

		if (this.order != initialString.order) {
			return false;
		} // if the order of this line is different to the stored order, don't move things - all three of these clauses basically do the same thing
		
		var numberCarsMoved = 0;
		var carStartingPoint = this.cars.concat(this.buses);
		var carEndingPoint = initialString.cars.concat(initialString.buses); // current 'start' and 'end' points for each vehicle

		for (var i = 0; i < carStartingPoint.length; i++) {
			if (carStartingPoint[i].location != carEndingPoint[i].location) {
				numberCarsMoved += 1;
			} // if you moved a car, say you did
		}

		if (numberCarsMoved == 1) {
			this.connections.push(new Connection(this, initialString));
			return true;
		} // if you did move a car, reset the initial spaces for the next move
		return false; 
	} //end joining squares
}

Board.prototype = { // get all the actual positions for everything
	constructor: Board,

	expand: function() {
		var boards = []

		for (var i = 0; i < this.strings.length; i++) {
			var line = this.strings[i]; // create a new set of rules for each line
			
			for (var j = 0; j < line.connections.length; j++) {
				var connection = line.connections[j];
				var canMove = true;  // in each line, place the things that can move

				for (var k = 0; k < connection.requirements.length; k++) {
					var requirement = connection.requirements[k]; // for each thing that can move, check what it needs

					if (i < boardSize) { // if we're still under the total board size (6)
						if (this.strings[requirement + boardSize][i]) {
							canMove = false;
							break;  // then, if we've made too many vehicles, stop
						}
					} 
					else {
						if (this.strings[requirement][i]) {
							canMove = false;
							break; // or if we've made just the right amount, stop
						}
					}
				}

				if (canMove) {
					// copy strings for a new board
					var strings = this.strings.slice();

					strings[i] = connection.initialString; 
					boards.push(new Board(strings));
				}
			}
		}

		return boards;
	}, // end board positions

	redCar: function() {
		var red = this.strings[this.size + Math.floor(this.size / 2) - 1];
		return red.cars[red.cars.length - 1].location == this.size - 2;
	} // let the program know which car is the red car
}



		/****************
		*   LAUNCHING   *
		****************/


var strings = generateStrings();
var puzzleParts = generateBoard();
var boards = puzzleParts.expand();

rushHour.load(puzzleParts);
rushHour.draw();