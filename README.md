# Grunt plugin for MSBuild

Build projects with MSBuild

example config

	module.exports = function(grunt) {

	    // Project configuration.

	    grunt.initConfig({

	        msbuild: {
	            dev: {
	                src: ['ConsoleApplication5.csproj'],
	                options: {
	                    projectConfigurations: 'Debug',
	                    targets: ['Clean', 'Rebuild'],
	                    stdout: true,
	                    buildParameters: {
	                        WarningLevel: 2,
	                        OutputPath: 'bin\\Debug'
	                    },
	                    verbosity: 'quiet'
	                }
	            }
	        }
	    });

	    grunt.loadNpmTasks('grunt-msbuild');

	};

