import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

const data = [
  { name: 'Mon', value: 92 },
  { name: 'Tue', value: 95 },
  { name: 'Wed', value: 88 },
  { name: 'Thu', value: 94 },
  { name: 'Fri', value: 97 },
  { name: 'Sat', value: 99 },
  { name: 'Sun', value: 96 },
];

const SystemHealth: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Orange (#f97316) for Dark Mode, Indigo for Light Mode
  const strokeColor = isDarkMode ? '#f97316' : '#6366f1';

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDarkMode ? '#9ca3af' : '#1f2937', fontSize: 11 }} 
            dy={10}
          />
          <Tooltip 
             contentStyle={{ 
              backgroundColor: isDarkMode ? '#171717' : '#fff', 
              borderColor: isDarkMode ? '#262626' : '#e5e7eb',
              borderRadius: '8px',
              color: isDarkMode ? '#fff' : '#000'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorHealth)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemHealth;