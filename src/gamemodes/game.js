// Declare the game state
OverGrown.Game = function() {
	this.tilemap;
	this.groundLayer;
	this.plantLayer;
	this.playerLayer;
	this.tiles;
	this.tickTimer;

	this.player = {
		x: 0,
		y: 0,
		targetX: 0,
		targetY: 0,
		influence: 3
	};
	this.nearTiles = [];
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
		// Construct the level
		this.constructLevel();

		// Set up input listeners
		this.game.input.addMoveCallback(this.updateTarget, this);

		// Set up the tick function
		this.tickTimer = this.game.time.create(false);
		this.tickTimer.loop(500, this.tick, this);
		this.tickTimer.start();
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
				this.tilemap.putTile(this.tiles.empty, i, j, this.plantLayer);
				this.tilemap.getTile(i, j, this.plantLayer).conviction = {
					neutral: 5,
					grass: 0,
					weed: 0,
					cattail: 0
				};
			}
		}
	},

	// Frame update function
	update: function() {
	},

	// Updates game state once per tick
	tick: function() {
		console.log("tick")
		this.updateDedicated();

		// Calculate the near tiles
		this.nearTiles = this.getNearTiles(this.player.x, this.player.y, this.player.influence);
	},

	// Updates the target for the dedicated tile
	updateTarget: function() {
		var x = this.playerLayer.getTileX(this.game.input.activePointer.x);
		var y = this.playerLayer.getTileY(this.game.input.activePointer.y);
		if(x != this.player.targetX || y != this.player.targetY) {
			this.player.targetX = x;
			this.player.targetY = y;
		}
	},

	// Updates the dedicated tile
	updateDedicated: function() {
		if(this.player.x != this.player.targetX || this.player.y != this.player.targetY) {
			var nextx = this.player.x;
			var nexty = this.player.y;
			if(this.player.x < this.player.targetX && this.player.x < this.playerLayer.width) {
				nextx = this.player.x + 1;
			} else if(this.player.x > this.player.targetX && this.player.x > 0) {
				nextx = this.player.x - 1;
			}
			if(this.player.y < this.player.targetY && this.player.y < this.playerLayer.height) {
				nexty = this.player.y + 1;
			} else if(this.player.y > this.player.targetY && this.player.y > 0) {
				nexty = this.player.y - 1;
			}

			if(this.tilemap.getTile(nextx, nexty, this.groundLayer, true).index == this.tiles.ground) {
				this.tilemap.putTile(this.tiles.empty, this.player.x, this.player.y, this.playerLayer);
				this.player.x = nextx;
				this.player.y = nexty;
				this.tilemap.putTile(this.tiles.dedicated, this.player.x, this.player.y, this.playerLayer);
			}
		}
	},

	// Finds the group of near tiles
	getNearTiles: function(x, y, rad) {
		// Determine a region of feasible "near" tiles
		var xmin = Math.max(0, Math.min(x - rad, this.tilemap.width));
		var xmax = Math.max(0, Math.min(x + rad, this.tilemap.width));
		var ymin = Math.max(0, Math.min(y - rad, this.tilemap.width));
		var ymax = Math.max(0, Math.min(y + rad, this.tilemap.width));
		var nearTiles = [];

		// Iterate through all possible tiles and determine which tiles are in the radius
		for(var i = xmin; i <= xmax; ++i) {
			for(var j = ymin; j <= ymax; ++j) {
				var temp = Math.sqrt((x-i)*(x-i) + (y-j)*(y-j));
				if(Math.sqrt((x-i)*(x-i) + (y-j)*(y-j)) <= rad) {
					nearTiles.push(this.tilemap.getTile(i, j, this.plantLayer));
				}
			}
		}

		return nearTiles;
	},

	// Called after rest of frame has rendered
	render: function() {
		var debugText ="Player: (" + this.player.x + "," + this.player.y + ")";
		this.game.debug.text(debugText, 10, 100);
	}
};
