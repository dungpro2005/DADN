import { useState } from 'react';
import { Settings2, Download, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface ReportCustomizationProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportPDF: () => void;
  onRefresh: () => void;
  availableMetrics: { key: string; label: string }[];
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  autoRefreshEnabled: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
  refreshInterval?: number;
  onRefreshIntervalChange?: (interval: number) => void;
}

export default function ReportCustomization({
  onExportCSV,
  onExportJSON,
  onExportPDF,
  onRefresh,
  availableMetrics,
  selectedMetrics,
  onMetricsChange,
  autoRefreshEnabled,
  onAutoRefreshChange,
  refreshInterval = 5,
  onRefreshIntervalChange,
}: ReportCustomizationProps) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleMetricToggle = (metricKey: string) => {
    if (selectedMetrics.includes(metricKey)) {
      onMetricsChange(selectedMetrics.filter((m) => m !== metricKey));
    } else {
      onMetricsChange([...selectedMetrics, metricKey]);
    }
  };

  const selectAllMetrics = () => {
    onMetricsChange(availableMetrics.map((m) => m.key));
  };

  const deselectAllMetrics = () => {
    onMetricsChange([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left section - Customize and Refresh */}
        <div className="flex flex-wrap gap-2">
          {/* Customize Button */}
          <button
            onClick={() => setShowCustomize(!showCustomize)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Tuỳ chỉnh
          </button>

          {/* Auto Refresh */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefreshEnabled}
              onChange={(e) => onAutoRefreshChange(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-700 cursor-pointer">
              Tự động cập nhật
            </label>
            {autoRefreshEnabled && onRefreshIntervalChange && (
              <select
                value={refreshInterval}
                onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
                className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
              </select>
            )}
          </div>
        </div>

        {/* Right section - Export */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất dữ liệu
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onExportCSV();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
              >
                📊 Xuất CSV
              </button>
              <button
                onClick={() => {
                  onExportJSON();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
              >
                📋 Xuất JSON
              </button>
              <button
                onClick={() => {
                  onExportPDF();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm border-t"
              >
                📄 Xuất PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customization Panel */}
      {showCustomize && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Chọn chỉ số hiển thị</h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllMetrics}
                  className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={deselectAllMetrics}
                  className="text-xs px-2 py-1 text-gray-600 hover:text-gray-700 font-medium"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableMetrics.map((metric) => (
                <label
                  key={metric.key}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.key)}
                    onChange={() => handleMetricToggle(metric.key)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{metric.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <p className="text-sm text-gray-600">
              Đã chọn {selectedMetrics.length}/{availableMetrics.length} chỉ số
            </p>
            <button
              onClick={() => setShowCustomize(false)}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
