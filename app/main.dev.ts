/* eslint global-require: off, no-console: off */

/**
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, systemPreferences } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import pythonConfig from './constants/python.json';
import windowConfig from './constants/window.json';

import { getPythonProcessPath } from './server/getPythonProcessPath';
import {
  initializeHttpServer,
  launchHttpServer,
  killHttpServer
} from './server/expressApi';

systemPreferences.askForMediaAccess('microphone').then(isMicrophoneAllowed => {
  console.log('isMicrophoneAllowed : ', isMicrophoneAllowed);
});

let globals = {
  context: process.env.NODE_ENV,
  isDebuggingProd: process.env.DEBUG_PROD,
  hasToUsePackagedPython: pythonConfig.devUsePackaged,
  isAppPackaged: app.isPackaged,
  processPath: process.cwd(),
  appPath: app.getAppPath(),
  mainWindow: BrowserWindow || null,
  windowParams: {
    width:
      process.env.NODE_ENV === 'production'
        ? windowConfig.prod.small.width
        : windowConfig.dev.small.width,
    height:
      process.env.NODE_ENV === 'production'
        ? windowConfig.prod.small.height
        : windowConfig.dev.small.height,
    minWidth:
      process.env.NODE_ENV === 'production'
        ? windowConfig.prod.small.minWidth
        : windowConfig.dev.small.minWidth,
    minHeight:
      process.env.NODE_ENV === 'production'
        ? windowConfig.prod.small.minHeight
        : windowConfig.dev.small.minHeight,
    backgroundColor: '#061B28'
  },
  httpServerPort: 8080,
  httpServerInstance: null,
  pythonProcessPath: getPythonProcessPath(
    process.env.NODE_ENV,
    process.cwd(),
    pythonConfig.devUsePackaged,
    app.getAppPath(),
    pythonConfig.execName
  ),
  pythonProcessInstance: null,
  hasPythonProcessFailed: false
};

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

if (globals.context === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (globals.context === 'development' || globals.isDebuggingProd === 'true') {
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

  // launchHTTPApi();
  initializeHttpServer(globals);
  launchHttpServer(globals);

  globals.mainWindow = new BrowserWindow({
    show: false,
    width: globals.windowParams.width,
    height: globals.windowParams.height,
    minWidth: globals.windowParams.minWidth,
    minHeight: globals.windowParams.minHeight,
    fullscreen: false,
    center: true,
    titleBarStyle: 'hidden',
    // titlebarAppearsTransparent: true,
    frame: false,
    backgroundColor: globals.windowParams.backgroundColor,
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

  globals.mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  globals.mainWindow.webContents.on('did-finish-load', () => {
    if (!globals.mainWindow) {
      throw new Error('"globals.mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      globals.mainWindow.minimize();
    } else {
      globals.mainWindow.show();
      globals.mainWindow.focus();
    }
  });

  globals.mainWindow.on('closed', () => {
    globals.mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(globals.mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  //new AppUpdater();
};

process.on('exit', function() {
  killHttpServer(globals);
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
  if (globals.mainWindow === null) {
    createWindow();
  }
});
