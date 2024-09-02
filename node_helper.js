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
      var state = 0;
      const output = child.execSync('modules/MMM-whoshome/macping.sh ' + mac, { encoding: 'utf-8', timeout: 30000 });
      var lastseen = '';
      if (output.trim() == 1) {
        state = 1;
      } else {
        state = 0;
        if (output.trim() != 0) {
          lastseen = output.trim();
        }
      }

      if (config.push) {
        if (lastseen == '') {
          // use current time in mysql date time format
          var currentdate = new Date();
          lasts = currentdate.getFullYear() + '-' + (currentdate.getMonth() + 1) + '-' + currentdate.getDate() + '-'
            + currentdate.getHours() + ':' + currentdate.getMinutes();
        } else {
          // convert lastseen to mysql date time format
          // if lastseen is only HH:MM, add current date
          if (lastseen.indexOf('.') == -1) {
            lasts = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + '-' + lastseen;
          }
          // if lastseen is DD.MM HH:MM, add current year
          if (lastseen.indexOf('.') != -1 && lastseen.indexOf(':') != -1) {
            var lastseenparts = lastseen.split(' ');
            var dateparts = lastseenparts[0].split('.');
            var timeparts = lastseenparts[1].split(':');
            lasts = new Date().getFullYear() + '-' + dateparts[1] + '-' + dateparts[0] + '-' + timeparts[0] + ':' + timeparts[1];
          }
        }
          console.log("Pushing to server: " + key + ' ' + lastseen);
          pushToServer(key, lasts, config);
      }

      console.log(key + ' ' + mac + ' ' + state + ' ' + lastseen);
      stateArray[counter] = [key, state, lastseen];
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

function pushToServer(user, lastseen, config) {
  const https = require('https');
  var ret = 0;
  const options = {
    hostname: config.push.hostname,
    path: config.push.path 
      + '?username=' + encodeURIComponent(user) 
      + '&lastseen=' + encodeURIComponent(lastseen) 
      + '&ssid=' + encodeURIComponent(config.push.ssid)
      + '&clientname=' + encodeURIComponent(config.push.clientname) 
      + '&token=' + encodeURIComponent(config.push.token),
    method: 'GET',
    headers: {
      'User-Agent': 'Node.js MagicMirror HTTPS Client'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        //console.log('Response body:', jsonData);
        ret = 1;
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
  return ret;
}
