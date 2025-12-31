import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface UIState {
  isSidebarOpen: boolean;
  isRightPanelOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  isSidebarOpen: true,
  isRightPanelOpen: true,
  activeModal: null,
  theme: 'light',
};

const uiStateSlice = createSlice({
  name: 'uiState',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    toggleRightPanel: (state) => {
      state.isRightPanelOpen = !state.isRightPanelOpen;
    },
    openRightPanel: (state) => {
      state.isRightPanelOpen = true;
    },
    closeRightPanel: (state) => {
      state.isRightPanelOpen = false;
    },
    setRightPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isRightPanelOpen = action.payload;
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.activeModal = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleRightPanel,
  openRightPanel,
  closeRightPanel,
  setRightPanelOpen,
  setActiveModal,
  toggleTheme,
  setTheme,
} = uiStateSlice.actions;

// Thunk for handling responsive panel state - defined after actions are exported
export const updatePanelsForScreenSize = createAsyncThunk(
  'uiState/updatePanelsForScreenSize',
  async (width: number, { dispatch }) => {
    if (width < 1024) {
      dispatch(closeSidebar());
      dispatch(closeRightPanel());
    } else {
      dispatch(openSidebar());
      dispatch(openRightPanel());
    }
  }
);

export default uiStateSlice.reducer;
