import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Filter, User, Calendar, Target, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ActivityLogsPage() {
  const { activityLogs, user } = useApp();
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600">
            Chỉ quản lý mới có thể xem nhật ký hoạt động
          </p>
        </div>
      </div>
    );
  }

  // Get unique users and actions for filters
  const uniqueUsers = Array.from(new Set(activityLogs.map((log) => log.user)));
  const uniqueActions = Array.from(new Set(activityLogs.map((log) => log.action)));

  // Filter logs
  const filteredLogs = activityLogs.filter((log) => {
    if (filterUser !== 'all' && log.user !== filterUser) return false;
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    return true;
  });

  // Group logs by date
  const groupedLogs: { [key: string]: typeof activityLogs } = {};
  filteredLogs.forEach((log) => {
    const date = format(new Date(log.timestamp), 'dd/MM/yyyy', { locale: vi });
    if (!groupedLogs[date]) {
      groupedLogs[date] = [];
    }
    groupedLogs[date].push(log);
  });

  const getActionColor = (action: string) => {
    if (action.includes('Thêm')) return 'bg-green-100 text-green-800';
    if (action.includes('Xóa')) return 'bg-red-100 text-red-800';
    if (action.includes('Điều khiển')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Thêm')) return '➕';
    if (action.includes('Xóa')) return '🗑️';
    if (action.includes('Điều khiển')) return '⚙️';
    return '📝';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nhật ký hoạt động
        </h1>
        <p className="text-gray-600">
          Theo dõi tất cả hoạt động trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Bộ lọc</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Người thực hiện
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              {uniqueUsers.map((userName) => (
                <option key={userName} value={userName}>
                  {userName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại hoạt động
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredLogs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Người dùng</p>
              <p className="text-2xl font-bold text-gray-900">
                {uniqueUsers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Loại hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {uniqueActions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hôm nay</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  filteredLogs.filter(
                    (log) =>
                      format(new Date(log.timestamp), 'dd/MM/yyyy') ===
                      format(new Date(), 'dd/MM/yyyy')
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {Object.keys(groupedLogs).length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có nhật ký hoạt động nào</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedLogs).map(([date, logs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">{date}</h3>
                  <span className="text-sm text-gray-500">
                    ({logs.length} hoạt động)
                  </span>
                </div>

                <div className="space-y-3 pl-8 border-l-2 border-gray-200">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="absolute -left-10 top-4 w-4 h-4 bg-orange-500 rounded-full border-4 border-white"></div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getActionIcon(log.action)}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-semibold ${getActionColor(
                                log.action
                              )}`}
                            >
                              {log.action}
                            </span>
                            <span className="text-sm text-gray-600">
                              {format(new Date(log.timestamp), 'HH:mm:ss', {
                                locale: vi,
                              })}
                            </span>
                          </div>

                          <div className="mb-2">
                            <span className="font-semibold text-gray-900">
                              {log.target}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600">{log.details}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{log.user}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              log.userRole === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {log.userRole === 'admin' ? 'Quản lý' : 'Nhân viên'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
