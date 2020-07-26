import path from 'path';
import pythonConfig from '../constants/python.json';

export const getPythonProcessPath = (
  context,
  rootCwd,
  hasToBePackaged,
  appPath,
  execName
) => {
  let processPath = null;

  if (context === 'development' && !hasToBePackaged) {
    processPath = path.join('/' + rootCwd, `./backend/${execName}.py`);
  } else if (context === 'development' && hasToBePackaged) {
    processPath = path.join(
      '/' + rootCwd,
      `./backend/bin/${execName}/${execName}`
    );
  } else if (context === 'production') {
    processPath = path.join(
      path.dirname(appPath),
      '..',
      './Resources',
      './bin'
    );

    processPath = processPath + '/' + execName;
  }

  return processPath;
};
