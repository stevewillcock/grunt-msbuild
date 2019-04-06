module.exports = function (grunt) {

    // Project configuration.

    grunt.initConfig({

        msbuild: {
            dev: {
                src: ['../ConsoleApplication1/ConsoleApplication1/ConsoleApplication1.csproj'],
                options: {
                    projectConfigurations: 'Debug',
                    targets: ['Rebuild'],
                    stdout: true,
                    buildParameters: {
                        WarningLevel: 2,
                        OutputPath: 'bin\\Debug'
                    },
                    nodeReuse:false,
                    verbosity: 'minimal',
                    customArgs: ['/nr:false'],
                    execOptions: {
                        maxBuffer: 1000 * 1024
                    },
                    msbuildPath: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\MSBuild\\15.0\\Bin\\MSBuild.exe'
                }
            }
        }
    });

    grunt.registerTask('default', ['msbuild', 'continuationTest']);

    grunt.registerTask('continuationTest', function () {
        grunt.log.writeln('continued OK...');
    });

    grunt.loadTasks('../../../tasks/');

};
