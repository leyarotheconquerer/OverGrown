// Declare the game state
OverGrown.Game = function() {
	this.tilemap;
	this.groundLayer;
	this.tiles;

	this.tickTimer;
	this.leftTimer;
	this.rightTimer;

	this.ownershipVal = 5;
	this.player = {
		x: 0,
		y: 0,
		targetX: 0,
		targetY: 0,
		sprite: null,
		tileCount: 1,
		identity: 'grass',
		growth: {
			unspent: 1,
			expansion: 1,
			strength: 1,
			influence: 1,
			cattail: 0
		}
	};

	this.enemy = {
		x: 0,
		y: 0,
		targetX: 0,
		targetY: 0,
		tileCount: 1,
		sprite: null,
		targetSprite: null,
		identity: 'weed',
		waitCounter: 0,
		growth: {
			unspent: 1,
			expansion: 1,
			strength: 1,
			influence: 1,
			cattail: 0
		}
	};
};

// Define the member functions of the game state
OverGrown.Game.prototype = {
	reset: function() {
		this.player = {
			x: 0,
			y: 0,
			targetX: 0,
			targetY: 0,
			sprite: null,
			tileCount: 1,
			identity: 'grass',
			growth: {
				unspent: 1,
				expansion: 1,
				strength: 1,
				influence: 1,
				cattail: 0
			}
		};

		this.enemy = {
			x: 0,
			y: 0,
			targetX: 0,
			targetY: 0,
			tileCount: 1,
			sprite: null,
			targetSprite: null,
			identity: 'weed',
			waitCounter: 0,
			growth: {
				unspent: 1,
				expansion: 1,
				strength: 1,
				influence: 1,
				cattail: 0
			}
		};
	},

	// Loads system resources
	preload: function() {
		this.game.load.image('tiles', 'assets/Tiles.png');
		this.game.load.image('cattail', 'assets/Cattail.png');
		this.game.load.image('dung', 'assets/Dung.png');
		this.game.load.image('grass', 'assets/Grass.png');
		this.game.load.image('weed', 'assets/Weed.png');
		this.game.load.image('selector', 'assets/Selector.png');
		this.game.load.image('target', 'assets/Target.png');
		this.tiles = {
			ground: 0,
			grass: 1,
			weed: 2,
			water: 3,
			dung: 4,
			dedicated: 5,
			empty: 6
		};

		this.game.rnd.sow([27, 543, 5]);
	},

	// Creates objects for this state
	create: function() {
		this.reset();
		// Set up input listeners
		this.game.input.addMoveCallback(this.updateTarget, this);
		this.game.input.activePointer.leftButton.onDown.add(this.onLeftMouseDown, this);
		this.game.input.activePointer.leftButton.onUp.add(this.onLeftMouseUp, this);
		this.game.input.activePointer.rightButton.onDown.add(this.onRightMouseDown, this);
		this.game.input.activePointer.rightButton.onUp.add(this.onRightMouseUp, this);
		this.player.sprite = this.game.add.sprite(0,0, 'selector');
		this.game.camera.follow(this.player.sprite, Phaser.Camera.FOLLOW_TOPDOWN);

		this.enemy.sprite = this.game.add.sprite(0,0, 'selector');
		this.enemy.targetSprite = this.game.add.sprite(0,0, 'target');

		// Construct the level
		this.constructLevel();

		// Set up the tick function
		this.tickTimer = this.game.time.create(false);
		this.tickTimer.loop(500, this.tick, this);
		this.tickTimer.start();

		this.leftTimer = this.game.time.create(false);
		this.rightTimer = this.game.time.create(false);
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

		// Fill ground layer with ground
		this.tilemap.fill(this.tiles.ground, 0, 0, this.tilemap.width, this.tilemap.height, this.groundLayer);
		for(var i = 0; i < this.tilemap.width; ++i) {
			for(var j = 0; j < this.tilemap.height; ++j) {
				var tile = this.tilemap.getTile(i, j, this.groundLayer);
				tile.conviction = {
					neutral: this.ownershipVal,
					grass: 0,
					weed: 0,
					current: "neutral"
				};
				tile.contains = {
					cattail: false,
					dung: false,
					water: false
				}
			}
		}

		// Place a random number of random water holes
		var waterHoleCount = this.game.rnd.integerInRange(5, 30);
		var waterHoles = [];
		for(var i = 0; i < waterHoleCount; ++i) {
			console.log("Generating water - pass " + (i + 1));
			var waterHole = [];
			var tileCount = this.game.rnd.integerInRange(2,15);
			var queue = [];
			var tile = this.tilemap.getTile(
				this.game.rnd.integerInRange(0, this.tilemap.width-1),
				this.game.rnd.integerInRange(0, this.tilemap.height-1),
				this.groundLayer
			);
			queue.push(tile);
			console.log(queue);
			for(var j = 0; j < tileCount; ++j) {
				var index = this.game.rnd.integerInRange(0, queue.length - 1);
				tile = queue[index];
				waterHole.push(tile);
				queue = queue.slice(0,index).concat(queue.slice(index+1,queue.length));
				tile.index = this.tiles.water;
				tile.contains.water = true;
				queue = queue.concat(this.getAdjacentTiles(tile.x, tile.y));
				console.log(queue);
			}
			waterHoles.push(waterHole);
		}

		// Place a random number of cattails, using water as a begining point
		var cattailCount = this.game.rnd.integerInRange(10, 30);
		for(var i = 0; i < cattailCount; ++i) {
			var waterHole = waterHoles[this.game.rnd.integerInRange(0, waterHoles.length - 1)];
			var waterTile = waterHole[this.game.rnd.integerInRange(0, waterHole.length - 1)];
			var adjacentTiles = this.getAdjacentTiles(waterTile.x, waterTile.y);
			var cattailTile = adjacentTiles[this.game.rnd.integerInRange(0, adjacentTiles.length - 1)];
			cattailTile.index = this.tiles.ground;
			cattailTile.contains.water = false;
			cattailTile.contains.cattail = true;
			cattailTile.conviction.sprite = this.game.add.sprite(cattailTile.worldX, cattailTile.worldY, 'cattail');
		}

		// Place a random number of dung tiles, randomly, but avoiding water and especially cattails
		var dungCount = this.game.rnd.integerInRange(30, 80);
		var tile;
		for(var i = 0; i < dungCount; ++i) {
			// If we can't find a non-water tile in 3 tries, just stop trying...
			var tryCount = 3;
			do {
				tile = this.tilemap.getTile(
					this.game.rnd.integerInRange(0, this.tilemap.width-1),
					this.game.rnd.integerInRange(0, this.tilemap.height-1),
					this.groundLayer
				);
				tryCount--;
			} while(tile.contains.cattail || (tryCount > 0 && tile.contains.water));
			tile.index = this.tiles.ground;
			tile.contains.water = false;
			tile.contains.dung = true;
			tile.conviction.sprite = this.game.add.sprite(tile.worldX, tile.worldY, 'dung');
		}

		// Place a random player start
		// TODO: Make this less susceptible to randomness making infinite loops of death
		do {
			tile = this.tilemap.getTile(
				this.game.rnd.integerInRange(0, this.tilemap.width-1),
				this.game.rnd.integerInRange(0, this.tilemap.height-1),
				this.groundLayer
			);
		} while(tile.contains.dung || tile.contains.cattail || tile.contains.water);
		this.player.x = tile.x;
		this.player.y = tile.y;
		tile.conviction.current = 'grass';
		tile.conviction.grass = this.ownershipVal;
		tile.conviction.neutral = 0;
		tile.conviction.sprite = this.game.add.sprite(tile.worldX, tile.worldY, 'grass');
		this.player.sprite.x = tile.worldX;
		this.player.sprite.y = tile.worldY;

		// Place a random enemy start
		// TODO: Make this less susceptible to randomness making infinite loops of death
		do {
			tile = this.tilemap.getTile(
				this.game.rnd.integerInRange(0, this.tilemap.width-1),
				this.game.rnd.integerInRange(0, this.tilemap.height-1),
				this.groundLayer
			);
		} while(tile.contains.dung || tile.contains.cattail || tile.contains.water || tile.conviction.grass != 0);
		this.enemy.x = tile.x;
		this.enemy.y = tile.y;
		tile.conviction.current = 'weed';
		tile.conviction.weed = this.ownershipVal;
		tile.conviction.neutral = 0;
		tile.conviction.sprite = this.game.add.sprite(tile.worldX, tile.worldY, 'weed');
	},

	// Frame update function
	update: function() {
	},

	// Updates game state once per tick
	tick: function() {
		console.log("tick")
		this.updateDedicated();
		this.updateEnemy();
		this.updateTiles();
		this.checkEndGame();
		this.player.sprite.bringToTop();
	},

	// Updates the target for the dedicated tile
	updateTarget: function() {
		var x = this.groundLayer.getTileX(this.game.input.activePointer.worldX);
		var y = this.groundLayer.getTileY(this.game.input.activePointer.worldY);
		if(x != this.player.targetX || y != this.player.targetY) {
			this.player.targetX = x;
			this.player.targetY = y;
		}
	},

	// Updates the dedicated tile
	updateDedicated: function() {
		if(this.player.x != this.player.targetX || this.player.y != this.player.targetY) {
			var nextPos = this.pathTowards(
				this.player.x,
				this.player.y,
				this.player.targetX,
				this.player.targetY,
				'grass'
			);
			var tile = this.tilemap.getTile(nextPos.x, nextPos.y, this.groundLayer);
			this.player.x = nextPos.x;
			this.player.y = nextPos.y;
			var tween = this.game.add.tween(this.player.sprite);
			tween.to({x: tile.worldX, y: tile.worldY}, 200, 'Linear', true, 0);
			//}
		}
	},

	// Updates the enemy action tile
	updateEnemy: function() {
		var nextPos = this.pathTowards(
			this.enemy.x,
			this.enemy.y,
			this.enemy.targetX,
			this.enemy.targetY,
			'weed'
		);
		if(this.enemy.x == nextPos.x && this.enemy.y == nextPos.y) {
			this.enemy.waitCounter--;
		} else {
			this.enemy.waitCounter = 6;
		}
		if(this.enemy.targetX != nextPos.x || this.enemy.targetY != nextPos.y) {
			this.enemy.targetWaitCounter--;
		}
		if(
			(this.enemy.targetWaitCounter <= 0) ||
			(this.enemy.waitCounter <= 0 && this.enemy.x == nextPos.x && this.enemy.y == nextPos.y) ||
			(this.enemy.x == this.enemy.targetX && this.enemy.y == this.enemy.targetY)
		) {
			var viewedTiles = this.getNearTiles(this.enemy.x, this.enemy.y, 6);
			var targetTile = null;
			this.enemy.targetWaitCounter = 25;
			while(true) {
				var tile = viewedTiles[this.game.rnd.integerInRange(0, viewedTiles.length - 1)];
				// Weed's heirarchy of needs: +/- random urges
				if(tile.contains.cattail && this.game.rnd.integerInRange(0, 100) < 90) {
					targetTile = tile;
					break;
				} else if(tile.contains.water && this.game.rnd.integerInRange(0, 100) < 80) {
					targetTile = tile;
					break;
				} else if(tile.contains.dung && this.game.rnd.integerInRange(0, 100) < 70) {
					targetTile = tile;
					break;
				} else if(tile.conviction.grass > 0 && this.game.rnd.integerInRange(0, 100) < 60) {
					targetTile = tile;
					break;
				}
			}
			if(targetTile == null) {
				targetTile = viewedTiles[this.game.rnd.integerInRange(0, viewedTiles.length-1)];
			}
			this.enemy.targetX = targetTile.x;
			this.enemy.targetY = targetTile.y;
		} else {
			var nextTile = this.tilemap.getTile(nextPos.x, nextPos.y, this.groundLayer);
			var targetTile = this.tilemap.getTile(this.enemy.targetX, this.enemy.targetY, this.groundLayer);
			this.enemy.x = nextPos.x;
			this.enemy.y = nextPos.y;
			this.enemy.sprite.x = nextTile.worldX;
			this.enemy.sprite.y = nextTile.worldY;
			this.enemy.sprite.bringToTop();
			this.enemy.targetSprite.x = targetTile.worldX;
			this.enemy.targetSprite.y = targetTile.worldY;
			this.enemy.targetSprite.bringToTop();
		}
	},

	// Returns the next tile towards the given target with the given conviction
	pathTowards: function(x, y, targetX, targetY, conviction) {
		var next = {x: 0, y: 0};
		var delta = {
			x: targetX - x,
			y: targetY - y
		};
		var offset = {
			x: (x < targetX ? 1 : -1),
			y: (y < targetY ? 1 : -1)
		};
		var tile;
		if(Math.abs(delta.x) < Math.abs(delta.y)) {
			if(Math.abs(3 * delta.x) < Math.abs(delta.y)) { // vertical
				tile = this.tilemap.getTile(x, y + offset.y, this.groundLayer);
				if(tile != null && tile.conviction.current == conviction) {
					next.x = tile.x;
					next.y = tile.y;
				} else {
					tile = this.tilemap.getTile(x + offset.x, y + offset.y, this.groundLayer);
					if(tile != null && tile.conviction.current == conviction) {
						next.x = tile.x;
						next.y = tile.y;
					} else {
						tile = this.tilemap.getTile(x - offset.x, y + offset.y, this.groundLayer);
						if(tile != null && tile.conviction.current == conviction) {
							next.x = tile.x;
							next.y = tile.y;
						} else {
							next.x = x;
							next.y = y;
						}
					}
				}
			} else { // diagonal
				tile = this.tilemap.getTile(x + offset.x, y + offset.y, this.groundLayer);
				if(tile != null && tile.conviction.current == conviction) {
					next.x = tile.x;
					next.y = tile.y;
				} else {
					tile = this.tilemap.getTile(x, y + offset.y, this.groundLayer);
					if(tile != null && tile.conviction.current == conviction) {
						next.x = tile.x;
						next.y = tile.y;
					} else {
						tile = this.tilemap.getTile(x + offset.x, y, this.groundLayer);
						if(tile != null && tile.conviction.current == conviction) {
							next.x = tile.x;
							next.y = tile.y;
						} else {
							next.x = x;
							next.y = y;
						}
					}
				}
			}
		} else if (Math.abs(delta.x) > Math.abs(delta.y)) {
			if(Math.abs(3 * delta.y) < Math.abs(delta.x)) { // horizontal
				tile = this.tilemap.getTile(x + offset.x, y, this.groundLayer);
				if(tile != null && tile.conviction.current == conviction) {
					next.x = tile.x;
					next.y = tile.y;
				} else {
					tile = this.tilemap.getTile(x + offset.x, y + offset.y, this.groundLayer);
					if(tile != null && tile.conviction.current == conviction) {
						next.x = tile.x;
						next.y = tile.y;
					} else {
						tile = this.tilemap.getTile(x + offset.x, y - offset.y, this.groundLayer);
						if(tile != null && tile.conviction.current == conviction) {
							next.x = tile.x;
							next.y = tile.y;
						} else {
							next.x = x;
							next.y = y;
						}
					}
				}
			} else { // diagonal
				tile = this.tilemap.getTile(x + offset.x, y + offset.y, this.groundLayer);
				if(tile != null && tile.conviction.current == conviction) {
					next.x = tile.x;
					next.y = tile.y;
				} else {
					tile = this.tilemap.getTile(x + offset.x, y, this.groundLayer);
					if(tile != null && tile.conviction.current == conviction) {
						next.x = tile.x;
						next.y = tile.y;
					} else {
						tile = this.tilemap.getTile(x, y + offset.y, this.groundLayer);
						if(tile != null && tile.conviction.current == conviction) {
							next.x = tile.x;
							next.y = tile.y;
						} else {
							next.x = x;
							next.y = y;
						}
					}
				}
			}
		} else { // diagonal
			tile = this.tilemap.getTile(x + offset.x, y + offset.y, this.groundLayer);
			if(tile != null && tile.conviction.current == conviction) {
				next.x = tile.x;
				next.y = tile.y;
			} else {
				tile = this.tilemap.getTile(x + offset.x, y, this.groundLayer);
				if(tile != null && tile.conviction.current == conviction) {
					next.x = tile.x;
					next.y = tile.y;
				} else {
					tile = this.tilemap.getTile(x, y + offset.y, this.groundLayer);
					if(tile != null && tile.conviction.current == conviction) {
						next.x = tile.x;
						next.y = tile.y;
					} else {
						next.x = x;
						next.y = y;
					}
				}
			}
		}
		return next;
	},

	// Updates the properties of all tiles
	updateTiles: function() {
		var playerNearTiles = this.getNearTiles(this.player.x, this.player.y, this.player.growth.influence);
		var enemyNearTiles = this.getNearTiles(this.enemy.x, this.enemy.y, this.enemy.growth.influence);
		var updatedTiles = [];

		// Calculate conviction for all "near" tiles to the player
		for(var i = 0; i < playerNearTiles.length; ++i) {
			var tile = playerNearTiles[i];
			if(tile.conviction.current == 'neutral') {
				tile.conviction.neutral -= Math.floor(Math.sqrt(this.player.growth.expansion));
				tile.conviction.grass += Math.floor(Math.sqrt(this.player.growth.expansion));
				updatedTiles.push(tile);
			} else if (tile.conviction.current == 'weed' && this.player.growth.strength > this.enemy.growth.strength) {
				tile.conviction.weed -= Math.floor(Math.sqrt(this.player.growth.strength - this.enemy.growth.strength));
				tile.conviction.grass += Math.floor(Math.sqrt(this.player.growth.strength - this.enemy.growth.strength));
				updatedTiles.push(tile);
			}
		}

		// Calculate conviction for all "near" tiles to the enemy
		for(var i = 0; i < enemyNearTiles.length; ++i) {
			var tile = enemyNearTiles[i];
			if(tile.conviction.current == 'neutral') {
				tile.conviction.neutral -= Math.floor(Math.sqrt(this.enemy.growth.expansion));
				tile.conviction.weed += Math.floor(Math.sqrt(this.enemy.growth.expansion));
				updatedTiles.push(tile);
			} else if (tile.conviction.current == 'grass' && this.enemy.growth.strength > this.player.growth.strength) {
				tile.conviction.grass -= Math.floor(Math.sqrt(this.enemy.growth.strength - this.player.growth.strength));
				tile.conviction.weed += Math.floor(Math.sqrt(this.enemy.growth.strength - this.player.growth.strength));
				updatedTiles.push(tile);
			}
		}

		this.updateOwnership(updatedTiles);
	},

	// Updates the ownership of tiles based on their convictions
	updateOwnership: function(tiles) {
		// Determine ownership of tile based on conviction
		for(var i = 0; i < tiles.length; ++i) {
			var tile = tiles[i];
			// Ignore water
			if(tile.contains.water) {
				continue;
			}
			var taken = false;
			var changeOwner = false;
			// If neutral tile is convinced by someone
			if(tile.conviction.current == 'neutral' && tile.conviction.neutral <= 0) {
				// Eliminate cattails once they are obtained
				if(tile.contains.cattail) {
					tile.conviction.sprite.kill();
				}
				// Assign it to the first player to get ownership
				if(tile.conviction.grass >= this.ownershipVal) {
					tile.conviction.current = 'grass';
					tile.conviction.grass = this.ownershipVal;
					tile.conviction.weed = 0;
					tile.conviction.sprite = this.game.add.sprite(tile.worldX, tile.worldY, 'grass');
					this.player.tileCount++;
				} else if(tile.conviction.weed >= this.ownershipVal) {
					tile.conviction.current = 'weed';
					tile.conviction.grass = 0;
					tile.conviction.weed = this.ownershipVal;
					tile.conviction.sprite = this.game.add.sprite(tile.worldX, tile.worldY, 'weed');
					this.enemy.tileCount++;
				}
				tile.conviction.neutral = 0;
				taken = true; changeOwner = false;
			// If the grass tile is reduced to 0 conviction
			} else if (tile.conviction.current == 'grass' && tile.conviction.grass <= 0) {
				tile.conviction.current = 'weed';
				tile.conviction.grass = 0;
				tile.conviction.weed = this.ownershipVal;
				tile.conviction.neutral = 0;
				tile.conviction.sprite.kill();
				tile.conviction.sprite = this.game.add.sprite(tile.worldX, tile.worldY, 'weed');
				this.enemy.tileCount++;
				taken = true; changeOwner = true;
			// If the weed tile is reduced to 0 conviction
			} else if (tile.conviction.current == 'weed' && tile.conviction.weed <= 0) {
				tile.conviction.current = 'grass';
				tile.conviction.grass = this.ownershipVal;
				tile.conviction.weed = 0;
				tile.conviction.neutral = 0;
				tile.conviction.sprite.kill();
				tile.conviction.sprite = this.game.add.sprite(tile.worldX, tile.worldY, 'grass');
				this.player.tileCount++;
				taken = true; changeOwner = true;
			}

			// If the tile was taken
			if(taken) {
				var growthAmount = 0;
				var totalGain = 0;
				var adjacentTiles = this.getAdjacentTiles(tile.x, tile.y);

				for(var j = 0; j < adjacentTiles.length; ++j) {
					if(adjacentTiles[j].contains.water) {
						growthAmount++;
						break;
					}
				}

				// If the tile was dung, it's worth 1 more
				if(tile.contains.dung) {
					growthAmount++;
				}

				// If the tile was a cattail, store a charge
				if(tile.contains.cattail) {
					tile.contains.cattail = false;
					if(tile.conviction.current == 'grass') {
						this.player.growth.cattail++;
					} else if (tile.conviction.current == 'weed') {
						this.enemy.growth.cattail++;
					}
				}

				// NOTE: Because the bonuses to the tile up to this point are universal,
				//       they must be added and removed equally from each player
				// Add growth points if the tile was taken
				if(tile.conviction.current == 'grass') {
					this.player.growth.unspent += growthAmount;
					totalGain = growthAmount;
				} else if(tile.conviction.current == 'weed') {
					this.enemy.growth.unspent += growthAmount;
				}

				// Remove growth points if the tile was stolen
				if(changeOwner) {
					if(tile.conviction.current == 'weed') {
						this.player.growth.unspent -= growthAmount;
						totalGain = -growthAmount;
					} else if(tile.conviction.current == 'grass') {
						this.enemy.growth.unspent -= growthAmount;
					}
				}

				// NOTE: The following points are player specific, so they can't be blindly applied or removed
				// If the tile put a player up to a multiple of 10
				if(tile.conviction.current == 'grass' && this.player.tileCount % 10 == 0) {
					this.player.growth.unspent++;
					totalGain++;
				} else if(tile.conviction.current == 'weed' && this.enemy.tileCount % 10 == 0) {
					this.enemy.growth.unspent++;
				}

				// If the tile pulled a player below a multiple of 10
				if(changeOwner && tile.conviction.current == 'grass' && this.enemy.tileCount % 10 == 9) {
					this.enemy.growth.unspent--;
				} else if(changeOwner && tile.conviction.current == 'weed' && this.player.tileCount % 10 == 9) {
					this.player.growth.unspent--;
					totalGain--;
				}

				// Have the enemy automatically apply unspent growth points, in a balanced approach
				if(this.enemy.growth.unspent != 0) {
					var points = Math.abs(Math.floor(this.enemy.growth.unspent / 2));
					this.changeStrength(this.enemy.growth, points);
					this.changeExpansion(this.enemy.growth, points);
				}

				// Display total gain
				if(totalGain != 0) {
					var text = this.game.add.text(tile.worldX, tile.worldY + this.tilemap.tileHeight, (totalGain > 0 ? "+" : "") + totalGain,  {
						font: 'bold 18pt Arial',
						fill: '#ff000'
					});
					text.bringToTop();
					text.scale.y = 0;
					text.anchor.y = 1;
					var tween = this.game.add.tween(text.scale);
					tween.to({x: 1, y: 1}, 1000, Phaser.Easing.Quadratic.Out);
					tween.start();
					var timer = this.game.time.create();
					timer.add(1000, function(thingy) {thingy.kill();}, this, text);
					timer.start();
				}
			}
		}
	},

	// Checks to see if the game has been lost or won
	checkEndGame: function() {
		// Check for loss
		var tile = this.tilemap.getTile(this.player.x, this.player.y, this.groundLayer);
		if(tile.conviction.current == 'weed' && this.player.growth.strength < this.enemy.growth.strength) {
			var nearTiles = this.getNearTiles(this.player.x, this.player.y, this.player.growth.influence);
			var lost = true;
			for(var i = 0; i < nearTiles.length; ++i) {
				var nearTile = nearTiles[i];
				if(nearTile.conviction.current != 'weed' && !(nearTile.contains.water)) {
					lost = false;
				}
			}
			if(lost) {
				this.state.start('Lose');
			}
		}

		// Check for victory
		tile = this.tilemap.getTile(this.enemy.x, this.enemy.x, this.groundLayer);
		if(tile.conviction.current == 'grass' && this.player.growth.strength > this.enemy.growth.strength) {
			var nearTiles = this.getNearTiles(this.enemy.x, this.enemy.y, this.enemy.growth.influence);
			var win = true;
			for(var i = 0; i < nearTiles.length; ++i) {
				var nearTile = nearTiles[i];
				if(nearTile.conviction.current != 'grass' && !(nearTile.contains.water)) {
					win = false;
				}
			}
			if(win) {
				this.state.start('Win');
			}
		}
	},

	// Resolves a cattail attack
	resolveCattail: function(entity) {
		var nearTiles = this.getNearTiles(entity.x, entity.y, entity.growth.influence);
		for(var i = 0; i < nearTiles.length; ++i) {
			var tile = nearTiles[i];
			if(tile.contains.water) {
				continue;
			}
			if(entity.identity == 'grass') {
				tile.conviction.grass = this.ownershipVal;
				tile.conviction.weed = 0;
				tile.conviction.neutral = 0;
			} else if(entity.identity == 'weed') {
				tile.conviction.weed = this.ownershipVal;
				tile.conviction.grass = 0;
				tile.conviction.neutral = 0;
			}
		}

		this.updateOwnership(nearTiles);
		entity.growth.cattail--;
	},

	// Calculates a group of tiles within a radius around given coordinates
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
					var tile = this.tilemap.getTile(i, j, this.groundLayer);
					if(tile != null) { nearTiles.push(tile); }
				}
			}
		}

		return nearTiles;
	},

	getAdjacentTiles: function(x, y) {
		var adjacentTiles = [];
		{
			var adjTile = this.tilemap.getTile(x-1, y, this.groundLayer, true);
			if(adjTile != null) { adjacentTiles.push(adjTile); };
		}
		{
			var adjTile = this.tilemap.getTile(x+1, y, this.groundLayer, true);
			if(adjTile != null) { adjacentTiles.push(adjTile); };
		}
		{
			var adjTile = this.tilemap.getTile(x, y-1, this.groundLayer, true);
			if(adjTile != null) { adjacentTiles.push(adjTile); };
		}
		{
			var adjTile = this.tilemap.getTile(x, y+1, this.groundLayer, true);
			if(adjTile != null) { adjacentTiles.push(adjTile); };
		}
		return adjacentTiles;
	},

	// Interprets left mouse clicks as commands for expansion
	onLeftMouseDown: function(pointer) {
		this.changeExpansion(this.player.growth, 1);
		// Resolve cattail if any charges remain
		if(this.player.growth.cattail > 0) {
			this.resolveCattail(this.player);
		}
		this.leftTimer.loop(200, this.onLeftMouseDown, this);
		this.leftTimer.start();
	},

	// Interprets right mouse clicks as commands for strength
	onRightMouseDown: function(pointer) {
		this.changeStrength(this.player.growth, 1);
		this.rightTimer.loop(200, this.onRightMouseDown, this);
		this.rightTimer.start();
	},

	// Stops using unused for expansion
	onLeftMouseUp: function(pointer) {
		this.leftTimer.stop();
	},

	// Stops using unused for strength
	onRightMouseUp: function(pointer) {
		this.rightTimer.stop();
	},

	// Increases expansion using the unspent growth
	changeExpansion: function(growth, amount) {
		if(growth.unspent > 0) {
			growth.expansion += amount;
			growth.unspent -= amount;
		} else if(growth.unspent < 0) {
			growth.expansion -= amount;
			growth.unspent += amount;
		}

		// Grow influence as expansion increases
		if(growth.expansion > 100) {
			growth.influence = 4;
		} else if(growth.expansion > 50) {
			growth.influence = 3;
		} else if(growth.expansion > 20) {
			growth.influence = 2;
		}
	},

	// Increases strength using the unspent growth
	changeStrength: function(growth, amount) {
		if(growth.unspent > 0) {
			growth.strength += amount;
			growth.unspent -= amount;
		} else if(growth.unspent < 0) {
			growth.strength -= amount;
			growth.unspent += amount;
		}
	},

	// Called after rest of frame has rendered
	render: function() {
		this.game.debug.text(
			"Player: Tile Count=" + this.player.tileCount +
			" Cattail=" + this.player.growth.cattail +
			" Expansion=" + this.player.growth.expansion +
			" Strength=" + this.player.growth.strength +
			" Unspent=" + this.player.growth.unspent, 10, 20);
		this.game.debug.text(
			"Enemy: Tile Count=" + this.enemy.tileCount +
			" Cattail=" + this.enemy.growth.cattail +
			" Expansion=" + this.enemy.growth.expansion +
			" Strength=" + this.enemy.growth.strength +
			" Unspent=" + this.enemy.growth.unspent, 10, 40);
	}
};
