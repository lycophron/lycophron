"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect'); //Runs a local dev server
var open = require('gulp-open'); //Open a URL in a web browser
var browserify = require('browserify'); // Bundles JS
var reactify = require('reactify'); // Transforms React JSX to JS
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
var concat = require('gulp-concat'); //Concatenates files
var lint = require('gulp-eslint'); //Lint JS files, including JSX
var shell = require('gulp-shell');
var babelify = require("babelify");

var config = {
    port: 9005,
    devBaseUrl: 'http://localhost',
    paths: {
        html: './src/*.html',
        js: ['./src/**/*.js', './lib/**/*.js'],
        json: ['./lib/**/*.json', './src/**/*.json'],
        css: [
            './src/css/**/*.css'
            // 'node_modules/bootstrap/dist/css/bootstrap.min.css',
            // 'node_modules/bootstrap/dist/css/bootstrap-theme.min.css'
        ],
        // copyFiles: ['./src/static/**/*.html'],
        // mainTempJs: './src/static/temp/main.js',
        copyAuthFiles: ['./src/auth/**/*.*'],
        distAuth: './dist/auth/',

        dist: './dist',
        mainJs: './src/main.js',
        mainOpeningJs: './src/opening.js'
    }
}

//Start a local development server
gulp.task('connect', function() {
    connect.server({
        root: ['dist'],
        port: config.port,
        base: config.devBaseUrl,
        livereload: true
    });
});

gulp.task('open', gulp.series('connect', function() {
    return gulp.src('dist/index.html')
        .pipe(open({ uri: config.devBaseUrl + ':' + config.port + '/' }));
}));

gulp.task('html', function() {
    return gulp.src(config.paths.html)
        .pipe(gulp.dest(config.paths.dist))
        .pipe(connect.reload());
});

gulp.task('js', function() {
    return (browserify(config.paths.mainJs)
        // .transform(babelify)
        .transform(reactify)
        .bundle()
        .on('error', console.error.bind(console))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
        .pipe(connect.reload()));
});

gulp.task('opening-js', function() {
    return (browserify(config.paths.mainOpeningJs)
        // .transform(babelify)
        .transform(reactify)
        .bundle()
        .on('error', console.error.bind(console))
        .pipe(source('bundle-opening.js'))
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
        .pipe(connect.reload()));
});

// gulp.task('temp-js', function() {
// 	browserify(config.paths.mainTempJs)
// 		// .transform(babelify)
// 		.transform(reactify)
// 		.bundle()
// 		.on('error', console.error.bind(console))
// 		.pipe(source('bundle.js'))
// 		.pipe(gulp.dest(config.paths.dist + '/temp/'))
// 		.pipe(connect.reload());
// });

gulp.task('json', function() {
    return gulp.src(config.paths.json)
        .pipe(gulp.dest(config.paths.dist))
        .pipe(connect.reload());
});

gulp.task('css', function() {
    return gulp.src(config.paths.css)
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(config.paths.dist + '/css'));
});

gulp.task('lint', function() {
    return gulp.src(config.paths.js)
        .pipe(lint({ config: 'eslint.config.json' }))
        .pipe(lint.format());
});

gulp.task('watch', function() {
    gulp.watch(config.paths.css, ['css']);
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.json, ['json']);
    gulp.watch(config.paths.js, ['update-version', 'js', 'opening-js', /*'temp-js',*/ 'lint']);
    // gulp.watch(config.paths.copyFiles, ['copy-files']);
    gulp.watch(config.paths.copyAuthFiles, ['copy-auth-files']);
});

gulp.task('copy-files', function() {
    return gulp.src(config.paths.copyFiles)
        .pipe(gulp.dest(config.paths.dist))
        .pipe(connect.reload());
});

gulp.task('copy-auth-files', function() {
    return gulp.src(config.paths.copyAuthFiles)
        .pipe(gulp.dest(config.paths.distAuth))
        .pipe(connect.reload());
});

gulp.task('update-version',
    shell.task(['git log -1 --pretty=format:\'{%n  "commit": "%H",%n  "date": "%ad",%n  "message": "%s"%n}\'' +
        ' > version.json'
    ]));

gulp.task('build', gulp.series('update-version', 'html', 'js', 'opening-js', /*'temp-js', 'copy-files',*/ 'copy-auth-files', 'json', 'css', 'lint'));
gulp.task('default', gulp.series('build', 'open', 'watch'));