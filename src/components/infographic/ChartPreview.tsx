import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer,
} from 'recharts';
import { Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { ChartType, DataRow, DEFAULT_COLORS } from '@/types/infographic';

interface ChartPreviewProps {
  title: string;
  data: DataRow[];
  chartType: ChartType;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-sm">
      <p className="font-medium text-foreground">{label || payload[0]?.name}</p>
      <p className="font-mono text-primary">{payload[0]?.value}</p>
    </div>
  );
};

const ProgressBars = ({ data }: { data: DataRow[] }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-4 w-full px-4">
      {data.map((row, i) => {
        const pct = (row.value / maxVal) * 100;
        return (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-foreground font-medium">{row.label}</span>
              <span className="text-xs font-mono text-muted-foreground">{row.value}</span>
            </div>
            <div className="h-3 bg-secondary/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ChartPreview = ({ title, data, chartType }: ChartPreviewProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, {
        backgroundColor: 'hsl(220, 20%, 7%)',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${title || 'infografico'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const chartData = data.map((d, i) => ({
    ...d,
    fill: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Preview</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Download size={13} />
          Exportar PNG
        </motion.button>
      </div>

      {/* Canvas */}
      <div
        ref={ref}
        className="flex-1 glass-card p-6 flex flex-col items-center justify-center min-h-[400px]"
      >
        {/* Title */}
        <motion.h2
          key={title}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center"
        >
          {title || 'Meu Infográfico'}
        </motion.h2>

        {/* Chart */}
        <motion.div
          key={chartType}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full flex items-center justify-center"
          style={{ height: chartType === 'progress' ? 'auto' : 320 }}
        >
          {data.length === 0 ? (
            <p className="text-muted-foreground text-sm">Adicione dados para visualizar</p>
          ) : chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1200}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : chartType === 'line' ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(187, 94%, 43%)"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: 'hsl(187, 94%, 43%)', strokeWidth: 0 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : chartType === 'pie' ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={50}
                  strokeWidth={2}
                  stroke="hsl(220, 20%, 7%)"
                  animationDuration={1200}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ProgressBars data={data} />
          )}
        </motion.div>

        {/* Legend */}
        {data.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3 mt-6 justify-center"
          >
            {data.map((row, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                />
                {row.label}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChartPreview;
