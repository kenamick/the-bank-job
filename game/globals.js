/**
 * The Bank Job
 *
 * Copyright (c) 2014 Petar Petrov
 *
 * Please view the LICENSE file for more information.
 */

'use strict';

var Globals = {

  /**
   * Global constants
   */

  PLAYER_SPEED: 101,
  PLAYER_WALK_ANIM_SPEED: 10,
  MONSTER_SPEED: 54,
  MONSTER_ACC: 108,
  MONSTER_MAXSPEED: 160,
  MONSTER_ACC_DELAY: 2800,

  SPAWN_COP_CHANCE: 25,

  DN: 10,
  DS: 11,
  DW: 12,
  DE: 13,

  ROOMS_X: 4,
  ROOMS_Y: 4,

  MONSTER01: 91, // static velocity
  MONSTER02: 92, // acc
  PLANT01: 101,
  PLANT02: 102,
  CHAIR01: 111,
  CHAIR02: 112,
  CHAIR03: 113,
  CHAIR04: 114,

  // Gfx & UI

  SCREEN_WIDTH: 960,
  SCREEN_HEIGHT: 640,
  TEXT_DELAY: 2500,
  ROOM_ENTER_DELAY: 850,
  GAMEEND_FADE_DELAY: 3000,

  /**
   * Debugging
   */

  enableDebug: false,

  debug: function() {
    if (this.enableDebug) {
      var args = Array.prototype.slice.call(arguments, 0);
      console.log(args);
    }
  },

  error: function() {
    if (this.enableDebug) {
      var args = Array.prototype.slice.call(arguments, 0);
      console.error(args);
    }
  },

  /**
   * Math constants
   */

  math: {
    PI:     3.14159265358979,
    PI2:    6.28318530716,
    PI_2:   1.5707963267948966,
    PI_4:   0.3926990817,
    PI3_2:  4.71238898037
  }

};

module.exports = Globals;
