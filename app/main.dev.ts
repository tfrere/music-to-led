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
import { PythonShell } from 'python-shell';
import fs from 'fs';
import url from 'url';
import http from 'http';
import MenuBuilder from './menu';
import pythonConfig from './constants/python.json';

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
//  * HTTP API PROCESS
//  *************************************************************/

const launchHTTPApi = () => {
  console.log('Launching HTTP API...');
  // Create a server object
  httpServerApi = http
    .createServer(function(req, res) {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Request-Method', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
      res.setHeader('Access-Control-Allow-Headers', '*');
      var baseUrl = req.url;
      console.log('--------');
      console.log('from url -> ' + baseUrl);

      if (baseUrl.includes('/listConfigFiles')) {
        console.log('/listConfigFiles');
        const testFolder = './backend';
        const files = [];
        fs.readdirSync(testFolder).forEach(file => {
          if (file.includes('CONFIG')) {
            files.push(file);
          }
        });
        var body = JSON.stringify({
          files: files
        });
        console.log('Config files founded : ', files);
        res.writeHead(200, { 'Content-Type': 'text/json' });

        res.write(body);
        res.end();
      } else if (baseUrl.includes('spawnKill')) {
        console.log('/spawnKill');
        const queryObject = url.parse(req.url, true).query;
        killDevPythonBackendProcess();
        spawnDevPythonBackendProcess(queryObject.file);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('OK');
        res.end();
      } else if (baseUrl.includes('/spawn')) {
        console.log('/spawn');
        spawnDevPythonBackendProcess('./CONFIG.yml');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('OK');
        res.end();
      } else if (baseUrl.includes('/kill')) {
        console.log('/kill');
        killDevPythonBackendProcess();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('OK');
        res.end();
      }
      console.log('--------');
    })
    .listen(HTTPPort, function() {
      console.log('HTTP API started at port ' + HTTPPort);
    });
};

const killHTTPApi = () => {
  if (httpServerApi) {
    httpServerApi.close(function() {
      console.log('HTTP API killed.');
    });
  }
};

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

const spawnDevPythonBackendProcess = configFile => {
  const options = {
    // mode: 'text',
    // pythonPath: 'path/to/python',
    // pythonOptions: ['--with-config-file'], // get print results in real-time
    // scriptPath: 'path/to/my/scripts',
    args: ['--with-config-file', './backend/' + configFile]
  };

  console.log(options);

  pythonBackendProcess = PythonShell.run('./backend/main.py', options, function(
    err,
    res
  ) {
    if (err) throw err;
    console.log('Launching dev python process...');
    console.log('results: %j', res);
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
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 900,
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
            scrollBounce: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
          }
        : {
            scrollBounce: true,
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
