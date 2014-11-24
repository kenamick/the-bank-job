/**
 * The Bank Job
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * Please view the LICENSE file for more information.
 */

'use strict';

function Gamewin() {}

Gamewin.prototype = {
  preload: function () {

  },
  create: function () {
   var style1 = { font: '65px Arial', fill: '#131313', align: 'center'}
      , style2 = { font: '18px Arial', fill: '#A1A1A1', align: 'center'}
      , style22 = { font: '18px Arial', fill: '#131313', align: 'center'}
      , style3 = { font: '14px Arial', fill: '#A1A1A1', align: 'center'}
      , text;

    this.game.stage.backgroundColor = '#ffffff';

    this.titleText = this.game.add.text(this.game.world.centerX,100, 'You have escaped!', style1);
    this.titleText.setShadow(3, 3, '#A1A1A1', 5);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'The money is yours.', style2);
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.sprite = this.game.add.sprite(this.game.world.centerX, 320, 'bags');
    this.sprite.angle = 115;
    this.sprite.anchor.setTo(0.5, 0.5);

    this.instructionText = this.game.add.text(this.game.world.centerX, 475, 'Click anywhere to continue', style22);
    this.instructionText.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('menu');
    }
  }
};

module.exports = Gamewin;
