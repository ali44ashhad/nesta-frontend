// serial.js - Web Serial API wrapper for ESP32 communication
// This provides USB Serial functionality for Flutter Web

class ESP32Serial {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.readableStreamClosed = null;
    this.writableStreamClosed = null;
    this.onDataReceived = null;
    this.onConnectionChange = null;
    this.isReading = false;
    console.log('🔧 ESP32Serial initialized');
  }

  isSupported() {
    const supported = 'serial' in navigator;
    if (!supported) {
      console.warn('⚠️ Web Serial API not available. Use Chrome/Edge browser.');
    }
    return supported;
  }

  async connect(baudRate = 921600) {
    console.log('🔌 Attempting to connect with baud rate:', baudRate);

    if (!this.isSupported()) {
      console.error('❌ Web Serial API not supported');
      return false;
    }

    try {
      console.log('📋 Requesting port selection...');
      this.port = await navigator.serial.requestPort();
      console.log('✅ Port selected:', this.port);

      console.log('🔓 Opening port...');
      await this.port.open({
        baudRate: baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });
      console.log('✅ Port opened successfully');

      // Setup streams
      console.log('📡 Setting up data streams...');
      const textDecoder = new TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      // CRITICAL FIX: Setup writer for BINARY data (no text encoding)
      // TextEncoderStream corrupts binary firmware data!
      this.writer = this.port.writable.getWriter();  // ✅ Binary-capable writer
      console.log('✅ Streams configured (BINARY mode)');
      console.log('🔍 Reader:', this.reader);
      console.log('🔍 Writer:', this.writer);

      // Start reading (don't await - let it run in background)
      console.log('🚀 About to start reading...');
      this.startReading().catch(err => {
        console.error('❌ CRITICAL: Reader crashed:', err);
      });
      console.log('✅ Connected to ESP32');

      if (this.onConnectionChange) {
        this.onConnectionChange(true);
      }

      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.name, error.message);
      console.error('Full error:', error);

      if (error.name === 'NotFoundError') {
        console.error('💡 No device was selected');
      } else if (error.name === 'SecurityError') {
        console.error('💡 Permission denied. Try using HTTPS or localhost');
      } else if (error.name === 'NetworkError') {
        console.error('💡 Device is busy. Close other programs using this port');
      }

      if (this.onConnectionChange) {
        this.onConnectionChange(false);
      }
      return false;
    }
  }

  async startReading() {
    this.isReading = true;

    try {
      while (this.isReading) {
        const { value, done } = await this.reader.read();
        if (done) {
          break;
        }
        if (value && value.includes('USB_S')) {
          console.log('📥 Received:', value);
          if (this.onDataReceived) {
            this.onDataReceived(value);
          } else {
          }
        } else {
        }
      }
    } catch (error) {
      console.error('❌ Reading error:', error);
      console.error('❌ Error name:', error.name);  // DEBUG
      console.error('❌ Error message:', error.message);  // DEBUG
      if (this.isReading) {
        // Only report error if we're still supposed to be reading
        console.error('Unexpected reading error:', error);
      }
    }
    console.log('🛑 Reader loop ended');  // DEBUG
  }

  async send(data) {
    if (!this.writer) {
      console.error('❌ Cannot send: Not connected');
      return false;
    }

    try {
      if (!data.endsWith('\n')) {
        data += '\n';
      }
      console.log('📤 Sending:', data.trim());

      // Manually encode text to Uint8Array (since we removed TextEncoderStream)
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(data);
      await this.writer.ready;
      await this.writer.write(uint8Array);

      console.log('✅ Sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Send error:', error);
      return false;
    }
  }

  async sendBinary(dataArray) {
    if (!this.writer) {
      console.error('❌ Cannot send: Not connected');
      return false;
    }

    try {

      // Convert to Uint8Array if needed
      const uint8Array = new Uint8Array(dataArray);

      // Write raw binary directly (no text encoding!)
      await this.writer.ready;
      await this.writer.write(uint8Array);

      return true;
    } catch (error) {
      console.error('❌ Send binary error:', error);
      return false;
    }
  }

  async disconnect() {
    console.log('🔌 Disconnecting...');
    this.isReading = false;

    try {
      if (this.reader) {
        await this.reader.cancel();
        await this.readableStreamClosed.catch(() => { });
        this.reader = null;
      }

      if (this.writer) {
        // FIX: Use releaseLock() instead of close() for direct writer
        await this.writer.releaseLock();
        this.writer = null;
      }

      if (this.port) {
        await this.port.close();
        this.port = null;
      }

      console.log('✅ Disconnected from ESP32');

      if (this.onConnectionChange) {
        this.onConnectionChange(false);
      }

      return true;
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      return false;
    }
  }

  isConnected() {
    const connected = this.port !== null && this.writer !== null;
    return connected;
  }

  setDataCallback(callback) {
    this.onDataReceived = callback;
  }

  setConnectionCallback(callback) {
    console.log('📝 Connection callback registered');
    this.onConnectionChange = callback;
  }

  async sendPing() {
    console.log('🏓 Sending PING command');
    return await this.send('USB_OTA_PING');
  }

  async sendStatus() {
    console.log('📊 Sending STATUS command');
    return await this.send('USB_OTA_STATUS');
  }
}

// Initialize
console.log('🚀 Loading ESP32 Serial API...');
window.esp32Serial = new ESP32Serial();

// Flutter-callable functions
window.esp32Connect = async function (baudRate) {
  console.log('🎯 esp32Connect called with baudRate:', baudRate);
  try {
    const success = await window.esp32Serial.connect(baudRate || 921600);
    console.log('✅ Connected:', success);
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
};

window.esp32Send = async function (data) {
  console.log('🎯 esp32Send called with data:', data);
  return await window.esp32Serial.send(data);
};

window.esp32SendBinary = async function (dataArray) {
  return await window.esp32Serial.sendBinary(dataArray);
};

window.esp32Disconnect = async function () {
  console.log('🎯 esp32Disconnect called');
  return await window.esp32Serial.disconnect();
};

window.esp32IsConnected = function () {
  return window.esp32Serial.isConnected();
};

window.esp32IsSupported = function () {
  return window.esp32Serial.isSupported();
};

window.esp32SendPing = async function () {
  console.log('🎯 esp32SendPing called');
  return await window.esp32Serial.sendPing();
};

window.esp32SendStatus = async function () {
  console.log('🎯 esp32SendStatus called');
  return await window.esp32Serial.sendStatus();
};

window.esp32SetDataCallback = function (callback) {
  console.log('🎯 esp32SetDataCallback called');
  window.esp32Serial.setDataCallback(function (data) {
    try {
      callback(data);
    } catch (e) {
      console.error('❌ Error in Flutter callback:', e);
    }
  });
};

window.esp32SetConnectionCallback = function (callback) {
  console.log('🎯 esp32SetConnectionCallback called');
  window.esp32Serial.setConnectionCallback(function (connected) {
    console.log('🔔 Calling Flutter connection callback:', connected);
    try {
      callback(connected);
    } catch (e) {
      console.error('❌ Error in Flutter connection callback:', e);
    }
  });
};

console.log('✅ ESP32 Serial API loaded successfully');
console.log('💡 Open browser console (F12) to see debug logs');
console.log('💡 Make sure you are using Chrome or Edge browser for Web Serial API support');

