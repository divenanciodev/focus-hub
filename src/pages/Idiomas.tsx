import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Languages, 
  BookOpen, 
  Dumbbell, 
  BarChart3, 
  Plus,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useLanguages } from '@/hooks/useLanguagesModule';
import type { Language } from '@/types/languages';
import { VocabularyModule } from '@/components/languages/VocabularyModule';
import { StructuresModule } from '@/components/languages/StructuresModule';
import { ProgressModule } from '@/components/languages/ProgressModule';

export default function Idiomas() {
  const { languages, loading } = useLanguages();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [activeModule, setActiveModule] = useState<'vocabulary' | 'structures' | 'progress'>('vocabulary');

  // If no language selected, show language selection
  if (!selectedLanguage) {
    return (
      <MainLayout>
        <PageHeader 
          title="Idiomas" 
          description="Aprenda idiomas através de vocabulário e estruturas gramaticais"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : languages.length === 0 ? (
          <EmptyState
            icon={<Languages className="w-12 h-12 text-muted-foreground" />}
            title="Nenhum idioma cadastrado"
            description="Adicione um idioma para começar a estudar"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map(language => (
              <Card 
                key={language.id}
                className="cursor-pointer hover:border-primary transition-colors group"
                onClick={() => setSelectedLanguage(language)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{language.icon}</span>
                      <CardTitle className="text-lg">{language.name}</CardTitle>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant="secondary" 
                    style={{ backgroundColor: `${language.color}20`, color: language.color }}
                  >
                    {language.category || 'Idioma'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </MainLayout>
    );
  }

  // Language selected - show modules
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedLanguage(null)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedLanguage.icon}</span>
            <div>
              <h1 className="text-2xl font-bold">{selectedLanguage.name}</h1>
              <p className="text-muted-foreground text-sm">
                Escolha um módulo para estudar
              </p>
            </div>
          </div>
        </div>

        {/* Module Tabs */}
        <Tabs value={activeModule} onValueChange={(v) => setActiveModule(v as any)}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="vocabulary" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Vocabulário</span>
            </TabsTrigger>
            <TabsTrigger value="structures" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">Estruturas</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Progresso</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vocabulary" className="mt-6">
            <VocabularyModule languageId={selectedLanguage.id} />
          </TabsContent>

          <TabsContent value="structures" className="mt-6">
            <StructuresModule languageId={selectedLanguage.id} />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <ProgressModule languageId={selectedLanguage.id} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
