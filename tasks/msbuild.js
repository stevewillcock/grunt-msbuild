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

        processor = 'Framework' + (processor === 64 ? processor : '');

        if (!version) {
          return findLatestMsBuild(processor);
        }

        var buildExecutablePath = getBuildExecutablePathFromVersion(version, processor);

        grunt.verbose.writeln('Using MSBuild at:' + buildExecutablePath.cyan);

        if (!fs.existsSync(buildExecutablePath)) {
            grunt.fatal('Unable to find MSBuild executable');
        }

        return path.normalize(buildExecutablePath);

    }

    function findLatestMsBuild(processor) {

        var msBuild12Path = 'C:/Program\ Files\ (x86)/MSBuild/12.0/Bin/MSBuild.exe';
        if(fs.existsSync(msBuild12Path)) {
            grunt.verbose.writeln('MSBuild 12 available, using this');
            return '"' + msBuild12Path + '"';
        }

		var rawVersions = [4, 3.5, 2.0, 1.1, 1.0]; // Wasn't sure how else to reverse the list since it's an object?
		for (var i = 0; i < rawVersions.length; i++) {
            var buildExecutablePath = getBuildExecutablePathFromVersion(rawVersions[i], processor);
		    if(fs.existsSync(buildExecutablePath)) {
		        return '"' + buildExecutablePath + '"';
		    }
     	}
		
        grunt.fatal("Unable to find any MSBuild executables");

    }

	function getBuildExecutablePathFromVersion(version, processor) {

        var specificVersion = versions[version];

        if (!specificVersion) {
            grunt.fatal('Unrecognised .NET framework version "' + version + '"');
        }

	    return path.join(process.env.WINDIR, 'Microsoft.Net', processor, 'v' + specificVersion, 'MSBuild.exe');

	}

};
