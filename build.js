var gulp = require('gulp');
var es = require('event-stream');
var responsiveImages = require('gulp-responsive-images');
var exec = require('gulp-exec');
var runSequence = require('run-sequence');
var child_process = require('child_process');
var builder = require('electron-builder');

var packageInfo = require('./package.json');

const Platform = builder.Platform;

//
// SHARED
//
var ELECTRON_VERSION = packageInfo.devDependencies['electron'].substr(1);
//@TODO get rid of electron packager and use electron builder for all builds (mac and snap)
//@TODO create appx build as separated gulp command so can be run on windows 10
var ELECTRON_PACKAGER_DEFAULTS = {
    dir: process.cwd(),
    out: process.cwd() + '/dist/electron',
    version: ELECTRON_VERSION,
    asar: false,
    'app-bundle-id': 'com.electron.start',
    'app-copyright': 'Me',
    'app-version': packageInfo.version,
    'build-version': packageInfo.version
};
var BUILDER_DEFAULTS = {
    "appId": "com.electron.start",
    "copyright": "Me",
    "productName": "ElectronStart",
    "files": [
        "**/*"
    ],
    "fileAssociations": {
      "ext": "test",
      "name": "Test"
    }
};
var WINDOWS_BUILDER_DEFAULTS = Object.assign({}, BUILDER_DEFAULTS, {
    "win": {
        "target": [
            {
                "target": "nsis",
                "arch": [
                    "x64",
                    "ia32"
                ]
            },
            {
                "target": "portable",
                "arch": [
                    "x64",
                    "ia32"
                ]
            }
        ],
        "icon": "appicon.ico",
        "publish": null
    },
    "nsis": {
      "oneClick": false,
      "perMachine": true,
      "allowToChangeInstallationDirectory": true,
      "menuCategory": packageInfo.author
  }
});
var APPIMAGE_BUILDER_DEFAULTS = Object.assign({}, BUILDER_DEFAULTS, {
    "linux": {
        "target": "AppImage",
        "executableName": "electron-start",
        "icon": "./",
        "desktop": {
            "Type": "Application",
            "Name": "ElectronStart"
        },
        "category": "Graphics",
        "publish": null
    }
});

//
// PACKAGE TASKS
//
gulp.task('package-electron', function (cb) {
    runSequence(
        'package-electron-icons',
        'package-electron-win32',
        'package-electron-linux-appimage',
        cb);
});

gulp.task('package-electron-icons', function () {
    return es.merge(
        // Generate windows app icon (ico)
        gulp.src('assets/logo.png')
            .pipe(exec('mkdir -p . && mogrify -resize 256x256! <%= file.path %> && convert  <%= file.path %> -define icon:auto-resize=256,128,64,48,32,16 ./appicon.ico'))
            .pipe(exec.reporter()),
        gulp.src('assets/logo.png')
            .pipe(responsiveImages({
                'logo.png': [
                    {width: 64, rename: '64x64.png'}
                ]
            }))
            .pipe(gulp.dest('./'))
    );
});

gulp.task('package-electron-win32', function (cb) {
    buildWin32(cb);
});

gulp.task('package-ws', function (cb) {
    buildWin32(cb, true);
});

var electronBuilder = function(target, config) {
    return builder.build({
        "targets": target,
        "projectDir": process.cwd(),
        "config": config
    });
};

var buildWin32 = function(cb, ws) {
    //now we sign the windows app using env vars
    // process.env.WIN_CSC_LINK = process.cwd() + '/package/windows-application.p12';
    // process.env.WIN_CSC_KEY_PASSWORD = 'build';
    
    var app = 'Electron Start',
        platform = 'windows',
        arch = 'x86_64',
        output = process.cwd() + '/dist/electron/' + (app.replace(" ","")) + '-' + platform + '-' + arch;
        
    var config = Object.assign({}, WINDOWS_BUILDER_DEFAULTS, {
        "directories": {
            "output": output
        }
    });
    
    return electronBuilder(Platform.WINDOWS.createTarget(), config)
        .then(() => {
            cb();
        }).catch(err => {
            if (err) console.error(err);
        });
};

gulp.task('package-electron-linux-appimage', function (cb) {
    console.log('Creating linux AppImage.');
    
    var app = 'ElectronStart',
        platform = 'linux',
        arch = 'x86_64',
        output = process.cwd() + '/dist/electron/' + app + '-' + platform + '-' + arch;
        
    var config = Object.assign({}, APPIMAGE_BUILDER_DEFAULTS, {
        "directories": {
            "output": output
        }
    });

    builder.build({
        targets: Platform.LINUX.createTarget(),
        projectDir: process.cwd(),
        config: {
            "electronVersion": ELECTRON_VERSION,
            "linux": {
                "target": "AppImage",
                "executableName": "electron-start",
                "icon": "./",
                "desktop": {
                    "Type": "Application",
                    "Name": "Electron Start"
                },
                "category": "Graphics", 
                "publish": null 
            },
            "directories": {
                "output": output
            },
            "files": [
                "**/*"
            ]
        }
    });
        
    electronBuilder(Platform.LINUX.createTarget(), config)
        .then(() => {
            cb();
        })
        .catch((error) => {
            console.log(error);
        });
});