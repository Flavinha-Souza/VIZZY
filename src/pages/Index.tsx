import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, Folder, User } from "lucide-react";
import DataInput from "@/components/infographic/DataInput";
import ChartTypeSelector from "@/components/infographic/ChartTypeSelector";
import ChartPreview from "@/components/infographic/ChartPreview";
import SavedInfographicsModal from "@/components/infographic/SavedInfographicsModal";
import AuthModal from "@/components/auth/AuthModal";
import AccountModal from "@/components/auth/AccountModal";
import {
  clearLegacyGlobalSaved,
  getSavedInfographics,
  getSession,
  mergeGuestSavedIntoUser,
  saveSavedInfographics,
} from "@/lib/storage";
import { AuthSession } from "@/types/auth";
import { ChartType, DataRow, SavedInfographic } from "@/types/infographic";
import { toast } from "sonner";

const Index = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [title, setTitle] = useState("Meu Infografico");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savedOpen, setSavedOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(() => getSession());

  useEffect(() => {
    clearLegacyGlobalSaved();
  }, []);

  const saveInfographic = () => {
    const saved = getSavedInfographics(session?.email);

    const newItem: SavedInfographic = {
      id: Date.now(),
      title,
      chartType,
      data,
      createdAt: new Date().toISOString(),
    };

    saveSavedInfographics([...saved, newItem], session?.email);

    toast.success("Infografico salvo com sucesso");
  };

  const openSavedProjects = () => {
    if (!session) {
      setAuthOpen(true);
      return;
    }

    setSavedOpen(true);
  };

  return (
    <div className="min-h-screen bg-background dot-bg">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="flex items-center justify-between px-3 md:px-6 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/Logo azul 2.png" alt="Vizzy Logo" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">VIZZY</h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider" />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden md:block text-xs font-mono text-muted-foreground">
              {data.length} itens · {chartType}
            </span>

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

            <button
              onClick={openSavedProjects}
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
              <span className="hidden sm:inline">Meus Infograficos</span>
              <span className="sm:hidden">Salvos</span>
            </button>

            {session && (
              <button
                onClick={() => setAccountOpen(true)}
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
                "
              >
                <User size={14} />
                <span className="hidden sm:inline">Conta</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        <motion.aside
          initial={false}
          animate={{
            width: sidebarOpen ? 340 : 0,
            opacity: sidebarOpen ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="hidden md:block border-r border-border/50 bg-background/50 overflow-hidden flex-shrink-0"
        >
          <div className="w-[340px] h-full overflow-y-auto p-4 space-y-6">
            <ChartTypeSelector selected={chartType} onSelect={setChartType} />
            <div className="h-px bg-border/50" />
            <DataInput data={data} onDataChange={setData} title={title} onTitleChange={setTitle} />
          </div>
        </motion.aside>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex items-center justify-center w-5 hover:bg-secondary/50 border-r border-border/30 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
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

          <ChartPreview
            title={title}
            data={data}
            chartType={chartType}
            canExport={!!session}
            onRequireAuth={() => setAuthOpen(true)}
          />
        </main>
      </div>

      <SavedInfographicsModal
        open={savedOpen}
        userEmail={session?.email || null}
        onClose={() => setSavedOpen(false)}
        onSelect={(item) => {
          setTitle(item.title);
          setChartType(item.chartType);
          setData(item.data);
        }}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(newSession) => {
          mergeGuestSavedIntoUser(newSession.email);
          setSession(newSession);
          setAuthOpen(false);
          setSavedOpen(true);
        }}
      />

      <AccountModal
        open={accountOpen}
        session={session}
        onClose={() => setAccountOpen(false)}
        onSessionChange={(nextSession) => {
          setSession(nextSession);
          if (!nextSession) {
            setSavedOpen(false);
          }
        }}
      />
    </div>
  );
};

export default Index;
