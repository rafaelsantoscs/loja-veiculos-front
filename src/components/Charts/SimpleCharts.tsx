"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface SimpleBarChartProps {
  title: string;
  data: ChartData[];
  className?: string;
}

interface SimpleLineChartProps {
  title: string;
  data: Array<{ date: string; value: number }>;
  trend: 'up' | 'down' | 'stable';
  className?: string;
}

interface SimplePieChartProps {
  title: string;
  data: ChartData[];
  className?: string;
}

// Gráfico de barras simples
export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  title, 
  data, 
  className = "" 
}) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="w-24 text-sm text-slate-300 truncate">
              {item.label}
            </div>
            <div className="flex-1 relative h-8 bg-slate-800 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-full rounded-lg"
                style={{ backgroundColor: item.color }}
              />
              <div className="absolute inset-0 flex items-center justify-end pr-2">
                <span className="text-xs font-medium text-white">
                  {item.value}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Gráfico de linha simples
export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ 
  title, 
  data, 
  trend, 
  className = "" 
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trendColor} bg-white/10`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-medium">
            {trend === 'up' ? 'Crescimento' : trend === 'down' ? 'Declínio' : 'Estável'}
          </span>
        </div>
      </div>

      <div className="relative h-32">
        <svg className="w-full h-full" viewBox="0 0 400 120">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 30}
              x2="400"
              y2={i * 30}
              stroke="rgb(51 65 85)"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Line chart */}
          {data.length > 1 && (
            <motion.polyline
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              fill="none"
              stroke={trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#f59e0b'}
              strokeWidth="3"
              points={data.map((point, index) => {
                const x = (index / (data.length - 1)) * 380 + 10;
                const y = 120 - (point.value / Math.max(...data.map(d => d.value))) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 380 + 10;
            const y = 120 - (point.value / Math.max(...data.map(d => d.value))) * 100;
            return (
              <motion.circle
                key={index}
                initial={{ r: 0 }}
                animate={{ r: 4 }}
                transition={{ delay: index * 0.1 + 1 }}
                cx={x}
                cy={y}
                fill={trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#f59e0b'}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between text-xs text-slate-400 mt-2">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </motion.div>
  );
};

// Gráfico de pizza simples
export const SimplePieChart: React.FC<SimplePieChartProps> = ({ 
  title, 
  data, 
  className = "" 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const paths = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const x1 = 50 + 35 * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = 50 + 35 * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = 50 + 35 * Math.cos((endAngle - 90) * Math.PI / 180);
    const y2 = 50 + 35 * Math.sin((endAngle - 90) * Math.PI / 180);

    const largeArc = angle > 180 ? 1 : 0;
    const path = `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { path, color: item.color, percentage: percentage.toFixed(1) };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <PieChart className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {paths.map((path, index) => (
              <motion.path
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                d={path.path}
                fill={path.color}
                stroke="#1e293b"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {data.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span className="text-xs text-slate-400">
                    {((item.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-slate-500">{item.value} itens</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};