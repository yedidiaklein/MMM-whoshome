Module.register("MMM-whoshome", {
    // Define required scripts.
	getStyles: function () {
		return ["whoshome.css"];
	},

    getTranslations () {
		return {
			en: "translations/en.json",
			fr: "translations/fr.json",
			he: "translations/he.json",
            es: "translations/es.json",
            de: "translations/de.json"
		};
	},

    // Override dom generator.
    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.setAttribute("dir", this.translate("direction"));
        var i = 0;
        wrapper.className = "whoshome";
        var html = '<span class="whoshome-title">' + this.translate("sysTitle") + '</span><br><hr>';
        console.log("in getDom function");
        console.log(this.peopleArray);

        if (this.peopleArray[0].subject == 'LOADING_ENTRIES') {
            html = html + '<span class="status">Loading...</span><br>';
            wrapper.innerHTML = html;
            return wrapper;
        }
        for( i = 0; i < this.peopleArray.length; i++ ) {
            if (this.peopleArray[i][1] == 1) {
                html = html + '<img class="person" src="' + this.config.TRACK[this.peopleArray[i][0]].image + '"> ' + this.peopleArray[i][0] + '<BR>';
            } else {
                html = html + '<img class="person bw-image" src="' + this.config.TRACK[this.peopleArray[i][0]].image 
                    + '"> <span class="person-away">' + this.peopleArray[i][0] + '</span><BR>'
                    + '<span class="lastseen">' + this.translate("lastSeen") + ' : ' + this.peopleArray[i][2] + '</span><BR>';
            }
        }

        wrapper.innerHTML = html;
        return wrapper;
    },

    socketNotificationReceived: function(notification, payload) {
        console.log("socketNotificationReceived: " + notification);
        if (payload.id == this.identifier) {
            switch(notification) {
                case "FETCHED_PEOPLE":
                  this.peopleArray = payload.people;
                  this.updateDom();
                  break
              }
        }
    },

    start: function () {
        var self = this

        self.peopleArray = [{ subject: 'LOADING_ENTRIES' }]

        // update tasks every 60s
        var refreshFunction = function () {
            self.config['id'] = self.identifier;
            self.sendSocketNotification('FETCH_PEOPLE', self.config)
        }
        refreshFunction()
        setInterval(refreshFunction, 60000)
    }

});
