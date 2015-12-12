// Declare the game state
OverGrown.Game = function() {
	var tilemap;
	var groundLayer;
	var plantLayer;
};

// Define the member functions of the game state
OverGrown.Game.prototype = {
	// Loads system resources
	preload: function() {
		this.game.load.image('tiles', 'assets/Tiles.png');
	},

	// Creates objects for this state
	create: function() {
		this.constructLevel();
	},

	// Constructs the level
	constructLevel: function() {
		// Create an emtpy tile map
		tilemap = this.game.add.tilemap();
		tilemap.addTilesetImage('tiles');

		// Add the ground layer
		this.groundLayer = tilemap.create('ground', 40, 30, 32, 32);
		this.plantLayer = tilemap.createBlankLayer('plant', 40, 30, 32, 32);

		// Initialize the ground layer
		for(var i = 0; i < tilemap.width; ++i) {
			for(var j = 0; j < tilemap.height; ++j) {
				if((i + j) % 2 == 0) {
					tilemap.putTile(0, i, j, this.groundLayer);
				} else {
					tilemap.putTile(3, i, j, this.groundLayer);
				}
			}
		}
	},

	// Frame update function
	update: function() {

	}
};
