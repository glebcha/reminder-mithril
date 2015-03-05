'use strict';
var reminder = reminder || {};

// Задаем свойства класса Remind
reminder.Remind = function(data) {
    this.description = m.prop(data.description);
    this.date = m.prop(data.date);
};


(function(){
    // Константа с именем списка напоминаний для хранения в localStorage
    var STORAGE_ID = 'task-list';

    // Геттер/сеттер для работы со списком напоминаний в localStorage
    reminder.storage = {
        get: function () {
            return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
        },
        set: function (todos) {
            localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
        }
    };
})();

reminder.controller = function() {

    // Забираем из localStorage объект с напоминаниями 
    this.list = reminder.storage.get();

    // Создаем коллекцию
    this.list = this.list.map(function(item) {
        return new reminder.Remind(item);
    });

    // Храним значения напоминания до его создания
    this.description = m.prop("");


    // Добавляем напоминание в список и обновляем коллекцию
    this.MAX_STRING_LENGTH = 100; // В константе указываем максимальное число символов, доступное в поле ввода
    this.add = function() {
        // С помощью регулярки убираем пробелы и считаем количество символов без них
        if (this.description() && this.description().replace(/\s/g, '').length <= this.MAX_STRING_LENGTH) {
            this.list.push(new reminder.Remind({
                description: this.description(),
                date: moment.utc().format() // Записываем дату в формате UTC, чтобы учитывать часовой пояс
            }));
            reminder.storage.set(this.list);
            this.description("");
        }
    };
};

// Создаем представление
reminder.view = (function() {
    return function(ctrl) {
        return m("div.tasks-container", [
           m('h1', 'Напоминания'),
            m("input.add-remind[placeholder='Текст напоминания']", {
                // Обрабатываем нажатия на ENTER/ESCAPE для добавления напоминания/очистки поля ввода
                onkeyup: function(e){
                    if (e.keyCode === 13) {
                        ctrl.add();
                    } else if (e.keyCode === 27) {
                        ctrl.description("");
                    } else {
                        // Не будем рендерить лишний раз
                       m.redraw.strategy("none");
                    }
                },
                oninput: m.withAttr("value", ctrl.description), 
                value: ctrl.description(),
                // В этом блоке выполняем все в контексте данного элемента после того как отрендерится представление
                config: function (el, isInit, context) {
                    var status = document.getElementById("input-status");
                    el.focus();
                    if(ctrl.description().replace(/\s/g, '').length <= ctrl.MAX_STRING_LENGTH) {
                        // Пока не превысили допустимое количество символов будет показывать сколько их еще можно использовать
                        status.innerHTML = "осталось " + (ctrl.MAX_STRING_LENGTH - ctrl.description().replace(/\s/g, '').length) + " символов";
                    } else{
                        // Когда превышено допустимое число символов мы сразу же об этом прокричим
                        status.innerHTML = "<span class='danger'>превышен допустимый лимит в " + ctrl.MAX_STRING_LENGTH + " символов</span>" ;
                    }   
                }
            }),
            m("button.add", {
                onclick: ctrl.add.bind(ctrl)
            }, "+"),
            m("div#input-status"),
            m("ul#todo-list", [
                ctrl.list.map(function(task, index) {
                    return m("li", [ 
                        m("label", { "data-date": task.date() }, task.description(), [
                            m("span.date", moment.utc(task.date()).fromNow())
                        ]),
                        m('span.destroy', {
                            onclick: function(){
                                ctrl.list.splice(index, 1);
                                reminder.storage.set(ctrl.list);
                            }
                        })
                    ])
                })
            ])
        ])
    }
})();

// Инициализируем приложение
m.module(document.getElementById('reminderapp'), {
    controller: reminder.controller, 
    view: reminder.view
});