import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Upload, FileJson, Table } from 'lucide-react';
import { DataRow } from '@/types/infographic';
import Papa from 'papaparse';

type InputMode = 'manual' | 'json' | 'csv';

interface DataInputProps {
  data: DataRow[];
  onDataChange: (data: DataRow[]) => void;
  title: string;
  onTitleChange: (title: string) => void;
}

const DataInput = ({ data, onDataChange, title, onTitleChange }: DataInputProps) => {
  const [mode, setMode] = useState<InputMode>('manual');
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const addRow = () => {
    onDataChange([...data, { label: `Item ${data.length + 1}`, value: 0 }]);
  };

  const removeRow = (index: number) => {
    onDataChange(data.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof DataRow, value: string | number) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onDataChange(updated);
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        const mapped = parsed.map((item: any) => ({
          label: String(item.label || item.name || item.category || ''),
          value: Number(item.value || item.amount || item.count || 0),
        }));
        onDataChange(mapped);
        setError('');
      } else {
        setError('JSON deve ser um array de objetos');
      }
    } catch {
      setError('JSON inválido');
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const mapped = results.data
          .filter((row: any) => row.label || row.name)
          .map((row: any) => ({
            label: String(row.label || row.name || ''),
            value: Number(row.value || row.amount || 0),
          }));
        if (mapped.length > 0) {
          onDataChange(mapped);
          setError('');
        } else {
          setError('CSV deve ter colunas "label" e "value"');
        }
      },
      error: () => setError('Erro ao ler CSV'),
    });
  };

  const modes: { id: InputMode; icon: any; label: string }[] = [
    { id: 'manual', icon: Table, label: 'Manual' },
    { id: 'json', icon: FileJson, label: 'JSON' },
    { id: 'csv', icon: Upload, label: 'CSV' },
  ];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="mb-2">
          <span className="block text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-primary/75">
            Conteúdo
          </span>
          <label
            htmlFor="infographic-title"
            className="mt-1 block text-sm md:text-base font-semibold tracking-tight text-foreground"
          >
            Título do Infográfico
          </label>
          <div className="mt-2 h-px bg-gradient-to-r from-primary/45 via-primary/20 to-transparent" />
        </div>

        <input
          id="infographic-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
          placeholder="Meu Infográfico"
        />
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === m.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <m.icon size={13} />
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'manual' && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <div className="grid grid-cols-[1fr_80px_32px] gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              <span>Label</span>
              <span>Valor</span>
              <span></span>
            </div>
            {data.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[1fr_80px_32px] gap-2 items-center"
              >
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateRow(i, 'label', e.target.value)}
                  className="bg-secondary/50 border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                />
                <input
                  type="number"
                  value={row.value}
                  onChange={(e) => updateRow(i, 'value', Number(e.target.value))}
                  className="bg-secondary/50 border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                />
                <button
                  onClick={() => removeRow(i)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
            <button
              onClick={addRow}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
            >
              <Plus size={14} />
              Adicionar linha
            </button>
          </motion.div>
        )}

        {mode === 'json' && (
          <motion.div
            key="json"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[
  { "label": "Marketing", "value": 42 },
  { "label": "Vendas", "value": 78 }
]`}
              className="w-full h-36 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
            />
            <button
              onClick={handleJsonImport}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Importar JSON
            </button>
          </motion.div>
        )}

        {mode === 'csv' && (
          <motion.div
            key="csv"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
              <Upload size={24} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Arraste um CSV ou clique para selecionar
              </span>
              <span className="text-xs text-muted-foreground/60">
                Colunas: label, value
              </span>
              <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default DataInput;


