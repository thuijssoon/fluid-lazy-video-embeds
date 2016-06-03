/* jshint node: true */

/* Needed gulp config */
var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    bump = require('gulp-bump'),
    cache = require('gulp-cache'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    cleanCSS = require('gulp-clean-css'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    prefix = require('gulp-autoprefixer'),
    reload = browserSync.reload,
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    sass = require('gulp-sass'),
    semver = require('semver'),
    uglify = require('gulp-uglify');

var pkg = require('./package.json'),
    banners = {
        full: '/*!\n' +
            ' * <%= pkg.name %> v<%= pkg.version %>: <%= pkg.description %>\n' +
            ' * (c) ' + new Date().getFullYear() + ' <%= pkg.author.name %>\n' +
            ' * <%= pkg.license %> License\n' +
            ' * <%= pkg.repository.url %>\n' +
            ' */\n\n',
        min: '/*!' +
            ' <%= pkg.name %> v<%= pkg.version %>\n' +
            ' | (c) ' + new Date().getFullYear() + ' <%= pkg.author.name %>\n' +
            ' | <%= pkg.license %> License\n' +
            ' | <%= pkg.repository.url %>\n' +
            ' */\n'
    };

/* bumpFiles function used by bump:* tasks */
function bumpFiles(release) {
    "use strict";
    var pkg = require('./package.json'),
        oldVersion = pkg.version,
        newVersion = semver.inc(pkg.version, release);

    /* Update the .json files */
    gulp.src(['./bower.json', './composer.json', './package.json'])
        .pipe(bump({
            version: newVersion
        }))
        .pipe(gulp.dest('./'));

    /* Update the plugin main .php file */
    gulp.src(['./fluid-lazy-video-embeds.php'])
        .pipe(replace('* Version: ' + oldVersion, '* Version: ' + newVersion))
        .pipe(replace('* @since  %since%', '* @since  ' + newVersion))
        .pipe(gulp.dest('./'));

    /* Update the included .php files */
    gulp.src(['./includes/*.php'])
        .pipe(replace('* @since  %since%', '* @since  ' + newVersion))
        .pipe(gulp.dest('./includes/'))
        .pipe(notify({
            message: 'bump:' + release + ' task complete'
        }));
}

/* Gulpfile task */
gulp.task('gulpfile', function () {
    "use strict";
    return gulp.src([
            'gulpfile.js'
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(notify({
            message: 'GulpFile task complete'
        }));
});

/* Scripts task */
gulp.task('scripts', function () {
    "use strict";
    return gulp.src([
            /* Add your JS files here, they will be combined in this order */
            'assets/js/src/flve-front-end.js',
            'assets/js/src/flve-front-end-vanilla-js.js'            
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(header(banners.full, {
            pkg: pkg
        }))
        .pipe(gulp.dest('assets/js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(header(banners.min, {
            pkg: pkg
        }))
        .pipe(gulp.dest('assets/js'))
        .pipe(reload({
            stream: true
        }))
        .pipe(notify({
            message: 'JS task complete'
        }));
});

/* Sass task */
gulp.task('sass', function () {
    "use strict";
    gulp.src('assets/scss/flve-front-end.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(prefix(
            'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'
        ))
        .pipe(header(banners.full, {
            pkg: pkg
        }))
        .pipe(gulp.dest('assets/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleanCSS({
            keepSpecialComments: 0
        }))
        .pipe(header(banners.min, {
            pkg: pkg
        }))
        .pipe(gulp.dest('assets/css'))
        .pipe(reload({
            stream: true
        }))
        .pipe(notify({
            message: 'SASS task complete'
        }));
});

/* Images task */
gulp.task('images', function () {
    "use strict";
    return gulp.src('assets/src/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('assets/images'))
        .pipe(reload({
            stream: true
        }))
        .pipe(notify({
            message: 'Images task complete'
        }));
});

/* Reload task */
gulp.task('bs-reload', function () {
    "use strict";
    browserSync.reload();
});

/* Bump tasks */
gulp.task('bump:major', function () {
    "use strict";
    bumpFiles('major');
});
gulp.task('bump:minor', function () {
    "use strict";
    bumpFiles('minor');
});
gulp.task('bump:patch', function () {
    "use strict";
    bumpFiles('patch');
});

/* Prepare Browser-sync for localhost */
gulp.task('browser-sync', function () {
    "use strict";
    browserSync.init(['assets/css/*.css', 'assets/js/*.js'], {
        proxy: 'http://bothellcounseling.dev/'
    });
});

/* Watch scss, js and html files, doing different things with each. */
gulp.task('default', ['scripts', 'sass', 'browser-sync'], function () {
    "use strict";
    /* Watch gulpfile.js, run the gulpfile task on change. */
    gulp.watch(['gulpfile.js'], ['gulpfile']);
    /* Watch .scss, run the sass task on change. */
    gulp.watch(['assets/scss/*.scss', 'sassets/css/**/*.scss'], ['sass']);
    /* Watch .js file, run the scripts task on change. */
    gulp.watch(['assets/js/src/*.js'], ['scripts']);
    /* Watch images, run the images task on change. */
    gulp.watch(['assets/images/src/**/*.*'], ['images']);
    /* Watch .php files, run the bs-reload task on change. */
    gulp.watch(['*.php', '**/*.php'], ['bs-reload']);
});