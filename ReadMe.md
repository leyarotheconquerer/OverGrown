Over Grown
==========
LD34 Entry
----------

This project is an entry to the Ludum Dare 34 Compo. It is a small game developed
using the Phaser framework.

Theme: Two button controls and Growing

Over Grown is a game in which you play a clump of grass eager to overgrow the evil spread of weeds arrayed against you. Use your superior powers of reasoning to grow faster and stronger than your opponent.

Design
------
+ Game progresses in one second ticks
+ Player and enemy has one tile called the dedicated tile that may be moved to adjacent tiles
+ This tile has a range which considers tiles "near"
- Adjacent tiles may be next to any owned tiles

+ Tiles have types, grass, weed, neutral, dung, water, and cat tail.
+ A tile has a conviction total of 5
+ Once per tick, tiles "near" the dedicated tile are persuaded toward the dedicated tile's owner
	+ The point value added to these tiles is equal to sqrt(player.expansion)
+ Unless the "near" tile belongs to the opponent
	+ Then the point value subtracted from the opponent and added to the player is sqrt(player.strength)
- Adjacent tiles between opponents are convinced if player.strength < enemy.strength
	- The rate of conversion is sqrt(enemy.strength - player.strength)
+ Water cannot be grown on

+ Growth points may be dedicated towards expansion or strength, only added to expansion or strength once (suject to play testing)
+ Every 10 tiles in ownership increase growth points by 1
+ Every dung tile increases growth points by 1
+ Every tile adjacent to water increases growth points by 1

+ Cat tails taken into ownership provide a one time use bonus
+ This bonus is used on command
	+ With it, a player immediately gains all tiles "near" the dedicated tile
	- With it, a player may immediately take up 10 adjacent tiles
	- Or the player may immediately steal 3 adjacent enemy tiles
