import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useBluetoothContext } from "./BluetoothContext";

// --- Motor Commands ---
const motorCommands = {
  UP: "M_M_CW_CW",
  DOWN: "M_M_ACW_ACW",
  LEFT: "M_M_ACW_CW",
  RIGHT: "M_M_CW_ACW",
  STOP: "STOP",
};

export function useGamepadBLECommands() {
  // Get commandChar from BluetoothContext, isConnected from Redux
  const { commandChar } = useBluetoothContext();
  const isConnected = useSelector((state: RootState) => state.ble.isConnected);

  const sendGamepadCommand = async (command: string) => {
    if (!commandChar || !isConnected) return;
    try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (commandChar as any).writeValue(new TextEncoder().encode(command));
    } catch {
      // Optionally handle error
    }
  };

  return {
    isConnected,
    sendGamepadCommand,
    motorCommands,
  };
}
