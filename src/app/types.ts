// Types for the Fruit Dryer Management System

export type UserRole = 'employee' | 'admin';

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

export interface Machine {
  id: string;
  name: string;
  buildingId: string;
  isOn: boolean;
  isDoorOpen: boolean;
  currentTemp: number;
  targetTempMin: number;
  targetTempMax: number;
  currentHumidity: number;
  targetHumidityMin: number;
  targetHumidityMax: number;
  fanLevel: 0 | 1 | 2 | 3 | 4 | 5; // 0 = off, 1-5 = speed levels
  mode: 'manual' | 'automatic';
  currentFruit?: string;
  scheduleId?: string;
}

export interface Building {
  id: string;
  name: string;
  location: string;
  machineCount: number;
}

export interface Schedule {
  id: string;
  name: string;
  fruitType: string;
  steps: ScheduleStep[];
  duration: number; // total minutes
}

export interface ScheduleStep {
  id: string;
  order: number;
  duration: number; // minutes
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  fanLevel: 1 | 2 | 3 | 4 | 5;
  doorOpen: boolean;
}

export interface MachineLog {
  id: string;
  machineId: string;
  buildingId: string;
  timestamp: Date;
  temp: number;
  humidity: number;
  fanLevel: number;
  isOn: boolean;
  isDoorOpen: boolean;
  mode: 'manual' | 'automatic';
}

export interface Stats {
  machineId: string;
  buildingId: string;
  avgTemp: number;
  avgHumidity: number;
  uptime: number; // percentage
  totalHours: number;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  user: string;
  userRole: UserRole;
  action: string;
  target: string;
  details: string;
}
