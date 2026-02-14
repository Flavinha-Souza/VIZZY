import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, Folder } from 'lucide-react';
import DataInput from '@/components/infographic/DataInput';
import ChartTypeSelector from '@/components/infographic/ChartTypeSelector';
import ChartPreview from '@/components/infographic/ChartPreview';
import SavedInfographicsModal from '@/components/infographic/SavedInfographicsModal';
import { ChartType, DataRow, SAMPLE_DATA } from '@/types/infographic';
import { toast } from "sonner";

const Index = () => {
  const [data, setData] = useState<DataRow[]>(SAMPLE_DATA);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('Desempenho por Departamento');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savedOpen, setSavedOpen] = useState(false);

  const saveInfographic = () => {
  const saved = JSON.parse(localStorage.getItem('vizzy_saved') || '[]');

  const newItem = {
    id: Date.now(),
    title,
    chartType,
    data,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    'vizzy_saved',
    JSON.stringify([...saved, newItem])
  );

  toast.success("Infográfico salvo com sucesso");
};

  return (
    <div className="min-h-screen bg-background dot-bg">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="flex items-center justify-between px-3 md:px-6 h-14">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/Logo azul 2.png"
                alt="Vizzy Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">
                VIZZY
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* Info (desktop only) */}
            <span className="hidden md:block text-xs font-mono text-muted-foreground">
              {data.length} itens · {chartType}
            </span>

            {/* Salvar */}
            <button
              onClick={saveInfographic}
              className="
                flex items-center gap-2
                text-xs font-mono
                px-3 md:px-4
                py-2
                bg-primary text-primary-foreground
                rounded-lg
                shadow-sm
                hover:opacity-90
                active:scale-95
                transition
              "
            >
              <Save size={14} />
              <span className="hidden sm:inline">Salvar</span>
            </button>

            {/* Meus Infográficos */}
            <button
              onClick={() => setSavedOpen(true)}
              className="
                flex items-center gap-2
                text-xs font-mono
                px-3 md:px-4
                py-2
                border border-border
                rounded-lg
                hover:bg-secondary/50
                active:scale-95
                transition
                whitespace-nowrap
              "
            >
              <Folder size={14} />
              <span className="hidden sm:inline">
                Meus Infográficos
              </span>
              <span className="sm:hidden">Salvos</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarOpen ? 340 : 0,
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="hidden md:block border-r border-border/50 bg-background/50 overflow-hidden flex-shrink-0"
        >
          <div className="w-[340px] h-full overflow-y-auto p-4 space-y-6">
            <ChartTypeSelector selected={chartType} onSelect={setChartType} />
            <div className="h-px bg-border/50" />
            <DataInput
              data={data}
              onDataChange={setData}
              title={title}
              onTitleChange={setTitle}
            />
          </div>
        </motion.aside>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex items-center justify-center w-5 hover:bg-secondary/50 border-r border-border/30 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {sidebarOpen ? (
            <ChevronLeft size={12} />
          ) : (
            <ChevronRight size={12} />
          )}
        </button>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* Mobile Controls */}
          <div className="md:hidden space-y-4 mb-6">
            <ChartTypeSelector selected={chartType} onSelect={setChartType} />

            <details className="glass-card p-3 rounded-lg">
              <summary className="text-xs font-mono text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
                Editar Dados
              </summary>
              <div className="mt-3">
                <DataInput
                  data={data}
                  onDataChange={setData}
                  title={title}
                  onTitleChange={setTitle}
                />
              </div>
            </details>
          </div>

          <ChartPreview title={title} data={data} chartType={chartType} />
        </main>
      </div>

      {/* Modal */}
      <SavedInfographicsModal
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        onSelect={(item) => {
          setTitle(item.title);
          setChartType(item.chartType);
          setData(item.data);
        }}
      />
    </div>
  );
};

export default Index;