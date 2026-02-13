import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

const data = [
  { name: 'Online', value: 72 },
  { name: 'Offline', value: 8 },
  { name: 'Warning', value: 20 },
];

const KioskStatus: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Dark Mode: Orange, Dark Grey, Light Grey (matching ATC Admin)
  // Light Mode: Emerald, Indigo, Amber
  const COLORS = isDarkMode 
    ? ['#f97316', '#3f3f46', '#71717a'] 
    : ['#10b981', '#6366f1', '#f59e0b'];

  return (
    <div className="h-full w-full flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Center Text Trick */}
        </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ 
              backgroundColor: isDarkMode ? '#171717' : '#fff', 
              borderColor: isDarkMode ? '#262626' : '#e5e7eb',
              borderRadius: '8px',
              color: isDarkMode ? '#fff' : '#000'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KioskStatus;