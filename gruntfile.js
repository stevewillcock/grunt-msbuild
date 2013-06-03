module.exports = function(grunt) {

    // Project configuration.

    grunt.initConfig({

        msbuild: {
            dev: {
                files: {
                    ['TestProject.csproj']
                },
                options: {
                    projectConfiguration: 'Dev',
                    stdout: false,
                    buildParameters: {
                        argA: 'bobobobobo',
                        argB: 'billbillbill '
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-msbuild');

};