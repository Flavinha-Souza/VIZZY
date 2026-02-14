import { motion } from 'framer-motion';
import { BarChart3, LineChart, PieChart, Activity } from 'lucide-react';
import { ChartType } from '@/types/infographic';

interface ChartTypeSelectorProps {
  selected: ChartType;
  onSelect: (type: ChartType) => void;
}

const chartTypes: { id: ChartType; icon: any; label: string }[] = [
  { id: 'bar', icon: BarChart3, label: 'Barras' },
  { id: 'line', icon: LineChart, label: 'Linhas' },
  { id: 'pie', icon: PieChart, label: 'Pizza' },
  { id: 'progress', icon: Activity, label: 'Progresso' },
];

const ChartTypeSelector = ({ selected, onSelect }: ChartTypeSelectorProps) => {
  return (
    <div>
      <div className="mb-3">
        <span className="block text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-primary/75">
          Configuração
        </span>
        <h3 className="mt-1 text-sm md:text-base font-semibold tracking-tight text-foreground">
          Tipo de Gráfico
        </h3>
        <div className="mt-2 h-px bg-gradient-to-r from-primary/45 via-primary/20 to-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {chartTypes.map((type) => {
          const isActive = selected === type.id;
          return (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(type.id)}
              className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                isActive
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-border/80'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="chart-selector"
                  className="absolute inset-0 rounded-lg border border-primary/30 bg-primary/5"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <type.icon size={16} className="relative z-10" />
              <span className="relative z-10">{type.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTypeSelector;

