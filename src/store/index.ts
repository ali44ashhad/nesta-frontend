import { configureStore, combineReducers, createAction, Reducer, AnyAction } from '@reduxjs/toolkit';
import simulatorReducer from './simulatorSlice';
import projectReducer from './projectSlice';
import blocklyReducer from './blocklySlice';
import codeReducer from './codeSlice';
import uiStateReducer from "./uiState";
import bleReducer from './bleSlice';

// 1. Create the reset action
export const resetAllStore = createAction('RESET_ALL_STORE');

// 2. Combine your slice reducers
const appReducer = combineReducers({
  simulator: simulatorReducer,
  project: projectReducer,
  blockly: blocklyReducer,
  code: codeReducer,
  uiState: uiStateReducer,
  ble: bleReducer,
});

// 3. Create the root reducer to handle the reset
const rootReducer: Reducer = (state: ReturnType<typeof appReducer> | undefined, action: AnyAction) => {
  if (action.type === resetAllStore.type) {
    // Passing undefined forces all reducers to return their initial state
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

// 4. Configure store with the root reducer
export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;