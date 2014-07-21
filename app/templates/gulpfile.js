var fs         = require('fs');
var path       = require('path');
var glob       = require('glob');
var gulp       = require('gulp');
var gutil      = require('gulp-util');
var rimraf     = require('gulp-rimraf');
var uglify     = require('gulp-uglify');
var streamify  = require('gulp-streamify');
var header     = require('gulp-header');
var sass       = require('gulp-sass');
var concat     = require('gulp-concat');
var minifyCss  = require('gulp-minify-css');
var serve      = require('gulp-serve');
var source     = require('vinyl-source-stream');
var es         = require('event-stream');
var browserify = require('browserify');
var coffeeify  = require('coffeeify');
var pkg        = require('./package.json');

var isProduction = gutil.env.production || gutil.env.prod;

var destDir  = './public';
var preamble = './preamble.txt';
var builds   = {
  app: {
    entries: ['./src/app.coffee'],
    output: 'bundle.js'
  },
  specs: {
    entries: [
      './test/**/*spec.js',
      './test/**/*spec.coffee'
    ],
    output: 'specs.js'
  },
  styles: {
    entries: ['.scss/style.scss'],
    output: 'style.css',
    bower: [
      './bower_components/jquery-mobile-bower/css/jquery.mobile-1.4.2.css'
    ]
  },
};

function globFiles(entries) {
  return entries.map(function(entry) {
    return glob.sync(entry);
  }).reduce(function(memo, entries) {
    return memo.concat(entries);
  }, []);
}

function streamHeaderFile(file) {
  return streamify(
    header(fs.readFileSync(file, 'utf-8'), { pkg: pkg })
  );
}

function reportChange(e) {
  gutil.log(gutil.template('File <%= file %> was <%= type %>, rebuilding...', {
    file: e.path,
    type: e.type
  }));
}

gulp.task('style', function() {
  var libsStream = gulp.src(builds.styles.bower);
  var sassStream = gulp.src(builds.styles.entries).pipe(sass());
  return es.concat(libsStream, sassStream)
    .pipe(concat(builds.styles.output))
    .pipe(isProduction ? minifyCss({keepSpecialComments: 0}) : gutil.noop())
    .pipe(streamHeaderFile(preamble))
    .pipe(gulp.dest(destDir));
});

gulp.task('specs', function() {
  return browserify(globFiles(builds.specs.entries))
    .bundle({debug: true})
    .pipe(source(builds.specs.output))
    .pipe(gulp.dest(destDir));
});

gulp.task('browserify', function() {
  return browserify(globFiles(builds.app.entries))
    .bundle({
      debug: !isProduction
    })
    .pipe(source(builds.app.output))
    .pipe(isProduction ? streamify(uglify()) : gutil.noop())
    .pipe(streamHeaderFile(preamble))
    .pipe(gulp.dest(destDir));
});

gulp.task('clean', function() {
  var buildFiles = Object.keys(builds).map(function(build) {
    return path.join(destDir, builds[build].output);
  });
  return gulp.src(buildFiles, {read: false}).pipe(rimraf());
});

gulp.task('watch', ['browserify', 'style'], function() {
  gulp.watch(['./src/**/*.js', './src/**/*.coffee'], ['browserify'])
    .on('change', reportChange);
  gulp.watch(['./scss/**/*.scss'], ['style'])
    .on('change', reportChange);
});

gulp.task('server', ['watch'], serve(destDir));

gulp.task('default', ['browserify', 'style'], function() {
  var buildEnv = isProduction ?
    gutil.colors.blue('production') :
    gutil.colors.green('development');
  var destPath = gutil.colors.magenta(path.join(destDir, builds.app.output));
  var stylePath = gutil.colors.magenta(path.join(destDir, builds.styles.output));
  gutil.log('Build environment: ' + buildEnv);
  gutil.log('Saved bundle to ' + destPath);
  gutil.log('Saved styles to ' + stylePath);
});
