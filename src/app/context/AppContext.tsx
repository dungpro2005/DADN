import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Building, Machine, Schedule, MachineLog, ActivityLog } from '../types';

interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  buildings: Building[];
  machines: Machine[];
  schedules: Schedule[];
  logs: MachineLog[];
  activityLogs: ActivityLog[];
  addBuilding: (building: Omit<Building, 'id' | 'machineCount'>) => void;
  removeBuilding: (buildingId: string) => void;
  addMachine: (machine: Omit<Machine, 'id'>) => void;
  removeMachine: (machineId: string) => void;
  updateMachine: (machineId: string, updates: Partial<Machine>) => void;
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  getStatsForMachine: (machineId: string, startDate?: Date, endDate?: Date) => any;
  getStatsForBuilding: (buildingId: string, startDate?: Date, endDate?: Date) => any;
  logActivity: (action: string, target: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock users
const USERS: Record<string, { password: string; user: User }> = {
  employee: {
    password: 'em1',
    user: { username: 'employee', role: 'employee', name: 'Nhân viên' },
  },
  admin: {
    password: 'ad12',
    user: { username: 'admin', role: 'admin', name: 'Quản lý' },
  },
};

// Initial mock data
const INITIAL_BUILDINGS: Building[] = [
  { id: 'b1', name: 'Tòa nhà A', location: 'Khu vực 1', machineCount: 3 },
  { id: 'b2', name: 'Tòa nhà B', location: 'Khu vực 2', machineCount: 2 },
];

const INITIAL_MACHINES: Machine[] = [
  {
    id: 'm1',
    name: 'Máy sấy A1',
    buildingId: 'b1',
    isOn: true,
    isDoorOpen: false,
    currentTemp: 65,
    targetTempMin: 60,
    targetTempMax: 70,
    currentHumidity: 45,
    targetHumidityMin: 40,
    targetHumidityMax: 50,
    fanLevel: 3,
    mode: 'automatic',
    currentFruit: 'Xoài',
  },
  {
    id: 'm2',
    name: 'Máy sấy A2',
    buildingId: 'b1',
    isOn: true,
    isDoorOpen: false,
    currentTemp: 55,
    targetTempMin: 50,
    targetTempMax: 60,
    currentHumidity: 35,
    targetHumidityMin: 30,
    targetHumidityMax: 40,
    fanLevel: 2,
    mode: 'manual',
  },
  {
    id: 'm3',
    name: 'Máy sấy A3',
    buildingId: 'b1',
    isOn: false,
    isDoorOpen: true,
    currentTemp: 25,
    targetTempMin: 60,
    targetTempMax: 70,
    currentHumidity: 60,
    targetHumidityMin: 40,
    targetHumidityMax: 50,
    fanLevel: 0,
    mode: 'manual',
  },
  {
    id: 'm4',
    name: 'Máy sấy B1',
    buildingId: 'b2',
    isOn: true,
    isDoorOpen: false,
    currentTemp: 70,
    targetTempMin: 65,
    targetTempMax: 75,
    currentHumidity: 30,
    targetHumidityMin: 25,
    targetHumidityMax: 35,
    fanLevel: 4,
    mode: 'automatic',
    currentFruit: 'Chuối',
  },
  {
    id: 'm5',
    name: 'Máy sấy B2',
    buildingId: 'b2',
    isOn: true,
    isDoorOpen: false,
    currentTemp: 58,
    targetTempMin: 55,
    targetTempMax: 65,
    currentHumidity: 42,
    targetHumidityMin: 35,
    targetHumidityMax: 45,
    fanLevel: 3,
    mode: 'manual',
  },
];

const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 's1',
    name: 'Lịch sấy xoài',
    fruitType: 'Xoài',
    duration: 480, // 8 hours
    steps: [
      {
        id: 'step1',
        order: 1,
        duration: 120,
        tempMin: 50,
        tempMax: 60,
        humidityMin: 50,
        humidityMax: 60,
        fanLevel: 2,
        doorOpen: false,
      },
      {
        id: 'step2',
        order: 2,
        duration: 180,
        tempMin: 60,
        tempMax: 70,
        humidityMin: 40,
        humidityMax: 50,
        fanLevel: 3,
        doorOpen: false,
      },
      {
        id: 'step3',
        order: 3,
        duration: 180,
        tempMin: 65,
        tempMax: 75,
        humidityMin: 30,
        humidityMax: 40,
        fanLevel: 4,
        doorOpen: false,
      },
    ],
  },
  {
    id: 's2',
    name: 'Lịch sấy chuối',
    fruitType: 'Chuối',
    duration: 360,
    steps: [
      {
        id: 'step1',
        order: 1,
        duration: 120,
        tempMin: 55,
        tempMax: 65,
        humidityMin: 45,
        humidityMax: 55,
        fanLevel: 2,
        doorOpen: false,
      },
      {
        id: 'step2',
        order: 2,
        duration: 240,
        tempMin: 65,
        tempMax: 75,
        humidityMin: 25,
        humidityMax: 35,
        fanLevel: 4,
        doorOpen: false,
      },
    ],
  },
];

// Generate mock logs
const generateMockLogs = (machines: Machine[]): MachineLog[] => {
  const logs: MachineLog[] = [];
  const now = new Date();

  machines.forEach((machine) => {
    // Generate logs for the past 7 days, every 30 minutes
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timestamp = new Date(now);
          timestamp.setDate(timestamp.getDate() - day);
          timestamp.setHours(hour, minute, 0, 0);

          logs.push({
            id: `log-${machine.id}-${day}-${hour}-${minute}`,
            machineId: machine.id,
            buildingId: machine.buildingId,
            timestamp,
            temp: machine.currentTemp + (Math.random() - 0.5) * 10,
            humidity: machine.currentHumidity + (Math.random() - 0.5) * 10,
            fanLevel: machine.fanLevel,
            isOn: machine.isOn,
            isDoorOpen: machine.isDoorOpen,
            mode: machine.mode,
          });
        }
      }
    }
  });

  return logs;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [logs, setLogs] = useState<MachineLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedBuildings = localStorage.getItem('buildings');
    const savedMachines = localStorage.getItem('machines');
    const savedSchedules = localStorage.getItem('schedules');
    const savedUser = localStorage.getItem('user');
    const savedActivityLogs = localStorage.getItem('activityLogs');

    setBuildings(savedBuildings ? JSON.parse(savedBuildings) : INITIAL_BUILDINGS);
    setMachines(savedMachines ? JSON.parse(savedMachines) : INITIAL_MACHINES);
    setActivityLogs(savedActivityLogs ? JSON.parse(savedActivityLogs) : []);
    setSchedules(savedSchedules ? JSON.parse(savedSchedules) : INITIAL_SCHEDULES);
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Generate logs when machines change
  useEffect(() => {
    if (machines.length > 0) {
      setLogs(generateMockLogs(machines));
    }
  }, [machines]);

  // Save data to localStorage
  useEffect(() => {
    if (buildings.length > 0) {
      localStorage.setItem('buildings', JSON.stringify(buildings));
    }
  }, [buildings]);

  useEffect(() => {
    if (machines.length > 0) {
      localStorage.setItem('machines', JSON.stringify(machines));
    }
  }, [machines]);

  useEffect(() => {
    if (schedules.length > 0) {
      localStorage.setItem('schedules', JSON.stringify(schedules));
    }
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const logActivity = (action: string, target: string, details: string) => {
    if (!user) return;
    
    const newLog: ActivityLog = {
      id: `activity-${Date.now()}`,
      timestamp: new Date(),
      user: user.name,
      userRole: user.role,
      action,
      target,
      details,
    };
    
    setActivityLogs([newLog, ...activityLogs]);
  };

  const login = (username: string, password: string): boolean => {
    const userRecord = USERS[username];
    if (userRecord && userRecord.password === password) {
      setUser(userRecord.user);
      localStorage.setItem('user', JSON.stringify(userRecord.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const addBuilding = (building: Omit<Building, 'id' | 'machineCount'>) => {
    const newBuilding: Building = {
      ...building,
      id: `b${Date.now()}`,
      machineCount: 0,
    };
    setBuildings([...buildings, newBuilding]);
    logActivity('Thêm tòa nhà', newBuilding.name, `Tòa nhà mới tại ${building.location}`);
  };

  const removeBuilding = (buildingId: string) => {
    const building = buildings.find((b) => b.id === buildingId);
    setBuildings(buildings.filter((b) => b.id !== buildingId));
    setMachines(machines.filter((m) => m.buildingId !== buildingId));
    if (building) {
      logActivity('Xóa tòa nhà', building.name, `Đã xóa tòa nhà ${building.name}`);
    }
  };

  const addMachine = (machine: Omit<Machine, 'id'>) => {
    const newMachine: Machine = {
      ...machine,
      id: `m${Date.now()}`,
    };
    setMachines([...machines, newMachine]);
    
    // Update building machine count
    setBuildings(
      buildings.map((b) =>
        b.id === machine.buildingId
          ? { ...b, machineCount: b.machineCount + 1 }
          : b
      )
    );
    
    const building = buildings.find((b) => b.id === machine.buildingId);
    logActivity('Thêm máy sấy', newMachine.name, `Thêm máy mới vào ${building?.name || 'tòa nhà'}`);
  };

  const removeMachine = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    if (machine) {
      setMachines(machines.filter((m) => m.id !== machineId));
      
      // Update building machine count
      setBuildings(
        buildings.map((b) =>
          b.id === machine.buildingId
            ? { ...b, machineCount: Math.max(0, b.machineCount - 1) }
            : b
        )
      );
      
      logActivity('Xóa máy sấy', machine.name, `Đã xóa máy sấy ${machine.name}`);
    }
  };

  const updateMachine = (machineId: string, updates: Partial<Machine>) => {
    const machine = machines.find((m) => m.id === machineId);
    setMachines(
      machines.map((m) => (m.id === machineId ? { ...m, ...updates } : m))
    );
    
    if (machine) {
      let details = '';
      if (updates.isOn !== undefined) {
        details = updates.isOn ? 'Bật máy' : 'Tắt máy';
      } else if (updates.isDoorOpen !== undefined) {
        details = updates.isDoorOpen ? 'Mở cửa' : 'Đóng cửa';
      } else if (updates.fanLevel !== undefined) {
        details = `Đặt quạt mức ${updates.fanLevel}`;
      } else if (updates.mode !== undefined) {
        details = `Chuyển sang chế độ ${updates.mode === 'automatic' ? 'tự động' : 'thủ công'}`;
      } else if (updates.targetTempMin !== undefined || updates.targetTempMax !== undefined) {
        details = `Cập nhật ngưỡng nhiệt độ`;
      } else if (updates.targetHumidityMin !== undefined || updates.targetHumidityMax !== undefined) {
        details = `Cập nhật ngưỡng độ ẩm`;
      } else {
        details = 'Cập nhật cấu hình';
      }
      
      logActivity('Điều khiển máy sấy', machine.name, details);
    }
  };

  const addSchedule = (schedule: Omit<Schedule, 'id'>) => {
    const newSchedule: Schedule = {
      ...schedule,
      id: `s${Date.now()}`,
    };
    setSchedules([...schedules, newSchedule]);
    logActivity('Thêm lịch trình', newSchedule.name, `Lịch sấy ${newSchedule.fruitType} - ${newSchedule.duration} phút`);
  };

  const getStatsForMachine = (
    machineId: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    let filteredLogs = logs.filter((log) => log.machineId === machineId);

    if (startDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) >= startDate
      );
    }
    if (endDate) {
      filteredLogs = filteredLogs.filter(
        (log) => new Date(log.timestamp) <= endDate
      );
    }

    if (filteredLogs.length === 0) return null;

    const avgTemp =
      filteredLogs.reduce((sum, log) => sum + log.temp, 0) / filteredLogs.length;
    const avgHumidity =
      filteredLogs.reduce((sum, log) => sum + log.humidity, 0) /
      filteredLogs.length;
    const uptime =
      (filteredLogs.filter((log) => log.isOn).length / filteredLogs.length) * 100;

    return {
      avgTemp: Math.round(avgTemp * 10) / 10,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      uptime: Math.round(uptime * 10) / 10,
      logs: filteredLogs,
    };
  };

  const getStatsForBuilding = (
    buildingId: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    const buildingMachines = machines.filter((m) => m.buildingId === buildingId);
    const stats = buildingMachines.map((m) =>
      getStatsForMachine(m.id, startDate, endDate)
    );

    return {
      machines: buildingMachines,
      stats,
    };
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        buildings,
        machines,
        schedules,
        logs,
        activityLogs,
        addBuilding,
        removeBuilding,
        addMachine,
        removeMachine,
        updateMachine,
        addSchedule,
        getStatsForMachine,
        getStatsForBuilding,
        logActivity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
