module.exports = function (grunt) {

    'use strict';

    var spawn = require('child_process').spawn,
        path = require('path'),
        async = require('async');

    var _ = grunt.util._;

    grunt.registerMultiTask('msbuild', 'Run MSBuild tasks', function () {

        var asyncCallback = this.async();

        var options = this.options({
            targets: ['Build'],
            buildParameters: {},
            customArgs: [],
            failOnError: true,
            verbosity: 'normal',
            processor: '',
            nologo: true,
            nodeReuse: true
        });

        if (!options.projectConfiguration) {
            options.projectConfiguration = 'Release';
        }

        grunt.verbose.writeln('Using Options: ' + JSON.stringify(options, null, 4).cyan);

        var projectFunctions = [];
        var files = this.files;
        var fileExists = false;

        if (files.length === 0) {
            files.push({src: ['']});
        }

        files.forEach(function (filePair) {
            grunt.verbose.writeln('File ' + filePair);
            filePair.src.forEach(function (src) {
                fileExists = true;
                projectFunctions.push(function (cb) {
                    build(src, options, cb);
                });

                projectFunctions.push(function (cb) {
                    cb();
                });
            });
        });

        if (!fileExists) {
            grunt.warn('No project or solution files found');
        }

        async.series(projectFunctions, function () {
            asyncCallback();
        });

    });

    function build(src, options, cb) {

        var projName = src || path.basename(process.cwd());

        grunt.log.writeln('Building ' + projName.cyan);

        if(!options.msbuildPath) {
            grunt.fail.warn('options.msbuildPath not set')
        }

        if(!grunt.file.exists(options.msbuildPath)) {
            grunt.fail.warn('Unable to find file [' + options.msbuildPath + '] (this is set via options.msbuildPath)')
        }

        var cmd = options.msbuildPath;
        var args = createCommandArgs(src, options);

        grunt.verbose.writeln('Using cmd:', cmd);
        grunt.verbose.writeln('Using args:', args);

        if (!cmd) {
            return;
        }

        var cp = spawn(cmd, args, {
            stdio: 'inherit'
        });

        cp.on('close', function (code) {
            var success = code === 0;
            grunt.verbose.writeln('close received - code: ', success);

            if (code === 0) {
                grunt.log.writeln('Build complete ' + projName.cyan);
            } else {
                grunt.log.writeln(('MSBuild failed with code: ' + code).cyan + projName);
                if (options.failOnError) {
                    grunt.warn('MSBuild exited with a failure code: ' + code);
                }
            }
            cb();
        });

    }

    function createCommandArgs(src, options) {

        var args = [];

        if (src) {
            var projectPath = path.normalize(src);

            args.push(projectPath);
        }

        args.push('/target:' + options.targets);
        args.push('/verbosity:' + options.verbosity);

        if (options.nologo) {
            args.push('/nologo');
        }

        if (options.maxCpuCount) {
            // maxcpucount is not supported by xbuild
            if (process.platform === 'win32') {
                grunt.verbose.writeln('Using maxcpucount:', +options.maxCpuCount);
                args.push('/maxcpucount:' + options.maxCpuCount);
            }
        }

        if (options.consoleLoggerParameters) {
            grunt.verbose.writeln('Using clp:' + options.consoleLoggerParameters);
            args.push('/clp:' + options.consoleLoggerParameters);
        }

        args.push('/property:Configuration=' + options.projectConfiguration);

        if (options.platform) {
            args.push('/p:Platform=' + options.platform);
        }

        if (!options.nodeReuse) {
            args.push('/nodeReuse:false');
        }

        if (options.visualStudioVersion) {
            args.push('/p:VisualStudioVersion=' + options.visualStudioVersion + '.0');
        }

        for (var buildArg in options.buildParameters) {
            var p = '/property:' + buildArg + '=' + options.buildParameters[buildArg];
            grunt.verbose.writeln('setting property: ' + p);
            args.push(p);
        }

        options.customArgs.forEach(function (a) {
            grunt.verbose.writeln('setting customArg: ' + a);
            args.push(a);
        });

        return args;
    }

};
