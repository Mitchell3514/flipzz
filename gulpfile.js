const { series, parallel, src, dest, watch } = require("gulp");
const cleanCSS = require("gulp-clean-css");
const minify = require("gulp-minify");
const webp = require('gulp-webp');
const livereload = require("gulp-livereload");
const clean = require("gulp-clean");

const path_in = "src";
const path_out = "dist";

const out = (file) => { return file.base.replace(path_in, path_out);  };

function clear() { 
    return src("./dist", { allowEmpty: true })
        .pipe(clean({ force: true }));
}

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
    return src(["src/public/js/*.js", "src/bin/www"])
        .pipe(minify({
            ext: ".js",
        }))
        .pipe(dest(out))
        .pipe(livereload());
}

function assets() {
    return src("src/public/assets/*.*")
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

exports.dev = series(clear, parallel(views, css, js, assets, server), livewatch);
exports.build = series(clear, parallel( views, css, js, assets, server));