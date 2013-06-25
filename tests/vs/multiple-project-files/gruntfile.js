module.exports = function(grunt) {

	// Project configuration.

	grunt.initConfig({

		msbuild: {
			dev: {
				src: ['../ConsoleApplication1/ConsoleApplication1/ConsoleApplication1.csproj',
						'../ConsoleApplication2/ConsoleApplication2/ConsoleApplication2.csproj'
				],
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

	grunt.registerTask('continuationTest', function() {
		grunt.log.writeln('continued OK...');
	});

};