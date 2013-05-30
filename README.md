# Grunt plugin for MSBuild

Build projects with MSBuild

example config

        msbuild: {
            dev: {
                src: ['**/MYSolutionFile.sln'],
                options: {
                    configuration: 'Debug',
                    stdout: false
                }
            }
        }

