import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Plus, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function BuildingsPage() {
  const { user, buildings, machines, addBuilding, removeBuilding } = useApp();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBuilding, setNewBuilding] = useState({ name: '', location: '' });

  const handleAddBuilding = () => {
    if (!newBuilding.name || !newBuilding.location) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    addBuilding(newBuilding);
    setNewBuilding({ name: '', location: '' });
    setShowAddDialog(false);
    toast.success('Đã thêm tòa nhà mới');
  };

  const handleRemoveBuilding = (buildingId: string, buildingName: string) => {
    const buildingMachines = machines.filter((m) => m.buildingId === buildingId);
    
    if (buildingMachines.length > 0) {
      toast.error(`Không thể xóa ${buildingName} vì còn ${buildingMachines.length} máy sấy`);
      return;
    }

    if (confirm(`Bạn có chắc muốn xóa ${buildingName}?`)) {
      removeBuilding(buildingId);
      toast.success('Đã xóa tòa nhà');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý tòa nhà
          </h1>
          <p className="text-gray-600">
            Danh sách các tòa nhà trong nhà máy
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm tòa nhà
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map((building) => {
          const buildingMachines = machines.filter(
            (m) => m.buildingId === building.id
          );
          const activeMachines = buildingMachines.filter((m) => m.isOn).length;

          return (
            <div
              key={building.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{building.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-white/90">
                        <MapPin className="w-4 h-4" />
                        {building.location}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() =>
                        handleRemoveBuilding(building.id, building.name)
                      }
                      className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Tổng số máy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {buildingMachines.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đang chạy</p>
                    <p className="text-2xl font-bold text-green-600">
                      {activeMachines}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tự động:</span>
                    <span className="font-semibold text-gray-900">
                      {buildingMachines.filter((m) => m.mode === 'automatic').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thủ công:</span>
                    <span className="font-semibold text-gray-900">
                      {buildingMachines.filter((m) => m.mode === 'manual').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {buildings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có tòa nhà nào</p>
        </div>
      )}

      {/* Add Building Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thêm tòa nhà mới
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tòa nhà
                </label>
                <input
                  type="text"
                  value={newBuilding.name}
                  onChange={(e) =>
                    setNewBuilding({ ...newBuilding, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Tòa nhà A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vị trí
                </label>
                <input
                  type="text"
                  value={newBuilding.location}
                  onChange={(e) =>
                    setNewBuilding({ ...newBuilding, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Khu vực 1"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddBuilding}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
