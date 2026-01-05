import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { HabitsCalendar } from '@/components/habits/HabitsCalendar';

export default function Habitos() {
  return (
    <div className="fade-in">
      <PageHeader
        title="Hábitos Diários"
        description="Acompanhe seus hábitos e mantenha a consistência"
      />

      <HabitsCalendar />
    </div>
  );
}
