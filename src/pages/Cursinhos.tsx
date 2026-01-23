import { useState, useRef } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useCourses, Course, CurriculumItem, CurriculumSubtopic } from '@/hooks/useCourses';
import {
  Plus,
  ExternalLink,
  Clock,
  Calendar,
  Upload,
  Pencil,
  Trash2,
  X,
  Image,
  ChevronDown,
  ChevronUp,
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CurriculumItemEditor } from '@/components/cursinhos/CurriculumItemEditor';
import { CourseStudyModal } from '@/components/cursinhos/CourseStudyModal';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';

export default function Cursinhos() {
  const { courses, loading, addCourse, updateCourse, deleteCourse, toggleCurriculumItem } = useCourses();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [contentCourse, setContentCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [newCourse, setNewCourse] = useState({
    name: '',
    theme: '',
    workload: '',
    deadline: '',
    imageUrl: '',
    curriculum: [] as CurriculumItem[],
    links: [] as { name: string; url: string }[],
  });

  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const [editLink, setEditLink] = useState({ name: '', url: '' });

  const [newCurriculumItem, setNewCurriculumItem] = useState('');
  const [editCurriculumItem, setEditCurriculumItem] = useState('');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [expandedCurriculums, setExpandedCurriculums] = useState<Set<string>>(new Set());

  const toggleCurriculumExpanded = (courseId: string) => {
    setExpandedCurriculums(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleAddLink = (isEdit: boolean) => {
    const link = isEdit ? editLink : newLink;
    if (!link.name.trim() || !link.url.trim()) return;
    
    if (isEdit && editingCourse) {
      setEditingCourse({
        ...editingCourse,
        links: [...editingCourse.links, { name: link.name.trim(), url: link.url.trim() }]
      });
      setEditLink({ name: '', url: '' });
    } else {
      setNewCourse({
        ...newCourse,
        links: [...newCourse.links, { name: link.name.trim(), url: link.url.trim() }]
      });
      setNewLink({ name: '', url: '' });
    }
  };

  const handleRemoveLink = (index: number, isEdit: boolean) => {
    if (isEdit && editingCourse) {
      setEditingCourse({
        ...editingCourse,
        links: editingCourse.links.filter((_, i) => i !== index)
      });
    } else {
      setNewCourse({
        ...newCourse,
        links: newCourse.links.filter((_, i) => i !== index)
      });
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.name.trim()) {
      toast.error('Preencha o nome do curso');
      return;
    }
    if (!newCourse.theme.trim()) {
      toast.error('Preencha o tema do curso');
      return;
    }
    if (!newCourse.workload) {
      toast.error('Preencha a carga horária');
      return;
    }
    if (!newCourse.deadline) {
      toast.error('Preencha o prazo');
      return;
    }
    
    await addCourse({
      name: newCourse.name,
      theme: newCourse.theme,
      workload: parseInt(newCourse.workload),
      deadline: new Date(newCourse.deadline),
      progress: 0,
      imageUrl: newCourse.imageUrl || undefined,
      links: newCourse.links,
      curriculum: newCourse.curriculum,
    });
    setNewCourse({ name: '', theme: '', workload: '', deadline: '', imageUrl: '', curriculum: [], links: [] });
    setNewLink({ name: '', url: '' });
    setIsCreateModalOpen(false);
  };

  const handleDeleteCourse = async (id: string) => {
    await deleteCourse(id);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse({ ...course });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingCourse) {
      await updateCourse(editingCourse.id, editingCourse);
      setIsEditModalOpen(false);
      setEditingCourse(null);
    }
  };

  const handleAddCurriculumItem = () => {
    if (newCurriculumItem.trim()) {
      const newOrder = newCourse.curriculum.length;
      setNewCourse({
        ...newCourse,
        curriculum: [...newCourse.curriculum, { 
          id: Date.now().toString(), 
          title: newCurriculumItem.trim(), 
          completed: false,
          order: newOrder,
          subtopics: []
        }]
      });
      setNewCurriculumItem('');
    }
  };

  const handleRemoveCurriculumItem = (id: string) => {
    setNewCourse({
      ...newCourse,
      curriculum: newCourse.curriculum.filter(item => item.id !== id).map((item, idx) => ({ ...item, order: idx }))
    });
  };

  const handleAddEditCurriculumItem = () => {
    if (editCurriculumItem.trim() && editingCourse) {
      const newOrder = editingCourse.curriculum.length;
      setEditingCourse({
        ...editingCourse,
        curriculum: [...editingCourse.curriculum, { 
          id: Date.now().toString(), 
          title: editCurriculumItem.trim(), 
          completed: false,
          order: newOrder,
          subtopics: []
        }]
      });
      setEditCurriculumItem('');
    }
  };

  const handleRemoveEditCurriculumItem = (id: string) => {
    if (editingCourse) {
      setEditingCourse({
        ...editingCourse,
        curriculum: editingCourse.curriculum.filter(item => item.id !== id).map((item, idx) => ({ ...item, order: idx }))
      });
    }
  };

  const handleAddSubtopic = (itemId: string, title: string, isEdit: boolean) => {
    if (!title.trim()) return;

    const newSub: CurriculumSubtopic = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false
    };

    if (isEdit && editingCourse) {
      setEditingCourse({
        ...editingCourse,
        curriculum: editingCourse.curriculum.map(item => 
          item.id === itemId 
            ? { ...item, subtopics: [...(item.subtopics || []), newSub] } 
            : item
        )
      });
    } else {
      setNewCourse({
        ...newCourse,
        curriculum: newCourse.curriculum.map(item => 
          item.id === itemId 
            ? { ...item, subtopics: [...(item.subtopics || []), newSub] } 
            : item
        )
      });
    }
  };

  const handleRemoveSubtopic = (itemId: string, subtopicId: string, isEdit: boolean) => {
    if (isEdit && editingCourse) {
      setEditingCourse({
        ...editingCourse,
        curriculum: editingCourse.curriculum.map(item => 
          item.id === itemId 
            ? { ...item, subtopics: (item.subtopics || []).filter(s => s.id !== subtopicId) } 
            : item
        )
      });
    } else {
      setNewCourse({
        ...newCourse,
        curriculum: newCourse.curriculum.map(item => 
          item.id === itemId 
            ? { ...item, subtopics: (item.subtopics || []).filter(s => s.id !== subtopicId) } 
            : item
        )
      });
    }
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItemId(itemId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;
  };

  const handleDrop = (targetId: string, isEdit: boolean) => {
    if (!draggedItemId || draggedItemId === targetId) return;

    const curriculum = isEdit && editingCourse 
      ? [...editingCourse.curriculum] 
      : [...newCourse.curriculum];

    const draggedIndex = curriculum.findIndex(item => item.id === draggedItemId);
    const targetIndex = curriculum.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = curriculum.splice(draggedIndex, 1);
    curriculum.splice(targetIndex, 0, draggedItem);

    const reorderedCurriculum = curriculum.map((item, idx) => ({ ...item, order: idx }));

    if (isEdit && editingCourse) {
      setEditingCourse({ ...editingCourse, curriculum: reorderedCurriculum });
    } else {
      setNewCourse({ ...newCourse, curriculum: reorderedCurriculum });
    }

    setDraggedItemId(null);
  };

  const sortedCurriculum = (curriculum: CurriculumItem[]) => {
    return [...curriculum].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const handleToggleCurriculumItem = async (courseId: string, itemId: string) => {
    await toggleCurriculumItem(courseId, itemId);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        if (isEdit && editingCourse) {
          setEditingCourse({ ...editingCourse, imageUrl });
        } else {
          setNewCourse({ ...newCourse, imageUrl });
        }
      };
      reader.readAsDataURL(file);
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
    <div className="fade-in relative">
      <div className="absolute top-0 right-0 z-10">
        <PomodoroTimer compact />
      </div>
      
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground">Cursinhos</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">Gerencie seus cursos e acompanhe seu progresso</p>
      </div>

      <Tabs defaultValue="meus" className="w-full">
        <div className="flex items-center gap-3 mb-3">
          <TabsList>
            <TabsTrigger value="meus">Meus Cursinhos</TabsTrigger>
            <TabsTrigger value="banco">Cursinhos do Banco</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Criar cursinho
          </Button>
        </div>

        {/* Meus Cursinhos - Área de Edição e Gestão */}
        <TabsContent value="meus" className="mt-0">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum cursinho criado ainda.</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar seu primeiro cursinho
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  {course.imageUrl ? (
                    <div className="h-28 bg-muted">
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-28 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Image className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-medium text-sm text-foreground mb-0.5 line-clamp-2">{course.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{course.theme}</p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.workload}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(course.deadline)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      <span>{course.curriculum.length} itens na grade</span>
                    </div>

                    <div className="flex-1" />

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cursinhos do Banco - Biblioteca de Visualização */}
        <TabsContent value="banco" className="mt-0">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum cursinho na biblioteca ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">Crie cursinhos em "Meus Cursinhos" para visualizá-los aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
                  onClick={() => setContentCourse(course)}
                >
                  {course.imageUrl ? (
                    <div className="h-28 bg-muted">
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-28 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Image className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-medium text-sm text-foreground mb-0.5 line-clamp-2">{course.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{course.theme}</p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.workload}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(course.deadline)}</span>
                      </div>
                    </div>

                    <ProgressBar value={course.progress} showLabel className="mb-2" />

                    {/* Grade Curricular */}
                    {course.curriculum.length > 0 ? (
                      <div className="mb-2 flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCurriculumExpanded(course.id);
                          }}
                          className="flex items-center justify-between w-full text-xs font-medium text-foreground mb-1 hover:text-primary transition-colors"
                        >
                          <span>Grade Curricular ({course.curriculum.filter(i => i.completed).length}/{course.curriculum.length})</span>
                          {expandedCurriculums.has(course.id) ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                        {expandedCurriculums.has(course.id) && (
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {course.curriculum.map((item) => (
                              <div key={item.id}>
                                <div
                                  className="flex items-center gap-1.5 p-1.5 rounded bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                                  onClick={() => handleToggleCurriculumItem(course.id, item.id)}
                                >
                                  <Checkbox
                                    checked={item.completed}
                                    onCheckedChange={() => handleToggleCurriculumItem(course.id, item.id)}
                                    className="h-3.5 w-3.5"
                                  />
                                  <span className={`text-xs font-medium ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                    {item.title}
                                  </span>
                                </div>
                                {/* Subtópicos */}
                                {item.subtopics && item.subtopics.length > 0 && (
                                  <div className="ml-5 mt-0.5 space-y-0.5">
                                    {item.subtopics.map((sub) => (
                                      <div
                                        key={sub.id}
                                        className="flex items-center gap-1.5 p-1 pl-2 rounded bg-muted/50 text-xs text-muted-foreground"
                                      >
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                        <span className={sub.completed ? 'line-through' : ''}>{sub.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mb-2 flex-1">Sem grade curricular.</p>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-border mt-auto" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourse(course);
                        }}
                      >
                        Ver detalhes
                      </Button>
                      {course.platform && (
                        <Button size="sm" className="flex-1 h-7 text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Acessar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Course Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

            {/* Image Section */}
            <div className="space-y-2">
              <Label>Imagem do curso</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Cole o link da imagem..."
                  value={newCourse.imageUrl}
                  onChange={(e) => setNewCourse({ ...newCourse, imageUrl: e.target.value })}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, false)}
              />
              {newCourse.imageUrl && (
                <div className="relative mt-2">
                  <img
                    src={newCourse.imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-background/80"
                    onClick={() => setNewCourse({ ...newCourse, imageUrl: '' })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Links do Curso */}
            <div className="space-y-2">
              <Label>Links do Curso</Label>
              <div className="flex gap-2">
                <Input
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  placeholder="Nome do link"
                  className="flex-1"
                />
                <Input
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="URL do curso"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink(false))}
                />
                <Button type="button" variant="outline" onClick={() => handleAddLink(false)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {newCourse.links.length > 0 && (
                <div className="space-y-1 mt-2">
                  {newCourse.links.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-secondary/50 text-sm">
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      <span className="flex-1 truncate">{link.name}</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[150px]">
                        {link.url}
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleRemoveLink(idx, false)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grade Curricular */}
            <div className="space-y-2">
              <Label>Grade Curricular (arraste para reordenar)</Label>
              <div className="flex gap-2">
                <Input
                  value={newCurriculumItem}
                  onChange={(e) => setNewCurriculumItem(e.target.value)}
                  placeholder="Ex: Módulo 1 - Introdução"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCurriculumItem())}
                />
                <Button type="button" variant="outline" onClick={handleAddCurriculumItem}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {newCourse.curriculum.length > 0 && (
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  {sortedCurriculum(newCourse.curriculum).map((item) => (
                    <CurriculumItemEditor
                      key={item.id}
                      item={item}
                      onRename={(id, title) => {
                        setNewCourse({
                          ...newCourse,
                          curriculum: newCourse.curriculum.map(i => 
                            i.id === id ? { ...i, title } : i
                          )
                        });
                      }}
                      onRemove={handleRemoveCurriculumItem}
                      onAddSubtopic={(itemId, title) => handleAddSubtopic(itemId, title, false)}
                      onRemoveSubtopic={(itemId, subtopicId) => handleRemoveSubtopic(itemId, subtopicId, false)}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={(id) => handleDrop(id, false)}
                      isDragging={draggedItemId === item.id}
                    />
                  ))}
                </div>
              )}
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

      {/* Edit Course Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cursinho</DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do curso</Label>
                <Input
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tema</Label>
                <Input
                  value={editingCourse.theme}
                  onChange={(e) => setEditingCourse({ ...editingCourse, theme: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Carga horária (horas)</Label>
                <Input
                  type="number"
                  value={editingCourse.workload}
                  onChange={(e) => setEditingCourse({ ...editingCourse, workload: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input
                  type="date"
                  value={new Date(editingCourse.deadline).toISOString().split('T')[0]}
                  onChange={(e) => setEditingCourse({ ...editingCourse, deadline: new Date(e.target.value) })}
                />
              </div>

              {/* Image Section */}
              <div className="space-y-2">
                <Label>Imagem do curso</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Cole o link da imagem..."
                    value={editingCourse.imageUrl || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, imageUrl: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editFileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, true)}
                />
                {editingCourse.imageUrl && (
                  <div className="relative mt-2">
                    <img
                      src={editingCourse.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 bg-background/80"
                      onClick={() => setEditingCourse({ ...editingCourse, imageUrl: undefined })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Links do Curso */}
              <div className="space-y-2">
                <Label>Links do Curso</Label>
                <div className="flex gap-2">
                  <Input
                    value={editLink.name}
                    onChange={(e) => setEditLink({ ...editLink, name: e.target.value })}
                    placeholder="Nome do link"
                    className="flex-1"
                  />
                  <Input
                    value={editLink.url}
                    onChange={(e) => setEditLink({ ...editLink, url: e.target.value })}
                    placeholder="URL do curso"
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink(true))}
                  />
                  <Button type="button" variant="outline" onClick={() => handleAddLink(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {editingCourse.links.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {editingCourse.links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded bg-secondary/50 text-sm">
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        <span className="flex-1 truncate">{link.name}</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[150px]">
                          {link.url}
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleRemoveLink(idx, true)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grade Curricular */}
              <div className="space-y-2">
                <Label>Grade Curricular (arraste para reordenar)</Label>
                <div className="flex gap-2">
                  <Input
                    value={editCurriculumItem}
                    onChange={(e) => setEditCurriculumItem(e.target.value)}
                    placeholder="Ex: Módulo 1 - Introdução"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEditCurriculumItem())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddEditCurriculumItem}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {editingCourse.curriculum.length > 0 && (
                  <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                    {sortedCurriculum(editingCourse.curriculum).map((item) => (
                      <CurriculumItemEditor
                        key={item.id}
                        item={item}
                        onRename={(id, title) => {
                          setEditingCourse({
                            ...editingCourse,
                            curriculum: editingCourse.curriculum.map(i => 
                              i.id === id ? { ...i, title } : i
                            )
                          });
                        }}
                        onRemove={handleRemoveEditCurriculumItem}
                        onAddSubtopic={(itemId, title) => handleAddSubtopic(itemId, title, true)}
                        onRemoveSubtopic={(itemId, subtopicId) => handleRemoveSubtopic(itemId, subtopicId, true)}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={(id) => handleDrop(id, true)}
                        isDragging={draggedItemId === item.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Detail Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.name}</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              {selectedCourse.imageUrl && (
                <img
                  src={selectedCourse.imageUrl}
                  alt={selectedCourse.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}

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

              {/* Grade Curricular no Modal */}
              {selectedCourse.curriculum.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-3">Grade Curricular</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCourse.curriculum.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                        onClick={() => handleToggleCurriculumItem(selectedCourse.id, item.id)}
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleCurriculumItem(selectedCourse.id, item.id)}
                        />
                        <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-3">Links do curso</h4>
                {selectedCourse.links.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCourse.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded bg-secondary hover:bg-secondary/80 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {link.name}
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
            {selectedCourse?.platform && (
              <Button>
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar curso
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Study Modal - Registro de Estudos */}
      <CourseStudyModal
        course={contentCourse}
        open={!!contentCourse}
        onOpenChange={(open) => !open && setContentCourse(null)}
      />
    </div>
  );
}
