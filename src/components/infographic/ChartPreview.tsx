import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { ChartType, DataRow, DEFAULT_COLORS } from "@/types/infographic";

interface ChartPreviewProps {
  title: string;
  data: DataRow[];
  chartType: ChartType;
  canExport?: boolean;
  onRequireAuth?: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card bg-card/95 border-border/70 px-3 py-2 text-xs md:text-sm shadow-xl">
      <p className="font-medium text-foreground">{label || payload[0]?.name}</p>
      <p className="font-mono text-primary">{payload[0]?.value}</p>
    </div>
  );
};

const ProgressBars = ({
  data,
  isMobile,
}: {
  data: DataRow[];
  isMobile: boolean;
}) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-4 w-full px-2 md:px-4">
      {data.map((row, i) => {
        const pct = (row.value / maxVal) * 100;

        return (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs md:text-sm text-foreground font-medium truncate max-w-[65%]">
                {isMobile && row.label.length > 18
                  ? row.label.slice(0, 18) + "…"
                  : row.label}
              </span>

              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                {row.value}
              </span>
            </div>

            <div className="h-2.5 md:h-3 bg-secondary/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ChartPreview = ({
  title,
  data,
  chartType,
  canExport = true,
  onRequireAuth,
}: ChartPreviewProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // 🔥 Detect mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleExport = async () => {
    if (!canExport) {
      onRequireAuth?.();
      return;
    }

    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, {
        backgroundColor: "hsl(220, 20%, 7%)",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${title || "infografico"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const chartData = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        fill: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      })),
    [data],
  );

  const chartMargin = {
    top: 10,
    right: 10,
    left: 0,
    bottom: isMobile ? 25 : 0,
  };

  const renderXAxis = () => (
    <XAxis
      dataKey="label"
      interval={0}
      angle={isMobile ? -45 : 0}
      textAnchor={isMobile ? "end" : "middle"}
      height={isMobile ? 70 : 30}
      minTickGap={20}
      tick={{ fontSize: isMobile ? 9 : 11 }}
      tickFormatter={(value: string) =>
        isMobile && value.length > 14 ? value.slice(0, 14) + "…" : value
      }
    />
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-primary uppercase tracking-widest">
          Preview
        </span>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            <Download size={13} />
            {canExport ? "Exportar PNG" : "Entrar para exportar"}
          </motion.button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={ref}
        className="flex-1 glass-card p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px]"
      >
        <motion.h2
          key={title}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg md:text-2xl font-bold text-foreground mb-6 text-center"
        >
          {title || "Meu Infográfico"}
        </motion.h2>

        <motion.div
          key={chartType}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full flex items-center justify-center"
          style={{ height: chartType === "progress" ? "auto" : 320 }}
        >
          {data.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Adicione dados para visualizar
            </p>
          ) : chartType === "bar" ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                {renderXAxis()}
                <YAxis tick={{ fontSize: isMobile ? 9 : 11 }} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1200}
                  activeBar={{
                    fillOpacity: 0.92,
                    stroke: "rgba(255,255,255,0.45)",
                    strokeWidth: 1.5,
                  }}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : chartType === "line" ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                {renderXAxis()}
                <YAxis tick={{ fontSize: isMobile ? 9 : 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(187, 94%, 43%)"
                  strokeWidth={2.5}
                  dot={{ r: isMobile ? 3 : 5, strokeWidth: 0 }}
                  activeDot={{ r: isMobile ? 5 : 7, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : chartType === "pie" ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 95 : 120}
                  innerRadius={isMobile ? 40 : 50}
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
            <ProgressBars data={data} isMobile={isMobile} />
          )}
        </motion.div>

        {/* Legend */}
        {data.length > 0 && chartType !== "progress" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3 mt-6 justify-center max-w-full"
          >
            {data.map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-[120px] truncate"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                  }}
                />
                <span className="truncate">{row.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChartPreview;
