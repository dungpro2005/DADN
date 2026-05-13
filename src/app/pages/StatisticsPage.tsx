import { useState, useEffect } from 'react';
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
import ReportCustomization from '../components/ReportCustomization';
import {
  PieChartReport,
  ScatterChartReport,
  ComparisonMetricsChart,
} from '../components/AdvancedCharts';
import DryingHistoryTable from '../components/DryingHistoryTable';
import DryingSessionDetail from '../components/DryingSessionDetail';
import YieldPredictionCard from '../components/YieldPredictionCard';
import {
  exportToCSV,
  exportToJSON,
  generatePDFReport,
  createHTMLTable,
  generateSummaryStats,
} from '../utils/reportExport';

export default function StatisticsPage() {
  //const { buildings, machines, logs } = useApp();
  //Giả sử máy chạy thật hiện tại đang sử dụng data fake
  const { buildings, machines, logs: realLogs } = useApp();

  //hàm cho data fake
  const generateMockLogs = () => {
    const mockLogs: any[] = [];

    machines.forEach((machine) => {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        for (let j = 0; j < 5; j++) {
          const timestamp = new Date(date);
          timestamp.setHours(j * 4);

          mockLogs.push({
            machineId: machine.id,
            timestamp: timestamp.toISOString(),
            temp: 30 + Math.random() * 10, // 30-40°C
            humidity: 50 + Math.random() * 20, // 50-70%
            fanLevel: Math.floor(Math.random() * 3) + 1, // 1-3
            isOn: Math.random() > 0.2, // 80% chạy
          });
        }
      }
    });

    return mockLogs;
  };

  const logs = realLogs.length > 0 ? realLogs : generateMockLogs();

  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Báo cáo động - tính năng tự động cập nhật
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5); // giây

  // Tuỳ chỉnh hiển thị báo cáo
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'avgTemp',
    'avgHumidity',
    'avgFanLevel',
    'uptime',
  ]);

  // Tuỳ chỉnh loại biểu đồ
  const [chartTypes, setChartTypes] = useState<Record<string, string>>({
    machineTemp: 'area',
    machineHumidity: 'area',
    machineComparison: 'bar',
    buildingStats: 'bar',
  });

  // Tab view: dashboard or drying history
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  // Selected drying log for detail view
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      // Trigger data refresh - trong thực tế có thể call API
      // Hiện tại chỉ là placeholder
      console.log('Auto-refreshing report data...');
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval]);

  const availableMetrics = [
    { key: 'avgTemp', label: 'Nhiệt độ TB' },
    { key: 'avgHumidity', label: 'Độ ẩm TB' },
    { key: 'avgFanLevel', label: 'Mức quạt TB' },
    { key: 'uptime', label: 'Thời gian chạy' },
    { key: 'activeMachines', label: 'Máy đang chạy' },
    { key: 'power', label: 'Công suất' },
  ];

  const filteredMachines =
    selectedBuilding === 'all'
      ? machines
      : machines.filter((m) => m.buildingId === selectedBuilding);

  // Export functions
  const handleExportCSV = () => {
    const exportData = selectedMachine ? chartData : buildingStats;
    if (exportData && exportData.length > 0) {
      const columns = Object.keys(exportData[0]);
      const filtered = columns.filter((col) => {
        if (selectedMetrics.length === 0) return true;
        return selectedMetrics.some((m) => col.toLowerCase().includes(m.toLowerCase()));
      });
      exportToCSV(exportData, `báo-cáo-thống-kê-${new Date().getTime()}`, filtered);
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      filters: {
        building: selectedBuilding,
        machine: selectedMachine,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
      data: selectedMachine ? chartData : buildingStats,
      summary: overallStats,
    };
    exportToJSON(exportData, `báo-cáo-thống-kê-${new Date().getTime()}`);
  };

  const handleExportPDF = () => {
    const summary = overallStats;
    const dataTable = selectedMachine
      ? createHTMLTable(chartData, Object.keys(chartData[0] || {}), 'Chi tiết máy sấy')
      : createHTMLTable(buildingStats, Object.keys(buildingStats[0] || {}), 'Thống kê tòa nhà');

    const htmlContent = `
      <h2>Tóm tắt chung</h2>
      <table>
        <tr>
          <td><strong>Nhiệt độ TB:</strong></td>
          <td>${summary.avgTemp}°C</td>
        </tr>
        <tr>
          <td><strong>Độ ẩm TB:</strong></td>
          <td>${summary.avgHumidity}%</td>
        </tr>
        <tr>
          <td><strong>Thời gian chạy:</strong></td>
          <td>${summary.totalUptime}%</td>
        </tr>
        <tr>
          <td><strong>Số máy:</strong></td>
          <td>${summary.totalMachines}</td>
        </tr>
      </table>
      ${dataTable}
    `;

    generatePDFReport('Báo cáo Thống kê và Phân tích', htmlContent, 'báo-cáo-thống-kê');
  };

  // Generate drying history from logs
  const getDryingHistory = () => {
    const history = logs.map((log, idx) => ({
      id: `DRY-${new Date().getFullYear()}-${String(logs.length - idx).padStart(4, '0')}`,
      date: new Date(log.timestamp).toLocaleDateString('vi-VN'),
      startTime: new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      duration: `${Math.floor(Math.random() * 20)}h ${Math.floor(Math.random() * 60)}m`,
      durationMinutes: Math.floor(Math.random() * 1440),
      machine: machines.find((m) => m.id === log.machineId)?.name || 'Unknown',
      machineId: log.machineId,
      fruitType: 'Mango', // From logs if available
      status: (Math.random() > 0.05 ? 'success' : 'failed') as 'success' | 'failed' | 'running' | 'stopped',
      moistureInitial: 45 + Math.random() * 20,
      moistureFinal: 10 + Math.random() * 5,
      tempAvg: 50 + Math.random() * 20,
      humidityAvg: 30 + Math.random() * 30,
    }));
    return history;
  };

  const dryingHistory = getDryingHistory();

  // Export drying history
  const handleExportHistory = (format: 'csv' | 'json' | 'pdf', data: any[]) => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const columns = ['date', 'startTime', 'duration', 'machineId', 'fruitType', 'status', 'moistureFinal', 'tempAvg'];
      exportToCSV(data, `lịch-sử-sấy-${timestamp}`, columns);
    } else if (format === 'json') {
      const jsonData = {
        timestamp: new Date().toISOString(),
        totalRecords: data.length,
        records: data,
      };
      exportToJSON(jsonData, `lịch-sử-sấy-${timestamp}`);
    } else if (format === 'pdf') {
      const tableContent = data
        .map(
          (row) =>
            `<tr><td>${row.date}</td><td>${row.machineId}</td><td>${row.fruitType}</td><td>${row.duration}</td><td>${row.moistureFinal.toFixed(1)}%</td><td>${row.status}</td></tr>`
        )
        .join('');

      const htmlContent = `
        <h2>Lịch Sử Sấy</h2>
        <p>Tổng số: ${data.length} lần sấy</p>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#f3f4f6;">
            <th style="border:1px solid #ddd; padding:8px;">Ngày</th>
            <th style="border:1px solid #ddd; padding:8px;">Máy</th>
            <th style="border:1px solid #ddd; padding:8px;">Loại</th>
            <th style="border:1px solid #ddd; padding:8px;">Thời Lượng</th>
            <th style="border:1px solid #ddd; padding:8px;">Độ Ẩm</th>
            <th style="border:1px solid #ddd; padding:8px;">Trạng Thái</th>
          </tr>
          ${tableContent}
        </table>
      `;

      generatePDFReport('Báo cáo Lịch Sử Sấy', htmlContent, `lịch-sử-sấy-${timestamp}`);
    }
  };

  // Export single session detail
  const handleExportSessionDetail = (format: 'csv' | 'json' | 'pdf') => {
    if (!selectedLog) return;

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      const data = [selectedLog];
      exportToCSV(data, `lần-sấy-chi-tiết-${selectedLog.id}`, Object.keys(selectedLog));
    } else if (format === 'json') {
      exportToJSON(selectedLog, `lần-sấy-chi-tiết-${selectedLog.id}`);
    } else if (format === 'pdf') {
      const htmlContent = `
        <h2>${selectedLog.fruitType} - Session ${selectedLog.id}</h2>
        <p><strong>Máy:</strong> ${selectedLog.machineId}</p>
        <p><strong>Ngày:</strong> ${selectedLog.date}</p>
        <p><strong>Thời Lượng:</strong> ${selectedLog.duration}</p>
        <p><strong>Trạng Thái:</strong> ${selectedLog.status}</p>
        <p><strong>Độ Ẩm Ban Đầu:</strong> ${selectedLog.moistureInitial.toFixed(1)}%</p>
        <p><strong>Độ Ẩm Cuối:</strong> ${selectedLog.moistureFinal.toFixed(1)}%</p>
        <p><strong>Nhiệt Độ TB:</strong> ${selectedLog.tempAvg.toFixed(1)}°C</p>
        <p><strong>Độ Ẩm TB:</strong> ${selectedLog.humidityAvg.toFixed(1)}%</p>
      `;

      generatePDFReport(`Chi Tiết Lần Sấy - ${selectedLog.id}`, htmlContent, `lần-sấy-${selectedLog.id}`);
    }
  };

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

// Building stats
const getBuildingStats = () => {
  if (!startDate || !endDate) return [];

  return buildings
    .map((building) => {
      const buildingMachines = machines.filter(
        (m) => m.buildingId === building.id
      );

      const buildingLogs = logs.filter(
        (log) =>
          new Date(log.timestamp) >= startDate &&
          new Date(log.timestamp) <= endDate &&
          buildingMachines.some((m) => m.id === log.machineId)
      );

      if (buildingLogs.length === 0) return null;

      const avgTemp =
        Math.round(
          (buildingLogs.reduce((sum, log) => sum + log.temp, 0) /
            buildingLogs.length) *
          10
        ) / 10;

      const avgHumidity =
        Math.round(
          (buildingLogs.reduce((sum, log) => sum + log.humidity, 0) /
            buildingLogs.length) *
          10
        ) / 10;

      const avgFanLevel =
        Math.round(
          (buildingLogs.reduce((sum, log) => sum + log.fanLevel, 0) /
            buildingLogs.length) *
          10
        ) / 10;

      const uptime =
        Math.round(
          (buildingLogs.filter((log) => log.isOn).length /
            buildingLogs.length) *
          1000
        ) / 10;

      const activeMachines = new Set(
        buildingLogs
          .filter((log) => log.isOn)
          .map((log) => log.machineId)
      ).size;

      const runningSeconds = buildingLogs.filter((log) => log.isOn).length;

      const power = Math.round(runningSeconds * 1.4 * 10) / 10;
      return {
        name: building.name,
        avgTemp,
        avgHumidity,
        avgFanLevel,
        uptime,
        activeMachines,
        power,
      };
    })
    .filter((b) => b !== null);
};

const buildingStats = getBuildingStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Thống kê và báo cáo
        </h1>
        <p className="text-gray-600">
          Phân tích hiệu suất hoạt động của máy sấy - Báo cáo trực quan, đa chiều, động
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Lịch Sử Sấy
        </button>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'dashboard' && (
        <>
          {/* Report Customization */}
          <ReportCustomization
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onExportPDF={handleExportPDF}
        onRefresh={() => {
          // Trigger data refresh
          console.log('Manual refresh triggered');
        }}
        availableMetrics={availableMetrics}
        selectedMetrics={selectedMetrics}
        onMetricsChange={setSelectedMetrics}
        autoRefreshEnabled={autoRefreshEnabled}
        onAutoRefreshChange={setAutoRefreshEnabled}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
      />

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

      {/* ML Yield Prediction Card - Only show when machine is selected */}
      {selectedMachine && (
        <div className="mb-6">
          <YieldPredictionCard
            temperature={overallStats.avgTemp}
            humidity={overallStats.avgHumidity}
            duration={600}
            fruitType="Mango"
            machineName={machines.find((m) => m.id === selectedMachine)?.name || 'Machine'}
            machineId={selectedMachine}
          />
        </div>
      )}

      {/* When no machine selected, show prediction for all machines */}
      {!selectedMachine && filteredMachines.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dự Đoán Sản Lượng Máy Sấy</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMachines.slice(0, 2).map((machine) => {
              const machineLogs = logs.filter((log) => log.machineId === machine.id);
              const avgTemp = machineLogs.length > 0
                ? machineLogs.reduce((sum, log) => sum + log.temp, 0) / machineLogs.length
                : 55;
              const avgHumidity = machineLogs.length > 0
                ? machineLogs.reduce((sum, log) => sum + log.humidity, 0) / machineLogs.length
                : 40;

              return (
                <YieldPredictionCard
                  key={machine.id}
                  temperature={Math.round(avgTemp * 10) / 10}
                  humidity={Math.round(avgHumidity * 10) / 10}
                  duration={600}
                  fruitType="Mango"
                  machineName={machine.name}
                  machineId={machine.id}
                />
              );
            })}
          </div>
        </div>
      )}

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
                <YAxis domain={[0, 3]} />
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
{!selectedMachine && buildingStats.length > 0 && (
  <>
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Nhiệt độ trung bình theo tòa nhà
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={buildingStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgTemp" fill="#ef4444" name="Nhiệt độ (°C)" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Độ ẩm và mức quạt
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={buildingStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgHumidity" fill="#3b82f6" name="Độ ẩm (%)" />
          <Bar dataKey="avgFanLevel" fill="#9333ea" name="Mức quạt" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Số máy đang hoạt động
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={buildingStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="activeMachines"
            fill="#10b981"
            name="Máy đang chạy"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Công suất hoạt động
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={buildingStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="power" fill="#f59e0b" name="Công suất" />
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

      {/* Báo cáo đa chiều - Biểu đồ so sánh chi tiết */}
      {!selectedMachine && buildingStats.length > 0 && selectedMetrics.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Phân tích đa chiều theo tòa nhà</h2>
          <ComparisonMetricsChart
            data={buildingStats}
            selectedMetrics={selectedMetrics.filter((m) =>
              ['avgTemp', 'avgHumidity', 'avgFanLevel', 'uptime', 'activeMachines', 'power'].includes(m)
            )}
            title="So sánh chi tiết các chỉ số"
          />
        </div>
      )}

      {/* Báo cáo trực quan - Biểu đồ tròn */}
      {!selectedMachine && machineComparison.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartReport
              data={machineComparison.map((m: any) => ({
                name: m.name,
                value: m.uptime,
              }))}
              dataKey="value"
              title="Phân bố thời gian hoạt động theo máy"
            />
            <PieChartReport
              data={machineComparison.map((m: any) => ({
                name: m.name,
                value: m.avgTemp,
              }))}
              dataKey="value"
              title="Phân bố nhiệt độ trung bình"
            />
          </div>
        </div>
      )}

      {/* Báo cáo động - Scatter chart so sánh 2 metrics */}
      {!selectedMachine && machineComparison.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Phân tích mối quan hệ giữa các chỉ số</h2>
          <p className="text-sm text-gray-600 mb-4">
            Biểu đồ cho thấy mối quan hệ giữa nhiệt độ và độ ẩm của các máy
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChartReport
              data={machineComparison}
              xDataKey="avgTemp"
              yDataKey="avgHumidity"
              title="Mối quan hệ Nhiệt độ - Độ ẩm"
            />
          </ResponsiveContainer>
        </div>
      )}

      {/* Báo cáo tóm tắt */}
      {!selectedMachine && buildingStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt báo cáo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildingStats.map((stat: any, idx: number) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{stat.name}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    Nhiệt độ TB: <span className="font-medium">{stat.avgTemp}°C</span>
                  </p>
                  <p className="text-gray-600">
                    Độ ẩm TB: <span className="font-medium">{stat.avgHumidity}%</span>
                  </p>
                  <p className="text-gray-600">
                    Thời gian chạy: <span className="font-medium">{stat.uptime}%</span>
                  </p>
                  <p className="text-gray-600">
                    Máy hoạt động: <span className="font-medium">{stat.activeMachines}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}

      {/* History Content */}
      {activeTab === 'history' && (
        <DryingHistoryTable
          logs={dryingHistory}
          onSelectLog={setSelectedLog}
          onExport={handleExportHistory}
        />
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <DryingSessionDetail
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onExport={handleExportSessionDetail}
        />
      )}
    </div>
  );
}






