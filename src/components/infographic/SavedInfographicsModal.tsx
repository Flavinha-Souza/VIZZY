import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ChartType, DataRow } from "@/types/infographic";

interface SavedItem {
  id: number;
  title: string;
  chartType: ChartType;
  data: DataRow[];
  createdAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (item: SavedItem) => void;
}

const SavedInfographicsModal = ({ open, onClose, onSelect }: Props) => {
  const [saved, setSaved] = useState<SavedItem[]>([]);

  useEffect(() => {
    if (open) {
      const data = JSON.parse(localStorage.getItem("vizzy_saved") || "[]");
      setSaved(data.reverse());
    }
  }, [open]);

  const deleteItem = (id: number) => {
    const updated = saved.filter((item) => item.id !== id);
    setSaved(updated);
    localStorage.setItem("vizzy_saved", JSON.stringify(updated));

    toast.success("Infográfico removido", {
      duration: 2000,
    });
  };

  const getChartLabel = (type: ChartType) => {
    switch (type) {
      case "bar":
        return "Gráfico de Barras";
      case "line":
        return "Gráfico de Linha";
      case "pie":
        return "Gráfico de Pizza";
      case "progress":
        return "Gráfico de Progresso";
      default:
        return type;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed z-50 inset-0 md:inset-20 bg-background md:rounded-xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                Meus Infográficos
              </h2>

              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-secondary transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
              {saved.length === 0 && (
                <div className="text-center text-muted-foreground text-sm mt-10">
                  Você ainda não salvou nenhum infográfico.
                </div>
              )}

              {saved.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border rounded-xl p-4 hover:bg-secondary/40 transition cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  {/* Infos */}
                  <div className="flex flex-col">
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>

                    <span className="text-xs text-muted-foreground">
                      {getChartLabel(item.chartType)} •{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SavedInfographicsModal;
