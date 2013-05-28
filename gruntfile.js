module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({

            msbuild: {
                dev: {
                    projectFile: 'RB.BusinessModules.Website.csproj',
                    options: {
                        stdout: false
                    }
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-msbuild');

};