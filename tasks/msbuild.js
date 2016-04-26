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
        4.0: '4.0.30319',
        12.0: '12.0',
        14.0: '14.0'
    };

    grunt.registerMultiTask('msbuild', 'Run MSBuild tasks', function() {

        var asyncCallback = this.async();

        var options = this.options({
            targets: ['Build'],
            buildParameters: {},
            customArgs:[],
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

        if (files.length == 0) {
            files.push({src: ['']});
        }

        files.forEach(function(filePair) {
            filePair.src.forEach(function(src) {
                fileExists = true;
                projectFunctions.push(function(cb) {
                    build(src, options, cb);
                });

                projectFunctions.push(function(cb) {
                    cb();
                });
            });
        });

        if(!fileExists){
            grunt.warn('No project or solution files found');
        }

        async.series(projectFunctions, function() {
            asyncCallback();
        });

    });

    function build(src, options, cb) {

        var projName = src || path.basename(process.cwd());

        grunt.log.writeln('Building ' + projName.cyan);

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
        
        for (var buildArg in options.buildParameters) {
            args.push('/property:' + buildArg + '=' + options.buildParameters[buildArg]);
        }

        for (var customArg in options.customArgs) {
            args.push(customArg);
        }
		
        return args;
    }

    function createCommand(version, processor) {

        // temp mono xbuild usage for linux / osx - assumes xbuild is in the path, works on my machine...
        if (process.platform === 'linux' || process.platform === 'darwin') {
            return 'xbuild';
        }

        // convert to numbers if correct strings
        version = isNaN(version) ? version : parseFloat(version);
        processor = isNaN(processor) ? processor : parseFloat(processor);

        var programFiles = process.env['ProgramFiles(x86)'] || process.env.PROGRAMFILES;

        if (!version) {
            version = 4.0; // default fallback to version 4.0

            var msbuildDir = path.join(programFiles, 'MSBuild');

            if (fs.existsSync(msbuildDir)) {
                var msbuildVersions = fs.readdirSync(msbuildDir)
                    .filter(function(entryName) {
                        return entryName.indexOf('1') === 0;
                    });

                if (msbuildVersions.length > 0) {
                    // set latest installed msbuild version
                    version = parseFloat(msbuildVersions[msbuildVersions.length - 1]);
                }
            }
        }

        var specificVersion = versions[version];

        if (!specificVersion) {
            grunt.fatal('Unrecognised MSBuild version "' + version + '"');
        }

        if (version < 12) {
            var frameworkDir = 'Framework' + (processor === 64 ? processor : '');
            var buildExecutablePath = path.join(process.env.WINDIR, 'Microsoft.Net', frameworkDir, 'v' + specificVersion, 'MSBuild.exe');
        } else {
            var x64Dir = processor === 64 ? 'amd64' : '';
            var buildExecutablePath = path.join(programFiles, 'MSBuild', specificVersion, 'Bin', x64Dir, 'MSBuild.exe');
        }

        grunt.verbose.writeln('Using MSBuild at:' + buildExecutablePath.cyan);

        if (!fs.existsSync(buildExecutablePath)) {
            grunt.fatal('Unable to find MSBuild executable');
        }

        return path.normalize(buildExecutablePath);

    }

};
