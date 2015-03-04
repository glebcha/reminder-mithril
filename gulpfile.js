// Определяем зависимости в переменных
var gulp = require('gulp'),
    cache = require('gulp-cache'),
    clean = require('gulp-clean'),
    stream = require('event-stream'),
    browserSync = require('browser-sync'),
    size = require('gulp-size'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    base64 = require('gulp-base64'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin');
 
// Проверка ошибок в скриптах
gulp.task('lint', function() {
    return gulp.src('js/custom.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
 
// Конкатенация и минификация стилей
// При указании исходников в gulp.src учитывается порядок в котором они указаны,
// то есть первыми в итоговом файле будут стили бустрапа, потому что мы должны
// вначале объявить их, чтобы потому переопределить на свои стили 
// То же самое касается скриптов - мы вначале объявляем зависимости и уже потом 
// подключаем наши скрипты (например первым будет всегда jquery, если он используется
// в проекте, а уже следом все остальные скрипты)
// Очень важно - в случае с less все импорты (бутстрап, миксины, свои переменные)  
// делаются в один style.less и уже с ним выполняем задачу
gulp.task('styles', function() {
    return gulp.src('less/style.less')
        .pipe(less())
        .pipe(base64({
            extensions: ['jpg', 'png'],
            maxImageSize: 32*1024 // размер указывается в байтах, тут он 32кб потому и больше уже плохо для IE8
        }))
        .pipe(minifyCSS({
            keepBreaks: false // булевым значением мы указываем начинать ли с новой строки новое правило в стилях, либо все будет в единой каше без разрыва строки как сейчас
        }))
        .pipe(size({
            title: 'size of styles'
        }))
        .pipe(gulp.dest('assets/css'))
        .pipe(browserSync.reload({stream:true}));
});
 
// Конкатенация и минификация скриптов
// Тут выделяются два контекста - jquery-плагины / наши скрипты и зависимости (то без чего 
// не будет работать хотя бы один наш скрипт, например jquery)
// Так как это просто пример, то лучшим вариантом было бы разделение на основные и 
// вспомогательные скрипты (например основные - jquery/bootstrap и вспомогательные - lightbox/fotorama) 
gulp.task('scripts', function() {
    var js = gulp.src(['js/*reminder*', 'js/*custom*']) 
        .pipe(concat('custom.js'))
        .pipe(uglify())
        .pipe(size({
            title: 'size of custom js'
        }))
        .pipe(gulp.dest('assets/js'));
    var locales = gulp.src('js/locale/*') 
        .pipe(concat('locale.js'))
        .pipe(uglify())
        .pipe(size({
            title: 'size of locales'
        }))
        .pipe(gulp.dest('assets/js'));
    var jsDeps = gulp.src('js/lib/*')
        .pipe(concat('lib.js'))
        .pipe(uglify())
        .pipe(size({
            title: 'size of locales'
        }))
        .pipe(gulp.dest('assets/js'));
    stream.concat(js, locales, jsDeps).pipe(browserSync.reload({stream:true, once: true}));
});
 
 
// Сжатие изображений (кэшируем, чтобы сжимать только изменившиеся изображения)
// optimizationLevel - это количество проходов, диапазон параметра 0-7 и начиная с 1 включается компрессия
// size  - показывает размер директории (полезно оценить результат)
gulp.task('images', function () {
    return gulp.src(['images/*', '!images/*.db'])
        .pipe(cache(imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        })))
        .pipe(size({
            title: 'size of images'
        }))
        .pipe(gulp.dest('assets/images'));
});
 
// Чистим директорию назначения и делаем ребилд, чтобы удаленные из проекта файлы не остались
gulp.task('clean', function() {
  return gulp.src(['assets/css', 'assets/js'], {read: false})
    .pipe(clean());
});

// Чистим кэш, который используется для обработки графики
gulp.task('clear', function (done) {
  return cache.clearAll(done);
});
 
// Livereload во имя Луны
// Поднимается локальный сервер и при каждом изменении 
// производится инъекция результирующего файла (то что на выходе после выполнения задачи)
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});
 
// Наблюдение за изменениями и автосборка
// После первого запуска (команда gulp в консоли) выполняем gulp watch,
// чтобы следитть за изменениями и автоматически пересобирать исходники с учетом 
// последних изменений
gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('js/*.js', ['lint', 'scripts']);
    gulp.watch('less/*.less', ['styles']);
    gulp.watch('images/*', ['images']);
});
 
// Выполняем по-умолчанию (вначале очистка и ребилд директории назначения, а потом выполнение остальных задач)
gulp.task('default', ['clean', 'clear'], function() {
    gulp.start('styles', 'scripts', 'images');
});