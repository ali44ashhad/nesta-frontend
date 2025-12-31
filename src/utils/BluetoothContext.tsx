import React, { createContext, useContext, useState } from 'react';
import type { GATTCharacteristic } from '../utils/useBluetoothScan';

interface BluetoothContextType {
  commandChar: GATTCharacteristic;
  setCommandChar: (char: GATTCharacteristic) => void;
  statusChar: GATTCharacteristic;
  setStatusChar: (char: GATTCharacteristic) => void;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [commandChar, setCommandChar] = useState<GATTCharacteristic>(null);
  const [statusChar, setStatusChar] = useState<GATTCharacteristic>(null);

  return (
    <BluetoothContext.Provider value={{ commandChar, setCommandChar, statusChar, setStatusChar }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export function useBluetoothContext() {
  const ctx = useContext(BluetoothContext);
  if (!ctx) throw new Error('useBluetoothContext must be used within a BluetoothProvider');
  return ctx;
}
