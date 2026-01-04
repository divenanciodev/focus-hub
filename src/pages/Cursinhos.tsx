import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { mockBankCourses, mockUserCourses } from '@/data/mockData';
import { Course } from '@/types';
import {
  Plus,
  ExternalLink,
  Clock,
  Calendar,
  Upload,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Cursinhos() {
  const [userCourses, setUserCourses] = useState<Course[]>(mockUserCourses);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [newCourse, setNewCourse] = useState({
    name: '',
    theme: '',
    workload: '',
    deadline: '',
  });

  const handleCreateCourse = () => {
    if (newCourse.name && newCourse.theme && newCourse.workload && newCourse.deadline) {
      const course: Course = {
        id: Date.now().toString(),
        name: newCourse.name,
        theme: newCourse.theme,
        workload: parseInt(newCourse.workload),
        deadline: new Date(newCourse.deadline),
        progress: 0,
        links: [],
      };
      setUserCourses([course, ...userCourses]);
      setNewCourse({ name: '', theme: '', workload: '', deadline: '' });
      setIsCreateModalOpen(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Cursinhos"
        description="Gerencie seus cursos e acesse cursos do banco"
      />

      <Tabs defaultValue="banco" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="banco">Cursinhos do Banco</TabsTrigger>
          <TabsTrigger value="meus">Meus Cursinhos</TabsTrigger>
        </TabsList>

        <TabsContent value="banco" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBankCourses.map((course) => (
              <div
                key={course.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all duration-200"
              >
                {course.imageUrl && (
                  <div className="aspect-video bg-muted">
                    <img
                      src={course.imageUrl}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">{course.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.platform}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.workload}h</span>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">
                      {course.theme}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedCourse(course)}
                    >
                      Ver mais
                    </Button>
                    <Button size="sm" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Acessar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meus" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar cursinho
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-foreground/20 hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-semibold text-foreground mb-1">{course.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{course.theme}</p>

                <ProgressBar value={course.progress} showLabel className="mb-4" />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.workload}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(course.deadline)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Course Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Cursinho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do curso</Label>
              <Input
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                placeholder="Ex: Curso de Excel"
              />
            </div>
            <div className="space-y-2">
              <Label>Tema</Label>
              <Input
                value={newCourse.theme}
                onChange={(e) => setNewCourse({ ...newCourse, theme: e.target.value })}
                placeholder="Ex: Tecnologia"
              />
            </div>
            <div className="space-y-2">
              <Label>Carga horária (horas)</Label>
              <Input
                type="number"
                value={newCourse.workload}
                onChange={(e) => setNewCourse({ ...newCourse, workload: e.target.value })}
                placeholder="Ex: 40"
              />
            </div>
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={newCourse.deadline}
                onChange={(e) => setNewCourse({ ...newCourse, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCourse}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Detail Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.name}</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedCourse.workload}h de carga horária</span>
                </div>
              </div>

              {selectedCourse.platform && (
                <p className="text-sm text-muted-foreground">
                  Plataforma: {selectedCourse.platform}
                </p>
              )}

              <ProgressBar value={selectedCourse.progress} showLabel />

              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-3">Links do curso</h4>
                {selectedCourse.links.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCourse.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded bg-secondary hover:bg-secondary/80 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {link.title}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum link adicionado.</p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-3">Certificado</h4>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer upload do certificado
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCourse(null)}>
              Fechar
            </Button>
            <Button>
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar curso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
