const child = require("node:child_process");
const Log = require("logger");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  start () {
    Log.log(`Starting node helper for: ${this.name}`);
  },

  socketNotificationReceived (notification, payload) {
    Log.debug(`${this.name} received a socket notification: ${notification} - Payload: ${payload}`);
    if (notification === "FETCH_PEOPLE") {
      this.getPeople(payload);
    }
  },

  getPeople (config) {
    const self = this;

    // run ansyc mapping of mac addresses
    Log.log("Mapping mac addresses...");
    let macs = "";
    for (const key in config.TRACK) {
      if (Object.hasOwn(config.TRACK, key)) {
        macs += `${config.TRACK[key].mac} `;
      }
    }

    // run the script to map the mac addresses
    const mapsoutput = child.exec(`modules/MMM-whoshome/mapmacs.sh ${macs}`, {encoding: "utf-8", timeout: 300000});
    Log.log("Mapping output:");
    Log.log(mapsoutput);

    // run async ping of mac addresses
    const stateArray = [];
    let counter = 0;
    for (const key in config.TRACK) {
      if (Object.hasOwn(config.TRACK, key)) {
        const {mac} = config.TRACK[key];
        let state = 0;
        const output = child.execSync(`modules/MMM-whoshome/macping.sh ${mac}`, {encoding: "utf-8", timeout: 30000});
        let lastseen = "";
        if (output.trim() === 1) {
          state = 1;
        } else {
          state = 0;
          if (output.trim() !== 0) {
            lastseen = output.trim();
          }
        }

        Log.log(`${key} ${mac} ${state} ${lastseen}`);
        stateArray[counter] = [key, state, lastseen];
        counter += 1;
      }
    }
    Log.log("Final state:");
    Log.log(stateArray);
    self.sendSocketNotification("FETCHED_PEOPLE", {
      people: stateArray,
      id: config.id
    });
  }
});
