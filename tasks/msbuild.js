module.exports = function (grunt) {

    "use strict";

    var spawn = require("child_process").spawn,
        path = require("path"),
        execSync = require("child_process").execSync,
        async = require("async")

    var _ = grunt.util._;

    grunt.registerMultiTask("msbuild", "Run MSBuild tasks", function () {
        var asyncCallback = this.async();

        var options = this.options({
            buildParameters: {},
            consoleLoggerParameters: undefined,
            customArgs: [],
            failOnError: true,
            inferMsbuildPath: false,
            maxCpuCount: 1,
            msbuildPath: "",
            nodeReuse: true,
            nologo: true,
            platform: undefined,
            projectConfiguration: "Release",
            targets: ["Build"],
            verbosity: "normal",
            visualStudioVersion: undefined,
            vswhereProducts: undefined,            // default value "*" is set later in setParams()
            vswhereVersion: undefined
        });

        grunt.verbose.writeln("Using Options: " + JSON.stringify(options, undefined, 4).cyan);

        var projectFunctions = [];
        var files = this.files;
        var fileExists = false;

        if (files.length === 0) {
            files.push({ src: [""] });
        }

        files.forEach(function (filePair) {
            grunt.verbose.writeln("File " + JSON.stringify(filePair, undefined, 4));
            filePair.src.forEach(function (src) {
                fileExists = true;
                projectFunctions.push(function (cb) {
                    build(src, options, cb);
                });

                projectFunctions.push(function (cb) {
                    cb();
                });
            });
        });

        if (!fileExists) {
            grunt.warn("No project or solution files found");
        }

        async.series(projectFunctions, function () {
            asyncCallback();
        });
    });

    function build(src, options, cb) {
        var projName = src || path.basename(process.cwd());

        grunt.log.writeln("Building " + projName.cyan);

        if (!options.msbuildPath && !options.inferMsbuildPath) {
            grunt.fail.warn("options.msbuildPath not set. Either set the path, or set inferMsbuildPath to true");
        }
        if (!options.inferMsbuildPath) {
            if (options.vswhereProducts) {
                grunt.log.writeln("options.msbuildPath not set. So options.vswhereProducts is ignored");
            }
            if (options.vswhereVersion) {
                grunt.log.writeln("options.msbuildPath not set. So options.vswhereVersion is ignored");
            }
        }

        var cmd = options.msbuildPath;
        if (options.inferMsbuildPath) {
            cmd = inferMSBuildPathViaVSWhere(options.vswhereProducts, options.vswhereVersion);
        }
        var args = createCommandArgs(src, options);

        grunt.verbose.writeln("Using cmd:", cmd);
        grunt.verbose.writeln("Using args:", args);

        if (!cmd) {
            return;
        }

        var cp = spawn(cmd, args, {
            stdio: "inherit"
        });

        cp.on("close", function (code) {
            var success = code === 0;
            grunt.verbose.writeln("close received - code: ", success);

            if (code === 0) {
                grunt.log.writeln("Build complete " + projName.cyan);
            } else {
                grunt.log.writeln(("MSBuild failed with code: " + code).cyan + projName);
                if (options.failOnError) {
                    grunt.warn("MSBuild exited with a failure code: " + code);
                }
            }
            cb();
        });
    }

    /**
     *
     * @param param type: string|string[]
     * @output type: string[]
     */
    function prepareParam(param) {
        let ret = param;
        if (param && !Array.isArray(param)) {
            ret = [param];
        }
        return ret;
    }

    /**
     *
     * @param vswhereProducts type: string|string[]
     * @param vswhereVersion type: string
     * @output type: string[]
     */
    function setParams(vswhereProducts, vswhereVersion) {
        const params = ["-latest", "-requires Microsoft.Component.MSBuild", "-find MSBuild\\**\\MSBuild.exe"];

        if (vswhereVersion) {
            params.push(` -version ${vswhereVersion}`);
        }
        if (!vswhereProducts && !vswhereVersion) {
            // default value set here - Note: * could not be used when vswhere -version option is used
            params.push(` -products *`);
        } else if (vswhereProducts) {
            params.push(`-products ${prepareParam(vswhereProducts).join(" ")}`);
        }
        return params;
    }

    function inferMSBuildPathViaVSWhere(vswhereProducts, vswhereVersion) {
        grunt.verbose.writeln("Using vswhere.exe to infer path for msbuild ");

        var exePath = path.resolve(__dirname, "../bin/vswhere.exe");

        var quotedExePathWithArgs = `"${ exePath }" ${ setParams(vswhereProducts, vswhereVersion).join(" ") }`;

        grunt.verbose.writeln("using quoted exe path: " + quotedExePathWithArgs);

        var resultString = execSync(quotedExePathWithArgs).toString();
        grunt.verbose.writeln("vswhere results start");
        grunt.verbose.writeln(resultString);
        grunt.verbose.writeln("vswhere results end");

        var results = resultString.split("\r");
        grunt.verbose.writeln("vswhere first result:");
        grunt.verbose.writeln(results[0]);

        var normalisedPath = path.normalize(results[0]);
        grunt.verbose.writeln("vswhere result normalised path: ");
        grunt.verbose.writeln(normalisedPath);

        return normalisedPath;
    }

    function createCommandArgs(src, options) {
        var args = [];

        if (src) {
            var projectPath = path.normalize(src);

            args.push(projectPath);
        }

        args.push("/target:" + options.targets);
        args.push("/verbosity:" + options.verbosity);

        if (options.nologo) {
            args.push("/nologo");
        }

        if (options.maxCpuCount) {
            // maxcpucount is not supported by xbuild
            if (process.platform === "win32") {
                grunt.verbose.writeln("Using maxcpucount:", +options.maxCpuCount);
                args.push("/maxcpucount:" + options.maxCpuCount);
            }
        }

        if (options.consoleLoggerParameters) {
            grunt.verbose.writeln("Using clp:" + options.consoleLoggerParameters);
            args.push("/clp:" + options.consoleLoggerParameters);
        }

        args.push("/property:Configuration=" + options.projectConfiguration);

        if (options.platform) {
            args.push("/p:Platform=" + options.platform);
        }

        if (!options.nodeReuse) {
            args.push("/nodeReuse:false");
        }

        if (options.visualStudioVersion) {
            args.push("/p:VisualStudioVersion=" + options.visualStudioVersion + ".0");
        }

        for (var buildArg in options.buildParameters) {
            var p = "/property:" + buildArg + "=" + options.buildParameters[buildArg];
            grunt.verbose.writeln("setting property: " + p);
            args.push(p);
        }

        options.customArgs.forEach(function (a) {
            grunt.verbose.writeln("setting customArg: " + a);
            args.push(a);
        });

        return args;
    }
};
