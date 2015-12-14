// Declare the learn state
OverGrown.Learn = function() {
	this.styles = {
		tutorialText: {
			font: 'bold 18pt Arial',
			fill: '#000000',
			boundsAlignH: 'center',
			boundsAlignV: 'middle'
		}
	};
};

// Define the member functions of the learn state
OverGrown.Learn.prototype = {
	// Loads system resources
	preload: function() {
		this.game.load.spritesheet('tiles', 'assets/Tiles.png', 32, 32, 7);
		this.game.load.image('cattail', 'assets/Cattail.png');
		this.game.load.image('dung', 'assets/Dung.png');
		this.game.load.spritesheet('cattails', 'assets/Cattails.png', 64, 64, 2);
		this.game.load.spritesheet('grass', 'assets/Grass.png', 64, 64, 6);
		this.game.load.spritesheet('weeds', 'assets/Weeds.png', 64, 64, 12);
		this.game.load.image('selector', 'assets/Selector.png');
		this.game.load.image('target', 'assets/Target.png');
	},

	// Creates objects for this state
	create: function() {
		this.stage.backgroundColor = '#9f9f9f';

		var text = this.game.add.text(0,0, "Your goal is to grow over your opponent.", this.styles.tutorialText);
		text.setTextBounds(0, 20, 800, 30);

		text = this.game.add.text(0,0, "You are Grass.", this.styles.tutorialText);
		text.setTextBounds(0, 60, 400, 30);
		var sprite = this.game.add.sprite(100, 80, 'grass', 0);
		sprite = this.game.add.sprite(170, 80, 'grass', 1);
		sprite = this.game.add.sprite(240, 80, 'grass', 2);

		text = this.game.add.text(0,0, "Your opponent is Weeds.", this.styles.tutorialText);
		sprite = this.game.add.sprite(500, 80, 'weeds', 0);
		sprite = this.game.add.sprite(570, 80, 'weeds', 1);
		text.setTextBounds(400, 60, 400, 30);

		text = this.game.add.text(0,0, "Collect Growth points by:", this.styles.tutorialText);
		text.setTextBounds(0, 150, 800, 30);

		text = this.game.add.text(0,0, "growing near water", this.styles.tutorialText);
		sprite = this.game.add.sprite(200, 190, 'tiles', 3);
		text.setTextBounds(0, 190, 800, 30);

		text = this.game.add.text(0,0, "growing on dung", this.styles.tutorialText);
		sprite = this.game.add.sprite(200, 220, 'dung');
		text.setTextBounds(0, 220, 800, 30);

		text = this.game.add.text(0,0, "growing 10 tiles", this.styles.tutorialText);
		text.setTextBounds(0, 250, 800, 30);

		text = this.game.add.text(0,0, "Spend Growth with the Right/Left mouse button", this.styles.tutorialText);
		text.setTextBounds(0, 290, 800, 40);

		text = this.game.add.text(0,0, "Expansion (Left)", this.styles.tutorialText);
		text.setTextBounds(0, 330, 400, 30);
		text = this.game.add.text(0,0, "Helps you grow faster", this.styles.tutorialText);
		text.setTextBounds(0, 360, 400, 30);

		text = this.game.add.text(0,0, "Strength (Right)", this.styles.tutorialText);
		text.setTextBounds(400, 330, 400, 30);
		text = this.game.add.text(0,0, "Helps you defend/attack", this.styles.tutorialText);
		text.setTextBounds(400, 360, 400, 30);

		text = this.game.add.text(0,0, "Collect Cattails for a power up", this.styles.tutorialText);
		sprite = this.game.add.sprite(370, 440, 'cattails', 0);
		text.setTextBounds(0, 400, 800, 40);
		text = this.game.add.text(0,0, "Release with the Left mouse button", this.styles.tutorialText);
		text.setTextBounds(0, 500, 800, 40);

		var text = this.game.add.text(0, 0, "Press Spacebar to Continue", {
			font: 'bold 20pt Arial',
			boundsAlignH: 'center',
			boundsAlignV: 'middle'
		});
		text.setTextBounds(0, 550, 800, 50);
	},

	// Frame update function
	update: function() {
		if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			this.state.start('Game');
		}
	}
};
