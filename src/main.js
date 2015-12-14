var game;

var main = function() {
	// Create the game object
	game = new Phaser.Game(800, 600, Phaser.Canvas, 'game-chasm');

	// Load the game states
	game.state.add('Menu', OverGrown.Menu);
	game.state.add('Learn', OverGrown.Learn);
	game.state.add('Game', OverGrown.Game);
	game.state.add('Lose', OverGrown.Lose);
	game.state.add('Win', OverGrown.Win);

	// Start the menu
	game.state.start('Menu');
};
