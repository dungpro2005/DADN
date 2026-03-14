import { useState, useEffect, useCallback } from 'react';

interface SensorData {
  temp: number;
  humidity: number;
  fan: number;
  door_open?: boolean;
  power_on?: boolean;
}

interface YolobitState {
  isConnected: boolean;
  sensorData: SensorData | null;
  port: SerialPort | null;
}

export const useYolobit = () => {
  const [state, setState] = useState<YolobitState>({
    isConnected: false,
    sensorData: null,
    port: null,
  });

  const connect = useCallback(async () => {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported');
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      setState(prev => ({ ...prev, port, isConnected: true }));

      // Start reading data
      const reader = port.readable?.getReader();
      if (reader) {
        readData(reader);
      }
    } catch (error) {
      console.error('Failed to connect to Yolobit:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (state.port) {
      await state.port.close();
      setState({ isConnected: false, sensorData: null, port: null });
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
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

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
      console.error('Error reading data:', error);
    } finally {
      reader.releaseLock();
    }
  };

  useEffect(() => {
    return () => {
      if (state.port) {
        state.port.close();
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