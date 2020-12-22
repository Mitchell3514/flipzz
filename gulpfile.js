const { series, parallel, src, dest, watch } = require("gulp");
const cleanCSS = require("gulp-clean-css");
const minify = require("gulp-minify");
const webp = require('gulp-webp');
const livereload = require("gulp-livereload");

const path_in = "src";
const path_out = "dist";

const out = (file) => { return file.base.replace(path_in, path_out); };

function views() {
    return src("src/public/views/*.ejs")
        .pipe(dest(out))
        .pipe(livereload());
}

function css() {
    return src("src/public/css/*.css")
        .pipe(cleanCSS({ compatibility: "ie8" }))
        .pipe(dest(out))
        .pipe(livereload());
}

function js() {
    return src("src/public/js/*.js")
        .pipe(minify({
            ext: {
                min: ".js",
            }
        }))
        .pipe(dest(out))
        .pipe(livereload());
}

function assets() {
    return src("src/public/assets/*.{png,gif,jpg}")
        .pipe(webp())
        .pipe(dest(out))
        .pipe(livereload());
}

function server() {
    return src("src/**/*.js", { ignore: "src/public" })
        .pipe(dest(out))
        .pipe(livereload());
}

function livewatch() {
    livereload.listen();
    watch("src/public/views", parallel(views));
    watch("src/public/css", parallel(css));
    watch("src/public/js", parallel(js));
    watch("src/public/assets", parallel(assets));
    watch("src/**/*.js", { ignored: "src/public" }, parallel(server));
}

exports.dev = series(parallel(views, css, js, assets, server), livewatch);
exports.build = parallel(views, css, js, assets, server);