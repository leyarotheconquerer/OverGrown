var game;

var main = function() {
	// Create the game object
	game = new Phaser.Game(800, 600, Phaser.Canvas, 'game-chasm');

	// Load the game states
	game.state.add('Menu', LD34.Menu);
	game.state.add('Game', LD34.Game);

	// Start the menu
	game.state.start('Menu');
};
