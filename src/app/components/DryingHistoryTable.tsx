import { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown } from 'lucide-react';

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
}

interface DryingHistoryTableProps {
  logs: DryingLog[];
  onSelectLog: (log: DryingLog) => void;
  onExport: (format: 'csv' | 'json' | 'pdf', filteredData: DryingLog[]) => void;
}

type SortBy = 'date' | 'duration' | 'status' | 'machine';
type SortOrder = 'asc' | 'desc';

export default function DryingHistoryTable({
  logs,
  onSelectLog,
  onExport,
}: DryingHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedFruit, setSelectedFruit] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Get unique values for filters
  const machines = useMemo(() => {
    return [...new Set(logs.map((log) => log.machineId))];
  }, [logs]);

  const fruits = useMemo(() => {
    return [...new Set(logs.map((log) => log.fruitType))];
  }, [logs]);

  // Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.machineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.fruitType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.date.includes(searchTerm);

      const matchMachine = !selectedMachine || log.machineId === selectedMachine;
      const matchFruit = !selectedFruit || log.fruitType === selectedFruit;
      const matchStatus = !selectedStatus || log.status === selectedStatus;

      return matchSearch && matchMachine && matchFruit && matchStatus;
    });
  }, [logs, searchTerm, selectedMachine, selectedFruit, selectedStatus]);

  // Sorting
  const sortedLogs = useMemo(() => {
    const sorted = [...filteredLogs];
    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'date':
          compareValue = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case 'duration':
          compareValue = a.durationMinutes - b.durationMinutes;
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'machine':
          compareValue = a.machineId.localeCompare(b.machineId);
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [filteredLogs, sortBy, sortOrder]);

  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Thành công' },
      running: { bg: 'bg-blue-100', text: 'text-blue-800', label: '⏸ Đang chạy' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Thất bại' },
      stopped: { bg: 'bg-gray-100', text: 'text-gray-800', label: '⏹ Dừng' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.stopped;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
  };

  const SortButton = ({ column, label }: { column: SortBy; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900 transition-colors"
    >
      {label}
      {sortBy === column && (
        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch Sử Sấy</h2>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm máy, loại trái cây..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Machine Filter */}
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            <option value="">Tất cả máy</option>
            {machines.map((machine) => (
              <option key={machine} value={machine}>
                {machine}
              </option>
            ))}
          </select>

          {/* Fruit Type Filter */}
          <select
            value={selectedFruit}
            onChange={(e) => setSelectedFruit(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            <option value="">Tất cả loại</option>
            {fruits.map((fruit) => (
              <option key={fruit} value={fruit}>
                {fruit}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="success">✓ Thành công</option>
            <option value="running">⏸ Đang chạy</option>
            <option value="failed">❌ Thất bại</option>
            <option value="stopped">⏹ Dừng</option>
          </select>

          {/* Export Button */}
          <div className="flex gap-1">
            <button
              onClick={() => onExport('csv', sortedLogs)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              title="Xuất CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => onExport('json', sortedLogs)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              title="Xuất JSON"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => onExport('pdf', sortedLogs)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
              title="Xuất PDF"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="text-sm text-gray-600 mb-3">
          Hiển thị {sortedLogs.length} / {logs.length} bản ghi
          {(selectedMachine || selectedFruit || selectedStatus || searchTerm) && (
            <>
              {' '}
              (Đã áp dụng{' '}
              {[selectedMachine, selectedFruit, selectedStatus, searchTerm]
                .filter(Boolean)
                .length.toString()}{' '}
              bộ lọc)
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <SortButton column="date" label="Ngày/Giờ" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton column="machine" label="Máy" />
              </th>
              <th className="px-4 py-3 text-left">Loại Trái Cây</th>
              <th className="px-4 py-3 text-left">
                <SortButton column="duration" label="Thời Lượng" />
              </th>
              <th className="px-4 py-3 text-left">Độ Ẩm Cuối</th>
              <th className="px-4 py-3 text-left">
                <SortButton column="status" label="Trạng Thái" />
              </th>
              <th className="px-4 py-3 text-left">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              sortedLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{log.date}</div>
                    <div className="text-gray-500">{log.startTime}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.machineId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.fruitType}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.duration}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium text-gray-900">{log.moistureFinal.toFixed(1)}%</span>
                    <span className="text-gray-500"> (vs {log.moistureInitial.toFixed(1)}%)</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{getStatusBadge(log.status)}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onSelectLog(log)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium transition-colors"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
