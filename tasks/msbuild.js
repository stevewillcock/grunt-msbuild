'use strict';
module.exports = function (grunt) {

    var exec = require('child_process').exec,
        path = require('path');

    var _ = grunt.util._;

    grunt.registerMultiTask('msbuild', 'Run MSBuild tasks', function () {

        var cb = this.async();

        var options = this.options({
            stdout: false,
            stderr: true,
            configuration: 'Release'
        });

        var cmd = buildCommand(this.data.projectFile, this.options.configuration);

        var cp = exec(cmd, options.execOptions, function (err, stdout, stderr) {

            if (_.isFunction(options.callback)) {

                options.callback.call(this, err, stdout, stderr, cb);

            } else {

                if (err && options.failOnError) {
                    grunt.warn(err);
                }

                cb();

            }

        });

        if (options.stdout || grunt.option('verbose')) {
            cp.stdout.pipe(process.stdout);
        }

        if (options.stderr || grunt.option('verbose')) {
            cp.stderr.pipe(process.stderr);
        }

    });

    function buildCommand(projectFile, configuration) {

        var command = 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\msbuild.exe ';
        var mainPath = path.resolve() + '\\' + projectFile;
        var args = ' /t:Build /p:Configuration=' + configuration;

        return command + mainPath + args;

    }

};
