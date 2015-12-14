// Declare the lose state
OverGrown.Lose = function() {

};

// Define the member functions of the menu state
OverGrown.Lose.prototype = {
	// Loads system resources
	preload: function() {
		this.game.load.image("lose", "assets/Lose.png");
	},

	// Creates objects for this state
	create: function() {
		this.stage.backgroundColor = '#9f9f9f';
		this.game.add.sprite(0,0,"lose");
		var text = this.game.add.text(0, 0, "Press Spacebar to Play Again", {
			font: 'bold 20pt Arial',
			boundsAlignH: 'center',
			boundsAlignV: 'middle'
		});
		text.setTextBounds(0, 475, 800, 100);
	},

	// Frame update function
	update: function() {
		if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			this.state.start('Game');
		}
	}
};
