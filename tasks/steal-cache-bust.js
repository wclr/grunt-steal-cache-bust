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
            assetsDir: '',
            bundlesDir: '',
            hashes: false,
            hashesOnly: false,
            relativeUrls: undefined
        });

        var assetsMap = [],
            cwd = process.cwd(),
            baseDir = path.resolve(cwd, options.baseDir),
            destBaseDir = path.resolve(baseDir, options.destDir),
            assetsDir = path.resolve(destBaseDir, options.assetsDir)

        var getDestAssetName = function(src, data){

            var fileName = path.basename(src)

            if (options.hashes || options.hashesOnly){
                var hash = crypto.createHash('md5').update(data).digest('hex'),
                    ext = path.extname(fileName),
                    basename = path.basename(fileName, ext)
                return (options.hashesOnly ? '' : basename + '-' ) + hash + ext
            } else {
                return fileName
            }

        }


        var urlRegExps = [
            /url\s*\(\s*["|']?\s*([^'"]*?\.[\w\d]{2,4})\s*["|']?\s*\)/,
            /(?:url\:|\.get|\.ajax|System\.import)\s*\([^'"]*["|']\s*([^'"\)]*?)\s*["|']/,
            /<(?:img|script).*?src=\s*["|']\s*([^'"]*?)\s*["|']/,
            /<(?:link).*?href=\s*["|']\s*([^'"]*?)\s*["|']/,
            /<script.*?(?:data-)?main=\s*["|']\s*([^'"]*?)\s*["|']/, // steal bundle
            ///<meta.*?content=\s*["|']\s*([^'"]*?\.[\w\d]{2,4})\s*["|']/,
            //'url\\s*\\(\\s*["|\']?\\s*([^\'"]*?\\.[\\w\\d]{2,4})\\s*["|\']?\\s*\\)' +
        ]

        var findUrls = function(data){
            var urls = []
            urlRegExps.forEach(function(regEx){
                var match = data.match(new RegExp(regEx.source,'g'))
                if (match){
                    urls = urls.concat(match.map(function(url){
                        return url.match(regEx)[1]
                    }))
                }
            })

            if (options.urls && options.urls.forEach){
                options.urls.forEach(function(url){
                    //console.log('options urls checking', url)
                    if (typeof url == 'string'){
                        url = new RegExp(url)
                    }

                    if (url instanceof RegExp){
                        var match = data.match(new RegExp(url.source,'g')) || []
                        urls = urls.concat(match)
                    }
                })
            }

            //console.log('findUrls', urls)
            return urls
        }

        var isMainBundle = function(data){
            return /System\.bundles/.test(data)
        }

        var processBundle = function(srcPath, data){

            var bundleFiles = grunt.file.expand(path.dirname(srcPath) + '/*')


            var bundleMap = []

            bundleFiles.forEach(function(bundleFile){
                if (path.normalize(bundleFile) !== path.normalize(srcPath)){
                    //console.log('processBundle file', bundleFile)
                    var extname = path.extname(bundleFile).slice(1)
                    if (extname === 'js'){extname = ''}

                    var destBundleFile = processAssetFile(bundleFile)

                    // need to add extension css to mapped path to get: app.csscss
                    bundleMap.push({
                        name: path.basename(bundleFile, '.js'),
                        url: getUrl(destBundleFile, assetsDir) + extname
                    })
                }
            })

            var configStr = bundleMap.map(function(bundle){
                return 'System.paths["bundles/' + bundle.name +'"] = "'
                + bundle.url +'";'
            }).join('\n')

            return data.replace(/System\.paths\["bundles\/.*?\n/g, '')
                // add paths to hashed files
                .replace(/(\nSystem\.bundles =)/, '\n' + configStr + '$1')

        }

        var lookForUrlsIn = ['.css', '.html', '.js']

        var getUrl = function(urlPath, relativeTo){
            if (options.relativeUrls === false){
                relativeTo = false
            }

            var url = (relativeTo
                ? path.relative(relativeTo, urlPath)
                : '/' + path.relative(destBaseDir, urlPath)
            ).replace(/\\/g, '/')

            //console.log('getUrl', urlPath, url)

            return url
        }

        var processAssetFile = function(srcPath, destPath){
            // resolve source path (removing absolute url slash)
            var srcDir = path.dirname(srcPath),
                extname = path.extname(srcPath)

            //console.log('processAssetFile', src)
            if (assetsMap[srcPath] === ''){
                console.log('Possible cyclic dependency', srcPath)
                return ''
            }

            if (assetsMap[srcPath] === undefined){
                if (!grunt.file.exists(srcPath) || grunt.file.isDir(srcPath)){
                    //console.log('File', srcPath, 'does not exist.')
                    return ''
                }
                //console.log('foundUrls', foundUrls)
                var lookForUrls = lookForUrlsIn.indexOf(extname) >= 0

                var srcData = grunt.file.read(srcPath, lookForUrls ? {} : {encoding: null} )


                // no forced relative urls for js
                var relativeUrls = (extname !== '.js' && options.relativeUrls)

                assetsMap[srcPath] == ''
                // find all urs in file
                if (lookForUrls){
                    var foundUrls = findUrls(srcData)
                    var urlsMap = []

                    var destDir = destPath ? path.dirname(destPath) : assetsDir

                    foundUrls.forEach(function(url){
                        if (!url) return
                        // get source file path
                        // if relative then resolve relative to current source
                        // if absolute path resolve relative to baseDir
                        var relative = url[0] !== '/',
                            filePath = relative ?
                                path.resolve(srcDir, url) :
                                path.resolve(baseDir, url.slice(1))
                        // get dest path
                        var destPath = processAssetFile(filePath)
                        if (destPath){
                            urlsMap.push({
                                src: url,
                                dest: getUrl(destPath, (relativeUrls || relative) && destDir)
                            })
                        }
                    })
                    urlsMap.forEach(function(map){
                        srcData = srcData.replace(new RegExp(map.src, 'g'), map.dest)
                    })
                }

                if (extname == '.js' && isMainBundle(srcData)){
                    srcData = processBundle(srcPath, srcData)
                }

                destPath = destPath || path.resolve(assetsDir, getDestAssetName(srcPath, srcData))

                assetsMap[srcPath] = destPath

                console.log('writing file', path.relative(destBaseDir, destPath))
                grunt.file.write(destPath, srcData)

                // replace urls and save file
            }

            return assetsMap[srcPath]
        }

        if (options.index){
            var srcPath =  path.resolve(baseDir, options.index.src || options.index),
                destPath = path.resolve(destBaseDir, options.index.dest || 'index.html')
            processAssetFile(srcPath, destPath)
        }

        if (options.bundle){
            processAssetFile(path.resolve(baseDir, options.bundle))
        }

    }

    grunt.registerMultiTask('stealCacheBust', 'Steal bundles and assets cache busting plugin.', taskFunc);

};
