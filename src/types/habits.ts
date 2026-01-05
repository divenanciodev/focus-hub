// Types for Daily Habits System

export interface Habit {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
}

export interface DayHabits {
  date: Date;
  habits: Habit[];
}

export const defaultHabits: Omit<Habit, 'completed'>[] = [
  { id: '1', name: '45 Min Workout', icon: '⏱️' },
  { id: '2', name: '45 Min Work / Study', icon: '🧠' },
  { id: '3', name: 'Write', icon: '✍️' },
  { id: '4', name: '1 Gallon of Water', icon: '💧' },
  { id: '5', name: 'Read 10 Pages', icon: '📖' },
  { id: '6', name: 'No Alcohol', icon: '🚫' },
  { id: '7', name: 'No Sugar', icon: '🍬' },
];
