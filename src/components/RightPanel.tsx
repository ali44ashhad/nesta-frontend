import { useState, useRef, useEffect, useCallback } from "react";
import { useBluetoothScan } from "../utils/useBluetoothScan";
import { BluetoothProvider } from "../utils/BluetoothContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import Simulator from "./simulator/Simulator";
import { setCompiledBinary } from "../store/codeSlice";
import api from "../services/api";
import axios from "axios";
// import { colors } from "../config/colors";
import GamepadsimulatorbtnBacktoSimulator from "./icons/simulatorbtnBacktoSimulator";
import { useToast } from "./ToastManager";

const RightPanelContent = () => {
  // Ref to always hold the latest compiledBinaryBlob
  const compiledBinaryBlobRef = useRef<Blob | null>(null);
  // Keep ref in sync with state
  useEffect(() => {
    compiledBinaryBlobRef.current = compiledBinaryBlob;
  });
  // Allowed origins for iframe messages

  // Listen for messages from OTA iframe
  // Toast state for firmware update success
  const [showFirmwareSuccess, setShowFirmwareSuccess] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Restrict to known child origins
      // DEBUG: Temporarily disable origin check to test message reception
      // if (!allowedChildOrigins.includes(event.origin)) return;

      const data = event.data;
      if (!data || data.source !== "flutter_firmware_updater") return;

      switch (data.type) {
        case "info":
          console.log("Info:", data.status);
          if (data.status === "SEND_FIRMWARE_DATA") {
            // Use ref for latest value
            const latestBlob = compiledBinaryBlobRef.current;
            console.log(
              "Sending firmware data automatically (ref)",
              latestBlob
            );
            if (flutterIframeRef.current && latestBlob) {
              latestBlob.arrayBuffer().then((buffer: ArrayBuffer) => {
                flutterIframeRef.current?.contentWindow?.postMessage(
                  { type: "FLASH_BINARY", binary: buffer },
                  "*"
                );
                console.log(
                  "Sent FLASH_BINARY to Flutter iframe as ArrayBuffer (on SEND_FIRMWARE_DATA)",
                  buffer
                );
              });
            } else {
              console.log(
                "Flutter iframe or binary not available for SEND_FIRMWARE_DATA"
              );
            }
          }
          break;
        case "progress":
          // progress is 0..1
          console.log("Progress:", data.progress, data.status);
          // e.g. update progress UI:
          // progressBar.value = Math.round((data.progress || 0) * 100);
          break;
        case "success":
          console.log("Success:", data.status);
          // Close OTA modal or Flutter Flash popup and show success toast
          if (showOTAModal) {
            setShowOTAModal(false);
            setTimeout(() => {
              setShowFirmwareSuccess(true);
              setTimeout(() => setShowFirmwareSuccess(false), 4000);
            }, 300); // Wait for modal to close before showing toast
          } else if (showFlutterFlashPopup) {
            setShowFlutterFlashPopup(false);
            setTimeout(() => {
              setShowFirmwareSuccess(true);
              setTimeout(() => setShowFirmwareSuccess(false), 4000);
            }, 300); // Wait for popup to close before showing toast
          } else {
            setShowFirmwareSuccess(true);
            setTimeout(() => setShowFirmwareSuccess(false), 4000);
          }
          break;
        case "error":
          console.error("Error:", data.status, data.error);
          // e.g. show toast, enable retry
          break;
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  // Firmware Update Success Toast is now rendered inside JSX below
  const [activeTab, setActiveTab] = useState<"simulator" | "code">("simulator");
  const [activeCode, setActiveCode] = useState<"arduino" | "micropython">(
    "micropython"
  );

  const { arduinoCode, micropythonCode } = useSelector(
    (state: RootState) => state.code
  );
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // Bluetooth scan popup state
  const [showScanPopup, setShowScanPopup] = useState(false);
  const openScanPopup = useCallback(() => setShowScanPopup(true), []);
  const {
    bluetoothState,
    statusMessage,
    isScanning,
    connectedDevice,
    startScan,
    connectToDevice,
    disconnect,
  } = useBluetoothScan();
  // Use global BLE state for connection symbol
  const bleIsConnected = useSelector(
    (state: RootState) => state.ble.isConnected
  );
  // const compiledBinary = useSelector(
  //   (state: RootState) => state.code.compiledBinary
  // );

  // Compiler state
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileOutput, setCompileOutput] = useState("");
  const [compileSuccess, setCompileSuccess] = useState<boolean | null>(null);

  // Bluetooth firmware update modal state
  const [showOTAModal, setShowOTAModal] = useState(false);
  // const otaIframeRef = useRef<HTMLIFrameElement>(null);

  const [showFlutterFlashPopup, setShowFlutterFlashPopup] = useState(false);
  const flutterIframeRef = useRef<HTMLIFrameElement>(null);

  const handleCopyCode = () => {
    const codeToCopy = activeCode === "arduino" ? arduinoCode : micropythonCode;
    navigator.clipboard.writeText(codeToCopy);
    // Optionally, show a toast notification for feedback
  };

  const [compiledBinaryBlob, setCompiledBinaryBlob] = useState<Blob | null>(
    null
  );

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompileOutput("Compiling, please wait...");
    setCompileSuccess(null);
    dispatch(setCompiledBinary(null));
    setCompiledBinaryBlob(null);

    try {
      const compileResponse = await api.post("/api/compile", {
        code: arduinoCode,
      });
      const compileResult = compileResponse.data;
      if (
        !compileResponse.status.toString().startsWith("2") ||
        !compileResult.jobId
      ) {
        throw new Error(
          compileResult.output || "Compilation failed or jobId not returned."
        );
      }
      setCompileOutput(
        compileResult.output || "Compilation successful! Fetching binary..."
      );
      setCompileSuccess(true);

      const { jobId } = compileResult;
      const downloadPath = `/api/download/${jobId}`;

      const downloadResponse = await api.get(downloadPath, {
        responseType: "blob",
      });
      if (!downloadResponse.status.toString().startsWith("2")) {
        throw new Error("Failed to download the compiled binary.");
      }
      const blob = downloadResponse.data;
      setCompiledBinaryBlob(blob);
      // Optionally, you can keep the base64 for legacy UI, but it's not used for flashing
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        if (typeof base64data === "string") {
          dispatch(setCompiledBinary(base64data));
        }
      };
      setCompileOutput(
        "Compilation successful! Binary saved to application state."
      );
      showToast("Compilation successful!", "success");
    } catch (error) {
      setCompileSuccess(false);
      let errorMessage = "An unexpected error occurred during compilation.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.output || error.message;
        setCompileOutput(errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message;
        setCompileOutput(errorMessage);
      } else {
        setCompileOutput(errorMessage);
      }
      const shortErrorMessage = errorMessage.length > 100 
        ? errorMessage.substring(0, 100) + "..." 
        : errorMessage;
      showToast(`Compilation failed: ${shortErrorMessage}`, "error");
    } finally {
      setIsCompiling(false);
    }
  };

  // Flutter Flash handler
  const handleFlutterFlash = () => {
    setShowFlutterFlashPopup(true);
  };

  return (
    <div
      className="h-full flex flex-col"
      // style={{ backgroundColor: colors.darkerGray }}
      style={{ backgroundColor: '#ffffff'}}

    >
      {/* <div className="flex border-b border-gray-200 items-center justify-end">
        <button
          className="mr-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-2"
          onClick={openScanPopup}
        >
          <span>Scan Device</span>
          {bleIsConnected ? (
            <span
              title="Bluetooth Connected"
              className="text-green-400 text-lg"
            >
              ●
            </span>
          ) : (
            <span
              title="Bluetooth Disconnected"
              className="text-gray-400 text-lg"
            >
              ●
            </span>
          )}
        </button>
      </div> */}

      {showScanPopup && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/70">
          <div className="bg-mediumDarkGray rounded-xl shadow-xl p-6 min-w-[320px] max-w-md relative">
            <button
              className="absolute top-2 right-2 transition-colors duration-200 hover:opacity-70 text-lightGray"
              onClick={() => setShowScanPopup(false)}
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2
              className="text-lg font-semibold mb-4 text-limeGreen"
              
            >
              Scan for Bluetooth Devices
            </h2>
            <div className="space-y-3">
              <button
                className="w-full px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90 disabled:opacity-50 bg-limeGreen text-nearBlack font-bold text-xs"
                onClick={startScan}
                disabled={isScanning || bleIsConnected || bluetoothState !== "on"}
                style={{ fontFamily: "TCM" }}
              >
                {isScanning ? "Scanning..." : "Start Scan"}
              </button>
              <div className="text-xs mb-2 text-lightGray" style={{ fontFamily: "TCM" }}>
                {statusMessage}
              </div>
              {connectedDevice && !bleIsConnected && (
                <button
                  onClick={connectToDevice}
                  className="w-full px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90 bg-limeGreen text-nearBlack font-bold text-xs"
                  style={{ fontFamily: "TCM" }}
                >
                  Connect
                </button>
              )}
              {bleIsConnected && (
                <button
                  onClick={disconnect}
                  className="w-full px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90 bg-red text-white font-bold text-xs"
                  style={{ fontFamily: "TCM" }}
                >
                  Disconnect
                </button>
              )}
              <ul className="max-h-40 overflow-auto text-sm border border-darkerGray rounded-md p-2">
                {connectedDevice ? (
                  <li className="py-2 px-2 border-b border-darkerGray last:border-b-0 text-lightGray" style={{ fontFamily: "TCM" }}>
                    {connectedDevice.name ||
                      connectedDevice.id ||
                      "Unnamed Device"}
                  </li>
                ) : (
                  <li className="text-lightGray py-2 px-2" style={{ fontFamily: "TCM" }}>
                    No device discovered yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* OTA Firmware Update Modal */}
      {showOTAModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#CEECF8] rounded-lg shadow-lg p-4 min-w-[900px] min-h-[850px] relative flex flex-col">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowOTAModal(false)}
              title="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2">OTA Firmware Update</h2>
          </div>
        </div>
      )}

      {showFlutterFlashPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full h-full max-w-lg max-h-full md:w-[600px] md:h-[600px] bg-mediumDarkGray rounded-xl shadow-xl flex flex-col">
            {/* Close Button at Top Right Corner */}
            <div className="flex justify-end p-2 md:p-4 z-[201] bg-mediumDarkGray">
              <button
                onClick={() => setShowFlutterFlashPopup(false)}
                className="flex items-center justify-center w-8 h-8 text-lightGray hover:opacity-70 transition-opacity cursor-pointer"
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Firmware Updater Iframe */}
            <div className="firmware-container flex-grow overflow-hidden rounded-b-xl">
              <iframe
                ref={flutterIframeRef}
                src="/OTAFirmwareUpdate/xyz.html"
                title="Firmware Updater"
                allow="bluetooth *; web-bluetooth *"
                className="w-full h-full border-none"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {/* Firmware Update Success Toast */}
        {showFirmwareSuccess && (
          <div className="fixed top-6 right-6 z-[9999] bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 animate-fade-in">
            <span>✅ Firmware updated successfully!</span>
          </div>
        )}
        {activeTab === "simulator" ? (
          <Simulator
            onOpenScanPopup={openScanPopup}
            onFirmwareFlash={
              compiledBinaryBlob ? handleFlutterFlash : undefined
            }
            onShowCode={() => setActiveTab("code")}
            onShowSimulator={() => setActiveTab("simulator")}
            canFirmwareFlash={!!compiledBinaryBlob}
          />
        ) : (
          <div className="h-full flex flex-col bg-darkerGray">
            <div className="p-3 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={() => setActiveTab("simulator")}
                  className="px-2 py-1 text-white rounded text-xs transition-colors"
                >
                  {/* Back to Simulator */}
                  <GamepadsimulatorbtnBacktoSimulator text="SIMULATOR"/>
                </button>
                <div className="flex items-center space-x-2">
                  {/* <button
                    onClick={() => setActiveCode("arduino")}
                    className={`px-2 py-1 text-xs rounded`}
                  >
                    <GamepadsimulatorbtnBacktoSimulator text="ARDUINO"/>
                  </button> */}
                  {/* <button
                    onClick={() => setActiveCode("micropython")}
                    className={`px-2 py-1 text-xs rounded ${activeCode === "micropython"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                      }`}
                  >
                    Python
                  </button> */}

                  <button
                  onClick={() => setActiveCode("micropython")}
                    className={`px-2 py-1 text-xs rounded`}
                  >
                    <GamepadsimulatorbtnBacktoSimulator text="PYTHON"/>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {(activeCode === "arduino" || activeCode === "micropython") && (
                    <button
                      className="px-2 py-1 text-white rounded text-xs transition-colors"
                      onClick={handleCompile}
                      disabled={isCompiling}
                    >
                      {/* {isCompiling ? "Compiling..." : "Compile"} */}
                      <GamepadsimulatorbtnBacktoSimulator text={isCompiling ? "Compiling..." : "Compile"}/>
                    </button>
                  )}
                  <button
                    className="px-2 py-1 text-white rounded text-xs transition-colors"
                    onClick={handleCopyCode}
                  >
                    <GamepadsimulatorbtnBacktoSimulator text="COPY CODE"/>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                className="w-full flex-1 bg-[#CEECFA] text-gray-600 p-4 rounded font-mono text-sm resize-none"
                value={activeCode === "arduino" ? arduinoCode : micropythonCode}
                spellCheck={false}
              />
              {compileOutput && (
                <div className="mt-2 p-2 border rounded">
                  <h4 className="font-semibold text-sm mb-1 text-white">
                    Compiler Output:
                  </h4>
                  <pre
                    className={`w-full h-24 overflow-auto bg-[#CEECFA] p-2 rounded text-xs font-mono ${
                      compileSuccess === true
                        ? "text-[#CDECF8]"
                        : compileSuccess === false
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                  >
                    {compileOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RightPanel = () => (
  <BluetoothProvider>
    <RightPanelContent />
  </BluetoothProvider>
);

export default RightPanel;
