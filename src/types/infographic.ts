export type ChartType = 'bar' | 'line' | 'pie' | 'progress';

export interface DataRow {
  label: string;
  value: number;
  color?: string;
}

export interface InfographicState {
  title: string;
  data: DataRow[];
  chartType: ChartType;
  colors: string[];
}

export interface SavedInfographic {
  id: number;
  title: string;
  chartType: ChartType;
  data: DataRow[];
  createdAt: string;
}

export const DEFAULT_COLORS = [
  'hsl(187, 94%, 43%)',
  'hsl(270, 60%, 58%)',
  'hsl(150, 60%, 50%)',
  'hsl(35, 92%, 60%)',
  'hsl(340, 75%, 55%)',
  'hsl(210, 80%, 55%)',
  'hsl(45, 90%, 55%)',
  'hsl(0, 70%, 55%)',
];

export const CHART_COLORS_KEYS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export const SAMPLE_DATA: DataRow[] = [
  { label: 'Marketing', value: 42 },
  { label: 'Vendas', value: 78 },
  { label: 'Tecnologia', value: 95 },
  { label: 'Design', value: 63 },
  { label: 'Suporte', value: 51 },
];
