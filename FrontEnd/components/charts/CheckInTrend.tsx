import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

const data = [
  { name: 'Mon', value: 140 },
  { name: 'Tue', value: 175 },
  { name: 'Wed', value: 155 },
  { name: 'Thu', value: 188 },
  { name: 'Fri', value: 235 },
  { name: 'Sat', value: 270 },
  { name: 'Sun', value: 195 },
];

const CheckInTrend: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Orange (#f97316) for Dark Mode, Emerald for Light Mode
  const barColor = isDarkMode ? '#f97316' : '#10b981';

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDarkMode ? '#9ca3af' : '#1f2937', fontSize: 11 }} 
            dy={10}
          />
          <Tooltip 
            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            contentStyle={{ 
              backgroundColor: isDarkMode ? '#171717' : '#fff', 
              borderColor: isDarkMode ? '#262626' : '#e5e7eb',
              borderRadius: '8px',
              color: isDarkMode ? '#fff' : '#000'
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CheckInTrend;