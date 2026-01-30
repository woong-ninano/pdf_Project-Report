
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MetricData } from '../types';

interface MetricChartProps {
  data: MetricData[];
  title: string;
}

const MetricChart: React.FC<MetricChartProps> = ({ data, title }) => {
  return (
    <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-8 text-[#004a99]">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
            <Tooltip 
              cursor={{fill: '#f3f4f6'}}
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#004a99' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricChart;
