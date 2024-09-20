Module.register("MMM-whoshome", {
    // Define required scripts.
    getStyles () {
      return ["whoshome.css"];
    },
  
    // Override dom generator.
    getDom () {
      const wrapper = document.createElement("div");
      wrapper.className = "whoshome";
      let html = "<span class='whoshome-title'>Who's Home:</span><br><hr>";
      Log.log("in getDom function");
      Log.log(this.peopleArray);
  
      if (this.peopleArray[0].subject === "LOADING_ENTRIES") {
        html = `${html}<span class="status">Loading...</span><br>`;
        wrapper.innerHTML = html;
        return wrapper;
      }
      for (let index = 0; index < this.peopleArray.length; index++) {
        if (this.peopleArray[index][1] === 1) {
          html = `${html}<img class="person" src="${this.config.TRACK[this.peopleArray[index][0]].image}"> ${this.peopleArray[index][0]}<BR>`;
        } else {
          html = `${html}<img class="person bw-image" src="${this.config.TRACK[this.peopleArray[index][0]].image
          }"> <span class="person-away">${this.peopleArray[index][0]}</span><BR>` +
          `<span class="lastseen">Last seen: ${this.peopleArray[index][2]}</span><BR>`;
        }
      }
  
      wrapper.innerHTML = html;
      return wrapper;
    },
  
    socketNotificationReceived (notification, payload) {
      Log.debug(`socketNotificationReceived: ${notification}`);
      if (payload.id === this.identifier) {
        switch (notification) {
          case "FETCHED_PEOPLE":
            this.peopleArray = payload.people;
            this.updateDom();
            break;
        }
      }
    },
  
    start () {
      const self = this;
  
      self.peopleArray = [{subject: "LOADING_ENTRIES"}];
  
      // update tasks every 60s
      const refreshFunction = function () {
        self.config.id = self.identifier;
        self.sendSocketNotification("FETCH_PEOPLE", self.config);
      };
      refreshFunction();
      setInterval(refreshFunction, 60000);
    }
  
  });
  