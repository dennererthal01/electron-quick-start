var gulp = require('gulp');
var runSequence = require('run-sequence');

require('./build.js');

// Package everything together building a release
gulp.task('package', function (cb) {
    var tasks = ['package-electron'];
    runSequence.apply(this, tasks.concat([cb]));
});