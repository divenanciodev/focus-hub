import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link, FileText, Loader2, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface EditalUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function EditalUpload({ value, onChange }: EditalUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(value && !value.includes('contest-editals') ? 'url' : 'upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { data, error } = await supabase.storage
        .from('contest-editals')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('contest-editals')
        .getPublicUrl(data.path);

      onChange(publicUrl.publicUrl);
      toast.success('Edital enviado com sucesso!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar o arquivo: ' + (error.message || 'Tente novamente'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = async () => {
    if (value && value.includes('contest-editals')) {
      try {
        const path = value.split('/contest-editals/')[1];
        if (path) {
          await supabase.storage.from('contest-editals').remove([path]);
        }
      } catch (error) {
        console.error('Error removing file:', error);
      }
    }
    onChange('');
  };

  const isUploadedFile = value && value.includes('contest-editals');

  return (
    <div className="space-y-2">
      <Label>Link do Edital (PDF)</Label>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="upload" className="flex-1 text-xs">
            <Upload className="w-3 h-3 mr-1" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex-1 text-xs">
            <Link className="w-3 h-3 mr-1" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-2">
          {value && isUploadedFile ? (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate flex-1"
              >
                Ver PDF enviado
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={handleRemoveFile}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="edital-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar PDF (máx. 10MB)
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="url" className="mt-2">
          <div className="flex gap-2">
            <Input
              value={isUploadedFile ? '' : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
            {value && !isUploadedFile && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                asChild
              >
                <a href={value} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
