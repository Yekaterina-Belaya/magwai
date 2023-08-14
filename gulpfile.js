"use strict";

/* пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch) */
var path = {
  build: {
    html: "./assets/build/",
    js: "./assets/build/js/",
    css: "./assets/build/css/",
    img: "./assets/build/img/",
    fonts: "./assets/build/fonts/",
  },
  src: {
    html: "./assets/src/*.html",
    js: ["./assets/src/js/main.js"],
    style: "./assets/src/style/main.scss",
    img: "./assets/src/img/**/*.*",
    fonts: "./assets/src/fonts/**/*.*",
  },
  watch: {
    html: ["./assets/src/**/*.html", "./assets/src/includes/**/*.{html,json}"],
    js: "./assets/src/js/**/*.js",
    css: "./assets/src/style/**/*.scss",
    img: "./assets/src/img/**/*.*",
    fonts: "./assets/srs/fonts/**/*.*",
  },
  clean: "./assets/build/*",
};

/* настройки сервера */
var config = {
  server: {
    baseDir: "./assets/build",
  },
  notify: false,
};

/* подключаем gulp и плагины */
let gulp = require("gulp"), // подключаем Gulp
  webserver = require("browser-sync"), // сервер для работы и автоматического обновления страниц
  plumber = require("gulp-plumber"), // модуль для отслеживания ошибок
  fileinclude = require("gulp-file-include"), // модуль для импорта содержимого одного файла в другой
  rigger = require("gulp-rigger"), // модуль для импорта содержимого одного файла в другой
  sourcemaps = require("gulp-sourcemaps"), // модуль для генерации карты исходных файлов
  sass = require("gulp-sass")(require("sass")), // модуль для компиляции SASS (SCSS) в CSS
  autoprefixer = require("gulp-autoprefixer"), // модуль для автоматической установки автопрефиксов
  cleanCSS = require("gulp-clean-css"), // плагин для минимизации CSS
  concat = require("gulp-concat"),
  cache = require("gulp-cache"), // модуль для кэширования
  imagemin = require("gulp-imagemin"), // плагин для сжатия PNG, JPEG, GIF и SVG изображений
  jpegrecompress = require("imagemin-jpeg-recompress"), // плагин для сжатия jpeg
  pngquant = require("imagemin-pngquant"), // плагин для сжатия png
  rimraf = require("gulp-rimraf"), // плагин для удаления файлов и каталогов
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default;
/* задачи */

// запуск сервера
gulp.task("webserver", function () {
  webserver(config);
});

// сбор html
gulp.task("html", function () {
  return gulp
    .src(path.src.html) // выбор всех html файлов по указанному пути
    .pipe(plumber()) // отслеживание ошибок
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "assets/src/includes/",
      })
    ) // импорт вложений
    .pipe(gulp.dest(path.build.html)) // выкладывание готовых файлов
    .pipe(webserver.reload({ stream: true })); // перезагрузка сервера
});

// сбор стилей
gulp.task("css", function () {
  return gulp
    .src(path.src.style) // получим main.scss
    .pipe(plumber()) // для отслеживания ошибок
    .pipe(sourcemaps.init()) // инициализируем sourcemap
    .pipe(sass({ outputStyle: "expanded" })) // scss -> css
    .pipe(
      autoprefixer({
        grid: true,
        overrideBrowserslist: ["last 10 versions"],
      })
    ) // добавим префиксы
    .pipe(rename({ suffix: ".min" }))
    .pipe(cleanCSS()) // минимизируем CSS
    .pipe(sourcemaps.write("./")) // записываем sourcemap
    .pipe(gulp.dest(path.build.css)) // выгружаем в build
    .pipe(webserver.reload({ stream: true })); // перезагрузим сервер
});

// сбор js
gulp.task("js", function () {
  return gulp
    .src(path.src.js) // получим файл main.js
    .pipe(plumber()) // для отслеживания ошибок
    .pipe(rigger()) // импортируем все указанные файлы в main.js
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.init()) //инициализируем sourcemap
    .pipe(concat("main.min.js"))
    .pipe(uglify()) // минимизируем js
    .pipe(sourcemaps.write("./")) //  записываем sourcemap
    .pipe(gulp.dest(path.build.js)) // положим готовый файл
    .pipe(webserver.reload({ stream: true })); // перезагрузим сервер
});

// перенос шрифтов
gulp.task("fonts", function () {
  return gulp.src(path.src.fonts).pipe(gulp.dest(path.build.fonts));
});

// обработка картинок
gulp.task("image", function () {
  return gulp
    .src(path.src.img) // путь с исходниками картинок
    .pipe(
      cache(
        imagemin([
          // сжатие изображений
          imagemin.gifsicle({ interlaced: true }),
          jpegrecompress({
            progressive: true,
            max: 90,
            min: 80,
          }),
          pngquant(),
          imagemin.svgo({ plugins: [{ removeViewBox: false }] }),
        ])
      )
    )
    .pipe(gulp.dest(path.build.img)); // выгрузка готовых файлов
});

// удаление каталога build
gulp.task("clean", function () {
  return gulp.src(path.clean, { read: false }).pipe(rimraf());
});

// очистка кэша
gulp.task("cache:clear", function () {
  cache.clearAll();
});

gulp.task("libs", function () {
  return gulp.src(path.src.libs).pipe(gulp.dest(path.build.libs));
});

// сборка
gulp.task(
  "build",
  gulp.series(
    "clean",
    gulp.parallel("html", "css", "js", "fonts", "image")
  )
);

// запуск задач при изменении файлов
gulp.task("watch", function () {
  gulp.watch(path.watch.html, gulp.series("html"));
  gulp.watch(path.watch.css, gulp.series("css"));
  gulp.watch(path.watch.js, gulp.series("js"));
  gulp.watch(path.watch.img, gulp.series("image"));
  gulp.watch(path.watch.fonts, gulp.series("fonts"));
});

// задача по умолчанию
gulp.task("default", gulp.series("build", gulp.parallel("webserver", "watch")));
