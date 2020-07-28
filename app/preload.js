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

// let WebMidi = require('webmidi');

// console.log(WebMidi);

// WebMidi.enable(function(err) {
//   console.log('midi is enabled !');

//   window.outputs = WebMidi.outputs;
// }, true);

const { webFrame } = require('electron');
webFrame.setVisualZoomLevelLimits(1, 3);
