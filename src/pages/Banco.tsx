import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  ChevronLeft,
  FolderPlus,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { useLinkBank, BankFolder, BankSubfolder, BankLink } from '@/hooks/useLinkBank';

type LinkFolder = BankFolder;
type LinkSubfolder = BankSubfolder;
type Link = BankLink;
import { FolderCard } from '@/components/banco/FolderCard';
import { SubfolderCard } from '@/components/banco/SubfolderCard';
import { LinkCard } from '@/components/banco/LinkCard';
import { CreateFolderModal } from '@/components/banco/CreateFolderModal';
import { CreateSubfolderModal } from '@/components/banco/CreateSubfolderModal';
import { CreateLinkModal } from '@/components/banco/CreateLinkModal';
import { EmptyState } from '@/components/ui/empty-state';

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
    refetch,
  } = useLinkBank();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation state
  const [currentFolder, setCurrentFolder] = useState<LinkFolder | null>(null);
  const [currentSubfolder, setCurrentSubfolder] = useState<LinkSubfolder | null>(null);

  // Modal states
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [subfolderModalOpen, setSubfolderModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  
  // Editing states
  const [editingFolder, setEditingFolder] = useState<LinkFolder | null>(null);
  const [editingSubfolder, setEditingSubfolder] = useState<LinkSubfolder | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  // Reload data when navigation changes
  useEffect(() => {
    refetch();
  }, [currentFolder, currentSubfolder]);

  // Filter subfolders and links based on current selection
  const currentSubfolders = currentFolder 
    ? subfolders.filter(sf => sf.folderId === currentFolder.id)
    : [];
  
  const currentLinks = currentSubfolder 
    ? links.filter(l => l.subfolderId === currentSubfolder.id)
    : [];

  // Navigation
  const navigateToFolder = (folder: LinkFolder) => {
    setCurrentFolder(folder);
    setCurrentSubfolder(null);
  };

  const navigateToSubfolder = (subfolder: LinkSubfolder) => {
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

  // Link CRUD
  const handleCreateLink = async (data: { name: string; url: string; description?: string; imageUrl?: string }) => {
    if (!currentSubfolder) return;

    if (editingLink) {
      await updateLink(editingLink.id, data);
      setEditingLink(null);
    } else {
      await addLink({ ...data, subfolderId: currentSubfolder.id });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    await deleteLink(linkId);
  };

  // Filtering
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

  // Breadcrumb
  const getBreadcrumb = () => {
    const parts = ['Banco'];
    if (currentFolder) parts.push(currentFolder.name);
    if (currentSubfolder) parts.push(currentSubfolder.name);
    return parts;
  };

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
        title="Banco"
        description="Organize seus links úteis por categorias e subpastas"
      />

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
        
        {currentSubfolder && (
          <Button onClick={() => { setEditingLink(null); setLinkModalOpen(true); }}>
            <LinkIcon className="w-4 h-4 mr-2" />
            Novo Link
          </Button>
        )}
      </div>

      {/* Content */}
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
              {getFilteredFolders().map((folder) => (
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
                />
              ))}
            </div>
          )}
        </>
      )}

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
              {getFilteredSubfolders().map((subfolder) => (
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
                />
              ))}
            </div>
          )}
        </>
      )}

      {currentSubfolder && (
        <>
          {getFilteredLinks().length === 0 ? (
            <EmptyState
              icon={<LinkIcon className="w-12 h-12" />}
              title="Nenhum link"
              description={`Adicione links em "${currentSubfolder.name}"`}
              action={
                <Button onClick={() => { setEditingLink(null); setLinkModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar link
                </Button>
              }
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
    </div>
  );
}
