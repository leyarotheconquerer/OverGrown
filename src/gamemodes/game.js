// Declare the game state
OverGrown.Game = function() {
	this.tilemap;
	this.groundLayer;
	this.plantLayer;
	this.playerLayer;
	this.tiles;
};

// Define the member functions of the game state
OverGrown.Game.prototype = {
	// Loads system resources
	preload: function() {
		this.game.load.image('tiles', 'assets/Tiles.png');
		this.tiles = {
			ground: 0,
			grass: 1,
			weed: 2,
			water: 3,
			dung: 4,
			dedicated: 5,
			empty: 6
		};
	},

	// Creates objects for this state
	create: function() {
		this.constructLevel();
	},

	// Constructs the level
	constructLevel: function() {
		this.game.stage.backgroundColor = '#ff0000';
		// Create an empty tile map
		this.tilemap = this.game.add.tilemap();
		this.tilemap.addTilesetImage('tiles');

		// Add the ground layer
		this.groundLayer = this.tilemap.create('ground', 40, 30, 32, 32);
		this.groundLayer.resizeWorld();
		this.plantLayer = this.tilemap.createBlankLayer('plant', 40, 30, 32, 32);
		this.playerLayer = this.tilemap.createBlankLayer('player', 40, 30, 32, 32);

		// Initialize the ground layer
		for(var i = 0; i < this.tilemap.width; ++i) {
			for(var j = 0; j < this.tilemap.height; ++j) {
				if((i + j) % 4 != 0) {
					this.tilemap.putTile(this.tiles.ground, i, j, this.groundLayer);
				} else {
					this.tilemap.putTile(this.tiles.water, i, j, this.groundLayer);
				}
			}
		}
	},

	// Frame update function
	update: function() {

	}
};
