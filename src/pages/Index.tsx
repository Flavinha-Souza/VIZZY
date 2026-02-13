import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import DataInput from '@/components/infographic/DataInput';
import ChartTypeSelector from '@/components/infographic/ChartTypeSelector';
import ChartPreview from '@/components/infographic/ChartPreview';
import { ChartType, DataRow, SAMPLE_DATA } from '@/types/infographic';

const Index = () => {
  const [data, setData] = useState<DataRow[]>(SAMPLE_DATA);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('Desempenho por Departamento');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background dot-bg">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">VIZZY</h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Criador de Infográficos
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground">
              {data.length} itens · {chartType}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 340 : 0, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="hidden md:block border-r border-border/50 bg-background/50 overflow-hidden flex-shrink-0"
        >
          <div className="w-[340px] h-full overflow-y-auto p-4 space-y-6">
            <ChartTypeSelector selected={chartType} onSelect={setChartType} />
            <div className="h-px bg-border/50" />
            <DataInput data={data} onDataChange={setData} title={title} onTitleChange={setTitle} />
          </div>
        </motion.aside>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex items-center justify-center w-5 hover:bg-secondary/50 border-r border-border/30 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Mobile Controls */}
          <div className="md:hidden space-y-4 mb-6">
            <ChartTypeSelector selected={chartType} onSelect={setChartType} />
            <details className="glass-card p-3">
              <summary className="text-xs font-mono text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
                Editar Dados
              </summary>
              <div className="mt-3">
                <DataInput data={data} onDataChange={setData} title={title} onTitleChange={setTitle} />
              </div>
            </details>
          </div>

          <ChartPreview title={title} data={data} chartType={chartType} />
        </main>
      </div>
    </div>
  );
};

export default Index;
