(function(){
	var update = function() {
		var tasks = document.querySelectorAll("#todo-list>li>label");
		if(tasks.length > 0) {
			for (var i = 0; i < tasks.length; i++) {
				var task = tasks[i],
					date = task.getAttribute("data-date");
				task.querySelector("span").innerText = moment.utc(date).fromNow();
			};
		}
	};
	setInterval(update, 5000);
})();