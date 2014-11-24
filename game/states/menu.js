/**
 * The Bank Job
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * Please view the LICENSE file for more information.
 */

'use strict';

function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
   var style1 = { font: '65px Arial', fill: '#131313', align: 'center'}
      , style2 = { font: '18px Arial', fill: '#A1A1A1', align: 'center'}
      , style22 = { font: '18px Arial', fill: '#131313', align: 'center'}
      , style3 = { font: '14px Arial', fill: '#A1A1A1', align: 'center'}
      , text;

    this.game.stage.backgroundColor = '#ffffff';

    this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'bags');
    this.sprite.angle = 115;
    this.game.add.tween(this.sprite).to({angle: 160}, 2000, Phaser.Easing.Linear.NONE, true, 0, 5000, true);
    this.sprite.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(this.game.world.centerX, 250, 'The Bank Job', style1);
    text.setShadow(3, 3, '#A1A1A1', 5);
    text.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(this.game.world.centerX, 320, 'by Dvubuz Games', style2);
    text.anchor.setTo(0.5, 0.5);

    text.anchor.setTo(0.5, 0.5);
    text = this.game.add.text(this.game.world.centerX, 455, 'Click anywhere to start', style22);
    text.anchor.setTo(0.5, 0.5);

    text = this.game.add.text(25, 580, 'Coding & Sfx by Petar Petrov', style3);
    text = this.game.add.text(25, 600, 'Art by Stremena Tuzsuzova', style3);

    // music
    this.music = this.game.add.sound('music');
    this.music.loop = true;
    this.music.play();

  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('gameintro');
    }
  },
  shutdown: function() {
    this.music.stop();
    this.music.destroy();
  }
};

module.exports = Menu;
