# Небольшое приложение для создания напоминаний на Mithril.js 

* Может дружить с IE9 и выше
* Обязательно покажет насколько крут Mithril.js
* Вероятно также покажет немного говнокода, но только совсем чуть-чуть

#### Запуск:

* Открываем index.html и наслаждаемся (для IE не прокатит, нужно запускать на локалхосте все из-за той же шняги с локалстораджем)

#### Изменение:

* Качаем http://nodejs.org/ NodeJS
* Качаем http://gulpjs.com/ Gulp

1 - после установки node.js запускаем командную строку

2 - копипастим в окно командной строки npm install -g gulp gulp-cache gulp-clean event-stream browser-sync gulp-size gulp-jshint gulp-concat gulp-uglify gulp-minify-css gulp-base64 gulp-less gulp-rename gulp-imagemin

4 - cd /reminder-mithril_directory

5 - линкуем все ранее установленные модули ноды в рабочую директорию командой npm link + портянка выше

6 - выполняем в командной строке gulp, а затем gulp watch (правим/смотрим в IE)
