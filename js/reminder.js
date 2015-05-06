'use strict';
var reminder = reminder || {};

// Define properties of Remind class
reminder.Remind = function(data) {
    this.description = m.prop(data.description);
    this.date = m.prop(data.date);
    this.edited = m.prop(data.edited);
    this.error = m.prop(data.error);
};


(function(){
    // Constant with name of notifications list stored in localStorage
    var STORAGE_ID = 'task-list';

    // Getter/Setter to operate notifications list stored in localStorage
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

    // Get notifications object from localStorage 
    this.list = reminder.storage.get();

    // Create collection
    this.list = this.list.map(function(item) {
        return new reminder.Remind(item);
    });

    // Temporary value storage (until we create notification)
    this.description = m.prop("");

    // Add notification in list and update collection
    this.MAX_STRING_LENGTH = 100; // Caonstant define max chars value to input 
    this.add = function() {
        // Remove whitespaces and count chars with a help of regex
        if (this.description()  && this.description().replace(/\s/g, '').length <= this.MAX_STRING_LENGTH) {
            this.list.push(new reminder.Remind({
                description: this.description(this.description().trim()),
                date: moment.utc().format(), // Write UTC-formatted date, so we can take into account timezone
                edited: false,
                error: false
            }));
            reminder.storage.set(this.list);
            this.description("");
        } 
    };

    this.edit = function(index, ctrl) {
        if (this.description() && this.description().replace(/\s/g, '').length <= ctrl.MAX_STRING_LENGTH) {
            this.description(this.description().trim());
            this.date(moment.utc().format());
            this.edited(true);
            this.error(false);
            reminder.storage.set(ctrl.list);
        } else {
            this.error(true);
            this.description(reminder.storage.get()[index].description);
        }
    };
};

// Create view
reminder.view = (function() {
    return function(ctrl) {
        return m("div.tasks-container", [
           m('h1', 'Notifications'),
            m("input.add-remind[placeholder='Notification text']", {
                "autofocus": true,
                // Process ENTER/ESCAPE keys to add notification/clear input field
                onkeyup: function(e){
                    if (e.keyCode === 13) {
                        ctrl.add();
                    } else if (e.keyCode === 27) {
                        ctrl.description("");
                    } else {
                        // Won't render if it's not necessary
                       m.redraw.strategy("none");
                    }
                },
                oninput: m.withAttr("value", ctrl.description), 
                value: ctrl.description(),
                // This block keep context of current element and is processed after element render completed
                config: function (el, isInit, context) {
                    var status = document.getElementById("input-status");
                    //el.focus();
                    if(ctrl.description().replace(/\s/g, '').length <= ctrl.MAX_STRING_LENGTH) {
                        // Indicate amount of chars left until max value exceed
                        status.innerHTML = "осталось " + (ctrl.MAX_STRING_LENGTH - ctrl.description().replace(/\s/g, '').length) + " символов";
                    } else {
                        // Show warning if max char value exceed
                        status.innerHTML = "<span class='danger'>limit of " + ctrl.MAX_STRING_LENGTH + " characters exceed</span>" ;
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
                        m("label", { "data-date": task.date() }, [
                            m("div.description",  {
                                "data-edited": task.edited(),
                                "data-error": task.error(), 
                                config: function(el, isInit, context){
                                    var inputField = el.parentNode.querySelector("textarea"),
                                        innerStatus = el.parentNode.querySelector(".inner-status");
                                    
                                    if(el.offsetHeight > 0){
                                        inputField.style.height = el.offsetHeight + "px";
                                    } else {
                                        inputField.style.height = "auto";
                                    }
                                        
                                    el.addEventListener('dblclick', function(){

                                        inputField.className = "show";

                                        if(!innerStatus.className.match("show")){
                                            innerStatus.className = "inner-status show";
                                        }

                                        if(!el.className.match("hide")){
                                            el.className += " hide";
                                        }
                                        inputField.focus();
                                    });
                                } 
                            }, task.description()),
                            m("textarea.hide", {
                                "rows": 1,
                                oninput: m.withAttr("value", task.description),
                                onkeyup: function(e){
                                    var prev = reminder.storage.get()[index].description,
                                        descr = this.parentNode.querySelector(".description"),
                                        innerStatus = this.parentNode.querySelector(".inner-status");

                                    if (e.keyCode === 13) {
                                        ctrl.edit.call(task, index, ctrl);
                                        this.className = "hide";
                                        descr.className = descr.className.replace("hide", "").trim();
                                        innerStatus.className = innerStatus.className.replace("show", "").trim();
                                    } else if (e.keyCode === 27) {  
                                        task.description(prev);
                                        this.value = prev;
                                        this.className = "hide";
                                        descr.className = descr.className.replace("hide", "").trim();
                                        innerStatus.className = innerStatus.className.replace("show", "").trim();
                                    } else {
                                        m.redraw.strategy("none");
                                    }
                                },
                                onblur: function(){
                                    var prev = reminder.storage.get()[index].description,
                                        descr = this.parentNode.querySelector(".description"),
                                        innerStatus = this.parentNode.querySelector(".inner-status");

                                        task.description(prev);
                                        this.value = prev;
                                        this.className = "hide";
                                        descr.className = descr.className.replace("hide", "").trim();
                                        innerStatus.className = innerStatus.className.replace("show", "").trim();                                  
                                },
                                config: function(el, isInit, context){
                                    var innerStatus = el.parentNode.querySelector(".inner-status");
                                    el.focus();
                                    innerStatus.innerHTML = (ctrl.MAX_STRING_LENGTH - task.description().replace(/\s/g, '').length);
                                    //if(el.scrollHeight != 0){
                                        el.style.minHeight = el.scrollHeight + "px";
                                    //}
                                    if (task.description().replace(/\s/g, '').length >= ctrl.MAX_STRING_LENGTH && !innerStatus.className.match("error")) {
                                        innerStatus.className += " error";
                                    }
                                } 
                            }, task.description()),
                            m("span.inner-status"),
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

// Application initialization. 
// This example use anonymous module, 
// but it is recommended to use namespace reminder instead {...} .
m.module(document.getElementById('reminderapp'), {
    controller: reminder.controller, 
    view: reminder.view
});
