import { X, Download } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DryingLog {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  durationMinutes: number;
  machine: string;
  machineId: string;
  fruitType: string;
  status: 'success' | 'running' | 'failed' | 'stopped';
  moistureInitial: number;
  moistureFinal: number;
  tempAvg: number;
  humidityAvg: number;
  steps?: Array<{
    name: string;
    order: number;
    duration: string;
    status: 'completed' | 'running' | 'pending';
    tempMin: number;
    tempMax: number;
    humidityMin: number;
    humidityMax: number;
  }>;
  chartData?: Array<{
    time: string;
    temp: number;
    humidity: number;
    fanLevel: number;
  }>;
}

interface DryingSessionDetailProps {
  log: DryingLog;
  onClose: () => void;
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
}

export default function DryingSessionDetail({
  log,
  onClose,
  onExport,
}: DryingSessionDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'running':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      case 'stopped':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return '✓ Hoàn thành thành công';
      case 'running':
        return '⏸ Đang chạy';
      case 'failed':
        return '❌ Thất bại';
      case 'stopped':
        return '⏹ Dừng';
      default:
        return 'N/A';
    }
  };

  // Generate mock chart data if not provided
  const chartData = log.chartData || [
    { time: '10:00', temp: 30, humidity: 50, fanLevel: 1 },
    { time: '12:00', temp: 45, humidity: 45, fanLevel: 2 },
    { time: '14:00', temp: 62, humidity: 35, fanLevel: 3 },
    { time: '16:00', temp: 65, humidity: 32, fanLevel: 3 },
    { time: '18:00', temp: 60, humidity: 38, fanLevel: 2 },
    { time: '20:00', temp: 55, humidity: 42, fanLevel: 1 },
    { time: '22:00', temp: 50, humidity: 48, fanLevel: 1 },
    { time: '02:30', temp: 40, humidity: 55, fanLevel: 0 },
  ];

  const steps = log.steps || [
    {
      name: 'Preheating (Hâm nóng)',
      order: 1,
      duration: '4h',
      status: 'completed' as const,
      tempMin: 58,
      tempMax: 62,
      humidityMin: 35,
      humidityMax: 45,
    },
    {
      name: 'Active Drying (Sấy chính)',
      order: 2,
      duration: '8h',
      status: 'completed' as const,
      tempMin: 62,
      tempMax: 68,
      humidityMin: 25,
      humidityMax: 35,
    },
    {
      name: 'Cooling (Làm lạnh)',
      order: 3,
      duration: '4h 30m',
      status: 'completed' as const,
      tempMin: 50,
      tempMax: 55,
      humidityMin: 35,
      humidityMax: 45,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🍀 Chi Tiết Lần Sấy {log.fruitType}</h2>
            <p className={`text-lg font-medium mt-1 ${getStatusColor(log.status)}`}>
              {getStatusLabel(log.status)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* General Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ID Session</p>
              <p className="font-semibold text-gray-900">{log.id}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Máy Sấy</p>
              <p className="font-semibold text-gray-900">{log.machineId}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Ngày Sấy</p>
              <p className="font-semibold text-gray-900">{log.date}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Thời Lượng</p>
              <p className="font-semibold text-gray-900">{log.duration}</p>
            </div>
          </div>

          {/* Moisture Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Độ Ẩm Ban Đầu</p>
              <p className="text-2xl font-bold text-blue-900">{log.moistureInitial.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 mb-1">Độ Ẩm Cuối</p>
              <p className="text-2xl font-bold text-green-900">{log.moistureFinal.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 mb-1">Giảm Ẩm</p>
              <p className="text-2xl font-bold text-orange-900">
                {(log.moistureInitial - log.moistureFinal).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Temperature & Humidity Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 mb-1">Nhiệt Độ Trung Bình</p>
              <p className="text-3xl font-bold text-red-900">{log.tempAvg.toFixed(1)}°C</p>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-sm text-cyan-600 mb-1">Độ Ẩm Không Khí TB</p>
              <p className="text-3xl font-bold text-cyan-900">{log.humidityAvg.toFixed(1)}%</p>
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Các Bước Sấy</h3>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    step.status === 'completed'
                      ? 'bg-green-50 border-green-500'
                      : step.status === 'running'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {step.status === 'completed' && '✓'}
                        {step.status === 'running' && '⏸'}
                        {step.status === 'pending' && '○'} {step.name}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{step.duration}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Temp: </span>
                      <span className="font-medium">{step.tempMin}°C - {step.tempMax}°C</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Humidity: </span>
                      <span className="font-medium">{step.humidityMin}% - {step.humidityMax}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Biểu Đồ Dữ Liệu</h3>
            <div className="space-y-6">
              {/* Temperature Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-3">Biểu Đồ Nhiệt Độ</p>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#tempGradient)"
                      name="Nhiệt độ (°C)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Humidity Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-3">Biểu Đồ Độ Ẩm</p>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#humidityGradient)"
                      name="Độ ẩm (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Fan Level Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-3">Biểu Đồ Mức Quạt</p>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 3]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="stepAfter"
                      dataKey="fanLevel"
                      stroke="#9333ea"
                      name="Mức Quạt"
                      strokeWidth={2}
                      dot={{ fill: '#9333ea', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Export Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={() => onExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => onExport('json')}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
