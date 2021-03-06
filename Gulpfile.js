"use strict";

var autoprefixer = require("gulp-autoprefixer");
var cssnano = require("gulp-cssnano");
var browserSync = require("browser-sync").create();
const hygienist = require("hygienist-middleware");
var fs = require("fs");
var gulp = require("gulp");
var gutil = require("gulp-util");
var handlebars = require("gulp-compile-handlebars");
var htmlmin = require("gulp-htmlmin");
var imagemin = require("gulp-imagemin");
var inlinesource = require("gulp-inline-source");
var layouts = require("handlebars-layouts");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var reload = browserSync.reload;
var replace = require("gulp-replace");
var yaml = require("js-yaml");
var rimraf = require("rimraf");
var runSequence = require("run-sequence");
var path = require("path");
var webpack = require("webpack");
var config = require("./webpack.config.dev");
var configProd = require("./webpack.config.prod");
var webpackHotMiddleware = require("webpack-hot-middleware");
var webpackDevMiddleware = require("webpack-dev-middleware");
var ngrok = require('ngrok');

handlebars.Handlebars.registerHelper(layouts(handlebars.Handlebars));
const bundler = webpack(config);

var configBS = {
  port: process.env.port || 3000,
  ghostMode: false,
  server: {
    baseDir: "docs",
    middleware: [
      // historyApiFallback(),
      hygienist("docs"),
      webpackDevMiddleware(bundler, {
        // Dev middleware can't access config, so we provide publicPath
        publicPath: config.output.publicPath,

        noInfo: false,
        quiet: true,
        stats: {
          assets: false,
          colors: true,
          version: false,
          hash: false,
          timings: false,
          chunks: false,
          chunkModules: false
        }
      }),
      webpackHotMiddleware(bundler, {
        log: () => {}
      })
    ]
  }
};

gulp.task("webpack", function(callback) {
  webpack(config, function(err, stats) {
    if (err) throw new gutil.PluginError("webpack:build", err);
    gutil.log(
      "[webpack:build] Completed\n" +
        stats.toString({
          assets: true,
          chunks: false,
          chunkModules: false,
          colors: true,
          hash: false,
          timings: false,
          version: false
        })
    );
    callback();
  });
});

gulp.task("webpack:optimized", function(callback) {
  webpack(configProd, function(err, stats) {
    if (err) throw new gutil.PluginError("webpack:build", err);
    gutil.log(
      "[webpack:build] Completed\n" +
        stats.toString({
          assets: true,
          chunks: false,
          chunkModules: false,
          colors: true,
          hash: false,
          timings: false,
          version: false
        })
    );
    callback();
  });
});

gulp.task("css:optimized", function() {
  return gulp
    .src("./docs/*.css")
    .pipe(plumber())
    .pipe(autoprefixer())
    .pipe(cssnano({ discardComments: { removeAll: true } }))
    .pipe(gulp.dest("docs/"));
});

gulp.task("images", function() {
  return gulp
    .src("src/assets/img/**/*")
    .pipe(plumber())
    .pipe(
      imagemin({
        progressive: true
      })
    )
    .pipe(gulp.dest("./docs/img"));
});

gulp.task("images:optimized", function() {
  return gulp
    .src("src/assets/img/**/*")
    .pipe(plumber())
    .pipe(
      imagemin({
        progressive: true,
        multipass: true
      })
    )
    .pipe(gulp.dest("./docs/img"));
});

gulp.task("fonts", function() {
  return gulp.src("src/font/*").pipe(plumber()).pipe(gulp.dest("./docs/font"));
});

gulp.task("templates", function() {
  var options = {
    ignorePartials: true,
    batch: ["./src/views/partials/"],
    helpers: {
      capitals: function(str) {
        return str.toUpperCase();
      }
    }
  };

  return gulp
    .src("./src/views/templates/**/*.hbs")
    .pipe(plumber())
    .pipe(handlebars({}, options))
    .pipe(
      rename(function(path) {
        path.extname = ".html";
      })
    )
    .pipe(gulp.dest("docs"));
});

gulp.task("templates:optimized", ["templates"], function() {
  return gulp
    .src("./docs/**/*.html")
    .pipe(inlinesource())
    .pipe(replace(/\.\.\//g, ""))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true
      })
    )
    .pipe(gulp.dest("./docs/"));
});

gulp.task("clean", function(cb) {
  return rimraf("./docs/", cb);
});

gulp.task("watch", function() {
  gulp.watch(
    [
      "./src//views/templates/**/*.hbs",
      "./src//views/partials/**/*.hbs",
      "data.yml"
    ],
    ["templates"],
    reload
  );
  gulp.watch('./src/assets/css/**/*.scss', ['webpack']);
  gulp.watch("./src/assets/img/**/*", ["images"], reload);
  gulp.watch(['./src/assets/js/**/*.js', './src/index.js', 'Gulpfile.js'], ['webpack']);
});

gulp.task("build", function(cb) {
  return runSequence("clean", ["images", "fonts", "webpack", "templates"], cb);
});

gulp.task("build:optimized", function(cb) {
  return runSequence(
    "clean",
    ["images", "webpack:optimized", "templates"],
    "css:optimized",
    cb
  );
});

// use default task to launch Browsersync and watch JS files
gulp.task("serve", ["build"], function() {
  // Serve files from the root of this project
  browserSync.init(["./docs/**/*"], configBS);

  // add browserSync.reload to the tasks array to make
  // all browsers reload after tasks are complete.
  gulp.start(["watch"]);
});

// use default task to launch Browsersync and watch JS files
gulp.task("serve:tunnel", ["build"], function() {
  // Serve files from the root of this project
  browserSync.init(["./docs/**/*"], configBS,
    function(err, bs) {
      ngrok.connect(configBS.port,
        function (err, url) {
          gutil.log(
            "[ngrok:tunnel]", gutil.colors.magenta(url));
      });
	});

  // add browserSync.reload to the tasks array to make
  // all browsers reload after tasks are complete.
  gulp.start(["watch"]);
});

