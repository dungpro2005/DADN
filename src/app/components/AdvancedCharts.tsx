import {
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface AdvancedChartsProps {
  machineComparisonData?: any[];
  buildingStatsData?: any[];
  timeSeriesData?: any[];
}

const COLORS = [
  '#ef4444',
  '#3b82f6',
  '#9333ea',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
];

export function PieChartReport({ data, dataKey, title }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScatterChartReport({
  data,
  xDataKey,
  yDataKey,
  title,
}: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey={xDataKey} />
          <YAxis type="number" dataKey={yDataKey} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter
            name={yDataKey}
            data={data}
            fill="#ef4444"
            line={{ stroke: '#ef4444', strokeWidth: 2 }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DimensionalAnalysisChart({
  data,
  dimensions,
  metrics,
  title,
}: any) {
  // Create data for multi-dimensional analysis
  const transformedData = data.map((item: any) => ({
    name: item.name || item.date,
    ...Object.fromEntries(metrics.map((m: string) => [m, item[m]])),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                {dimensions}
              </th>
              {metrics.map((metric: string) => (
                <th key={metric} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transformedData.map((row: any, idx: number) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2 text-sm text-gray-900">{row.name}</td>
                {metrics.map((metric: string) => (
                  <td key={metric} className="px-4 py-2 text-sm text-gray-600">
                    {typeof row[metric] === 'number'
                      ? row[metric].toFixed(2)
                      : row[metric]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ComparisonMetricsChart({
  data,
  selectedMetrics,
  title,
}: any) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Tên
              </th>
              {selectedMetrics.map((metric: string) => (
                <th key={metric} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, idx: number) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {row.name || row.date}
                </td>
                {selectedMetrics.map((metric: string) => {
                  const value = row[metric];
                  let displayValue = value;
                  let badgeColor = 'bg-gray-100 text-gray-800';

                  // Color coding based on metric type and value
                  if (metric.toLowerCase().includes('temp')) {
                    if (value > 40) badgeColor = 'bg-red-100 text-red-800';
                    else if (value > 35) badgeColor = 'bg-orange-100 text-orange-800';
                    else badgeColor = 'bg-green-100 text-green-800';
                    displayValue = `${value}°C`;
                  } else if (metric.toLowerCase().includes('humidity')) {
                    if (value < 40 || value > 70) badgeColor = 'bg-red-100 text-red-800';
                    else if (value < 50 || value > 60) badgeColor = 'bg-yellow-100 text-yellow-800';
                    else badgeColor = 'bg-green-100 text-green-800';
                    displayValue = `${value}%`;
                  } else if (metric.toLowerCase().includes('uptime')) {
                    if (value > 90) badgeColor = 'bg-green-100 text-green-800';
                    else if (value > 70) badgeColor = 'bg-yellow-100 text-yellow-800';
                    else badgeColor = 'bg-red-100 text-red-800';
                    displayValue = `${value}%`;
                  }

                  return (
                    <td key={metric} className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${badgeColor}`}>
                        {typeof displayValue === 'number'
                          ? displayValue.toFixed(2)
                          : displayValue}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
