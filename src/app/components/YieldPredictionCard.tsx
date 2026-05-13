import { predictYield, PredictionInput } from '../utils/yieldPrediction';
import { TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface YieldPredictionCardProps {
  temperature: number;
  humidity: number;
  duration?: number;
  fruitType?: string;
  machineId?: string;
  machineName?: string;
}

export default function YieldPredictionCard({
  temperature,
  humidity,
  duration = 600,
  fruitType = 'Mango',
  machineName = 'Machine',
}: YieldPredictionCardProps) {
  // Get prediction
  const prediction = predictYield({
    temperature,
    humidity,
    duration,
    fruitType,
  });

  // Status colors and icons
  const statusConfig = {
    optimal: {
      color: 'bg-green-50 border-green-200',
      badgeColor: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      label: 'Tối ưu',
      textColor: 'text-green-600',
    },
    good: {
      color: 'bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: TrendingUp,
      label: 'Tốt',
      textColor: 'text-blue-600',
    },
    fair: {
      color: 'bg-yellow-50 border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-800',
      icon: AlertCircle,
      label: 'Bình thường',
      textColor: 'text-yellow-600',
    },
    poor: {
      color: 'bg-red-50 border-red-200',
      badgeColor: 'bg-red-100 text-red-800',
      icon: AlertCircle,
      label: 'Kém',
      textColor: 'text-red-600',
    },
  };

  const config = statusConfig[prediction.status];
  const StatusIcon = config.icon;

  return (
    <div className={`rounded-xl shadow-sm p-6 border-2 ${config.color}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${config.badgeColor}`}>
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Dự Đoán Sản Lượng</h3>
            <p className="text-sm text-gray-600">{machineName} - {fruitType}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.badgeColor}`}>
          <StatusIcon className="w-5 h-5" />
          <span className="font-semibold">{config.label}</span>
        </div>
      </div>

      {/* Main Prediction Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Predicted Yield */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Sản Lượng Dự Đoán</p>
          <p className={`text-3xl font-bold ${config.textColor}`}>
            {prediction.predictedYield} kg
          </p>
          <p className="text-xs text-gray-500 mt-1">Khối lượng dự kiến</p>
        </div>

        {/* Confidence */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Độ Tin Cậy</p>
          <p className={`text-3xl font-bold ${config.textColor}`}>
            {prediction.confidence}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Mức độ chính xác dự đoán</p>
        </div>

        {/* Yield Percentage */}
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">So Với Mức Kỳ Vọng</p>
          <p className={`text-3xl font-bold ${config.textColor}`}>
            {prediction.yieldPercentage}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Hiệu suất so với chuẩn</p>
        </div>
      </div>

      {/* Factors Impact */}
      <div className="bg-white rounded-lg p-4 border border-gray-100 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Phân Tích Các Yếu Tố</h4>
        
        <div className="space-y-3">
          {/* Temperature Impact */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-600">
                Nhiệt độ: {temperature}°C
              </label>
              <span className="text-sm font-semibold text-gray-900">
                {prediction.factors.tempImpact}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${prediction.factors.tempImpact}%` }}
              ></div>
            </div>
          </div>

          {/* Humidity Impact */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-600">
                Độ ẩm: {humidity}%
              </label>
              <span className="text-sm font-semibold text-gray-900">
                {prediction.factors.humidityImpact}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${prediction.factors.humidityImpact}%` }}
              ></div>
            </div>
          </div>

          {/* Duration Impact */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-600">
                Thời lượng: {duration} phút
              </label>
              <span className="text-sm font-semibold text-gray-900">
                {prediction.factors.durationImpact}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${prediction.factors.durationImpact}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-lg p-4 border-l-4 ${config.badgeColor}`}>
        <p className="text-sm font-semibold text-gray-900 mb-1">💡 Gợi Ý Cải Thiện</p>
        <p className={`text-sm ${config.textColor}`}>
          {prediction.recommendation}
        </p>
      </div>

      {/* Model Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">
            🤖 Mô hình dự đoán ML (Polynomial Regression)
          </p>
          <p className="text-xs text-gray-500">
            Độ chính xác: ~87.5% | Dữ liệu: Mẫu lịch sử sấy
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}
