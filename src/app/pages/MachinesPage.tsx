import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useYolobitServer } from '../hooks/useYolobitServer';
import {
  Settings,
  Plus,
  Trash2,
  Power,
  DoorOpen,
  DoorClosed,
  Thermometer,
  Droplet,
  Fan,
  Calendar,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Slider } from '../components/ui/slider';

export default function MachinesPage() {
  const {
    user,
    buildings,
    machines,
    schedules,
    addMachine,
    removeMachine,
    updateMachine,
  } = useApp();

  const yolobit = useYolobitServer();

  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const [deviceConfig, setDeviceConfig] = useState({
    sensorPin: 0, // Pin for DT20 sensor (I2C)
    fanPin: 2,    // Pin for fan PWM
    doorPin: 3,   // Pin for door sensor (optional)
    powerPin: 4,  // Pin for power control (optional)
    heaterPin: 5, // Pin for heater PWM
    humidifierPin: 6, // Pin for humidifier PWM
  });

  const [newMachine, setNewMachine] = useState({
    name: '',
    buildingId: '',
    targetTempMin: 60,
    targetTempMax: 70,
    targetHumidityMin: 40,
    targetHumidityMax: 50,
  });

  const filteredMachines =
    selectedBuilding === 'all'
      ? machines
      : machines.filter((m) => m.buildingId === selectedBuilding);

  const isAdmin = user?.role === 'admin';

  // Update machine data from Yolobit sensor
  useEffect(() => {
    if (yolobit.sensorData && selectedMachine) {
      updateMachine(selectedMachine, {
        currentTemp: yolobit.sensorData.temp,
        currentHumidity: yolobit.sensorData.humidity,
        fanLevel: yolobit.sensorData.fan as 0 | 1 | 2 | 3 | 4 | 5,
        heaterLevel: (yolobit.sensorData.heater as 0 | 1 | 2 | 3 | 4 | 5) || 0,
        humidifierLevel: (yolobit.sensorData.humidifier as 0 | 1 | 2 | 3 | 4 | 5) || 0,
      });
    }
  }, [yolobit.sensorData, selectedMachine, updateMachine]);

  const handleAddMachine = () => {
    if (!newMachine.name || !newMachine.buildingId) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    addMachine({
      ...newMachine,
      isOn: false,
      isDoorOpen: false,
      currentTemp: 25,
      currentHumidity: 60,
      fanLevel: 0,
      heaterLevel: 0,
      humidifierLevel: 0,
      mode: 'manual',
    });

    setNewMachine({
      name: '',
      buildingId: '',
      targetTempMin: 60,
      targetTempMax: 70,
      targetHumidityMin: 40,
      targetHumidityMax: 50,
    });
    setShowAddDialog(false);
    toast.success('Đã thêm máy sấy mới');
  };

  const handleRemoveMachine = (machineId: string, machineName: string) => {
    if (confirm(`Bạn có chắc muốn xóa ${machineName}?`)) {
      removeMachine(machineId);
      toast.success('Đã xóa máy sấy');
    }
  };

  const togglePower = (machineId: string, currentState: boolean) => {
    updateMachine(machineId, {
      isOn: !currentState,
      currentTemp: !currentState ? 45 : 25,
    });
    toast.success(!currentState ? 'Đã bật máy' : 'Đã tắt máy');
  };

  const toggleDoor = (machineId: string, currentState: boolean) => {
    updateMachine(machineId, { isDoorOpen: !currentState });
    toast.success(currentState ? 'Đã đóng cửa' : 'Đã mở cửa');
  };

  const setFanLevel = (machineId: string, level: 0 | 1 | 2 | 3 | 4 | 5) => {
    updateMachine(machineId, { fanLevel: level });
    if (yolobit.isConnected) {
      yolobit.sendCommand({ command: 'set_fan', level });
    }
    toast.success(`Đã đặt quạt mức ${level}`);
  };

  const setHeaterLevel = (machineId: string, level: 0 | 1 | 2 | 3 | 4 | 5) => {
    updateMachine(machineId, { heaterLevel: level });
    if (yolobit.isConnected) {
      yolobit.sendCommand({ command: 'set_heater', level });
    }
    toast.success(`Đã đặt sưởi ấm mức ${level}`);
  };

  const setHumidifierLevel = (machineId: string, level: 0 | 1 | 2 | 3 | 4 | 5) => {
    updateMachine(machineId, { humidifierLevel: level });
    if (yolobit.isConnected) {
      yolobit.sendCommand({ command: 'set_humidifier', level });
    }
    toast.success(`Đã đặt làm ẩm mức ${level}`);
  };

  const handleConnectYolobit = async (machineId: string) => {
    try {
      await yolobit.connect();
      toast.success('Đã kết nối với Yolobit');
    } catch (error) {
      toast.error('Không thể kết nối với Yolobit: ' + (error as Error).message);
    }
  };

  const handleDisconnectYolobit = async () => {
    try {
      await yolobit.disconnect();
      toast.success('Đã ngắt kết nối Yolobit');
    } catch (error) {
      toast.error('Lỗi khi ngắt kết nối: ' + (error as Error).message);
    }
  };

  const handleConfigureDevices = () => {
    if (!yolobit.isConnected) {
      toast.error('Vui lòng kết nối với Yolobit trước');
      return;
    }
    setShowConfigDialog(true);
  };

  const saveDeviceConfig = async () => {
    try {
      await yolobit.sendCommand({
        command: 'configure_devices',
        config: deviceConfig
      });
      toast.success('Đã gửi cấu hình thiết bị đến Yolobit');
      setShowConfigDialog(false);
    } catch (error) {
      toast.error('Lỗi khi gửi cấu hình: ' + (error as Error).message);
    }
  };

  const setMode = (
    machineId: string,
    mode: 'manual' | 'automatic',
    scheduleId?: string
  ) => {
    updateMachine(machineId, { mode, scheduleId });
    toast.success(`Đã chuyển sang chế độ ${mode === 'manual' ? 'thủ công' : 'tự động'}`);
  };

  const updateTemperature = (
    machineId: string,
    min: number,
    max: number
  ) => {
    updateMachine(machineId, { targetTempMin: min, targetTempMax: max });
    toast.success('Đã cập nhật ngưỡng nhiệt độ');
  };

  const updateHumidity = (
    machineId: string,
    min: number,
    max: number
  ) => {
    updateMachine(machineId, {
      targetHumidityMin: min,
      targetHumidityMax: max,
    });
    toast.success('Đã cập nhật ngưỡng độ ẩm');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý máy sấy
          </h1>
          <p className="text-gray-600">Điều khiển và giám sát máy sấy</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tất cả tòa nhà</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleConfigureDevices}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            Cấu hình thiết bị
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm máy
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredMachines.map((machine) => {
          const building = buildings.find((b) => b.id === machine.buildingId);
          const isExpanded = selectedMachine === machine.id;

          return (
            <div
              key={machine.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Machine Header */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        machine.isOn ? 'bg-green-100' : 'bg-gray-200'
                      }`}
                    >
                      <Settings
                        className={`w-6 h-6 ${
                          machine.isOn ? 'text-green-600' : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {machine.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {building?.name} • {machine.mode === 'automatic' ? 'Tự động' : 'Thủ công'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        yolobit.isConnected
                          ? handleDisconnectYolobit()
                          : handleConnectYolobit(machine.id)
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        yolobit.isConnected
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={
                        yolobit.isConnected
                          ? 'Ngắt kết nối Yolobit'
                          : 'Kết nối với Yolobit'
                      }
                    >
                      {yolobit.isConnected ? (
                        <Wifi className="w-5 h-5" />
                      ) : (
                        <WifiOff className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setSelectedMachine(isExpanded ? null : machine.id)
                      }
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      {isExpanded ? 'Thu gọn' : 'Điều khiển'}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() =>
                          handleRemoveMachine(machine.id, machine.name)
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Machine Stats */}
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-600">Nhiệt độ</p>
                      <p className="text-xl font-bold text-gray-900">
                        {machine.currentTemp}°C
                      </p>
                      <p className="text-xs text-gray-500">
                        ({machine.targetTempMin}-{machine.targetTempMax}°C)
                      </p>
                      {yolobit.isConnected && yolobit.sensorData && (
                        <p className="text-xs text-green-600">Real-time</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplet className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Độ ẩm</p>
                      <p className="text-xl font-bold text-gray-900">
                        {machine.currentHumidity}%
                      </p>
                      <p className="text-xs text-gray-500">
                        ({machine.targetHumidityMin}-{machine.targetHumidityMax}%)
                      </p>
                      {yolobit.isConnected && yolobit.sensorData && (
                        <p className="text-xs text-green-600">Real-time</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Fan className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Quạt</p>
                      <p className="text-xl font-bold text-gray-900">
                        Mức {machine.fanLevel}
                      </p>
                      <p className="text-xs text-gray-500">(0-5)</p>
                      {yolobit.isConnected && (
                        <p className="text-xs text-green-600">Điều khiển</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {machine.isDoorOpen ? (
                      <DoorOpen className="w-8 h-8 text-orange-500" />
                    ) : (
                      <DoorClosed className="w-8 h-8 text-gray-500" />
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Cửa</p>
                      <p className="text-xl font-bold text-gray-900">
                        {machine.isDoorOpen ? 'Mở' : 'Đóng'}
                      </p>
                      {yolobit.isConnected && yolobit.sensorData?.door_open !== undefined && (
                        <p className="text-xs text-green-600">
                          {yolobit.sensorData.door_open ? 'Mở' : 'Đóng'} (HW)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Sưởi ấm</p>
                      <p className="text-xl font-bold text-gray-900">
                        Mức {machine.heaterLevel}
                      </p>
                      <p className="text-xs text-gray-500">(0-5)</p>
                      {yolobit.isConnected && (
                        <p className="text-xs text-green-600">Điều khiển</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplet className="w-8 h-8 text-cyan-500" />
                    <div>
                      <p className="text-sm text-gray-600">Làm ẩm</p>
                      <p className="text-xl font-bold text-gray-900">
                        Mức {machine.humidifierLevel}
                      </p>
                      <p className="text-xs text-gray-500">(0-5)</p>
                      {yolobit.isConnected && (
                        <p className="text-xs text-green-600">Điều khiển</p>
                      )}
                    </div>
                  </div>
                </div>
                {yolobit.isConnected && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <Wifi className="w-4 h-4 inline mr-2" />
                      Đã kết nối với Yolobit - Dữ liệu cảm biến đang được cập nhật real-time
                    </p>
                    {yolobit.sensorData?.power_on !== undefined && (
                      <p className="text-xs text-green-700 mt-1">
                        Nguồn: {yolobit.sensorData.power_on ? 'Bật' : 'Tắt'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Control Panel */}
              {isExpanded && (
                <div className="p-6 bg-gray-50">
                  {/* Mode Selection */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Chế độ hoạt động
                    </h4>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setMode(machine.id, 'manual')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                          machine.mode === 'manual'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <Settings className="w-5 h-5 mx-auto mb-1" />
                        <p className="font-semibold">Thủ công</p>
                      </button>
                      <button
                        onClick={() => setMode(machine.id, 'automatic')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                          machine.mode === 'automatic'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <Calendar className="w-5 h-5 mx-auto mb-1" />
                        <p className="font-semibold">Tự động</p>
                      </button>
                    </div>
                  </div>

                  {machine.mode === 'automatic' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn lịch trình
                      </label>
                      <select
                        value={machine.scheduleId || ''}
                        onChange={(e) =>
                          setMode(machine.id, 'automatic', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">-- Chọn lịch trình --</option>
                        {schedules.map((schedule) => (
                          <option key={schedule.id} value={schedule.id}>
                            {schedule.name} ({schedule.fruitType}) -{' '}
                            {schedule.duration} phút
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Manual Controls */}
                  {machine.mode === 'manual' && (
                    <>
                      {/* Power and Door */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                          onClick={() => togglePower(machine.id, machine.isOn)}
                          className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-colors ${
                            machine.isOn
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          <Power className="w-5 h-5" />
                          {machine.isOn ? 'Tắt máy' : 'Bật máy'}
                        </button>
                        <button
                          onClick={() =>
                            toggleDoor(machine.id, machine.isDoorOpen)
                          }
                          disabled={!machine.isOn}
                          className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-colors ${
                            !machine.isOn
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : machine.isDoorOpen
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          {machine.isDoorOpen ? (
                            <DoorClosed className="w-5 h-5" />
                          ) : (
                            <DoorOpen className="w-5 h-5" />
                          )}
                          {machine.isDoorOpen ? 'Đóng cửa' : 'Mở cửa'}
                        </button>
                      </div>

                  {/* Hardware Power Control */}
                  {deviceConfig.powerPin >= 0 && yolobit.isConnected && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Điều khiển nguồn hardware
                      </label>
                      <button
                        onClick={() => yolobit.sendCommand({
                          command: 'set_power',
                          state: !yolobit.sensorData?.power_on
                        })}
                        className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-colors w-full ${
                          yolobit.sensorData?.power_on
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        <Power className="w-5 h-5" />
                        {yolobit.sensorData?.power_on ? 'Tắt nguồn HW' : 'Bật nguồn HW'}
                      </button>
                    </div>
                  )}

                  {/* Temperature Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngưỡng nhiệt độ (°C)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600">Tối thiểu</label>
                            <input
                              type="number"
                              value={machine.targetTempMin}
                              onChange={(e) =>
                                updateTemperature(
                                  machine.id,
                                  Number(e.target.value),
                                  machine.targetTempMax
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Tối đa</label>
                            <input
                              type="number"
                              value={machine.targetTempMax}
                              onChange={(e) =>
                                updateTemperature(
                                  machine.id,
                                  machine.targetTempMin,
                                  Number(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Humidity Range */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngưỡng độ ẩm (%)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600">Tối thiểu</label>
                            <input
                              type="number"
                              value={machine.targetHumidityMin}
                              onChange={(e) =>
                                updateHumidity(
                                  machine.id,
                                  Number(e.target.value),
                                  machine.targetHumidityMax
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Tối đa</label>
                            <input
                              type="number"
                              value={machine.targetHumidityMax}
                              onChange={(e) =>
                                updateHumidity(
                                  machine.id,
                                  machine.targetHumidityMin,
                                  Number(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Fan Speed Control */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Tốc độ quạt
                        </label>
                        <div className="flex items-center gap-4">
                          <Fan className="w-5 h-5 text-purple-500" />
                          <div className="flex-1">
                            <Slider
                              value={[machine.fanLevel]}
                              onValueChange={(value) => setFanLevel(machine.id, value[0] as 0 | 1 | 2 | 3 | 4 | 5)}
                              min={0}
                              max={5}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">
                            Mức {machine.fanLevel}
                          </span>
                        </div>
                      </div>

                      {/* Heater Control */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Sưởi ấm
                        </label>
                        <div className="flex items-center gap-4">
                          <Thermometer className="w-5 h-5 text-red-500" />
                          <div className="flex-1">
                            <Slider
                              value={[machine.heaterLevel]}
                              onValueChange={(value) => setHeaterLevel(machine.id, value[0] as 0 | 1 | 2 | 3 | 4 | 5)}
                              min={0}
                              max={5}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">
                            Mức {machine.heaterLevel}
                          </span>
                        </div>
                      </div>

                      {/* Humidifier Control */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Làm ẩm
                        </label>
                        <div className="flex items-center gap-4">
                          <Droplet className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <Slider
                              value={[machine.humidifierLevel]}
                              onValueChange={(value) => setHumidifierLevel(machine.id, value[0] as 0 | 1 | 2 | 3 | 4 | 5)}
                              min={0}
                              max={5}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">
                            Mức {machine.humidifierLevel}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredMachines.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không có máy sấy nào</p>
        </div>
      )}

      {/* Device Configuration Dialog */}
      {showConfigDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cấu hình thiết bị Yolobit
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Cấu hình chân GPIO cho các thiết bị kết nối với Yolobit
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chân cảm biến DT20 (I2C)
                </label>
                <select
                  value={deviceConfig.sensorPin}
                  onChange={(e) =>
                    setDeviceConfig({
                      ...deviceConfig,
                      sensorPin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Pin 0 (SDA)</option>
                  <option value={1}>Pin 1 (SCL)</option>
                  <option value={4}>Pin 4 (SDA)</option>
                  <option value={5}>Pin 5 (SCL)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chân điều khiển quạt (PWM)
                </label>
                <select
                  value={deviceConfig.fanPin}
                  onChange={(e) =>
                    setDeviceConfig({
                      ...deviceConfig,
                      fanPin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].map(pin => (
                    <option key={pin} value={pin}>Pin {pin}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chân cảm biến cửa (Digital Input)
                </label>
                <select
                  value={deviceConfig.doorPin}
                  onChange={(e) =>
                    setDeviceConfig({
                      ...deviceConfig,
                      doorPin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={-1}>Không sử dụng</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].map(pin => (
                    <option key={pin} value={pin}>Pin {pin}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chân điều khiển nguồn (Digital Output)
                </label>
                <select
                  value={deviceConfig.powerPin}
                  onChange={(e) =>
                    setDeviceConfig({
                      ...deviceConfig,
                      powerPin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={-1}>Không sử dụng</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].map(pin => (
                    <option key={pin} value={pin}>Pin {pin}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chân điều khiển sưởi ấm (PWM)
                </label>
                <select
                  value={deviceConfig.heaterPin}
                  onChange={(e) =>
                    setDeviceConfig({
                      ...deviceConfig,
                      heaterPin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={-1}>Không sử dụng</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].map(pin => (
                    <option key={pin} value={pin}>Pin {pin}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chân điều khiển làm ẩm (PWM)
                </label>
                <select
                  value={deviceConfig.humidifierPin}
                  onChange={(e) =>
                    setDeviceConfig({
                      ...deviceConfig,
                      humidifierPin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={-1}>Không sử dụng</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].map(pin => (
                    <option key={pin} value={pin}>Pin {pin}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={saveDeviceConfig}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Machine Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thêm máy sấy mới
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên máy sấy
                </label>
                <input
                  type="text"
                  value={newMachine.name}
                  onChange={(e) =>
                    setNewMachine({ ...newMachine, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Máy sấy A1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tòa nhà
                </label>
                <select
                  value={newMachine.buildingId}
                  onChange={(e) =>
                    setNewMachine({ ...newMachine, buildingId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">-- Chọn tòa nhà --</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngưỡng nhiệt độ (°C)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newMachine.targetTempMin}
                    onChange={(e) =>
                      setNewMachine({
                        ...newMachine,
                        targetTempMin: Number(e.target.value),
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={newMachine.targetTempMax}
                    onChange={(e) =>
                      setNewMachine({
                        ...newMachine,
                        targetTempMax: Number(e.target.value),
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngưỡng độ ẩm (%)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newMachine.targetHumidityMin}
                    onChange={(e) =>
                      setNewMachine({
                        ...newMachine,
                        targetHumidityMin: Number(e.target.value),
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={newMachine.targetHumidityMax}
                    onChange={(e) =>
                      setNewMachine({
                        ...newMachine,
                        targetHumidityMax: Number(e.target.value),
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Max"
                  />
                </div>
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
                onClick={handleAddMachine}
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
