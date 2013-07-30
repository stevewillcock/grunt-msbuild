# Grunt plugin for MSBuild

Build projects with MSBuild

example config

	module.exports = function(grunt) {

	    grunt.initConfig({

	        msbuild: {
	            dev: {
	                src: ['ConsoleApplication5.csproj'],
	                options: {
	                    projectConfiguration: 'Debug',
	                    targets: ['Clean', 'Rebuild'],
	                    stdout: true,
	                    buildParameters: {
	                        WarningLevel: 2
	                    },
	                    verbosity: 'quiet'
	                }
	            }
	        }
	    });

	    grunt.loadNpmTasks('grunt-msbuild');

	};

