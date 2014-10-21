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
                    keepBasename: true, // names of result files will contain original name + "-{hash_value}"
                    baseDir: 'test',

                    // assets map can be array or object (if only one)
                    assets: [
                        {
                            src: ['assets/*'], // pattern mask for asset files, string or array of string
                            dest: 'temp/assets', // where to put bundles (relative to baseDir or cwd)
                            urlBase: {src: '', dest: 'temp'}, // this paths is substracted from asset file path to get URLs
                            addToPath: true
                        }
                    ],

                    // configuration for busting steal.js bundles
                    bundles: {
                        main: 'bundle0', // main bundle name (optional if only one bundle)
                        path: 'bundles', // where from take bundles (relative to baseDir or cwd)
                        dest: 'temp/assets', // where to output files (relative to baseDir or cwd)
                        removeTraceur: false, // remove traceur runtime from file
                        bustedPath: '/assets', // will be added to every System.path value,
                        urlBase: {src: '', dest: 'temp'}
                    },

                    // replace busted assets in index.html
                    index: {
                        src: 'index.html',
                        dest: 'temp/index.html'
                    },
                    removeNotUsedAssets: true
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
