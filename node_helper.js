var NodeHelper = require("node_helper");
var child = require('child_process');
const { exit } = require("process");

module.exports = NodeHelper.create({
  start: function() {
  },
  
  socketNotificationReceived: function (notification, payload, user) {
    console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
    if (notification === 'FETCH_PEOPLE') {
        this.getPeople(payload);
    }    
  },

  getPeople: function(config) {
    const self = this;

    // run ansyc mapping of mac addresses
    console.log("Mapping mac addresses...");
    var macs = '';
    for (var key in config.TRACK) {
      macs += config.TRACK[key].mac + ' ';
    }
    
    const mapsoutput = child.exec('modules/MMM-whoshome/mapmacs.sh ' + macs, { encoding: 'utf-8', timeout: 300000 });
    console.log("Mapping output:");
    console.log(mapsoutput);


    var mac = '';
    var stateArray = new Array();
    var counter = 0;
    for (var key in config.TRACK) {
      mac = config.TRACK[key].mac;
    
      const output = child.execSync('modules/MMM-whoshome/macping.sh ' + mac, { encoding: 'utf-8', timeout: 300000 });
      const state = output.trim();

      console.log(key + ' ' + mac + ' ' + output);
      stateArray[counter] = [key, state];
      counter += 1;
    }
    console.log("Final state:");
    console.log(stateArray);
    self.sendSocketNotification(
      'FETCHED_PEOPLE', {
          'people': stateArray,
          'id': config.id,
      }
  );
  }
});
