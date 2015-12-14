// Declare the menu state
OverGrown.Menu = function() {

};

// Define the member functions of the menu state
OverGrown.Menu.prototype = {
	// Loads system resources
	preload: function() {
		this.game.load.image("title", "assets/Title.png");
	},

	// Creates objects for this state
	create: function() {
		this.game.add.sprite(0,0,"title");
		var text = this.game.add.text(0, 0, "Press Spacebar to Begin", {
			font: 'bold 20pt Arial',
			boundsAlignH: 'center',
			boundsAlignV: 'middle'
		});
		text.setTextBounds(0, 475, 800, 100);
	},

	// Frame update function
	update: function() {
		if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			this.state.start('Learn');
		}
	}
};
