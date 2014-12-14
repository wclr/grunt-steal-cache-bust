/*
 * grunt-steal-cache-bust
 * https://github.com/whitecolor/grunt-steal-cache-bust
 *
 * Copyright (c) 2014 Alex Oshchepkov
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>',
            ],
            options: {
                jshintrc: '.jshintrc',
            },
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['test/temp'],
        },

        // Configuration to be run (and then tested).
        stealCacheBust: {
            default_options: {
                options: {
                    baseDir: 'test',
                    index: 'index.html',
                    destDir: 'temp',
                    assetsDir: 'assets', // relative to destDir
                    urls: ['/assets/nested/asset3.txt']
                }
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js'],
        },

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "temp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'stealCacheBust', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
