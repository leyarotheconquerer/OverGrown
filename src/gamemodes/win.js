// Declare the menu state
OverGrown.Win = function() {

};

// Define the member functions of the menu state
OverGrown.Win.prototype = {
	// Loads system resources
	preload: function() {
		this.game.load.image("title", "assets/Title.png");
	},

	// Creates objects for this state
	create: function() {
		this.stage.backgroundColor = '#00ff00';
		//this.game.add.sprite(0,0,"title");
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
