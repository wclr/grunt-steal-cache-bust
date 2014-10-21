/*
 * grunt-steal-cache-bust
 * https://github.com/whitecolor/grunt-steal-cache-bust
 *
 * Copyright (c) 2014 Alex Oshchepkov
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path'),
    crypto = require('crypto'),
    util = require('util')

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    var taskFunc = function() {

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            baseDir: '',
            separator: ', '
        });

        var bustMap = [],
            baseDir = path.resolve(process.cwd(), options.baseDir)

        console.log('Base directory is', baseDir)

        var makeHashedName = function(fileName, data){
            var hash = crypto.createHash('md5').update(data).digest('hex'),
                ext = path.extname(fileName),
                basename = path.basename(fileName, ext)

            return (options.keepBasename ? basename + '-' : '' ) + hash + ext
        }

        var mapBustedUrls = function(data){

            var oldData

            try {
                bustMap.forEach(function(map){
                    oldData = data
                    data = data.replace(new RegExp(map['from'], 'g'), map['to'])
                    if (oldData !== data){
                        map.used = true
                    }

                })
            } catch(e){
                console.log('stealCacheBust mapUrls error', e.message)
            }

            return data
        }

        var addToBustMap = function(paths, urlBase){
            urlBase = urlBase || {}
            var srcBase = path.resolve(baseDir, urlBase.src || urlBase[0] || ''),
                destBase = path.resolve(baseDir, urlBase.dest || urlBase[1] || '')

            //console.log('addToBustMap', urlBase.dest, destBase)

            bustMap.push({
                srcPath: paths.src,
                destPath: paths.dest,
                from: paths.src.slice(srcBase.length).replace(/\\/g, '/'),
                to: paths.dest.slice(destBase.length).replace(/\\/g, '/')
            })

        }

        // create hached assets
        if (options.assets){

            var assets = util.isArray(options.assets) ? options.assets : [options.assets]

            assets.forEach(function(assetsMap){

                var files = grunt.file.expand({cwd: baseDir}, assetsMap.src)

                files.forEach(function(filePath){

                    filePath = path.resolve(baseDir, filePath)

                    var data = grunt.file.read(filePath, {encoding: null})


                    var fileName = path.basename(filePath),
                        hashedName = makeHashedName(fileName, data),
                        destPath = path.resolve(baseDir, assetsMap.dest, hashedName)

                    console.log('Saving hashed asset file', path.relative(baseDir, destPath))

                    grunt.file.write(destPath, data)

                    if (assetsMap.remove){
                        grunt.file.delete(filePath)
                    }

                    addToBustMap({src: filePath, dest: destPath}, assetsMap.urlBase)

                })
            })
        }


        if (options.bundles){

            var bundlesPath = options.bundles.path,
                fullBundlesPath = path.resolve(baseDir, bundlesPath)



            var bundleFiles = grunt.file.expand(fullBundlesPath + '/*')

            var bundles = bundleFiles.map(function(bundleFile){
                var fileName = path.basename(bundleFile)
                //console.log('Loading bundle file', path.relative(baseDir, bundleFile))
                return {
                    name: fileName.replace(/\.js$/, ''),
                    fileName: fileName,
                    ext: path.extname(fileName).slice(1),
                    path: bundleFile,
                    source: grunt.file.read(bundleFile)
                }
            })

            // no bundles.main option
            var mainBundleName
            if (!options.bundles.main){
                var jsBundles = bundles.filter(function(b){return b.ext == 'js'})
                if (jsBundles.length[0]){
                    mainBundleName = jsBundles[0].name
                }
            } else {
                mainBundleName = path.basename(options.bundles.main)
            }

            var mainBundle = bundles.filter(function(b){return b.name == mainBundleName})[0]

            if (!mainBundle){
                console.log('Could not find main bundle', mainBundleName)
                return
            }


            // remove main bundle from bundles
            bundles.splice(bundles.indexOf(mainBundle), 1)


            var saveHashedBundleFile = function(filePath, source){
                var name = makeHashedName(filePath, source)
                var savePath = path.resolve(baseDir, options.bundles.dest, name)
                console.log('Saving bundle file', path.relative(baseDir, savePath))
                grunt.file.write(savePath, source)
                return savePath
            }

            // compose paths that we should add to main bundle System.paths
            var pathsStr = bundles.map(function(bundle){

                var ext = path.extname(bundle.name).slice(1)

                if (ext == 'css'){
                    bundle.source = mapBustedUrls(bundle.source)
                }

                var hashedName = path.basename(saveHashedBundleFile(bundle.path, bundle.source))

                if (options.bundles.remove){
                    grunt.file.delete(bundle.path)
                }

                // for css we should append just "css": "/dist/app.csscss";'

                var bundlePath = options.bundles.bustedPath || ''

                // add slash in the end of the path
                bundlePath && (bundlePath = bundlePath.replace(/\/$/, '') + '/')

                return 'System.paths["bundles/' + bundle.name +'"] = "'
                    + bundlePath + hashedName + ext +'";'

            }).join('\n')

            if (options.bundles.removeTraceur){
                // remove traceur-runtime
                mainBundle.source = mainBundle.source.replace(/\/\*\[traceur-runtime\]\*\/[\s\S]*?\n(\/\*)/, '$1')
            }

            if (options.bundles.loadCssUsingStyleTag){
                mainBundle.source = mainBundle.source.replace(/(define\("\$css.*?)production/, '$1')
            }

            if (pathsStr){
                mainBundle.source = mainBundle.source
                    //remove old bundles paths
                    .replace(/System\.paths\["bundles\/.*?\n/g, '')
                    // add paths to hashed files
                    .replace(/(\nSystem\.bundles =)/, '\n' + pathsStr + '$1')
            }

            var mainBundleHashed = saveHashedBundleFile(mainBundle.path, mainBundle.source)

            addToBustMap({src: mainBundle.path, dest: mainBundleHashed}, options.bundles.urlBase)
        }

        if (options.index){
            var indexHtml = grunt.file.read(path.resolve(baseDir, options.index.src))
            grunt.file.write(path.resolve(baseDir, options.index.dest), mapBustedUrls(indexHtml))
        }

        if (options.removeNotUsedAssets){
            bustMap.filter(function(map){return !map.used}).forEach(function(map){
                console.log('Remove not used asset', path.relative(baseDir, map.destPath))
                grunt.file.delete(map.destPath)
            })
        }

    }

    grunt.registerMultiTask('stealCacheBust', 'Steal bundles and assets cache busting plugin.', taskFunc);

    grunt.registerMultiTask('steal_cache_bust', 'Steal bundles and assets cache busting plugin.', taskFunc);

};
