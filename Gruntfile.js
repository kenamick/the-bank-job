// Generated on 2014-03-28 using generator-phaser-official 0.0.8-rc-2
'use strict';
var config = require('./config.json');
var _ = require('underscore');
_.str = require('underscore.string');

// Mix in non-conflict functions to Underscore namespace if you want
_.mixin(_.str.exports());

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    watch: {
      scripts: {
        files: [
            'game/**/*.js',
            '!game/main.js'
        ],
        options: {
          spawn: false,
          livereload: LIVERELOAD_PORT
        },
        tasks: ['build']
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0' //'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:9000'
      }
    },
    clean: {
      game: [
        'dist/js/game.js'
      ],
      dist: [
        'dist/*'
      ]
    },
    copy: {
      dist: {
        files: [
          // includes files within path and its sub-directories
          { expand: true, src: ['assets/*.png', 'assets/*.gif', 'assets/*.jpg'], dest: 'dist/' },
          { expand: true, src: ['assets/sfx/*.ogg', 'assets/sfx/*.m4a', 'assets/sfx/*.mp3'], dest: 'dist/' },
          { expand: true, flatten: true, src: ['game/plugins/*.js'], dest: 'dist/js/plugins/' },
          { expand: true, flatten: true, src: ['bower_components/phaser-official/build/phaser.min.js'], dest: 'dist/js/' },
          { expand: true, flatten: true, src: ['bower_components/lodash/dist/lodash.min.js'], dest: 'dist/js/' },
          { expand: true, flatten: true, src: ['LICENSE'], dest: 'dist/' },
          { expand: true, src: ['css/**'], dest: 'dist/' },
          { expand: true, src: ['index.html'], dest: 'dist/' }
        ]
      }
    },
    browserify: {
      build: {
        // options: {
        //   ignore: ['lodash']
        // },
        src: ['game/main.js'],
        dest: 'dist/js/game.js'
      }
    },
    uglify: {
      dist: {
        options: {
          report: 'min',
          preserveComments: false,
          banner: '<%= grunt.file.read("templates/header.txt") %>'
        },
        files: {
          'dist/js/game.min.js': ['dist/js/game.js']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'dist/index.html': ['index.html']
        }
      }
    }
  });

  grunt.registerTask('build', ['buildBootstrapper', 'browserify','copy']);
  grunt.registerTask('serve', ['build', 'connect:livereload', 'open', 'watch']);
  grunt.registerTask('default', ['serve']);
  grunt.registerTask('prod', ['build', 'uglify', 'processhtml', 'clean:game']);

  grunt.registerTask('buildBootstrapper', 'builds the bootstrapper file correctly', function() {
    var stateFiles = grunt.file.expand('game/states/*.js');
    var gameStates = [];
    var statePattern = new RegExp(/(\w+).js$/);
    stateFiles.forEach(function(file) {
      var state = file.match(statePattern)[1];
      if (!!state) {
        gameStates.push({shortName: state, stateName: _.capitalize(state) + 'State'});
      }
    });
    config.gameStates = gameStates;
    console.log(config);
    var bootstrapper = grunt.file.read('templates/_main.js.tpl');
    bootstrapper = grunt.template.process(bootstrapper,{data: config});
    grunt.file.write('game/main.js', bootstrapper);
  });

};
