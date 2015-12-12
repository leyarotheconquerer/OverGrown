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
		influence: 1,
		sprite: null
	};

	this.enemy = {
		x: 0,
		y: 0,
		targetX: 0,
		targetY: 0,
		influence: 1
	};

	this.ownershipVal = 5;
	this.growthRate = {
		grass: {
			growth: 1,
			expansion: 1,
			strength: 1
		},
		weed: {
			growth: 1,
			expansion: 1,
			strength: 1
		}
	}
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

		this.game.rnd.sow([5, 27, 543]);
	},

	// Creates objects for this state
	create: function() {
		// Set up input listeners
		this.game.input.addMoveCallback(this.updateTarget, this);
		this.player.sprite = this.game.add.sprite();
		this.game.camera.follow(this.player.sprite, Phaser.Camera.FOLLOW_TOPDOWN);

		// Construct the level
		this.constructLevel();

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
					cattail: 0,
					current: "neutral"
				};
			}
		}

		// Random player starting point
		this.player.x = this.game.rnd.integerInRange(0, this.tilemap.width);
		this.player.y = this.game.rnd.integerInRange(0, this.tilemap.height);
		this.tilemap.putTile(this.tiles.grass, this.player.x, this.player.y, this.plantLayer);
		var tile = this.tilemap.getTile(this.player.x, this.player.y, this.playerLayer, true);
		this.player.sprite.x = tile.worldX;
		this.player.sprite.y = tile.worldY;
	},

	// Frame update function
	update: function() {
	},

	// Updates game state once per tick
	tick: function() {
		console.log("tick")
		this.updateDedicated();
		this.updateTiles();
		console.log("finished tick");
	},

	// Updates the target for the dedicated tile
	updateTarget: function() {
		var x = this.playerLayer.getTileX(this.game.input.activePointer.worldX);
		var y = this.playerLayer.getTileY(this.game.input.activePointer.worldY);
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

			if(this.tilemap.getTile(nextx, nexty, this.plantLayer, true).index == this.tiles.grass) {
				this.tilemap.putTile(this.tiles.empty, this.player.x, this.player.y, this.playerLayer);
				this.player.x = nextx;
				this.player.y = nexty;
				var tile = this.tilemap.putTile(this.tiles.dedicated, this.player.x, this.player.y, this.playerLayer);
				var tween = this.game.add.tween(this.player.sprite);
				tween.to({x: tile.worldX, y: tile.worldY}, 500, 'Linear', true, 0);
			}
		}
	},

	// Updates the properties of all tiles
	updateTiles: function() {
		var playerNearTiles = this.getNearTiles(this.player.x, this.player.y, this.player.influence);
		var enemyNearTiles = this.getNearTiles(this.enemy.x, this.enemy.y, this.enemy.influence);
		var updatedTiles = [];

		// Calculate conviction for all "near" tiles to the player
		for(var i = 0; i < playerNearTiles.length; ++i) {
			var tile = playerNearTiles[i];
			if(tile.conviction.current == 'neutral') {
				tile.conviction.neutral -= Math.floor(Math.sqrt(this.growthRate.grass.expansion));
				tile.conviction.grass += Math.floor(Math.sqrt(this.growthRate.grass.expansion));
				updatedTiles.push(tile);
			} else if (tile.conviction.current == 'weed' && this.growthRate.grass.strength > this.growthRate.weed.strength) {
				tile.conviction.weed -= Math.floor(Math.sqrt(this.growthRate.grass.strength - this.growthRate.weed.strength));
				tile.conviction.grass += Math.floor(Math.sqrt(this.growthRate.grass.strength - this.growthRate.weed.strength));
				updatedTiles.push(tile);
			}
		}

		// Calculate conviction for all "near" tiles to the enemy
		for(var i = 0; i < enemyNearTiles.length; ++i) {
			var tile = enemyNearTiles[i];
			if(tile.conviction.current == 'neutral') {
				tile.conviction.neutral -= Math.floor(Math.sqrt(this.growthRate.weed.expansion));
				tile.conviction.weed += Math.floor(Math.sqrt(this.growthRate.weed.expansion));
				updatedTiles.push(tile);
			} else if (tile.conviction.current == 'weed' && this.growthRate.weed.strength > this.growthRate.grass.strength) {
				tile.conviction.grass -= Math.floor(Math.sqrt(this.growthRate.weed.strength - this.growthRate.grass.strength));
				tile.conviction.weed += Math.floor(Math.sqrt(this.growthRate.weed.strength - this.growthRate.grass.strength));
				updatedTiles.push(tile);
			}
		}

		// Determine ownership of tile based on conviction
		for(var i = 0; i < updatedTiles.length; ++i) {
			var tile = updatedTiles[i];
			// Ignore water
			if(this.tilemap.getTile(tile.x, tile.y, this.groundLayer).index == this.tiles.water) {
				continue;
			}
			// If neutral tile is convinced by someone
			if(tile.conviction.current == 'neutral' && tile.conviction.neutral <= 0) {
				// Assign it to the first player to get ownership
				if(tile.conviction.grass >= this.ownershipVal) {
					tile.conviction.current = 'grass';
					tile.conviction.grass = this.ownershipVal;
					tile.conviction.weed = 0;
					tile.index = this.tiles.grass;
				} else if(tile.conviction.weed >= this.ownershipVal) {
					tile.conviction.weed = 'weed';
					tile.conviction.grass = 0;
					tile.conviction.weed = this.ownershipVal;
					tile.index = this.tiles.weed;
				}
				tile.conviction.neutral = 0;
			// If the grass tile is reduced to 0 conviction
			} else if (tile.conviction.current == 'grass' && tile.conviction.grass <= 0) {
				tile.conviction.current = 'weed';
				tile.conviction.grass = 0;
				tile.conviction.weed = this.ownershipVal;
				tile.conviction.neutral = 0;
				tile.index = this.tiles.weed;
			// If the weed tile is reduced to 0 conviction
			} else if (tile.conviction.current == 'weed' && tile.conviction.weed <= 0) {
				tile.conviction.current = 'grass';
				tile.conviction.grass = this.ownershipVal;
				tile.conviction.weed = 0;
				tile.conviction.neutral = 0;
				tile.index = this.tiles.grass;
			}
		}
	},

	// Recalculates the group of near tiles
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
