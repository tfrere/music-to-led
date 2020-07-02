import { Dispatch as ReduxDispatch, Store as ReduxStore, Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

export type PythonCounterT = {
  isFetching: boolean;
  value: number;
  operator: number;
  error: boolean;
};

export type CounterStateType = {
  counter: number;
  pythonCounter: PythonCounterT;
};

export const PYTHON_BACKEND_REQUEST = 'PYTHON_BACKEND_REQUEST';
export const PYTHON_BACKEND_SUCCESS = 'PYTHON_BACKEND_SUCCESS';
export const PYTHON_BACKEND_FAILURE = 'PYTHON_BACKEND_FAILURE';

interface PythonBackendRequestAction {
  type: typeof PYTHON_BACKEND_REQUEST;
}

interface PythonBackendSuccessAction {
  type: typeof PYTHON_BACKEND_SUCCESS;
  payload: number;
}

interface PythonBackendFailureAction {
  type: typeof PYTHON_BACKEND_FAILURE;
  payload: string;
}

export type PythonActionT =
  | PythonBackendRequestAction
  | PythonBackendSuccessAction
  | PythonBackendFailureAction;

export type GetState = () => CounterStateType;
export type Dispatch = ReduxDispatch<Action<string>>;
export type Store = ReduxStore<CounterStateType, Action<string>>;

export type ThunkDispatchT = ThunkDispatch<PythonCounterT, void, PythonActionT>;
