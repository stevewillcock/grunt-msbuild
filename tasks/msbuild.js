'use strict';
module.exports = function (grunt) {

    var exec = require('child_process').exec,
        path = require('path'),
        async = require('async');

    var _ = grunt.util._;

    grunt.registerMultiTask('msbuild', 'Run MSBuild tasks', function () {

        var cb = this.async();

        var options = this.options({
            stdout: false,
            stderr: true,
            configuration: 'Release',
            failOnError: true
        });

        var projectFunctions = [];

        this.files.forEach(function (filePair) {
            filePair.src.forEach(function (src) {
                projectFunctions.push(function (cb) {
                    build(src, options, cb);
                });

                projectFunctions.push(function (cb) {
                    cb();
                });
            });
        });

        async.series(projectFunctions);

    });

    function build(src, options, cb) {

        grunt.log.writeln('Building '.cyan + src);
        var cmd = buildCommand(src, options.configuration);

        var cp = exec(cmd, options.execOptions, function (err, stdout, stderr) {
            if (_.isFunction(options.callback)) {
                // Where does options.callback come from?
                options.callback.call(this, err, stdout, stderr, cb);
            } else {
                if (err) {
                    grunt.log.writeln('Build failed '.cyan + src);
                    if(options.failOnError){
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

    function buildCommand(src, configuration) {

        var command = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\msbuild.exe ';
        var mainPath = path.resolve() + '\\' + src;
        var args = ' /t:Build /p:Configuration=' + configuration;

        return command + mainPath + args;

    }

};
