// Types for Study Schedule/Cronograma

export interface ScheduleBlock {
  id: string;
  subject: string;
  activityType: string; // Free text for any activity type
  color: string;
  duration: number; // in minutes
}

export interface Schedule {
  id: string;
  name: string;
  objective: string;
  hoursPerDay: number;
  startTime: string;
  endTime: string;
  blockDuration: number; // in minutes
  restDuration: number; // in minutes
  blocks: { [dayHour: string]: ScheduleBlock }; // key format: "day-hour" e.g., "monday-08:00"
}

export const activityTypes = [
  { value: 'study', label: 'Estudo', icon: '📚' },
  { value: 'review', label: 'Revisão', icon: '🔄' },
  { value: 'simulado', label: 'Simulado', icon: '📝' },
  { value: 'redacao', label: 'Redação', icon: '✏️' },
  { value: 'reading', label: 'Leitura', icon: '📖' },
  { value: 'rest', label: 'Descanso', icon: '☕' },
] as const;

export const subjectColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#000000', // black
];

export const weekDays = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];
