'use strict';
module.exports = function(grunt) {

    var exec = require('child_process').exec,
        path = require('path'),
        async = require('async'),
        fs = require('fs');

    var _ = grunt.util._;

    grunt.registerMultiTask('msbuild', 'Run MSBuild tasks', function() {

        var cb = this.async();

        var options = this.options({
            stdout: false,
            stderr: true,
            target: 'Build',
            buildParameters: {},
            failOnError: true
        });

        if(!options.buildParameters.configuration) {
            options.buildParameters.configuration = 'Debug';
        }

        var projectFunctions = [];

        this.files.forEach(function(filePair) {
            filePair.src.forEach(function(src) {
                projectFunctions.push(function(cb) {
                    build(src, options, cb);
                });

                projectFunctions.push(function(cb) {
                    cb();
                });
            });
        });

        async.series(projectFunctions);

    });

    function build(src, options, cb) {

        grunt.log.writeln('Building '.cyan + src);
        var cmd = buildCommand(src, options);

        console.log(cmd);
        return;


        var cp = exec(cmd, options.execOptions, function(err, stdout, stderr) {
            if (_.isFunction(options.callback)) {
                // Where does options.callback come from?
                options.callback.call(this, err, stdout, stderr, cb);
            } else {
                if (err) {
                    grunt.log.writeln('Build failed '.cyan + src);
                    if (options.failOnError) {
                        grunt.warn(err);
                    }
                }
                grunt.log.writeln('Build complete '.cyan + src);
                cb();
            }
        });

        if (options.stdout || grunt.option('verbose')) {
            cp.stdout.pipe(process.stdout);
        }

        if (options.stderr || grunt.option('verbose')) {
            cp.stderr.pipe(process.stderr);
        }

    }

    function buildCommand(src, options) {

        // TODO - work out the location of the msbuild exe, don't hard code it
        var commandPath = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\msbuild.exe ';

        // if(!fs.existsSync(commandPath)) {
            // return null;
        // }

        // TODO - work out the path separators depending on environment so this can work on *nix for xbuild
        var projectPath = path.resolve() + '\\' + src;
        
        // TODO - allow args to be passed as hash
        var args = ' /t:' + options.target;

        for(var buildArg in options.buildParameters) {
            console.log(buildArg);
            args += ' /p:' + buildArg + '=' + options.buildParameters[buildArg];
        }

        return commandPath + projectPath + args;

    }

};