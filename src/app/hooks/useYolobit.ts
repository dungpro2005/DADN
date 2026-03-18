import { useState, useEffect, useCallback } from 'react';

interface SensorData {
  temp: number;
  humidity: number;
  fan: number;
  heater?: number;
  humidifier?: number;
  door_open?: boolean;
  power_on?: boolean;
}

interface YolobitState {
  isConnected: boolean;
  sensorData: SensorData | null;
  port: SerialPort | null;
  reader?: ReadableStreamDefaultReader | null;
}

let readerRef: ReadableStreamDefaultReader | null = null;
let isReadingRef = false;

export const useYolobit = () => {
  const [state, setState] = useState<YolobitState>({
    isConnected: false,
    sensorData: null,
    port: null,
    reader: null,
  });

  const connect = useCallback(async () => {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported');
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      const reader = port.readable?.getReader();
      readerRef = reader || null;
      isReadingRef = true;

      setState(prev => ({ ...prev, port, isConnected: true, reader }));

      // Start reading data (don't await, let it run in background)
      if (reader) {
        readData(reader);
      }
    } catch (error) {
      console.error('Failed to connect to Yolobit:', error);
      isReadingRef = false;
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      // Stop reading loop
      isReadingRef = false;

      // Release reader lock if exists
      if (readerRef) {
        try {
          readerRef.cancel();
          readerRef.releaseLock();
        } catch (e) {
          console.log('Reader already released:', e);
        }
        readerRef = null;
      }

      // Close port
      if (state.port) {
        try {
          await state.port.close();
        } catch (e) {
          console.log('Port already closed:', e);
        }
      }

      setState({ isConnected: false, sensorData: null, port: null, reader: null });
    } catch (error) {
      console.error('Error during disconnect:', error);
      setState({ isConnected: false, sensorData: null, port: null, reader: null });
    }
  }, [state.port]);

  const sendCommand = useCallback(async (command: any) => {
    if (!state.port || !state.isConnected) return;

    const writer = state.port.writable?.getWriter();
    if (writer) {
      const data = JSON.stringify(command) + '\n';
      await writer.write(new TextEncoder().encode(data));
      writer.releaseLock();
    }
  }, [state.port, state.isConnected]);

  const readData = async (reader: ReadableStreamDefaultReader) => {
    try {
      while (isReadingRef) {
        const { value, done } = await reader.read();
        if (done || !isReadingRef) break;

        const data = new TextDecoder().decode(value);
        const lines = data.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsedData = JSON.parse(line.trim());
              // Check if this is a command response
              if (parsedData.status === 'configured') {
                console.log('Device configuration updated:', parsedData.config);
                continue;
              }
              // Otherwise, treat as sensor data
              setState(prev => ({ ...prev, sensorData: parsedData }));
            } catch (e) {
              console.log('Invalid JSON:', line);
            }
          }
        }
      }
    } catch (error) {
      if (isReadingRef) {
        console.error('Error reading data:', error);
      }
    } finally {
      isReadingRef = false;
      try {
        reader.releaseLock();
      } catch (e) {
        console.log('Reader lock already released');
      }
    }
  };

  useEffect(() => {
    return () => {
      isReadingRef = false;
      if (readerRef) {
        try {
          readerRef.cancel();
          readerRef.releaseLock();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (state.port) {
        state.port.close().catch(() => {
          // Ignore close errors
        });
      }
    };
  }, [state.port]);

  return {
    ...state,
    connect,
    disconnect,
    sendCommand,
  };
};