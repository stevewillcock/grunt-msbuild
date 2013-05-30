module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({

            msbuild: {
                dev: {
                    projectFile: 'RB.BusinessModules.Website.csproj',
                    options: {
                        configuration: 'Dev',
                        stdout: false
                    }
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-msbuild');

};