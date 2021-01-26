# grunt-msbuild

Build projects with MSBuild and XBuild using Grunt

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
                maxCpuCount: 4,
                buildParameters: {
                    WarningLevel: 2
                },
                nodeReuse:true,
                customArgs:[ '/noautoresponse', '/detailedsummary'],
                verbosity: 'quiet',
                msbuildPath: 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\MSBuild\\Current\\Bin\\amd64\\MSBuild.exe',
                inferMsbuildPath:false
            }
        }
    }
});
```

### Options

| Name                    | Description               | Default
|------------------------ |-------------------------- | -------
| projectConfiguration    | Configuration to pick     | Release
| targets                 | Targets to run            | Build
| maxCpuCount             | Number of cores to use    | 1
| nodeReuse               | If msbuild should hang around    | true
| failOnError             | If this grunt-msbuild should fail on error | true
| consoleLoggerParameters | Customize Console Logger
| visualStudioVersion     | Set VisualStudio version property to a special version i.e. 15
| platform                | Platform msbuild should use i.e. "Win32"
| buildParameters         | Additional [properties](http://msdn.microsoft.com/en-us/library/ms171458.aspx)
| customArgs              | Additional args, see [MSBuild Command-Line Reference](http://msdn.microsoft.com/en-us/library/ms164311.aspx)
| verbosity               | Verbosity level (quiet, minimal, normal, detailed or diagnostic) | normal
| nologo                  | If msbuild should hide logo | true
| msbuildPath             | Path to MSBuild.exe. Required if inferMsbuildPath is not set to true.
| inferMsbuildPath        | If the msbuildpath should be inferred using vswhere. Overrides the given msbuildPath value. | false
| vswhereProducts  | Ignored if inferMsbuildPath is false. Parameter of 'products' option of vswhere.exe. One or more product IDs to find. Defaults to Community, Professional, and Enterprise. Specify "\*" by itself to search all product instances installed. See <https://aka.ms/vs/workloads> for a list of product IDs. | \*
| vswhereVersion  | Ignored if inferMsbuildPath is false. Parameter of 'version' option of vswhere.exe. A version range for instances to find. Example: [15.0,16.0) will find versions 15.\*.

For more information, see [MSBuild Command-Line Reference](http://msdn.microsoft.com/en-us/library/ms164311.aspx).

## MSBuild version selection

If inferMsbuildPath is set to true, grunt-msbuild will try to infer the msbuildpath using vswhere.exe.
Otherwise, you should set msbuildPath option. msbuildPath is used to target your msbuild version.

Example values for msbuildPath:

```shell
C:\\Program Files (x86)\\MSBuild\\MSBuild\\<VERSION>\\Bin\\amd64\\MSBuild.exe

C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\<YOUR_EDITION>\\MSBuild\\15.0\\Bin\\amd64\\MSBuild.exe

C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\<YOUR_EDITION>\\MSBuild\\Current\\Bin\\amd64\\MSBuild.exe

msbuild  (This will work if msbuild is available on the path for example)

```

## Contributing

All contributions welcome :) Add to the VS integration tests for any new or changed functionality if possible.

## Issues and installing previous versions

If you have any problems with the latest release please log an issue at <https://github.com/stevewillcock/grunt-msbuild/issues>.

If you need to roll back to an earlier version you can use the following syntax to install a specific version

```shell
npm install grunt-msbuild@0.1.12
```

Also see <https://www.npmjs.org/doc/json.html#dependencies> for details of how to specify a particular package version in your package.json file

## Release Notes

|Version| Notes|
|-------|------|
|1.2|Added options vswhereProduct & vswhereVersion. Switched from vswhere 2.6.7 to 2.8.4.
|1.0|This version replaces the version option with msbuildPath to support MSBuild versions moving forward from Visual Studio 2019.
|0.2.0|This version replaces exec() with spawn() to improve memory usage and also to support coloured console output. This has been tested internally.
|0.1.12|Support for MSBuild 12 added|
|0.1.11|...|
