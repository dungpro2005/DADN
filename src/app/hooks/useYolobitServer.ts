import { useState, useEffect, useCallback, useRef } from 'react';

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
}

export const useYolobitServer = (serverUrl: string = 'ws://localhost:3001') => {
  const [state, setState] = useState<YolobitState>({
    isConnected: false,
    sensorData: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(async () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('Already connected');
        return;
      }

      const ws = new WebSocket(serverUrl);

      ws.onopen = () => {
        console.log('✓ Connected to Yolobit server');
        setState(prev => ({ ...prev, isConnected: true }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'sensor_data') {
            setState(prev => ({
              ...prev,
              sensorData: message.data
            }));
          } else if (message.type === 'connection_status') {
            setState(prev => ({
              ...prev,
              isConnected: message.connected
            }));
          } else if (message.type === 'initial_data') {
            setState(prev => ({
              ...prev,
              isConnected: message.connected,
              sensorData: message.sensorData
            }));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, isConnected: false }));
      };

      ws.onclose = () => {
        console.log('✗ Disconnected from server');
        setState(prev => ({ ...prev, isConnected: false }));

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect:', error);
      setState(prev => ({ ...prev, isConnected: false }));
    }
  }, [serverUrl]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState({ isConnected: false, sensorData: null });
  }, []);

  const sendCommand = useCallback(async (command: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify(command));
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  }, []);

  const setFan = useCallback((level: number) => {
    return sendCommand({ command: 'set_fan', level });
  }, [sendCommand]);

  const setPower = useCallback((state: boolean) => {
    return sendCommand({ command: 'set_power', state });
  }, [sendCommand]);

  const setHeater = useCallback((level: number) => {
    return sendCommand({ command: 'set_heater', level });
  }, [sendCommand]);

  const setHumidifier = useCallback((level: number) => {
    return sendCommand({ command: 'set_humidifier', level });
  }, [sendCommand]);

  const configureDevices = useCallback((config: any) => {
    return sendCommand({ command: 'configure_devices', config });
  }, [sendCommand]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendCommand,
    setFan,
    setPower,
    setHeater,
    setHumidifier,
    configureDevices
  };
};
