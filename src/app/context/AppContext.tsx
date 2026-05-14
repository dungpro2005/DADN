import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Building, Machine, Schedule, MachineLog, ActivityLog } from '../types';

interface AppContextType {
  user: User | null;
  users: Record<
    string,
    {
      password: string;
      user: User;
    }
  >;
  login: (usernameOrEmail: string, password: string) => boolean;
  logout: () => void;
  requestOTP: (email: string) => Promise<{ success: boolean; error?: string; debug_otp?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  addUser: (user: User, password: string) => boolean;
  updateUser: (
    username: string,
    updates: Partial<User> & { password?: string }
  ) => boolean;
  removeUser: (username: string) => boolean;
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
  updateSchedule: (scheduleId: string, updates: Partial<Schedule>) => void;
  getStatsForMachine: (machineId: string, startDate?: Date, endDate?: Date) => any;
  getStatsForBuilding: (buildingId: string, startDate?: Date, endDate?: Date) => any;
  logActivity: (action: string, target: string, details: string) => void;
  liveDataMachineId: string | null;
  setLiveDataMachineId: (machineId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const API_BASE = 'http://localhost:8000/api';

// Mock users (stored by username)
const DEFAULT_USERS: Record<
  string,
  {
    password: string;
    user: User;
  }
> = {
  employee: {
    password: 'em1',
    user: {
      username: 'employee',
      role: 'employee',
      name: 'Nhân viên',
      firstName: 'Nhân',
      lastName: 'viên',
      email: 'employee@example.com',
      phoneNumber: '0123456789',
    },
  },
  admin: {
    password: 'ad12',
    user: {
      username: 'admin',
      role: 'admin',
      name: 'Quản lý',
      firstName: 'Quản',
      lastName: 'lý',
      email: 'admin@example.com',
      phoneNumber: '0987654321',
    },
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
    heaterLevel: 2,
    humidifierLevel: 1,
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
    heaterLevel: 1,
    humidifierLevel: 0,
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
    heaterLevel: 0,
    humidifierLevel: 0,
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
    fanLevel: 3,
    heaterLevel: 3,
    humidifierLevel: 0,
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
    heaterLevel: 1,
    humidifierLevel: 1,
    mode: 'manual',
  },
];

const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 's1',
    name: 'Lịch sấy xoài',
    fruitType: 'Xoài',
    duration: 480, // 8 hours
    targetTempMin: 50,
    targetTempMax: 60,
    targetHumidityMin: 40,
    targetHumidityMax: 50,
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
        fanLevel: 3,
        doorOpen: false,
      },
    ],
  },
  {
    id: 's2',
    name: 'Lịch sấy chuối',
    fruitType: 'Chuối',
    duration: 360,
    targetTempMin: 55,
    targetTempMax: 65,
    targetHumidityMin: 45,
    targetHumidityMax: 55,
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
        fanLevel: 3,
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
  const [users, setUsers] = useState<typeof DEFAULT_USERS>(DEFAULT_USERS);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [logs, setLogs] = useState<MachineLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [liveDataMachineId, setLiveDataMachineId] = useState<string | null>(null);
  const liveDataMachineIdRef = useRef<string | null>(null);

  // Keep ref in sync with state for use inside WebSocket closure
  useEffect(() => {
    liveDataMachineIdRef.current = liveDataMachineId;
  }, [liveDataMachineId]);

  const wsRef = useRef<WebSocket | null>(null);

  // Fetch data from backend API
  const fetchDataFromAPI = async () => {
    try {
      const [machinesRes, logsRes, usersRes, schedulesRes] = await Promise.all([
        fetch(`${API_BASE}/machines`),
        fetch(`${API_BASE}/logs`),
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/schedules`)
      ]);

      // Fetch machines and convert to frontend format
      if (machinesRes.ok) {
        const machinesData = await machinesRes.json();
        // Map backend machine format to frontend format
        const convertedMachines: Machine[] = machinesData.map((m: any) => ({
          id: m.id,
          name: m.name,
          buildingId: m.buildingId,
          isOn: m.isOn === 1 || m.isOn === true,
          isDoorOpen: m.isDoorOpen === 1 || m.isDoorOpen === true,
          currentTemp: m.currentTemp || 0,
          targetTempMin: m.targetTempMin || 60,
          targetTempMax: m.targetTempMax || 70,
          currentHumidity: m.currentHumidity || 0,
          targetHumidityMin: m.targetHumidityMin || 40,
          targetHumidityMax: m.targetHumidityMax || 50,
          fanLevel: (m.fanLevel || 0) as 0 | 1 | 2 | 3,
          heaterLevel: 0 as 0 | 1 | 2 | 3,
          humidifierLevel: 0 as 0 | 1,
          mode: (m.mode || 'manual') as 'automatic' | 'manual',
          currentFruit: m.currentFruit,
        }));
        setMachines(convertedMachines);

        // Build buildings list from machines
        const buildingMap = new Map<string, Building>();
        convertedMachines.forEach(machine => {
          if (!buildingMap.has(machine.buildingId)) {
            buildingMap.set(machine.buildingId, {
              id: machine.buildingId,
              name: `Tòa ${machine.buildingId}`,
              location: `Khu vực ${machine.buildingId}`,
              machineCount: 0,
            });
          }
          const building = buildingMap.get(machine.buildingId)!;
          building.machineCount++;
        });
        setBuildings(Array.from(buildingMap.values()));
      }

      // Fetch logs
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        // Map backend log format to frontend format
        const convertedLogs: MachineLog[] = logsData.map((log: any) => ({
          id: `log-${Math.random()}`,
          machineId: log.zone || '1',
          buildingId: log.zone || '1',
          timestamp: new Date(log.time),
          temp: log.temp || 0,
          humidity: log.humi || 0,
          fanLevel: 3,
          isOn: true,
          isDoorOpen: false,
          mode: 'automatic' as const,
        }));
        setLogs(convertedLogs);
      }

      // Fetch users
      if (usersRes.ok) {
        const backendUsers = await usersRes.json();
        setUsers(prevUsers => {
          const updatedUsers = { ...prevUsers };
          backendUsers.forEach((u: User) => {
            // Only set placeholder if user doesn't exist or already has placeholder
            // This prevents overwriting 'ad12' or 'em1' if they were added via DEFAULT_USERS
            if (!updatedUsers[u.username] || updatedUsers[u.username].password === '***') {
              updatedUsers[u.username] = { user: u, password: '***' };
            } else {
              // Update user info but keep existing password
              updatedUsers[u.username].user = u;
            }
          });
          return updatedUsers;
        });
      }

      // Fetch schedules
      if (schedulesRes.ok) {
        const backendSchedules = await schedulesRes.json();
        // Map backend schedules to include required frontend fields
        const mappedSchedules = backendSchedules.map((s: any) => ({
          ...s,
          targetTempMin: s.targetTempMin || 50,
          targetTempMax: s.targetTempMax || 60,
          targetHumidityMin: s.targetHumidityMin || 40,
          targetHumidityMax: s.targetHumidityMax || 50,
          steps: s.steps || [
            {
              id: 'step1',
              order: 1,
              duration: s.duration || 120,
              tempMin: s.targetTempMin || 50,
              tempMax: s.targetTempMax || 60,
              humidityMin: s.targetHumidityMin || 40,
              humidityMax: s.targetHumidityMax || 50,
              fanLevel: 2,
              doorOpen: false,
            }
          ]
        }));
        setSchedules(mappedSchedules);
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
      // Fallback to localStorage or initial data
      const savedBuildings = localStorage.getItem('buildings');
      const savedMachines = localStorage.getItem('machines');
      const savedSchedules = localStorage.getItem('schedules');
      const savedActivityLogs = localStorage.getItem('activityLogs');

      setBuildings(savedBuildings ? JSON.parse(savedBuildings) : INITIAL_BUILDINGS);
      setMachines(savedMachines ? JSON.parse(savedMachines) : INITIAL_MACHINES);
      setActivityLogs(savedActivityLogs ? JSON.parse(savedActivityLogs) : []);
      setSchedules(savedSchedules ? JSON.parse(savedSchedules) : INITIAL_SCHEDULES);
    }
  };

  // Connect to WebSocket for real-time updates
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8000');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✓ Connected to backend WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'telemetry_update' && message.data) {
            const telemetry = message.data;
            const machineId = telemetry.zone_id ? telemetry.zone_id.toString() : '1';

            // Update machine by zone_id (from sensor)
            // Also update liveDataMachineId machine if different
            setMachines(prevMachines =>
              prevMachines.map(machine => {
                const isZoneMachine = machine.id === machineId;
                const isLiveMachine =
                  liveDataMachineIdRef.current !== null &&
                  liveDataMachineIdRef.current !== machineId &&
                  machine.id === liveDataMachineIdRef.current;

                if (isZoneMachine || isLiveMachine) {
                  return {
                    ...machine,
                    currentTemp: telemetry.temperature ?? machine.currentTemp,
                    currentHumidity: telemetry.humidity ?? machine.currentHumidity,
                    isDoorOpen: telemetry.isDoorOpen ?? false,
                    fanLevel: (telemetry.fan_level ?? machine.fanLevel) as 0 | 1 | 2 | 3,
                  };
                }
                return machine;
              })
            );

            // Add to logs
            const newLog: MachineLog = {
              id: telemetry.id || `log-${Date.now()}`,
              machineId: machineId,
              buildingId: telemetry.zone_id ? telemetry.zone_id.toString() : '1',
              timestamp: new Date(telemetry.timestamp || new Date()),
              temp: telemetry.temperature || 0,
              humidity: telemetry.humidity || 0,
              fanLevel: telemetry.fan_level || 0,
              isOn: true,
              isDoorOpen: telemetry.isDoorOpen || false,
              mode: 'automatic'
            };
            setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 999)]);
          } else if (message.type === 'initial_data' && message.data) {
            // Handle initial data on connection
            console.log('Received initial telemetry data from backend');
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('✗ WebSocket disconnected, reconnecting in 5 seconds...');
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  // Load data from API and localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    const savedUser = localStorage.getItem('user');
    const savedSchedules = localStorage.getItem('schedules');

    // Merge saved users with DEFAULT_USERS to ensure defaults are always available
    const parsedSavedUsers = savedUsers ? JSON.parse(savedUsers) : {};
    setUsers({ ...DEFAULT_USERS, ...parsedSavedUsers });
    setSchedules(savedSchedules ? JSON.parse(savedSchedules) : INITIAL_SCHEDULES);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Fetch data from backend
    fetchDataFromAPI();

    // Connect WebSocket
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

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

  // Persist user store (passwords) so reset password stays across reloads
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

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

  const login = (usernameOrEmail: string, password: string): boolean => {
    // Support login by username or email
    const userRecord =
      users[usernameOrEmail] ||
      Object.values(users).find((entry) => entry.user.email === usernameOrEmail);

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

  const requestOTP = async (email: string): Promise<{ success: boolean; error?: string; debug_otp?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error, debug_otp: data.debug_otp };
      }
    } catch (error) {
      return { success: false, error: 'Không thể kết nối tới máy chủ' };
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Không thể kết nối tới máy chủ' };
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    const entry = Object.entries(users).find(
      ([, u]) => u.user.email === email
    );

    if (!entry) return false;

    try {
      // Sync with backend
      const response = await fetch(`${API_BASE}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.ok) {
        const [username, existing] = entry;
        const updatedUsers = {
          ...users,
          [username]: {
            ...existing,
            password: newPassword,
          },
        };

        setUsers(updatedUsers);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Lỗi resetPassword:', error);
      return false;
    }
  };

  const addUser = (userToAdd: User, password: string): boolean => {
    const username = userToAdd.username.trim();
    if (!username) return false;

    // Ensure unique username and email
    if (users[username]) return false;
    if (
      Object.values(users).some(
        (entry) => entry.user.email && entry.user.email === userToAdd.email
      )
    ) {
      return false;
    }

    // First sync with backend
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userToAdd, username })
    }).catch(err => console.error('Lỗi đồng bộ addUser:', err));

    setUsers({
      ...users,
      [username]: {
        password,
        user: {
          ...userToAdd,
          username,
          name: `${userToAdd.firstName} ${userToAdd.lastName}`.trim(),
        },
      },
    });

    logActivity('Thêm tài khoản', username, `Tạo tài khoản ${userToAdd.name}`);
    return true;
  };

  const updateUser = (
    username: string,
    updates: Partial<User> & { password?: string }
  ): boolean => {
    const existing = users[username];
    if (!existing) return false;

    // If email is changing, ensure uniqueness
    if (
      updates.email &&
      Object.values(users).some(
        (entry) => entry.user.email === updates.email && entry.user.username !== username
      )
    ) {
      return false;
    }

    // Sync with backend
    fetch(`${API_BASE}/users/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.error('Lỗi đồng bộ updateUser:', err));

    const updatedUser: User = {
      ...existing.user,
      ...updates,
      name: updates.firstName && updates.lastName
        ? `${updates.firstName} ${updates.lastName}`.trim()
        : existing.user.name,
    };

    const updatedUsers = {
      ...users,
      [username]: {
        ...existing,
        user: updatedUser,
        password: updates.password ? updates.password : existing.password,
      },
    };

    setUsers(updatedUsers);

    if (user?.username === username) {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    logActivity('Cập nhật tài khoản', username, `Cập nhật thông tin tài khoản ${updatedUser.name}`);
    return true;
  };

  const removeUser = (username: string): boolean => {
    const existing = users[username];
    if (!existing) return false;
    if (user?.username === username) return false;

    // Prevent deleting the last admin
    const isAdmin = existing.user.role === 'admin';
    const adminCount = Object.values(users).filter(
      (entry) => entry.user.role === 'admin'
    ).length;

    if (isAdmin && adminCount <= 1) {
      return false;
    }

    // Sync with backend
    fetch(`${API_BASE}/users/${username}`, {
      method: 'DELETE'
    }).catch(err => console.error('Lỗi đồng bộ removeUser:', err));

    const updatedUsers = { ...users };
    delete updatedUsers[username];

    setUsers(updatedUsers);

    logActivity('Xóa tài khoản', username, `Xóa tài khoản ${existing.user.name}`);
    return true;
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
      let deviceCommand: { device: string; value: any; zone_id: string } | null = null;

      if (updates.isOn !== undefined) {
        details = updates.isOn ? 'Bật máy' : 'Tắt máy';
      } else if (updates.isDoorOpen !== undefined) {
        details = updates.isDoorOpen ? 'Mở cửa' : 'Đóng cửa';
        deviceCommand = {
          device: 'door',
          value: updates.isDoorOpen ? 1 : 0,
          zone_id: machineId
        };
      } else if (updates.fanLevel !== undefined) {
        details = `Đặt quạt mức ${updates.fanLevel}`;
        deviceCommand = {
          device: 'fan',
          value: updates.fanLevel,
          zone_id: machineId
        };
      } else if (updates.heaterLevel !== undefined) {
        details = updates.heaterLevel > 0 ? `Bật sưởi ấm mức ${updates.heaterLevel}` : 'Tắt sưởi ấm';
        deviceCommand = {
          device: 'heater',
          value: updates.heaterLevel,
          zone_id: machineId
        };
      } else if (updates.humidifierLevel !== undefined) {
        details = updates.humidifierLevel === 1 ? 'Bật làm ẩm' : 'Tắt làm ẩm';
        deviceCommand = {
          device: 'humidifier',
          value: updates.humidifierLevel,
          zone_id: machineId
        };
      } else if (updates.mode !== undefined || updates.scheduleId !== undefined) {
        const newMode = updates.mode || machine.mode;
        const newScheduleId = updates.scheduleId || machine.scheduleId;

        if (newMode === 'automatic' && newScheduleId) {
          const schedule = schedules.find(s => s.id === newScheduleId);
          console.log(`[Debug] newScheduleId=${newScheduleId}, schedule found=`, schedule);
          console.log(`[Debug] all schedule IDs=`, schedules.map(s => s.id));
          if (schedule) {
            updates.targetTempMin = schedule.targetTempMin;
            updates.targetTempMax = schedule.targetTempMax;
            updates.targetHumidityMin = schedule.targetHumidityMin;
            updates.targetHumidityMax = schedule.targetHumidityMax;
            updates.currentFruit = schedule.fruitType;
            details = `Chuyển sang tự động - Lịch: ${schedule.name}`;

            const fruitMapping: Record<string, string> = {
              'Xoài': 'xoai',
              'Chuối': 'chuoi',
              'Thanh long': 'thanh-long',
              'Dứa': 'pineapple',
              'Nhãn': 'nhan'
            };
            const feedName = fruitMapping[schedule.fruitType];
            console.log(`[Debug] fruitType="${schedule.fruitType}", feedName="${feedName}"`);

            // Gửi tuần tự: fruit=1 → đợi 500ms → auto=1
            ;(async () => {
              if (feedName) {
                await sendControlCommand({ device: feedName, value: 1, zone_id: machineId });
                console.log(`[Auto] Gửi ${feedName}=1`);
                await new Promise(r => setTimeout(r, 500));
              } else {
                console.warn(`[Auto] Không tìm thấy feedName cho fruitType="${schedule.fruitType}"`);
              }
              await sendControlCommand({ device: 'auto', value: 1, zone_id: machineId });
              console.log(`[Auto] Gửi auto=1`);
            })();
          } else {
            details = `Chuyển sang chế độ tự động`;
            console.warn(`[Auto] Schedule ${newScheduleId} không tìm thấy! Chỉ gửi auto=1`);
            sendControlCommand({ device: 'auto', value: 1, zone_id: machineId });
          }
        } else if (newMode === 'manual') {
          details = `Chuyển sang chế độ thủ công`;
          sendControlCommand({ device: 'auto', value: 0, zone_id: machineId });
          console.log(`[Auto] Gửi auto=0`);
        } else {
          details = `Chuyển sang chế độ ${newMode === 'manual' ? 'thủ công' : 'tự động'}`;
        }
      } else if (updates.targetTempMin !== undefined || updates.targetTempMax !== undefined) {
        details = `Cập nhật ngưỡng nhiệt độ`;
      } else if (updates.targetHumidityMin !== undefined || updates.targetHumidityMax !== undefined) {
        details = `Cập nhật ngưỡng độ ẩm`;
      } else {
        details = 'Cập nhật cấu hình';
      }

      // Send control command to backend if applicable
      if (deviceCommand) {
        sendControlCommand(deviceCommand);
      }

      logActivity('Điều khiển máy sấy', machine.name, details);
    }
  };

  // Send control command to the backend gateway
  const sendControlCommand = async (command: { device: string; value: any; zone_id: string }) => {
    try {
      const response = await fetch('http://localhost:8000/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command)
      });

      if (response.ok) {
        console.log(`✓ Control command sent: ${command.device}=${command.value}`);
      } else {
        console.error(`✗ Control command failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending control command:', error);
    }
  };

  const addSchedule = (schedule: Omit<Schedule, 'id'>) => {
    const newSchedule: Schedule = {
      ...schedule,
      id: `SCH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    // Sync with backend
    fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSchedule)
    }).catch(err => console.error('Lỗi đồng bộ addSchedule:', err));

    setSchedules([...schedules, newSchedule]);
    logActivity('Thêm lịch trình', newSchedule.name, `Lịch sấy ${newSchedule.fruitType} - ${newSchedule.duration} phút`);
  };

  const updateSchedule = (scheduleId: string, updates: Partial<Schedule>) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    // Sync with backend
    fetch(`${API_BASE}/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.error('Lỗi đồng bộ updateSchedule:', err));

    setSchedules(
      schedules.map((s) => (s.id === scheduleId ? { ...s, ...updates } : s))
    );

    if (schedule) {
      logActivity('Cập nhật lịch trình', schedule.name, `Cập nhật lịch trình ${schedule.name}`);
    }
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
        users,
        login,
        logout,
        requestOTP,
        verifyOTP,
        resetPassword,
        addUser,
        updateUser,
        removeUser,
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
        updateSchedule,
        getStatsForMachine,
        getStatsForBuilding,
        logActivity,
        liveDataMachineId,
        setLiveDataMachineId,
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
