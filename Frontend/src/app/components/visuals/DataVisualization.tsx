import { DataVisualization as DataVisualizationType } from '@/app/types/intelligence';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface DataVisualizationProps {
  data: DataVisualizationType;
}

export function DataVisualization({ data }: DataVisualizationProps) {
  const chartData = data.data.map(point => ({
    name: point.label,
    value: point.value,
  }));

  return (
    <div className="space-y-4">
      <h3 className="intel-text-heading text-[15px]">
        {data.title}
      </h3>
      
      <div className="intel-card p-6 bg-[var(--intel-bg-secondary)]">
        <ResponsiveContainer width="100%" height={280}>
          {data.type === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--intel-border)" strokeOpacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--intel-text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--intel-border)' }}
              />
              <YAxis 
                label={{ value: data.yAxisLabel || '', angle: -90, position: 'insideLeft', fill: 'var(--intel-text-muted)', fontSize: 12 }}
                tick={{ fill: 'var(--intel-text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--intel-border)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="var(--intel-text-secondary)" 
                strokeWidth={2}
                dot={{ fill: 'var(--intel-text-secondary)', r: 4 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--intel-border)" strokeOpacity={0.5} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--intel-text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--intel-border)' }}
              />
              <YAxis 
                label={{ value: data.yAxisLabel || '', angle: -90, position: 'insideLeft', fill: 'var(--intel-text-muted)', fontSize: 12 }}
                tick={{ fill: 'var(--intel-text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--intel-border)' }}
              />
              <Bar 
                dataKey="value" 
                fill="var(--intel-text-secondary)" 
                opacity={0.85}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-2">
        <p className="intel-text-muted text-[13px] italic">
          {data.caption}
        </p>
        <p className="intel-text-body text-[14px] leading-[1.7]">
          {data.interpretation}
        </p>
      </div>
    </div>
  );
}
