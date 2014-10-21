'use strict';

var grunt = require('grunt'),
    fs = require('fs')

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

var asset1Hashed =  'asset1-d40550281cb0b55fdfbc62a976891616.txt'
var asset2Hashed = 'asset2-51e2292abe8e406ca8abb30e3b943c4d.txt'
var bundle1CssHashed = 'bundle1-7db4cebc60cdaca08365ab40f85867d8.css'
var bundle0CssHashed = 'bundle0-9aff02e709e8bf1644f94126f639dc7a.css'
var bundle1JsHashed = 'bundle1-d5bfcf2baec3703f19e97120cae1bfaf.js'
var bundle0JsHashed = 'bundle0-b197da9be5e76ad6402e2880567ffb2f.js' // main bundle
var notUsedAsset = 'asset-not-used-c17cf7f03a347a769a30f71385fb5c9b.txt'

var assetsPath = 'test/temp/assets/'

exports.steal_cache_bust = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },
    hashedAssets: function(test) {
        test.expect(6);

        test.ok(grunt.file.exists(assetsPath + asset1Hashed),'hashed assets1 does not exists')

        test.ok(grunt.file.exists(assetsPath + asset2Hashed),'hashed assets2 does not exists')

        test.ok(grunt.file.exists(assetsPath + bundle0CssHashed),'hashed bundle0.css does not exists')

        test.ok(grunt.file.exists(assetsPath + bundle1CssHashed),'hashed bundle1.css does not exists')

        test.ok(grunt.file.exists(assetsPath + bundle1JsHashed),'hashed bundle1.js does not exists')

        test.ok(grunt.file.exists(assetsPath + bundle0JsHashed),'hashed bundle1.js does not exists')

        test.done();
    },

    indexHtml: function(test) {
        test.expect(1);

        var html = grunt.file.read('test/temp/index.html')

        test.ok(html.indexOf('' + bundle0JsHashed + '') > 0)

        test.done();
    },

    notUsedAsset: function(test) {
        test.expect(1);

        test.ok(!grunt.file.exists(assetsPath + notUsedAsset), 'Not used asset was not removed')

        test.done();
    },
    //custom_options: function(test) {
    //    test.expect(1);
    //
    //    var actual = grunt.file.read('tmp/custom_options');
    //    var expected = grunt.file.read('test/expected/custom_options');
    //    test.equal(actual, expected, 'should describe what the custom option(s) behavior is.');
    //
    //    test.done();
    //}
};
