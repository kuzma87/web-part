// ******************************************************
// Required
// ******************************************************

'use strict';
 
var gulp = require('gulp'),
	 sass = require('gulp-sass'),
	 autoprefixer = require('gulp-autoprefixer'),
	 combineMq = require('gulp-combine-mq'),
	 csscomb = require('gulp-csscomb'),
	 sourcemaps = require('gulp-sourcemaps'),
	 rename = require('gulp-rename'),
	 del = require('del'),
	 browserSync = require('browser-sync'),
	 uglifycss = require('gulp-uglifycss'),
	 uglify = require('gulp-uglify'),
	 imagemin = require('gulp-imagemin'),
	 runSequence = require('run-sequence');


// ******************************************************
// SASS Task
// ******************************************************
gulp.task('sass', function(){
	gulp.src(['./markup/dev/scss/**/*.scss', './bower_components/**/*.scss'])
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	//.pipe(sourcemaps.write())
	.pipe(autoprefixer({ browsers: ['last 2 versions'] }))
	.pipe(combineMq())
	.pipe(csscomb())
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('./markup/dev/css'))
	.pipe(browserSync.reload({ stream: true }));
});


// ******************************************************
// Watch Task
// ******************************************************
gulp.task('watch', function(){
	gulp.watch('./markup/dev/scss/**/*.scss', ['sass']);
	gulp.watch("./markup/dev/*.html").on('change', browserSync.reload);
});


// ******************************************************
// Browser Sync Task
// ******************************************************
gulp.task('sync', function(){
	browserSync({
		server: {
			baseDir: './',
			directory: true
		}
	});
});

// task to run server for testing final build
gulp.task('build:server', function() {
		return browserSync({
				server: {
						baseDir: "./markup/",
						directory: true
				}
		});
});


// ******************************************************
// Clean Task
// ******************************************************
gulp.task('build:clean', function(){
	return del([
		'./markup/build'
	]);
});

gulp.task('build:clean-final', function(){
	return del([
		'./markup/build/scss',
		'./markup/build/css/*.map'
	]);
});


// ******************************************************
// Copy Task
// ******************************************************
gulp.task('build:copy', function(){
	return gulp.src('./markup/dev/**')
	.pipe(gulp.dest('./markup/build'));
});


// ******************************************************
// CSS Minify Task
// ******************************************************
gulp.task('build:css', function(){
	return gulp.src('./markup/dev/css/*.css')
	.pipe(uglifycss())
	.pipe(gulp.dest('./markup/build/css/'));
});


// ******************************************************
// Image Optimization Task
// ******************************************************
gulp.task('build:img', function(){
	return gulp.src('./markup/dev/images/*')
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [
			{removeViewBox: false},
			{cleanupIDs: false}
		]
	}))
	.pipe(gulp.dest('./markup/build/images/'));
});


// ******************************************************
// JavaScript Minify Task
// ******************************************************
gulp.task('build:js', function(){
	return gulp.src([
		'./markup/dev/js/*.js',
		'!./markup/dev/js/*.min.js'
	])
	.pipe(uglify())
	.pipe(gulp.dest('./markup/build/js/'));
});



/////////////////////////////////////////////////////////
// Default Task 
// a. sass - compile SCSS -> CSS
// b. sync - Watch CSS files and reload browser
// c. watch - Watch SCSS files and run a.
/////////////////////////////////////////////////////////

gulp.task('default', ['sass', 'sync', 'watch']);


/////////////////////////////////////////////////////////
// Build Task
// a. build:clean - clean build folder
// b. build:copy - copy project files from dev folder
// c. build:css - minify and rename (*.min.css) CSS files
// d. build:img - optimaze images size
// e. build:js - minify and rename (*.min.js) JS files
// f. build:clean-final - remove scss & .map
// g. build:server - run test server
/////////////////////////////////////////////////////////

gulp.task('build', function(){
	runSequence(
		'build:clean', 
		'build:copy', 
		[
			'build:css', 
			'build:img',
			'build:js'
		],
		'build:clean-final',
		'build:server'
	);
});