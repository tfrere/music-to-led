/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { ChildProcess, spawn, exec } from 'child_process';
import log from 'electron-log';
import MenuBuilder from './menu';
import pythonConfig from './constants/python.json';
import { PythonShell } from 'python-shell';

let http = require('http');
const cors = require('cors');
const HTTPPort = 8080;

// /*************************************************************
//  * GLOBALS
//  *************************************************************/

let mainWindow: BrowserWindow | null = null;
let httpServerApi = null;
let pythonBackendProcess = null;

// /*************************************************************
//  * ELECTRON DEV
//  *************************************************************/

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

// /*************************************************************
//  * ELECTRON WINDOW
//  *************************************************************/

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  launchHTTPApi();

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    // minWidth: 900,
    // minHeight: 600,
    // maxWidth: 1100,
    // maxHeight: 800,
    center: true,
    titleBarStyle: 'hidden',
    frame: false,
    // titlebarAppearsTransparent: true,
    backgroundColor: '#061B28',
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js')
          }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

process.on('exit', function() {
  killHTTPApi();
  // killPythonBackendProcess();
});

// /*************************************************************
//  * ELECTRON WINDOW EVENT LISTENERS
//  *************************************************************/

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// /*************************************************************
//  * SPAWN PYTHON PROCESS
//  *************************************************************/

const spawnPythonBackendProcess = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (
    (!isDevelopment || !pythonConfig.devUsePackaged) &&
    !pythonBackendProcess
  ) {
    console.log('Launching python process...');
    // const root = process.cwd();

    // const binariesPath =
    //   isProduction && app.isPackaged
    //     ? path.join(
    //         path.dirname(app.getAppPath()),
    //         '..',
    //         './Resources',
    //         './bin'
    //       )
    //     : path.join(root, './resources', pythonConfig.execName);

    // const execPath = path.resolve(
    //   path.join(binariesPath, `./${pythonConfig.execName}`)
    // );

    // pythonBackendProcess = spawn(
    //   '/Users/thibaudfrere/Documents/music-2-led/backend/dist/music2led',
    //   // 'conda run -n audio-2-led python /Users/thibaudfrere/Documents/music-2-led/backend/main.py',
    //   [],
    //   { detached: true }
    // );

    pythonBackendProcess = exec(
      '/Users/thibaudfrere/Documents/music-2-led/backend/dist/music2led',
      { async: true }
    );

    // console.log(
    //   'binPath',
    //   binariesPath,
    //   'execPath',
    //   execPath,
    //   'process',
    //   pythonBackendProcess
    // );

    // python event listeneres
    // process.on('error', function handler(e: Error) {
    //   console.log(`Cannot spawn process. ${e}`);
    // });
    // process.stdin.resume();
    // process.on('exit', killPythonBackendProcess);
    // process.on('SIGINT', killPythonBackendProcess);
    // process.on('SIGUSR1', killPythonBackendProcess);
    // process.on('SIGUSR2', killPythonBackendProcess);
    // process.on('uncaughtException', killPythonBackendProcess);
  }
};

const killPythonBackendProcess = () => {
  if (pythonBackendProcess) {
    console.log('Killing python process...');
    pythonBackendProcess.kill();
    pythonBackendProcess = null;
  }
};

// /*************************************************************
//  * PYTHON SCRIPT PROCESS
//  *************************************************************/

const spawnDevPythonBackendProcess = () => {
  pythonBackendProcess = PythonShell.run('./backend/main.py', null, function(
    err
  ) {
    console.log('Launching dev python process...');
    if (err) throw err;
  });
};

const killDevPythonBackendProcess = () => {
  if (pythonBackendProcess) {
    console.log('Killing dev python process...');
    pythonBackendProcess.kill();
    pythonBackendProcess = null;
  }
};

// /*************************************************************
//  * HTTP API PROCESS
//  *************************************************************/

const launchHTTPApi = () => {
  let pythonProcess = null;
  console.log('Launching HTTP API...');
  //create a server object:
  httpServerApi = http
    .createServer(function(req, res) {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Request-Method', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
      res.setHeader('Access-Control-Allow-Headers', '*');
      var url = req.url;
      if (url === '/launchPython') {
        console.log('/launchPython');
        spawnDevPythonBackendProcess();
      } else if (url === '/killPython') {
        console.log('/killPython');
        killDevPythonBackendProcess();
      }
      res.writeHead(200, { 'Content-Type': 'text/html' }); // http header
      res.write('OK'); //write a response
      res.end(); //end the response
    })
    .listen(HTTPPort, function() {
      console.log('HTTP API started at port ' + HTTPPort); //the server object listens on port 3000
    });
};

const killHTTPApi = () => {
  if (httpServerApi) {
    httpServerApi.close(function() {
      console.log('HTTP API killed.');
    });
  }
};
