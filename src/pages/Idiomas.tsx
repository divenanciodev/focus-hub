import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Languages } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default function Idiomas() {
  return (
    <MainLayout>
      <PageHeader 
        title="Idiomas" 
        description="Aprenda idiomas através de estruturas práticas e fluência oral"
      />

      <EmptyState
        icon={<Languages className="w-12 h-12 text-muted-foreground" />}
        title="Módulo em desenvolvimento"
        description="O módulo de idiomas está sendo reestruturado"
      />
    </MainLayout>
  );
}
