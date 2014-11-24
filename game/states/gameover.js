/**
 * The Bank Job
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * Please view the LICENSE file for more information.
 */

'use strict';

function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
   var style1 = { font: '65px Arial', fill: '#131313', align: 'center'}
      , style2 = { font: '18px Arial', fill: '#A1A1A1', align: 'center'}
      , style22 = { font: '18px Arial', fill: '#131313', align: 'center'}
      , style3 = { font: '14px Arial', fill: '#A1A1A1', align: 'center'};

    this.game.stage.backgroundColor = '#ffffff';

    this.titleText = this.game.add.text(this.game.world.centerX,100, 'Game Over', style1);
    this.titleText.setShadow(3, 3, '#A1A1A1', 5);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'You have been caught!', style2);
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 250, 'See you in 20 years time.', style2);
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.instructionText = this.game.add.text(this.game.world.centerX, 475, 'Click anywhere to continue', style22);
    this.instructionText.anchor.setTo(0.5, 0.5);

    // caught
    this.addCop(this.game.world.centerX, 320);
    this.addCop(this.game.world.centerX - 65, 320);
    this.addCop(this.game.world.centerX + 65, 320);
    this.addCop(this.game.world.centerX, 380, 'protagonist');
  },

  addCop: function(x, y, key) {
    key = key || 'monster';
    this.sprite = this.game.add.sprite(x, y, key, 1);
    this.sprite.angle = 180;
    this.sprite.anchor.setTo(0.5, 0.5);
  },

  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('menu');
    }
  }
};
module.exports = GameOver;
