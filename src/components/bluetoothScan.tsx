import { useBluetoothScan } from "../utils/useBluetoothScan";

const FirmwareUpdater = () => {
  const {
    bluetoothState,
    statusMessage,
    isScanning,
    isConnected,
    connectedDevice,
    receivedMessage,
    startScan,
    connectToDevice,
    disconnect,
  } = useBluetoothScan();

  return (
    <div className="font-sans max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">
        ESP32 BLE Controller
      </h2>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-300">
        <strong className="text-lg">Status:</strong>
        <p className="mt-1">{statusMessage}</p>
        {isConnected && (
          <>
            <p className="mt-1">{`Connected Device: ${
              connectedDevice?.name || connectedDevice?.id
            }`}</p>
            {receivedMessage && (
              <p className="mt-1">{`Device Message: ${receivedMessage}`}</p>
            )}
          </>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-300">
        <strong className="text-lg">Device Discovery</strong>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={startScan}
            disabled={isScanning || isConnected || bluetoothState !== "on"}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Scan for Devices
          </button>
          {connectedDevice && !isConnected && (
            <button
              onClick={connectToDevice}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Connect
            </button>
          )}
          {isConnected && (
            <button
              onClick={disconnect}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirmwareUpdater;
