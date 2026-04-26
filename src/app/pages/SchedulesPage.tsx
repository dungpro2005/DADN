import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Plus, Clock, Thermometer, Droplet, Fan } from 'lucide-react';
import { toast } from 'sonner';
import { Schedule, ScheduleStep } from '../types';

export default function SchedulesPage() {
  const { schedules, addSchedule, updateSchedule } = useApp();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );

  const [newSchedule, setNewSchedule] = useState({
    name: '',
    fruitType: '',
    targetTempMin: 50,
    targetTempMax: 60,
    targetHumidityMin: 40,
    targetHumidityMax: 50,
  });

  const [editSchedule, setEditSchedule] = useState({
    name: '',
    fruitType: '',
    targetTempMin: 50,
    targetTempMax: 60,
    targetHumidityMin: 40,
    targetHumidityMax: 50,
  });

  const [editSteps, setEditSteps] = useState<Omit<ScheduleStep, 'id'>[]>([]);

  const [steps, setSteps] = useState<Omit<ScheduleStep, 'id'>[]>([
    {
      order: 1,
      duration: 120,
      tempMin: 50,
      tempMax: 60,
      humidityMin: 40,
      humidityMax: 50,
      fanLevel: 2,
      doorOpen: false,
    },
  ]);

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        order: steps.length + 1,
        duration: 120,
        tempMin: 60,
        tempMax: 70,
        humidityMin: 30,
        humidityMax: 40,
        fanLevel: 3,
        doorOpen: false,
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Reorder
    setSteps(
      newSteps.map((step, i) => ({
        ...step,
        order: i + 1,
      }))
    );
  };

  const handleUpdateStep = (
    index: number,
    updates: Partial<ScheduleStep>
  ) => {
    setSteps(
      steps.map((step, i) =>
        i === index ? { ...step, ...updates } : step
      )
    );
  };

  const handleAddSchedule = () => {
    if (!newSchedule.name || !newSchedule.fruitType) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (steps.length === 0) {
      toast.error('Cần ít nhất 1 bước');
      return;
    }

    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

    addSchedule({
      ...newSchedule,
      duration: totalDuration,
      steps: steps.map((step, index) => ({
        ...step,
        id: `step${index + 1}`,
      })),
    });

    setNewSchedule({
      name: '',
      fruitType: '',
      targetTempMin: 50,
      targetTempMax: 60,
      targetHumidityMin: 40,
      targetHumidityMax: 50,
    });
    setSteps([
      {
        order: 1,
        duration: 120,
        tempMin: 50,
        tempMax: 60,
        humidityMin: 40,
        humidityMax: 50,
        fanLevel: 2,
        doorOpen: false,
      },
    ]);
    setShowAddDialog(false);
    toast.success('Đã thêm lịch trình mới');
  };

  const handleEditSchedule = () => {
    if (!editingSchedule) return;

    if (!editSchedule.name || !editSchedule.fruitType) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (editSteps.length === 0) {
      toast.error('Cần ít nhất 1 bước');
      return;
    }

    const totalDuration = editSteps.reduce((sum, step) => sum + step.duration, 0);

    updateSchedule(editingSchedule.id, {
      ...editSchedule,
      duration: totalDuration,
      steps: editSteps.map((step, index) => ({
        ...step,
        id: `step${index + 1}`,
      })),
    });

    setShowEditDialog(false);
    setEditingSchedule(null);
    toast.success('Đã cập nhật lịch trình');
  };

  const handleOpenEditDialog = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditSchedule({
      name: schedule.name,
      fruitType: schedule.fruitType,
      targetTempMin: schedule.targetTempMin || 50,
      targetTempMax: schedule.targetTempMax || 60,
      targetHumidityMin: schedule.targetHumidityMin || 40,
      targetHumidityMax: schedule.targetHumidityMax || 50,
    });
    setEditSteps(schedule.steps.map(step => ({
      order: step.order,
      duration: step.duration,
      tempMin: step.tempMin,
      tempMax: step.tempMax,
      humidityMin: step.humidityMin,
      humidityMax: step.humidityMax,
      fanLevel: step.fanLevel,
      doorOpen: step.doorOpen,
    })));
    setShowEditDialog(true);
  };

  const handleAddEditStep = () => {
    setEditSteps([
      ...editSteps,
      {
        order: editSteps.length + 1,
        duration: 120,
        tempMin: 60,
        tempMax: 70,
        humidityMin: 30,
        humidityMax: 40,
        fanLevel: 3,
        doorOpen: false,
      },
    ]);
  };

  const handleRemoveEditStep = (index: number) => {
    const newSteps = editSteps.filter((_, i) => i !== index);
    // Reorder
    setEditSteps(
      newSteps.map((step, i) => ({
        ...step,
        order: i + 1,
      }))
    );
  };

  const handleUpdateEditStep = (
    index: number,
    updates: Partial<ScheduleStep>
  ) => {
    setEditSteps(
      editSteps.map((step, i) =>
        i === index ? { ...step, ...updates } : step
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý lịch trình
          </h1>
          <p className="text-gray-600">
            Lịch trình sấy tự động cho các loại trái cây
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm lịch trình
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            onClick={() => setSelectedSchedule(schedule)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{schedule.name}</h3>
                  <p className="text-sm text-white/90">{schedule.fruitType}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs bg-white/10 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-white">
                  <Thermometer className="w-3 h-3" />
                  <span>{schedule.targetTempMin}-{schedule.targetTempMax}°C</span>
                </div>
                <div className="flex items-center gap-1 text-white">
                  <Droplet className="w-3 h-3" />
                  <span>{schedule.targetHumidityMin}-{schedule.targetHumidityMax}%</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  Tổng thời gian: {schedule.duration} phút (
                  {Math.floor(schedule.duration / 60)} giờ{' '}
                  {schedule.duration % 60} phút)
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  {schedule.steps.length} bước:
                </p>
                {schedule.steps.slice(0, 3).map((step) => (
                  <div
                    key={step.id}
                    className="text-sm bg-gray-50 p-3 rounded-lg"
                  >
                    <p className="font-semibold text-gray-900 mb-1">
                      Bước {step.order} - {step.duration} phút
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>🌡️ {step.tempMin}-{step.tempMax}°C</div>
                      <div>💧 {step.humidityMin}-{step.humidityMax}%</div>
                    </div>
                  </div>
                ))}
                {schedule.steps.length > 3 && (
                  <p className="text-xs text-blue-600 font-medium">
                    + {schedule.steps.length - 3} bước khác...
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có lịch trình nào</p>
        </div>
      )}

      {/* Schedule Detail Modal */}
      {selectedSchedule && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSchedule(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSchedule.name}
                </h2>
                <p className="text-gray-600">
                  Loại trái cây: {selectedSchedule.fruitType}
                </p>
              </div>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Thermometer className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nhiệt độ mục tiêu</p>
                  <p className="text-lg font-bold text-gray-900">{selectedSchedule.targetTempMin} - {selectedSchedule.targetTempMax}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Droplet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Độ ẩm mục tiêu</p>
                  <p className="text-lg font-bold text-gray-900">{selectedSchedule.targetHumidityMin} - {selectedSchedule.targetHumidityMax}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-gray-900 border-b pb-2">Chi tiết các bước</h3>
              {selectedSchedule.steps.map((step) => (
                <div
                  key={step.id}
                  className="border border-gray-100 bg-gray-50/50 rounded-lg p-4"
                >
                  <div className="flex justify-between mb-3">
                    <h3 className="font-bold text-gray-900">
                      Bước {step.order}
                    </h3>
                    <div className="flex items-center gap-1 text-orange-600 font-semibold text-sm">
                      <Clock className="w-4 h-4" />
                      {step.duration} phút
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="text-xs text-gray-500">Nhiệt độ</p>
                        <p className="text-sm font-semibold">{step.tempMin}-{step.tempMax}°C</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Độ ẩm</p>
                        <p className="text-sm font-semibold">{step.humidityMin}-{step.humidityMax}%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Fan className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Quạt</p>
                        <p className="text-sm font-semibold">Mức {step.fanLevel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleOpenEditDialog(selectedSchedule);
                  setSelectedSchedule(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                Chỉnh sửa lịch trình
              </button>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Thêm lịch trình mới
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên lịch trình
                  </label>
                  <input
                    type="text"
                    value={newSchedule.name}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="VD: Xoài sấy dẻo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại trái cây
                  </label>
                  <input
                    type="text"
                    value={newSchedule.fruitType}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        fruitType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="VD: Xoài"
                  />
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <h3 className="text-sm font-bold text-orange-800 mb-3 uppercase tracking-wider">Thiết lập ngưỡng vận hành mục tiêu</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nhiệt độ Min (°C)</label>
                    <input
                      type="number"
                      value={newSchedule.targetTempMin}
                      onChange={(e) => setNewSchedule({ ...newSchedule, targetTempMin: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nhiệt độ Max (°C)</label>
                    <input
                      type="number"
                      value={newSchedule.targetTempMax}
                      onChange={(e) => setNewSchedule({ ...newSchedule, targetTempMax: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Độ ẩm Min (%)</label>
                    <input
                      type="number"
                      value={newSchedule.targetHumidityMin}
                      onChange={(e) => setNewSchedule({ ...newSchedule, targetHumidityMin: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Độ ẩm Max (%)</label>
                    <input
                      type="number"
                      value={newSchedule.targetHumidityMax}
                      onChange={(e) => setNewSchedule({ ...newSchedule, targetHumidityMax: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">
                    Cấu hình các bước sấy ({steps.length})
                  </h3>
                  <button
                    onClick={handleAddStep}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm bước
                  </button>
                </div>

                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-800">
                          Bước {step.order}
                        </h4>
                        {steps.length > 1 && (
                          <button
                            onClick={() => handleRemoveStep(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          >
                            Xóa bước
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Thời gian (phút)</label>
                          <input
                            type="number"
                            value={step.duration}
                            onChange={(e) => handleUpdateStep(index, { duration: Number(e.target.value) })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Nhiệt độ ({step.tempMin}-{step.tempMax}°C)</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={step.tempMin}
                              onChange={(e) => handleUpdateStep(index, { tempMin: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              value={step.tempMax}
                              onChange={(e) => handleUpdateStep(index, { tempMax: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Độ ẩm ({step.humidityMin}-{step.humidityMax}%)</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={step.humidityMin}
                              onChange={(e) => handleUpdateStep(index, { humidityMin: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              value={step.humidityMax}
                              onChange={(e) => handleUpdateStep(index, { humidityMax: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Mức quạt (0-3)</label>
                          <select
                            value={step.fanLevel}
                            onChange={(e) => handleUpdateStep(index, { fanLevel: Number(e.target.value) as 0 | 1 | 2 | 3 })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none"
                          >
                            {[0, 1, 2, 3].map(v => <option key={v} value={v}>Mức {v}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={step.doorOpen}
                              onChange={(e) => handleUpdateStep(index, { doorOpen: e.target.checked })}
                              className="w-4 h-4 rounded text-orange-500 border-gray-300 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">Mở cửa</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 border-t pt-6">
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleAddSchedule}
                className="flex-2 px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-bold shadow-sm"
              >
                Lưu lịch trình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Dialog */}
      {showEditDialog && editingSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Chỉnh sửa lịch trình
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên lịch trình
                  </label>
                  <input
                    type="text"
                    value={editSchedule.name}
                    onChange={(e) =>
                      setEditSchedule({ ...editSchedule, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại trái cây
                  </label>
                  <input
                    type="text"
                    value={editSchedule.fruitType}
                    onChange={(e) =>
                      setEditSchedule({
                        ...editSchedule,
                        fruitType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h3 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider">Thiết lập ngưỡng vận hành mục tiêu</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nhiệt độ Min (°C)</label>
                    <input
                      type="number"
                      value={editSchedule.targetTempMin}
                      onChange={(e) => setEditSchedule({ ...editSchedule, targetTempMin: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nhiệt độ Max (°C)</label>
                    <input
                      type="number"
                      value={editSchedule.targetTempMax}
                      onChange={(e) => setEditSchedule({ ...editSchedule, targetTempMax: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Độ ẩm Min (%)</label>
                    <input
                      type="number"
                      value={editSchedule.targetHumidityMin}
                      onChange={(e) => setEditSchedule({ ...editSchedule, targetHumidityMin: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Độ ẩm Max (%)</label>
                    <input
                      type="number"
                      value={editSchedule.targetHumidityMax}
                      onChange={(e) => setEditSchedule({ ...editSchedule, targetHumidityMax: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">
                    Cấu hình các bước sấy ({editSteps.length})
                  </h3>
                  <button
                    onClick={handleAddEditStep}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm bước
                  </button>
                </div>

                <div className="space-y-4">
                  {editSteps.map((step, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-800">
                          Bước {step.order}
                        </h4>
                        {editSteps.length > 1 && (
                          <button
                            onClick={() => handleRemoveEditStep(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          >
                            Xóa bước
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Thời gian (phút)</label>
                          <input
                            type="number"
                            value={step.duration}
                            onChange={(e) => handleUpdateEditStep(index, { duration: Number(e.target.value) })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Nhiệt độ ({step.tempMin}-{step.tempMax}°C)</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={step.tempMin}
                              onChange={(e) => handleUpdateEditStep(index, { tempMin: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              value={step.tempMax}
                              onChange={(e) => handleUpdateEditStep(index, { tempMax: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Độ ẩm ({step.humidityMin}-{step.humidityMax}%)</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={step.humidityMin}
                              onChange={(e) => handleUpdateEditStep(index, { humidityMin: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              value={step.humidityMax}
                              onChange={(e) => handleUpdateEditStep(index, { humidityMax: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Mức quạt (0-3)</label>
                          <select
                            value={step.fanLevel}
                            onChange={(e) => handleUpdateEditStep(index, { fanLevel: Number(e.target.value) as 0 | 1 | 2 | 3 })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          >
                            {[0, 1, 2, 3].map(v => <option key={v} value={v}>Mức {v}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={step.doorOpen}
                              onChange={(e) => handleUpdateEditStep(index, { doorOpen: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-500 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Mở cửa</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 border-t pt-6">
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingSchedule(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleEditSchedule}
                className="flex-2 px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-bold shadow-sm"
              >
                Cập nhật lịch trình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
