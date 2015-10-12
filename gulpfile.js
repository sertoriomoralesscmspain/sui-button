// LOAD DEPENDENCIES ===========================================================
  var gulp = require('gulp'),
      browsersync = require('browser-sync'),

      runSequence = require('run-sequence'),
      del = require('del'),
      colors = require('colors'),
      beep = require('beepbeep'),
      cache = require('gulp-cached'),

      sass = require('gulp-sass'),
      scsslint = require('gulp-scss-lint'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),
      plumber = require('gulp-plumber');


// FOLDER PATHS ================================================================
  var basePath = {
    src: './src',
    dist: './dist'
  };

  var assetsPath = {
    stylesSrc: basePath.src,
    stylesDist: basePath.dist,
    htmlSrc: basePath.src,
    htmlDist: basePath.dist,
  };


// ERROR HANDLER ==============================================================
  var onError = function(err) {
    beep([200, 200]);
    console.log(
      '\n***************** '.bold.gray + '( ERROR! )> '.bold.blue  + '\(╯°□°)╯︵ssɔs '.bold.red + '*****************\n\n'.bold.gray +
      String(err) +
      '\n\n*************************************************************\n'.bold.gray );
    browsersync.notify(String(err), 5000);
    this.emit('end');
  };


// CLEAN =======================================================================
  gulp.task('clean', function(callback) {
    return del([basePath.dist], callback)
      .then(function (paths) {
          console.log('Deleted files/folders:\n'.bold.green, paths.join('\n'));
      });
  });


// STYLES ======================================================================
  gulp.task('scss-lint', function() {
    return gulp.src([
        assetsPath.stylesSrc + '/**/*.scss',
      ])
      .pipe(cache('scsslint'))
      .pipe(scsslint({
        'config': '.scss-lint.yml',
      }));
  });

  gulp.task('css', ['scss-lint'], function() {
    return gulp.src( assetsPath.stylesSrc + '/*.scss' )
      .pipe(plumber({
        errorHandler: onError
      }))
      .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([
          autoprefixer({
            browsers: ['> 1%', 'last 2 version', 'IE 8']
          })
        ]))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest( assetsPath.stylesDist ));
  });


// HTML ========================================================================
  gulp.task('html', function() {
    return gulp.src( assetsPath.htmlSrc + '/*.html' )
      .pipe(gulp.dest( assetsPath.htmlDist ))
  });


// BROWSER SYNC ================================================================
  gulp.task('browsersync', function() {
    browsersync({
      server: { baseDir: basePath.dist },
      port: 8080,
      files: [
        assetsPath.stylesDist + '/*.css',
        assetsPath.scriptsDist + '/*.js',
      ]
    })
  });


// WATCH =======================================================================
  gulp.task('watch', ['browsersync'], function() {
    gulp.watch( basePath.src + '/**/*.+(html|yml)',   ['html'] );
    gulp.watch( assetsPath.stylesSrc + '/**/*.scss',  ['css'] );
    gulp.watch( './themes/**/*.scss',                 ['css'] );
  });


// BUILD =======================================================================
  gulp.task('build', function(callback) {
    runSequence(
    'clean',
    [
      'css',
      'html'
    ],
    callback);
  });

  gulp.task('default', function(callback) {
    runSequence(
      'build',
      ['watch'],
      callback);
  });

