import { Request } from 'zeromq';
import {
  Dispatch,
  GetState,
  PythonCounterT,
  PythonActionT,
  ThunkDispatchT,
  PYTHON_BACKEND_REQUEST,
  PYTHON_BACKEND_SUCCESS,
  PYTHON_BACKEND_FAILURE
} from '../types';
import pythonConfig from '../constants/python.json';

export function pythonBackendRequest(): PythonActionT {
  return {
    type: PYTHON_BACKEND_REQUEST
  };
}

export function pythonBackendSuccess(v: number): PythonActionT {
  return {
    type: PYTHON_BACKEND_SUCCESS,
    payload: v
  };
}

export function pythonBackendFailure(m: string): PythonActionT {
  return {
    type: PYTHON_BACKEND_FAILURE,
    payload: m
  };
}

// zeromq send-receive function
async function zeromqMessages(m: PythonCounterT): Promise<number> {
  const sock = new Request();
  sock.connect(pythonConfig.connString);
  await sock.send(JSON.stringify(m));
  const [result] = await sock.receive();
  return JSON.parse(result.toString()).value;
}

// redux-thunk action for zeromq send-receive
export const pythonCalc = (m: PythonCounterT) => async (dispatch: Dispatch) => {
  dispatch(pythonBackendRequest());
  return zeromqMessages(m).then(
    r => dispatch(pythonBackendSuccess(r)),
    e => dispatch(pythonBackendFailure(e.toString))
  );
};

export const pythonIncrement = () => async (
  dispatch: ThunkDispatchT,
  getState: GetState
) => {
  // construct message object
  const { pythonCounter } = getState();
  const message = {
    ...pythonCounter,
    operator: 1
  };
  dispatch(pythonCalc(message));
};

export const pythonDecrement = () => async (
  dispatch: ThunkDispatchT,
  getState: GetState
) => {
  // construct message object
  const { pythonCounter } = getState();
  const message = {
    ...pythonCounter,
    operator: -1
  };
  dispatch(pythonCalc(message));
};
