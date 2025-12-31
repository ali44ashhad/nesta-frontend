# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# SmartCar Creator

A block-based educational robotics platform that allows children (age 10+) to program a toy car using a visual programming interface similar to Scratch.

## Features

- Visual block-based programming interface powered by Google's Blockly
- Custom blocks for car movement, sensors, and logic
- Real-time 2D car simulator
- Arduino code generation for deployment to physical hardware
- Project saving and loading
- Remote control functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```
git clone https://github.com/your-username/smartcar-creator.git
cd smartcar-creator
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

- `src/components/` - React components
  - `blockly/` - Blockly workspace and custom blocks
  - `simulator/` - 2D simulator components
- `src/store/` - Redux store and slices
- `src/utils/` - Utility functions, like code generation

## Working with Blocks

### Available Block Categories

1. **Motion** - Basic car movement actions
   - Move Forward/Backward
   - Turn Left/Right
   - Custom movement
   
2. **Sensors** - Blocks for sensor readings
   - Ultrasonic sensor distance reading
   - Obstacle detection

3. **Logic** - Conditional statements
   - If/else statements
   - Comparisons
   - Logic operations

4. **Loops** - Repetition blocks
   - Repeat n times
   - Repeat until condition

5. **Variables** - Create and use variables

6. **Functions** - Create reusable functions

### Creating a Simple Program

1. Create a new project with the "New Project" button
2. Drag blocks from the left sidebar into the workspace
3. Connect blocks to create a sequence of commands
4. Use the simulator to test your program
5. Save your project with the "Save" button

## Extending the Platform

### Adding New Blocks

1. Create a new block definition in `src/components/blockly/blocks/`
2. Define the block appearance and behavior
3. Add a code generator for the block
4. Register the block in `BlocklyWorkspace.tsx`

### Enhancing the Simulator

The simulator is implemented in `src/components/simulator/` directory. The main components are:

- `Simulator.tsx` - The main simulator canvas and controls
- `RemoteControls.tsx` - Manual controls for the car

## License

MIT
