'use strict';

var grunt = require('grunt')

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

var assetsPath = 'test/temp/assets'


exports.steal_cache_bust = {
    setUp: function(done) {
        // setup here if necessary



        done();
    },
    pathsInMainBundle: function(test) {
        test.expect(3);

        var bundle0 = grunt.file.read(assetsPath + '/bundle0.js')

        test.ok(
            bundle0.indexOf('System.paths["bundles/bundle0.css"] = "bundle0.csscss";') > 0,
            'bundle0.css path is not ok'
        )

        test.ok(
            bundle0.indexOf('System.paths["bundles/bundle1.css"] = "bundle1.csscss";')  > 0,
            'bundle1.css path is not ok'
        )

        test.ok(
            bundle0.indexOf('System.paths["bundles/bundle1"] = "bundle1.js";')  > 0,
            'bundle1.js path is not ok'
        )


        test.done();
    },

    urlInJsBundle1: function(test) {

        test.expect(2);

        var bundle1 = grunt.file.read(assetsPath + '/bundle1.js')

        test.ok(
            bundle1.indexOf("can.get('/assets/asset1.txt')") > 0,
            'bundle1.js absolute url from can.get() is not ok'
        )

        test.ok(
            bundle1.indexOf("someurl = '/assets/asset3.txt'") > 0,
            'bundle1.js absolute url from options.urls is not ok'
        )

        test.done();
    },

    urlsInCss: function(test) {
        test.expect(3);

        var bundle0css = grunt.file.read(assetsPath + '/bundle0.css')
        var bundle1css = grunt.file.read(assetsPath + '/bundle1.css')

        test.ok(
            bundle0css.indexOf('url(/assets/asset1.txt);') > 0,
            'absolute path in bundle0.css is not ok'
        )

        test.ok(
            bundle0css.indexOf('url(/assets/asset2.txt);')  > 0,
            'absolute path in bundle0.css is not ok'
        )

        test.ok(
            bundle1css.indexOf('url(asset2.txt);')  > 0,
            'relative url in bundle1.css is not ok'
        )

        test.done();
    },


    indexHtml: function(test) {
        test.expect(0);


        test.done();
    }

};
