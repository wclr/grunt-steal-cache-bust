# grunt-steal-cache-bust

> Steal bundles and assets cache busting plugin.

## Getting Started
This plugin requires Grunt `~0.4.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-steal-cache-bust --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-steal-cache-bust');
```

## The "stealCacheBust" task

### Overview
It takes index.html template for production (distributive) version,
that contains link to steaJs main bundle file discovers all the assets and put it into one directory.


In your project's Gruntfile, add a section named `stealCacheBust` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  stealCacheBust: {
    default_options: {
        options: {
            baseDir: 'test',
            index: 'index.dist.html',
            destDir: 'dist',
            assetsDir: 'assets', // relative to destDir
            urls: ['/assets/nested/asset3.txt']
            hashes: true,
        }
    }
});
```

### Options

#### options.baseDir
Type: `String`
Default value: `process.cwd()`

Base directory (root from where developers assets are served)

#### options.index
Type: `String`

Path to index.html template file (relative to baseDir)

#### options.bundle
Type: `String`

Path to main stealJs bundle file (can be omitted if options.index is used)


#### options.destDir
Type: `String`
Required: 'Yes'

Root from where production assets are served (typically where index.html is located). <b>Relative to baseDir</b>.

#### options.assetsDir
Type: `String`

Directory where to put production assets (relative to destDir)

#### options.urls
Type: `String`
Required: 'No'

Urls which should be process but could't be automatically found in assets, can be RegEx instance, or string for new RegExp

#### options.hashes
Type: `String`
Default value: `false`

Add hashes to result assets

#### options.hashesOnly
Type: `String`
Default value: `false`

Replaces files names with hashes completely (no need to set options.hash)


## Release History
0.2.0 - new simplified version with automagical assets discovery
0.0.1 - old more complicated version
