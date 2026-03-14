import { useApp } from '../context/AppContext';
import { Building2, Settings, Activity, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { buildings, machines } = useApp();

  const activeMachines = machines.filter((m) => m.isOn).length;
  const automaticMachines = machines.filter((m) => m.mode === 'automatic').length;
  const alertMachines = machines.filter(
    (m) =>
      m.isOn &&
      (m.currentTemp < m.targetTempMin ||
        m.currentTemp > m.targetTempMax ||
        m.currentHumidity < m.targetHumidityMin ||
        m.currentHumidity > m.targetHumidityMax)
  ).length;

  const stats = [
    {
      label: 'Tòa nhà',
      value: buildings.length,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      label: 'Tổng số máy',
      value: machines.length,
      icon: Settings,
      color: 'bg-green-500',
    },
    {
      label: 'Máy đang hoạt động',
      value: activeMachines,
      icon: Activity,
      color: 'bg-orange-500',
    },
    {
      label: 'Cảnh báo',
      value: alertMachines,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan hệ thống</h1>
        <p className="text-gray-600">Theo dõi tình trạng máy sấy trong nhà máy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Buildings Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tổng quan tòa nhà</h2>
        <div className="space-y-4">
          {buildings.map((building) => {
            const buildingMachines = machines.filter(
              (m) => m.buildingId === building.id
            );
            const activeBuildingMachines = buildingMachines.filter(
              (m) => m.isOn
            ).length;

            return (
              <div
                key={building.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {building.name}
                    </h3>
                    <p className="text-sm text-gray-600">{building.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {activeBuildingMachines}/{buildingMachines.length} máy đang chạy
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {buildingMachines.filter((m) => m.mode === 'automatic').length} chế độ tự động
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Machines */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Máy đang hoạt động ({activeMachines})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines
            .filter((m) => m.isOn)
            .map((machine) => {
              const isAlert =
                machine.currentTemp < machine.targetTempMin ||
                machine.currentTemp > machine.targetTempMax ||
                machine.currentHumidity < machine.targetHumidityMin ||
                machine.currentHumidity > machine.targetHumidityMax;

              return (
                <div
                  key={machine.id}
                  className={`border rounded-lg p-4 ${
                    isAlert ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {machine.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {machine.mode === 'automatic' ? 'Tự động' : 'Thủ công'}
                      </p>
                    </div>
                    {isAlert && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nhiệt độ:</span>
                      <span
                        className={
                          machine.currentTemp < machine.targetTempMin ||
                          machine.currentTemp > machine.targetTempMax
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-900'
                        }
                      >
                        {machine.currentTemp}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Độ ẩm:</span>
                      <span
                        className={
                          machine.currentHumidity < machine.targetHumidityMin ||
                          machine.currentHumidity > machine.targetHumidityMax
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-900'
                        }
                      >
                        {machine.currentHumidity}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quạt:</span>
                      <span className="text-gray-900">Mức {machine.fanLevel}</span>
                    </div>
                    {machine.currentFruit && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trái cây:</span>
                        <span className="text-gray-900">{machine.currentFruit}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
        {activeMachines === 0 && (
          <p className="text-center text-gray-500 py-8">
            Không có máy nào đang hoạt động
          </p>
        )}
      </div>
    </div>
  );
}
