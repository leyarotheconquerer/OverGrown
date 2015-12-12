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
	},

	// Frame update function
	update: function() {

	}
};
