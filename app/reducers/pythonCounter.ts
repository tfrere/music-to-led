import {
  // Dispatch,
  PythonCounterT,
  PythonActionT,
  PYTHON_BACKEND_REQUEST,
  PYTHON_BACKEND_SUCCESS,
  PYTHON_BACKEND_FAILURE
} from '../types';

const initialState: PythonCounterT = {
  isFetching: false,
  value: 0,
  error: false,
  operator: 0
};

export default function pythonCounter(
  state = initialState,
  action: PythonActionT
) {
  switch (action.type) {
    case PYTHON_BACKEND_REQUEST:
      return {
        ...state,
        isFetching: true,
        error: false
      };
    case PYTHON_BACKEND_SUCCESS:
      return {
        ...state,
        isFetching: false,
        error: false,
        value: action.payload,
        operator: 0
      };
    case PYTHON_BACKEND_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: true,
        operator: 0
      };
    default:
      return state;
  }
}
