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
In your project's Gruntfile, add a section named `stealCacheBust` (or `steal_cache_bust` as you like) to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
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
            removeNotUsedAssets: true //will remove hashed assets that were not used anywhere
        }
    }
});
```

### Options

#### options.keepBasename
Type: `String`
Default value: `true`

Defines if hashed names will contain original name + "-{hash_value}" or just {hash_value}.

#### options.baseDir
Type: `String`
Default value: `cwd`

Base directory to witch source files (assets and bundles) are looked up.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_0.0.1_
