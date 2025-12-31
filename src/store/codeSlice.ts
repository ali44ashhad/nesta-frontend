// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface CodeState {
//   micropythonCode: string;
//   arduinoCode: string;
//   compiledBinary: string | null;
// }

// const initialState: CodeState = {
//   micropythonCode: '# Drag blocks into the workspace to generate MicroPython code.',
//   arduinoCode: '// Drag blocks into the workspace to generate Arduino code.',
//   compiledBinary: null,
// };

// const codeSlice = createSlice({
//   name: 'code',
//   initialState,
//   reducers: {
//     setGeneratedCode: (state, action: PayloadAction<{ micropythonCode: string; arduinoCode: string }>) => {
//       state.micropythonCode = action.payload.micropythonCode;
//       state.arduinoCode = action.payload.arduinoCode;
//     },
//     setCompiledBinary: (state, action: PayloadAction<string | null>) => {
//       state.compiledBinary = action.payload;
//     },
//   },
// });

// export const { setGeneratedCode, setCompiledBinary } = codeSlice.actions;

// export default codeSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CodeState {
  micropythonCode: string;
  arduinoCode: string;
  javascriptCode: string; // Added to store JS for simulator
  compiledBinary: string | null;
}

const initialState: CodeState = {
  micropythonCode: '# Drag blocks into the workspace to generate MicroPython code.',
  arduinoCode: '// Drag blocks into the workspace to generate Arduino code.',
  javascriptCode: '// JavaScript logic for simulation',
  compiledBinary: null,
};

const codeSlice = createSlice({
  name: 'code',
  initialState,
  reducers: {
    setGeneratedCode: (
      state, 
      action: PayloadAction<{ micropythonCode: string; arduinoCode: string; javascriptCode: string }>
    ) => {
      state.micropythonCode = action.payload.micropythonCode;
      state.arduinoCode = action.payload.arduinoCode;
      state.javascriptCode = action.payload.javascriptCode;
    },
    setCompiledBinary: (state, action: PayloadAction<string | null>) => {
      state.compiledBinary = action.payload;
    },
  },
});

export const { setGeneratedCode, setCompiledBinary } = codeSlice.actions;

export default codeSlice.reducer;