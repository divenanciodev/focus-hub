import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  ChevronLeft,
  FolderPlus,
  Link as LinkIcon,
} from 'lucide-react';
import { BankFolder, BankSubfolder, BankLink } from '@/types/linkBank';
import { FolderCard } from '@/components/banco/FolderCard';
import { SubfolderCard } from '@/components/banco/SubfolderCard';
import { LinkCard } from '@/components/banco/LinkCard';
import { CreateFolderModal } from '@/components/banco/CreateFolderModal';
import { CreateSubfolderModal } from '@/components/banco/CreateSubfolderModal';
import { CreateLinkModal } from '@/components/banco/CreateLinkModal';
import { EmptyState } from '@/components/ui/empty-state';

export default function Banco() {
  const [folders, setFolders] = useState<BankFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation state
  const [currentFolder, setCurrentFolder] = useState<BankFolder | null>(null);
  const [currentSubfolder, setCurrentSubfolder] = useState<BankSubfolder | null>(null);

  // Modal states
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [subfolderModalOpen, setSubfolderModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  
  // Editing states
  const [editingFolder, setEditingFolder] = useState<BankFolder | null>(null);
  const [editingSubfolder, setEditingSubfolder] = useState<BankSubfolder | null>(null);
  const [editingLink, setEditingLink] = useState<BankLink | null>(null);

  // Navigation
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
  const handleCreateFolder = (data: Omit<BankFolder, 'id' | 'subfolders' | 'createdAt'>) => {
    if (editingFolder) {
      setFolders(folders.map(f => 
        f.id === editingFolder.id 
          ? { ...f, ...data }
          : f
      ));
      if (currentFolder?.id === editingFolder.id) {
        setCurrentFolder({ ...currentFolder, ...data });
      }
      setEditingFolder(null);
    } else {
      const newFolder: BankFolder = {
        id: crypto.randomUUID(),
        ...data,
        subfolders: [],
        createdAt: new Date(),
      };
      setFolders([...folders, newFolder]);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(folders.filter(f => f.id !== folderId));
  };

  // Subfolder CRUD
  const handleCreateSubfolder = (data: Omit<BankSubfolder, 'id' | 'links' | 'createdAt'>) => {
    if (!currentFolder) return;

    if (editingSubfolder) {
      const updatedFolders = folders.map(f => {
        if (f.id === currentFolder.id) {
          return {
            ...f,
            subfolders: f.subfolders.map(sf =>
              sf.id === editingSubfolder.id ? { ...sf, ...data } : sf
            ),
          };
        }
        return f;
      });
      setFolders(updatedFolders);
      
      const updatedFolder = updatedFolders.find(f => f.id === currentFolder.id);
      if (updatedFolder) setCurrentFolder(updatedFolder);
      
      if (currentSubfolder?.id === editingSubfolder.id) {
        setCurrentSubfolder({ ...currentSubfolder, ...data });
      }
      setEditingSubfolder(null);
    } else {
      const newSubfolder: BankSubfolder = {
        id: crypto.randomUUID(),
        ...data,
        links: [],
        createdAt: new Date(),
      };

      const updatedFolders = folders.map(f => {
        if (f.id === currentFolder.id) {
          return { ...f, subfolders: [...f.subfolders, newSubfolder] };
        }
        return f;
      });
      setFolders(updatedFolders);
      
      const updatedFolder = updatedFolders.find(f => f.id === currentFolder.id);
      if (updatedFolder) setCurrentFolder(updatedFolder);
    }
  };

  const handleDeleteSubfolder = (subfolderId: string) => {
    if (!currentFolder) return;
    
    const updatedFolders = folders.map(f => {
      if (f.id === currentFolder.id) {
        return { ...f, subfolders: f.subfolders.filter(sf => sf.id !== subfolderId) };
      }
      return f;
    });
    setFolders(updatedFolders);
    
    const updatedFolder = updatedFolders.find(f => f.id === currentFolder.id);
    if (updatedFolder) setCurrentFolder(updatedFolder);
  };

  // Link CRUD
  const handleCreateLink = (data: Omit<BankLink, 'id' | 'createdAt'>) => {
    if (!currentFolder || !currentSubfolder) return;

    if (editingLink) {
      const updatedFolders = folders.map(f => {
        if (f.id === currentFolder.id) {
          return {
            ...f,
            subfolders: f.subfolders.map(sf => {
              if (sf.id === currentSubfolder.id) {
                return {
                  ...sf,
                  links: sf.links.map(l =>
                    l.id === editingLink.id ? { ...l, ...data } : l
                  ),
                };
              }
              return sf;
            }),
          };
        }
        return f;
      });
      setFolders(updatedFolders);
      
      const updatedFolder = updatedFolders.find(f => f.id === currentFolder.id);
      if (updatedFolder) {
        setCurrentFolder(updatedFolder);
        const updatedSubfolder = updatedFolder.subfolders.find(sf => sf.id === currentSubfolder.id);
        if (updatedSubfolder) setCurrentSubfolder(updatedSubfolder);
      }
      setEditingLink(null);
    } else {
      const newLink: BankLink = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
      };

      const updatedFolders = folders.map(f => {
        if (f.id === currentFolder.id) {
          return {
            ...f,
            subfolders: f.subfolders.map(sf => {
              if (sf.id === currentSubfolder.id) {
                return { ...sf, links: [...sf.links, newLink] };
              }
              return sf;
            }),
          };
        }
        return f;
      });
      setFolders(updatedFolders);
      
      const updatedFolder = updatedFolders.find(f => f.id === currentFolder.id);
      if (updatedFolder) {
        setCurrentFolder(updatedFolder);
        const updatedSubfolder = updatedFolder.subfolders.find(sf => sf.id === currentSubfolder.id);
        if (updatedSubfolder) setCurrentSubfolder(updatedSubfolder);
      }
    }
  };

  const handleDeleteLink = (linkId: string) => {
    if (!currentFolder || !currentSubfolder) return;
    
    const updatedFolders = folders.map(f => {
      if (f.id === currentFolder.id) {
        return {
          ...f,
          subfolders: f.subfolders.map(sf => {
            if (sf.id === currentSubfolder.id) {
              return { ...sf, links: sf.links.filter(l => l.id !== linkId) };
            }
            return sf;
          }),
        };
      }
      return f;
    });
    setFolders(updatedFolders);
    
    const updatedFolder = updatedFolders.find(f => f.id === currentFolder.id);
    if (updatedFolder) {
      setCurrentFolder(updatedFolder);
      const updatedSubfolder = updatedFolder.subfolders.find(sf => sf.id === currentSubfolder.id);
      if (updatedSubfolder) setCurrentSubfolder(updatedSubfolder);
    }
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
    if (!currentFolder) return [];
    if (!searchTerm) return currentFolder.subfolders;
    return currentFolder.subfolders.filter(sf => 
      sf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sf.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredLinks = () => {
    if (!currentSubfolder) return [];
    if (!searchTerm) return currentSubfolder.links;
    return currentSubfolder.links.filter(l => 
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
                  folder={folder}
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
                  subfolder={subfolder}
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
                  link={link}
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
        editingFolder={editingFolder}
      />

      <CreateSubfolderModal
        open={subfolderModalOpen}
        onOpenChange={setSubfolderModalOpen}
        onSubmit={handleCreateSubfolder}
        editingSubfolder={editingSubfolder}
      />

      <CreateLinkModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        onSubmit={handleCreateLink}
        editingLink={editingLink}
      />
    </div>
  );
}
