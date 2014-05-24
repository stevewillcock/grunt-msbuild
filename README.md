# grunt-msbuild

> Build projects with MSBuild and XBuild using Grunt

## Getting Started
This plugin requires Grunt `~0.4.0`. In other words it should work on 0.4.0 or higher.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-msbuild --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-msbuild');
```

## The "msbuild" task

### Overview
In your project's Gruntfile, add a section named `msbuild` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    msbuild: {
        dev: {
            src: ['ConsoleApplication5.csproj'],
            options: {
                projectConfiguration: 'Debug',
                targets: ['Clean', 'Rebuild'],
                stdout: true,
                version: 4.0,
                maxCpuCount: 4,
                buildParameters: {
                    WarningLevel: 2
                },
                verbosity: 'quiet'
            }
        }
    }
});
```

## MSBuild version selection
Pass a version parameter to the task options as shown above to select a specific MSBuild version.

The version number is used to look up the .NET version and find the .NET Framework directory location on disk. The following version mappings are used:

|Version| .NET Framework directory|
|-------|-------------------------|
|1.0|1.0.3705|
|1.1|1.1.4322|
|2.0|2.0.50727|
|3.5|3.5|
|4.0|4.0.30319|

If a version is not passed the task will attempt to locate version 12 of MSBuild which is installed with Visual Studio 2013, and will then fallback to 4.0

## XBuild
If this task is run on OS X or Linux it will assume that xbuild is in the path and use that instead of MSBuild

## Contributing
All contributions welcome :) Add to the VS integration tests for any new or changed functionality if possible.

## Issues and installing previous versions

If you have any problems with the latest release please log an issue at https://github.com/stevewillcock/grunt-msbuild/issues.

If you need to roll back to an earlier version you can use the following syntax to install a specific version

```
npm install grunt-msbuild@0.1.12
```

Also see https://www.npmjs.org/doc/json.html#dependencies for details of how to specify a particular package version in your package.json file

## Release Notes

|Version| Notes|
|-------|------|
|2.0|This version replaces exec() with spawn() to improve memory usage and also to support coloured console output.This has been tested internally.
|0.1.12|Support for MSBuild 12 added|
|0.1.11|...|
