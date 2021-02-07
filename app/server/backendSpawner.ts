import { ChildProcess, spawn, exec } from 'child_process';
import { PythonShell } from 'python-shell';

// /*************************************************************
//  * SPAWN PYTHON PROCESS
//  *************************************************************/

export const spawnPythonBackendProcess = (globals, configFilePath) => {
  console.log('spawn python backend process');
  const args = ['--with-config-file', configFilePath];
  if (globals.context === 'development' && !globals.hasToUsePackagedPython) {
    console.log('with pythonshell');
    globals.pythonProcessInstance = PythonShell.run(
      globals.pythonProcessPath,
      {
        args: args
      },
      function(err, res) {
        if (err) throw err;
        console.log('...');
        console.log('results: %j', res);
      }
    );
  } else {
    console.log('with spawn');
    globals.pythonProcessInstance = spawn(globals.pythonProcessPath, args, {
      detached: false
    });
  }
};

export const killPythonBackendProcess = globals => {
  console.log('kill python backend process');
  if (globals.pythonProcessInstance) {
    console.log('...');
    if (globals.context === 'development' && !globals.hasToUsePackagedPython) {
      globals.pythonProcessInstance.childProcess.kill('SIGINT');
    } else {
      globals.pythonProcessInstance.kill();
    }
    globals.pythonProcessInstance = null;
  }
};

export const testConfigPythonBackendProcess = (globals, configFilePath) => {
  return new Promise((resolve, reject) => {
    console.log('test config file python backend process');
    const args = ['--test-config-file', configFilePath];
    if (globals.context === 'development' && !globals.hasToUsePackagedPython) {
      console.log('with pythonshell');
      globals.pythonProcessInstance = PythonShell.run(
        globals.pythonProcessPath,
        {
          args: args
        },
        function(err, res) {
          console.log("toto", err, res);

          if (!err && !res) {
            resolve({ success: false, error: 'Something went wrong. Please check your config file.' });
          } else if (res[0].includes('is valid')) {
            resolve({ success: true, error: '' });
          } else {
            resolve({ success: false, error: res[0] });
          }
          console.log('results: %j', res);
        }
      );
    } else {
      console.log('with spawn');

      globals.pythonProcessInstance = exec(
        globals.pythonProcessPath + ' ' + args[0] + ' ' + args[1],
        function(err, res) {
          console.log(err, res);
          if (!err && !res) {
            resolve({ success: false, error: 'Something went wrong. Please check your config file.' });
          } else if (res.includes('is valid')) {
            resolve({ success: true, error: '' });
          } else {
            resolve({ success: false, error: res });
          }
          console.log('results: %j', res);
        }
      );
    }
  });
};
