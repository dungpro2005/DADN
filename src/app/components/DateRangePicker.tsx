import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { vi } from 'date-fns/locale';

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Chọn ngày';
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Từ ngày
        </label>
        <button
          onClick={() => setShowStartCalendar(!showStartCalendar)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-orange-500 transition-colors"
        >
          <span className={startDate ? 'text-gray-900' : 'text-gray-500'}>
            {formatDate(startDate)}
          </span>
          <Calendar className="w-5 h-5 text-gray-400" />
        </button>
        {showStartCalendar && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowStartCalendar(false)}
            ></div>
            <div className="absolute z-20 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3">
              <DayPicker
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  onStartDateChange(date);
                  setShowStartCalendar(false);
                }}
                locale={vi}
                disabled={{ after: endDate || new Date() }}
              />
            </div>
          </>
        )}
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đến ngày
        </label>
        <button
          onClick={() => setShowEndCalendar(!showEndCalendar)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:border-orange-500 transition-colors"
        >
          <span className={endDate ? 'text-gray-900' : 'text-gray-500'}>
            {formatDate(endDate)}
          </span>
          <Calendar className="w-5 h-5 text-gray-400" />
        </button>
        {showEndCalendar && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowEndCalendar(false)}
            ></div>
            <div className="absolute z-20 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3">
              <DayPicker
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  onEndDateChange(date);
                  setShowEndCalendar(false);
                }}
                locale={vi}
                disabled={{ before: startDate, after: new Date() }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
