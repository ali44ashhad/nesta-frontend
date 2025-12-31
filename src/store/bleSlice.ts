import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export interface BLEDeviceInfo {
  id?: string;
  name?: string;
}

export interface BLEState {
  isConnected: boolean;
  connectedDevice: BLEDeviceInfo | null;
  statusMessage: string;
}

const initialState: BLEState = {
  isConnected: false,
  connectedDevice: null,
  statusMessage: '',
};

const bleSlice = createSlice({
  name: 'ble',
  initialState,
  reducers: {
    setBLEConnection(state, action: PayloadAction<{ isConnected: boolean; device: BLEDeviceInfo | null }>) {
      state.isConnected = action.payload.isConnected;
      state.connectedDevice = action.payload.device;
    },
    setBLEStatusMessage(state, action: PayloadAction<string>) {
      state.statusMessage = action.payload;
    },
    resetBLE(state) {
      state.isConnected = false;
      state.connectedDevice = null;
      state.statusMessage = '';
    },
  },
});

export const { setBLEConnection, setBLEStatusMessage, resetBLE } = bleSlice.actions;
export default bleSlice.reducer;
