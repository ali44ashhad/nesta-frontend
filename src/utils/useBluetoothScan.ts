import { useState, useEffect, useCallback } from "react";
import { useBluetoothContext } from "./BluetoothContext";
import { useDispatch } from "react-redux";
import { setBLEConnection, setBLEStatusMessage } from "../store/bleSlice";


// TypeScript: Add minimal Web Bluetooth types if not present
type BluetoothDevice = {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
};
type BluetoothRemoteGATTServer = {
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  connected: boolean;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
};
type BluetoothRemoteGATTService = {
  getCharacteristic(char: string): Promise<BluetoothRemoteGATTCharacteristic>;
};
type BluetoothRemoteGATTCharacteristic = {
  value: DataView;
  addEventListener(type: string, listener: (ev: Event) => void): void;
  removeEventListener(type: string, listener: (ev: Event) => void): void;
  writeValue(value: BufferSource): Promise<void>;
  startNotifications?(): Promise<void>;
};

export type ConnectedDevice = BluetoothDevice | null;
export type GATTCharacteristic = unknown;

const SERVICE_UUID = "88881231-a981-99b0-ba32-1bd54a51b97c";
const COMMAND_CHAR_UUID = "88881233-a981-99b0-ba32-1bd54a51b97c";
const STATUS_CHAR_UUID = "88881234-a981-99b0-ba32-1bd54a51b97c";

export function useBluetoothScan() {
  const dispatch = useDispatch();
  const [bluetoothState, setBluetoothState] = useState<string>("unknown");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const { commandChar, setCommandChar, statusChar, setStatusChar } =
    useBluetoothContext();
  const [receivedMessage, setReceivedMessage] = useState<string>("");

  useEffect(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(navigator as any).bluetooth) {
      setBluetoothState("unavailable");
      setStatusMessage("❌ Web Bluetooth not supported in this browser.");
      dispatch(
        setBLEStatusMessage("❌ Web Bluetooth not supported in this browser.")
      );
    } else {
      setBluetoothState("on");
      setStatusMessage("🌐 Web Bluetooth ready.");
      dispatch(setBLEStatusMessage("🌐 Web Bluetooth ready."));
    }
  }, [dispatch]);

  useEffect(() => {
    const handleCharacteristicValueChanged = (event: Event) => {
      const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
      const value = target.value;
      if (value) {
        const message = new TextDecoder().decode(value.buffer);
        setReceivedMessage(message);
      }
    };
    if (statusChar) {
      (statusChar as BluetoothRemoteGATTCharacteristic).addEventListener(
        "characteristicvaluechanged",
        handleCharacteristicValueChanged
      );
      return () => {
        (statusChar as BluetoothRemoteGATTCharacteristic).removeEventListener(
          "characteristicvaluechanged",
          handleCharacteristicValueChanged
        );
      };
    }
  }, [statusChar]);

  const startScan = useCallback(async () => {
    if (bluetoothState !== "on") {
      setStatusMessage("❌ Bluetooth is not enabled");
      dispatch(setBLEStatusMessage("❌ Bluetooth is not enabled"));
      return;
    }
    setIsScanning(true);
    try {
      setStatusMessage("Scanning for BLE devices...");
      dispatch(setBLEStatusMessage("Scanning for BLE devices..."));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
        optionalServices: [COMMAND_CHAR_UUID, STATUS_CHAR_UUID],
      });
      setConnectedDevice(device);
      setStatusMessage(`Device discovered: ${device.name || device.id}`);
      dispatch(
        setBLEStatusMessage(`Device discovered: ${device.name || device.id}`)
      );
      dispatch(
        setBLEConnection({
          isConnected: false,
          device: { id: device.id, name: device.name },
        })
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatusMessage("Error scanning: " + e.message);
        dispatch(setBLEStatusMessage("Error scanning: " + e.message));
      } else {
        setStatusMessage("Error scanning: Unknown error");
        dispatch(setBLEStatusMessage("Error scanning: Unknown error"));
      }
    } finally {
      setIsScanning(false);
    }
  }, [bluetoothState, dispatch]);

// TypeScript: Add minimal Web Bluetooth types if not present
type BluetoothDevice = {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
};
type BluetoothRemoteGATTServer = {
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  connected: boolean;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
};
type BluetoothRemoteGATTService = {
  getCharacteristic(char: string): Promise<BluetoothRemoteGATTCharacteristic>;
};
type BluetoothRemoteGATTCharacteristic = {
  value: DataView;
  addEventListener(type: string, listener: (ev: Event) => void): void;
  removeEventListener(type: string, listener: (ev: Event) => void): void;
  writeValue(value: BufferSource): Promise<void>;
  startNotifications(): Promise<void>;
};
  const connectToDevice = useCallback(async () => {
    if (!connectedDevice) return;
    try {
      setStatusMessage(
        `Connecting to ${connectedDevice.name || connectedDevice.id}...`
      );
      dispatch(
        setBLEStatusMessage(
          `Connecting to ${connectedDevice.name || connectedDevice.id}...`
        )
      );
      const server = await connectedDevice.gatt?.connect();
      if (!server) throw new Error("GATT server is null.");
      const service = await server.getPrimaryService(SERVICE_UUID);
      const cmdChar = await service.getCharacteristic(COMMAND_CHAR_UUID);
      setCommandChar(cmdChar);
      const statChar = await service.getCharacteristic(STATUS_CHAR_UUID);
      setStatusChar(statChar);
      await statChar.startNotifications();
      setIsConnected(true);
      setStatusMessage("✅ Connected! Ready to send commands.");
      dispatch(setBLEStatusMessage("✅ Connected! Ready to send commands."));
      dispatch(
        setBLEConnection({
          isConnected: true,
          device: connectedDevice
            ? { id: connectedDevice.id, name: connectedDevice.name }
            : null,
        })
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatusMessage("❌ Connection failed: " + err.message);
        dispatch(setBLEStatusMessage("❌ Connection failed: " + err.message));
      } else {
        setStatusMessage("❌ Connection failed: Unknown error");
        dispatch(setBLEStatusMessage("❌ Connection failed: Unknown error"));
      }
      dispatch(setBLEConnection({ isConnected: false, device: null }));
    }
  }, [connectedDevice, dispatch, setCommandChar, setStatusChar]);

  const disconnect = useCallback(() => {
    if (connectedDevice?.gatt?.connected) {
      connectedDevice.gatt.disconnect();
    }
    setConnectedDevice(null);
    setCommandChar(null);
    setStatusChar(null);
    setIsConnected(false);
    setReceivedMessage("");
    setStatusMessage("Disconnected from device");
    dispatch(setBLEStatusMessage("Disconnected from device"));
    dispatch(setBLEConnection({ isConnected: false, device: null }));
  }, [connectedDevice, dispatch, setCommandChar, setStatusChar]);

  return {
    bluetoothState,
    statusMessage,
    isScanning,
    isConnected,
    connectedDevice,
    receivedMessage,
    startScan,
    connectToDevice,
    disconnect,
    commandChar,
  };
}
