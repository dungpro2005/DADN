import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Droplet,
  Fan,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import DateRangePicker from '../components/DateRangePicker';

export default function StatisticsPage() {
  const { buildings, machines, logs } = useApp();

  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const filteredMachines =
    selectedBuilding === 'all'
      ? machines
      : machines.filter((m) => m.buildingId === selectedBuilding);

  // Get stats for selected machine or all machines
  const getChartData = () => {
    if (!startDate || !endDate) return [];

    if (selectedMachine) {
      const machine = machines.find((m) => m.id === selectedMachine);
      if (!machine) return [];

      const machineLogs = logs.filter(
        (log) =>
          log.machineId === selectedMachine &&
          new Date(log.timestamp) >= startDate &&
          new Date(log.timestamp) <= endDate
      );

      // Group by day
      const groupedByDay: { [key: string]: any[] } = {};
      machineLogs.forEach((log) => {
        const date = new Date(log.timestamp).toLocaleDateString('vi-VN');
        if (!groupedByDay[date]) {
          groupedByDay[date] = [];
        }
        groupedByDay[date].push(log);
      });

      return Object.entries(groupedByDay)
        .map(([date, dayLogs]) => ({
          date,
          temp:
            Math.round(
              (dayLogs.reduce((sum, log) => sum + log.temp, 0) /
                dayLogs.length) *
                10
            ) / 10,
          humidity:
            Math.round(
              (dayLogs.reduce((sum, log) => sum + log.humidity, 0) /
                dayLogs.length) *
                10
            ) / 10,
          fanLevel:
            Math.round(
              (dayLogs.reduce((sum, log) => sum + log.fanLevel, 0) /
                dayLogs.length) *
                10
            ) / 10,
          uptime:
            Math.round(
              (dayLogs.filter((log) => log.isOn).length / dayLogs.length) *
                1000
            ) / 10,
        }))
        .sort((a, b) => {
          const [dayA, monthA, yearA] = a.date.split('/').map(Number);
          const [dayB, monthB, yearB] = b.date.split('/').map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          return dateA.getTime() - dateB.getTime();
        });
    }

    return [];
  };

  const chartData = getChartData();

  // Calculate overall stats
  const calculateOverallStats = () => {
    if (!startDate || !endDate) {
      return {
        avgTemp: 0,
        avgHumidity: 0,
        avgFanLevel: 0,
        totalUptime: 0,
        totalMachines: 0,
      };
    }

    const relevantLogs = logs.filter(
      (log) =>
        new Date(log.timestamp) >= startDate &&
        new Date(log.timestamp) <= endDate &&
        (selectedBuilding === 'all' ||
          machines.find(
            (m) => m.id === log.machineId && m.buildingId === selectedBuilding
          ))
    );

    if (relevantLogs.length === 0) {
      return {
        avgTemp: 0,
        avgHumidity: 0,
        avgFanLevel: 0,
        totalUptime: 0,
        totalMachines: 0,
      };
    }

    const avgTemp =
      Math.round(
        (relevantLogs.reduce((sum, log) => sum + log.temp, 0) /
          relevantLogs.length) *
          10
      ) / 10;
    const avgHumidity =
      Math.round(
        (relevantLogs.reduce((sum, log) => sum + log.humidity, 0) /
          relevantLogs.length) *
          10
      ) / 10;
    const avgFanLevel =
      Math.round(
        (relevantLogs.reduce((sum, log) => sum + log.fanLevel, 0) /
          relevantLogs.length) *
          10
      ) / 10;
    const totalUptime =
      Math.round(
        (relevantLogs.filter((log) => log.isOn).length / relevantLogs.length) *
          1000
      ) / 10;

    return {
      avgTemp,
      avgHumidity,
      avgFanLevel,
      totalUptime,
      totalMachines: filteredMachines.length,
    };
  };

  const overallStats = calculateOverallStats();

  // Machine performance comparison
  const getMachineComparison = () => {
    if (!startDate || !endDate) return [];

    return filteredMachines
      .map((machine) => {
        const machineLogs = logs.filter(
          (log) =>
            log.machineId === machine.id &&
            new Date(log.timestamp) >= startDate &&
            new Date(log.timestamp) <= endDate
        );

        if (machineLogs.length === 0) return null;

        const avgTemp =
          Math.round(
            (machineLogs.reduce((sum, log) => sum + log.temp, 0) /
              machineLogs.length) *
              10
          ) / 10;
        const avgHumidity =
          Math.round(
            (machineLogs.reduce((sum, log) => sum + log.humidity, 0) /
              machineLogs.length) *
              10
          ) / 10;
        const avgFanLevel =
          Math.round(
            (machineLogs.reduce((sum, log) => sum + log.fanLevel, 0) /
              machineLogs.length) *
              10
          ) / 10;
        const uptime =
          Math.round(
            (machineLogs.filter((log) => log.isOn).length /
              machineLogs.length) *
              1000
          ) / 10;

        return {
          name: machine.name,
          avgTemp,
          avgHumidity,
          avgFanLevel,
          uptime,
        };
      })
      .filter((data) => data !== null);
  };

  const machineComparison = getMachineComparison();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Thống kê và báo cáo
        </h1>
        <p className="text-gray-600">
          Phân tích hiệu suất hoạt động của máy sấy
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tòa nhà
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setSelectedMachine('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tất cả tòa nhà</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máy sấy
            </label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Tất cả máy</option>
              {filteredMachines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Nhiệt độ TB</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallStats.avgTemp}°C
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Droplet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Độ ẩm TB</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallStats.avgHumidity}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Fan className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quạt TB</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallStats.avgFanLevel}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Thời gian chạy</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallStats.totalUptime}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Số máy</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallStats.totalMachines}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {selectedMachine && chartData.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Biểu đồ nhiệt độ
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  name="Nhiệt độ (°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Biểu đồ độ ẩm
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorHumidity)"
                  name="Độ ẩm (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Biểu đồ mức quạt
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line
                  type="stepAfter"
                  dataKey="fanLevel"
                  stroke="#9333ea"
                  name="Mức quạt"
                  strokeWidth={2}
                  dot={{ fill: '#9333ea', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Thời gian hoạt động
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="uptime"
                  fill="#10b981"
                  name="Thời gian chạy (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Machine Comparison */}
      {!selectedMachine && machineComparison.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              So sánh nhiệt độ trung bình
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={machineComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgTemp" fill="#ef4444" name="Nhiệt độ TB (°C)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              So sánh độ ẩm và mức quạt trung bình
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={machineComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="avgHumidity"
                  fill="#3b82f6"
                  name="Độ ẩm TB (%)"
                />
                <Bar
                  dataKey="avgFanLevel"
                  fill="#9333ea"
                  name="Mức quạt TB"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              So sánh thời gian hoạt động
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={machineComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="uptime"
                  fill="#10b981"
                  name="Thời gian chạy (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {selectedMachine && chartData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Không có dữ liệu cho khoảng thời gian này
          </p>
        </div>
      )}
    </div>
  );
}
