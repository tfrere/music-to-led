// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// var zerorpc = require('zerorpc');
// window.zerorpc = zerorpc;

// navigator.permissions
//   .query(
//     // { name: 'camera' }
//     //{ name: 'microphone' }
//     // { name: 'geolocation' }
//     // { name: 'notifications' }
//     // { name: 'midi', sysex: false }
//     { name: 'midi', sysex: true }
//     // { name: 'push', userVisibleOnly: true }
//   )
//   .then(function(permissionStatus) {
//     console.log(permissionStatus.state); // granted, denied, prompt
//     permissionStatus.onchange = function() {
//       console.log('Permission changed to ' + this.state);
//     };
//   });

let os = require('os');
let WebMidi = require('webmidi');

window.os = os;
WebMidi.enable(function(err) {
  window.outputs = WebMidi.outputs;
}, true);
