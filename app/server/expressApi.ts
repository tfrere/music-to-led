const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressInstance = express();

import {
  spawnPythonBackendProcess,
  killPythonBackendProcess,
  testConfigPythonBackendProcess
} from './backendSpawner';

expressInstance.use(bodyParser.urlencoded({ extended: false }));
expressInstance.use(bodyParser.json());
expressInstance.options('*', cors());

export const initializeHttpServer = globals => {
  expressInstance.get('/spawn', (req, res, next) => {
    console.log('/spawn');
    console.log(req.query.file);
    killPythonBackendProcess(globals);
    spawnPythonBackendProcess(globals, req.query.file);
    res.json({ msg: 'spawned' });
  });

  expressInstance.get('/kill', (req, res, next) => {
    console.log('/kill');
    killPythonBackendProcess(globals);
    res.json({ msg: 'killed' });
  });

  expressInstance.get('/test-config-file', (req, res, next) => {
    console.log('/test-config-file');
    console.log(req.query.file);
    let promise = testConfigPythonBackendProcess(globals, req.query.file);
    console.log('promise', promise);
    promise
      .then(data => {
        console.log(' api success');
        console.log(data);
        res.json(data);
      })
      .catch(err => {
        console.log(' api error', err);
        res.json(err);
      });
  });

  expressInstance.get('/is-backend-alive', (req, res, next) => {
    console.log('/is-backend-alive');

    if (globals.pythonProcessInstance) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });

  expressInstance.get('/resize-window', (req, res, next) => {
    console.log(
      '/resize-window to ' + req.query.width + ' ' + req.query.height
    );
    globals.mainWindow.setSize(
      Number(req.query.width),
      Number(req.query.height),
      false
    );
    globals.mainWindow.center();
    res.json({ msg: 'resize window' });
  });
};

export const launchHttpServer = globals => {
  globals.httpServerInstance = expressInstance.listen(
    globals.httpServerPort,
    () => {
      console.log(
        'HTTP Api Listening on port %s',
        globals.httpServerInstance.address().port
      );
    }
  );
};

export const killHttpServer = globals => {
  if (globals.httpServerInstance) {
    globals.httpServerInstance.close(function() {
      console.log('HTTP API killed.');
      killPythonBackendProcess(globals);
    });
  }
};
