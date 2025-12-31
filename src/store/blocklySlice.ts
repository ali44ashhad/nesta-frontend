import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BlocklyState {
  selectedCategory: string;
}

const initialState: BlocklyState = {
  selectedCategory: 'Motion',
};

const blocklySlice = createSlice({
  name: 'blockly',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setSelectedCategory } = blocklySlice.actions;

export default blocklySlice.reducer; 