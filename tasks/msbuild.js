'use strict';
module.exports = function(grunt) {

    var exec = require('child_process').exec,
        path = require('path'),
        async = require('async'),
        fs = require('fs');

    var _ = grunt.util._;

    grunt.registerMultiTask('msbuild', 'Run MSBuild tasks', function() {

        var asyncCallback = this.async();

        var options = this.options({
            stdout: false,
            stderr: true,
            targets: ['Build'],
            buildParameters: {},
            failOnError: true,
            verbosity: 'normal'
        });

        if (!options.buildParameters.projectConfiguration) {
            options.buildParameters.projectConfiguration = 'Release';
        }

        grunt.verbose.writeln('Using Options: ' + JSON.stringify(options, null, 4).cyan);

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

        async.series(projectFunctions, function() {
            asyncCallback();
        });

    });

    function build(src, options, cb) {

        grunt.log.writeln('Building ' + src.cyan);
        var cmd = buildCommand(src, options);

        if (!cmd) {
            return;
        }

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
                grunt.log.writeln('Build complete ' + src.cyan);
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
        var commandPath = path.normalize('C:/Windows/Microsoft.NET/Framework/v4.0.30319/MSBuild.exe');

        if (!fs.existsSync(commandPath)) {
            grunt.fatal('Unable to find MSBuild executable');
        }

        var projectPath = '\"' + path.normalize(path.resolve() + '/' + src) + '\"';
        
        var args = ' /target:' + options.targets;
        args += ' /verbosity:' + options.verbosity;

        for (var buildArg in options.buildParameters) {
            args += ' /property:' + buildArg + '=\"' + options.buildParameters[buildArg] + '\"';
        }

        var fullCommand = commandPath + ' ' + projectPath + ' ' + args;

        grunt.verbose.writeln('Using Command:' + fullCommand.cyan);

        return fullCommand;
    }

};