import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  ChevronLeft,
  FolderPlus,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Trash2,
  FolderInput,
  ExternalLink,
} from 'lucide-react';
import { useLinkBank, BankFolder, BankSubfolder, BankLink } from '@/hooks/useLinkBank';
import { FolderCard } from '@/components/banco/FolderCard';
import { SubfolderCard } from '@/components/banco/SubfolderCard';
import { LinkCard } from '@/components/banco/LinkCard';
import { CreateFolderModal } from '@/components/banco/CreateFolderModal';
import { CreateSubfolderModal } from '@/components/banco/CreateSubfolderModal';
import { CreateLinkModal } from '@/components/banco/CreateLinkModal';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function Banco() {
  const {
    folders,
    subfolders,
    links,
    loading,
    addFolder,
    updateFolder,
    deleteFolder,
    addSubfolder,
    updateSubfolder,
    deleteSubfolder,
    addLink,
    updateLink,
    deleteLink,
    assignLinkToSubfolder,
    getUnassignedLinks,
    refetch,
  } = useLinkBank();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation state for library tab
  const [currentFolder, setCurrentFolder] = useState<BankFolder | null>(null);
  const [currentSubfolder, setCurrentSubfolder] = useState<BankSubfolder | null>(null);

  // Modal states
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [subfolderModalOpen, setSubfolderModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  
  // Editing states
  const [editingFolder, setEditingFolder] = useState<BankFolder | null>(null);
  const [editingSubfolder, setEditingSubfolder] = useState<BankSubfolder | null>(null);
  const [editingLink, setEditingLink] = useState<BankLink | null>(null);
  
  // Assignment state
  const [linkToAssign, setLinkToAssign] = useState<BankLink | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedSubfolderId, setSelectedSubfolderId] = useState<string>('');

  // Get unassigned links (links without subfolder)
  const unassignedLinks = getUnassignedLinks();

  // Filter subfolders and links based on current selection in library
  const currentSubfolders = currentFolder 
    ? subfolders.filter(sf => sf.folderId === currentFolder.id)
    : [];
  
  const currentLinks = currentSubfolder 
    ? links.filter(l => l.subfolderId === currentSubfolder.id)
    : [];

  // Navigation for library
  const navigateToFolder = (folder: BankFolder) => {
    setCurrentFolder(folder);
    setCurrentSubfolder(null);
  };

  const navigateToSubfolder = (subfolder: BankSubfolder) => {
    setCurrentSubfolder(subfolder);
  };

  const navigateBack = () => {
    if (currentSubfolder) {
      setCurrentSubfolder(null);
    } else if (currentFolder) {
      setCurrentFolder(null);
    }
  };

  // Folder CRUD
  const handleCreateFolder = async (data: { name: string; description?: string; color?: string }) => {
    if (editingFolder) {
      await updateFolder(editingFolder.id, data);
      setEditingFolder(null);
    } else {
      await addFolder(data);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteFolder(folderId);
  };

  // Subfolder CRUD
  const handleCreateSubfolder = async (data: { name: string; description?: string }) => {
    if (!currentFolder) return;

    if (editingSubfolder) {
      await updateSubfolder(editingSubfolder.id, data);
      setEditingSubfolder(null);
    } else {
      await addSubfolder({ ...data, folderId: currentFolder.id });
    }
  };

  const handleDeleteSubfolder = async (subfolderId: string) => {
    await deleteSubfolder(subfolderId);
  };

  // Link CRUD - now supports creating without subfolder
  const handleCreateLink = async (data: { name: string; url: string; description?: string; imageUrl?: string }) => {
    if (editingLink) {
      await updateLink(editingLink.id, data);
      setEditingLink(null);
    } else {
      // Create link without subfolder (unassigned)
      await addLink({ ...data, subfolderId: undefined });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    await deleteLink(linkId);
  };

  // Assignment handlers
  const openAssignModal = (link: BankLink) => {
    setLinkToAssign(link);
    setSelectedFolderId('');
    setSelectedSubfolderId('');
    setAssignModalOpen(true);
  };

  const handleAssignLink = async () => {
    if (linkToAssign && selectedSubfolderId) {
      await assignLinkToSubfolder(linkToAssign.id, selectedSubfolderId);
      setAssignModalOpen(false);
      setLinkToAssign(null);
    }
  };

  const handleRemoveFromFolder = async (linkId: string) => {
    await assignLinkToSubfolder(linkId, null);
  };

  // Filtering
  const getFilteredUnassignedLinks = () => {
    if (!searchTerm) return unassignedLinks;
    return unassignedLinks.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredFolders = () => {
    if (!searchTerm) return folders;
    return folders.filter(f => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredSubfolders = () => {
    if (!searchTerm) return currentSubfolders;
    return currentSubfolders.filter(sf => 
      sf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sf.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredLinks = () => {
    if (!searchTerm) return currentLinks;
    return currentLinks.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Breadcrumb for library
  const getBreadcrumb = () => {
    const parts: string[] = [];
    if (currentFolder) parts.push(currentFolder.name);
    if (currentSubfolder) parts.push(currentSubfolder.name);
    return parts;
  };

  // Get subfolders for selected folder in assign modal
  const availableSubfolders = selectedFolderId 
    ? subfolders.filter(sf => sf.folderId === selectedFolderId)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Banco de Links"
        description="Organize seus links úteis por categorias e pastas"
      />

      <Tabs defaultValue="meus-links" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="meus-links">Meus Links</TabsTrigger>
          <TabsTrigger value="biblioteca">Biblioteca</TabsTrigger>
        </TabsList>

        {/* Meus Links - Área de criação e edição */}
        <TabsContent value="meus-links" className="mt-0">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar links..."
                className="pl-9"
              />
            </div>
            <Button onClick={() => { setEditingLink(null); setLinkModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Link
            </Button>
          </div>

          {getFilteredUnassignedLinks().length === 0 && links.length === 0 ? (
            <EmptyState
              icon={<LinkIcon className="w-12 h-12" />}
              title="Nenhum link criado"
              description="Adicione links aqui e depois organize-os em pastas na Biblioteca"
              action={
                <Button onClick={() => { setEditingLink(null); setLinkModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro link
                </Button>
              }
            />
          ) : (
            <>
              {/* All links - both assigned and unassigned */}
              <div className="space-y-6">
                {/* Unassigned links section */}
                {getFilteredUnassignedLinks().length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Links sem pasta ({getFilteredUnassignedLinks().length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getFilteredUnassignedLinks().map((link) => (
                        <div
                          key={link.id}
                          className="bg-card border border-border rounded-lg p-4 hover:border-foreground/20 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            {link.imageUrl ? (
                              <img src={link.imageUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <LinkIcon className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{link.name}</h4>
                              {link.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{link.description}</p>
                              )}
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Abrir
                              </a>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-3 pt-3 border-t border-border">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-7 text-xs"
                              onClick={() => openAssignModal(link)}
                            >
                              <FolderInput className="w-3 h-3 mr-1" />
                              Atribuir pasta
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => { setEditingLink(link); setLinkModalOpen(true); }}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteLink(link.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned links section */}
                {links.filter(l => l.subfolderId).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Links organizados ({links.filter(l => l.subfolderId).length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {links.filter(l => l.subfolderId && (
                        !searchTerm || 
                        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        l.description?.toLowerCase().includes(searchTerm.toLowerCase())
                      )).map((link) => {
                        const subfolder = subfolders.find(sf => sf.id === link.subfolderId);
                        const folder = subfolder ? folders.find(f => f.id === subfolder.folderId) : null;
                        
                        return (
                          <div
                            key={link.id}
                            className="bg-card border border-border rounded-lg p-4 hover:border-foreground/20 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              {link.imageUrl ? (
                                <img src={link.imageUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <LinkIcon className="w-5 h-5 text-primary" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{link.name}</h4>
                                {folder && subfolder && (
                                  <p className="text-xs text-muted-foreground">
                                    {folder.name} / {subfolder.name}
                                  </p>
                                )}
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Abrir
                                </a>
                              </div>
                            </div>
                            <div className="flex gap-1 mt-3 pt-3 border-t border-border">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs"
                                onClick={() => handleRemoveFromFolder(link.id)}
                              >
                                Remover da pasta
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => { setEditingLink(link); setLinkModalOpen(true); }}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteLink(link.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Biblioteca - Navegação por pastas */}
        <TabsContent value="biblioteca" className="mt-0">
          {/* Breadcrumb and navigation */}
          <div className="flex items-center gap-2 mb-4">
            {(currentFolder || currentSubfolder) && (
              <Button variant="ghost" size="icon" onClick={navigateBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {getBreadcrumb().map((part, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <span className="mx-1">/</span>}
                  <span className={index === getBreadcrumb().length - 1 ? 'text-foreground font-medium' : ''}>
                    {part}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Search and actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  currentSubfolder ? 'Buscar links...' :
                  currentFolder ? 'Buscar subpastas...' :
                  'Buscar pastas...'
                }
                className="pl-9"
              />
            </div>
            
            {!currentFolder && (
              <Button onClick={() => { setEditingFolder(null); setFolderModalOpen(true); }}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Nova Pasta
              </Button>
            )}
            
            {currentFolder && !currentSubfolder && (
              <Button onClick={() => { setEditingSubfolder(null); setSubfolderModalOpen(true); }}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Nova Subpasta
              </Button>
            )}
          </div>

          {/* Folder list */}
          {!currentFolder && (
            <>
              {getFilteredFolders().length === 0 ? (
                <EmptyState
                  icon={<FolderPlus className="w-12 h-12" />}
                  title="Nenhuma pasta criada"
                  description="Crie pastas para organizar seus links por categorias"
                  action={
                    <Button onClick={() => { setEditingFolder(null); setFolderModalOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar primeira pasta
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredFolders().map((folder) => {
                    const folderSubfolders = subfolders.filter(sf => sf.folderId === folder.id);
                    const folderLinks = links.filter(l => 
                      folderSubfolders.some(sf => sf.id === l.subfolderId)
                    );
                    
                    return (
                      <FolderCard
                        key={folder.id}
                        folder={{
                          id: folder.id,
                          name: folder.name,
                          description: folder.description,
                          color: folder.color,
                          subfolders: [],
                          createdAt: folder.createdAt,
                        }}
                        onClick={() => navigateToFolder(folder)}
                        onEdit={() => { setEditingFolder(folder); setFolderModalOpen(true); }}
                        onDelete={() => handleDeleteFolder(folder.id)}
                        linkCount={folderLinks.length}
                        subfolderCount={folderSubfolders.length}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Subfolder list */}
          {currentFolder && !currentSubfolder && (
            <>
              {getFilteredSubfolders().length === 0 ? (
                <EmptyState
                  icon={<FolderPlus className="w-12 h-12" />}
                  title="Nenhuma subpasta"
                  description={`Crie subpastas dentro de "${currentFolder.name}"`}
                  action={
                    <Button onClick={() => { setEditingSubfolder(null); setSubfolderModalOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar subpasta
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredSubfolders().map((subfolder) => {
                    const subfolderLinks = links.filter(l => l.subfolderId === subfolder.id);
                    
                    return (
                      <SubfolderCard
                        key={subfolder.id}
                        subfolder={{
                          id: subfolder.id,
                          name: subfolder.name,
                          description: subfolder.description,
                          links: [],
                          createdAt: subfolder.createdAt,
                        }}
                        onClick={() => navigateToSubfolder(subfolder)}
                        onEdit={() => { setEditingSubfolder(subfolder); setSubfolderModalOpen(true); }}
                        onDelete={() => handleDeleteSubfolder(subfolder.id)}
                        linkCount={subfolderLinks.length}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Links in subfolder */}
          {currentSubfolder && (
            <>
              {getFilteredLinks().length === 0 ? (
                <EmptyState
                  icon={<LinkIcon className="w-12 h-12" />}
                  title="Nenhum link nesta pasta"
                  description={`Atribua links a "${currentSubfolder.name}" na aba "Meus Links"`}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredLinks().map((link) => (
                    <LinkCard
                      key={link.id}
                      link={{
                        id: link.id,
                        name: link.name,
                        url: link.url,
                        description: link.description,
                        imageUrl: link.imageUrl,
                        createdAt: link.createdAt,
                      }}
                      onEdit={() => { setEditingLink(link); setLinkModalOpen(true); }}
                      onDelete={() => handleDeleteLink(link.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateFolderModal
        open={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        onSubmit={handleCreateFolder}
        editingFolder={editingFolder ? {
          id: editingFolder.id,
          name: editingFolder.name,
          description: editingFolder.description,
          color: editingFolder.color,
          subfolders: [],
          createdAt: editingFolder.createdAt,
        } : null}
      />

      <CreateSubfolderModal
        open={subfolderModalOpen}
        onOpenChange={setSubfolderModalOpen}
        onSubmit={handleCreateSubfolder}
        editingSubfolder={editingSubfolder ? {
          id: editingSubfolder.id,
          name: editingSubfolder.name,
          description: editingSubfolder.description,
          links: [],
          createdAt: editingSubfolder.createdAt,
        } : null}
      />

      <CreateLinkModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        onSubmit={handleCreateLink}
        editingLink={editingLink ? {
          id: editingLink.id,
          name: editingLink.name,
          url: editingLink.url,
          description: editingLink.description,
          imageUrl: editingLink.imageUrl,
          createdAt: editingLink.createdAt,
        } : null}
      />

      {/* Assign to folder modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir a uma pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {linkToAssign && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">{linkToAssign.name}</p>
                <p className="text-xs text-muted-foreground truncate">{linkToAssign.url}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Pasta</Label>
              <Select value={selectedFolderId} onValueChange={(v) => { setSelectedFolderId(v); setSelectedSubfolderId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pasta..." />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFolderId && availableSubfolders.length > 0 && (
              <div className="space-y-2">
                <Label>Subpasta</Label>
                <Select value={selectedSubfolderId} onValueChange={setSelectedSubfolderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma subpasta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubfolders.map((subfolder) => (
                      <SelectItem key={subfolder.id} value={subfolder.id}>
                        {subfolder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedFolderId && availableSubfolders.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Esta pasta não tem subpastas. Crie uma subpasta primeiro na Biblioteca.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignLink} disabled={!selectedSubfolderId}>
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
