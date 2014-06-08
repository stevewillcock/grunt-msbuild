module.exports = function(grunt) {

    'use strict';

    var spawn = require('child_process').spawn,
        path = require('path'),
        async = require('async'),
        fs = require('fs');

    var _ = grunt.util._;

    var versions = {
        1.0: '1.0.3705',
        1.1: '1.1.4322',
        2.0: '2.0.50727',
        3.5: '3.5',
        4.0: '4.0.30319'
    };

    grunt.registerMultiTask('msbuild', 'Run MSBuild tasks', function() {

        var asyncCallback = this.async();

        var options = this.options({
            targets: ['Build'],
            buildParameters: {},
            failOnError: true,
            verbosity: 'normal',
            processor: '',
            nologo: true
        });

        if (!options.projectConfiguration) {
            options.projectConfiguration = 'Release';
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

        var cmd = createCommand(options.version || null, options.processor);
        var args = createCommandArgs(src, options);

        grunt.verbose.writeln('Using cmd:', cmd);
        grunt.verbose.writeln('Using args:', args);

        if (!cmd) {
            return;
        }


        var cp = spawn(cmd, args, {
            stdio: 'inherit'
        });

        cp.on('close', function(code) {
            var success = code === 0;
            grunt.verbose.writeln('close received - code: ', success);

            if (code === 0) {
                grunt.log.writeln('Build complete ' + src.cyan);
                cb();
            } else {
                grunt.log.writeln(('MSBuild failed with code: ' + code).cyan + src);
                if (options.failOnError) {
                    grunt.warn('MSBuild exited with a failure code: ' + code);
                }
            }

        });

    }

    function createCommandArgs(src, options) {

        var args = [];

        var projectPath = path.normalize(path.resolve() + '/' + src);

        args.push(projectPath);

        args.push('/target:' + options.targets);
        args.push('/verbosity:' + options.verbosity);

        if (options.nologo) {
            args.push('/nologo');
        }

        if (options.maxCpuCount) {
            grunt.verbose.writeln('Using maxcpucount:', +options.maxCpuCount);
            args.push('/maxcpucount:' + options.maxCpuCount);
        }

        args.push('/property:Configuration=' + options.projectConfiguration);

        if (options.platform) {
            args.push('/p:Platform=' + options.platform);
        }

        for (var buildArg in options.buildParameters) {
            args.push('/property:' + buildArg + '=' + options.buildParameters[buildArg]);
        }

        return args;
    }

    function createCommand(version, processor) {

        // temp mono xbuild usage for linux / osx - assumes xbuild is in the path, works on my machine...
        if (process.platform === 'linux' || process.platform === 'darwin') {
            return 'xbuild';
        }

        if (!version) {
            var msBuild12x86Path = 'C:\\Program Files (x86)\\MSBuild\\12.0\\Bin\\MSBuild.exe';
            var msBuild12x64Path = 'C:\\Program Files\\MSBuild\\12.0\\Bin\\MSBuild.exe';

            if (fs.existsSync(msBuild12x86Path)) {
                grunt.verbose.writeln('Using MSBuild at:', msBuild12x86Path.cyan);
                return msBuild12x86Path;
            } else if (fs.existsSync(msBuild12x64Path)) {
                grunt.verbose.writeln('Using MSBuild at:', msBuild12x64Path.cyan);
                return msBuild12x64Path;
            } else {
                // Fallback to version 4.0
                version = 4.0;
            }
        }

        processor = 'Framework' + (processor === 64 ? processor : '');

        var specificVersion = versions[version];

        if (!specificVersion) {
            grunt.fatal('Unrecognised .NET framework version "' + version + '"');
        }

        var buildExecutablePath = path.join(process.env.WINDIR, 'Microsoft.Net', processor, 'v' + specificVersion, 'MSBuild.exe');

        grunt.verbose.writeln('Using MSBuild at:' + buildExecutablePath.cyan);

        if (!fs.existsSync(buildExecutablePath)) {
            grunt.fatal('Unable to find MSBuild executable');
        }

        return path.normalize(buildExecutablePath);

    }

};
