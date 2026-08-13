import { useQuery } from "@tanstack/react-query";
import { getSharedFiles } from "@/lib/whatsapp/sidebar.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIcon, ImageIcon, LinkIcon, X, Download, ExternalLink, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DateTime } from "luxon";

interface SidebarFilesProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
}

export function SidebarFiles({ isOpen, onClose, contactId }: SidebarFilesProps) {
  const { data: files, isLoading } = useQuery({
    queryKey: ['shared-files', contactId],
    queryFn: () => getSharedFiles({ data: { contactId } }),
    enabled: isOpen
  });

  if (!isOpen) return null;

  return (
    <div className="w-[380px] border-l border-border bg-card flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-border flex items-center justify-between bg-accent/20">
        <h3 className="font-bold text-sm">Arquivos Compartilhados</h3>
        <button onClick={onClose} className="p-1 hover:bg-accent rounded-md transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <Tabs defaultValue="media" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start px-4 h-12 bg-transparent border-b border-border rounded-none">
          <TabsTrigger value="media" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 text-xs font-bold uppercase tracking-widest">Mídia</TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 text-xs font-bold uppercase tracking-widest">Documentos</TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 text-xs font-bold uppercase tracking-widest">Links</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          <TabsContent value="media" className="h-full m-0 p-0">
            <ScrollArea className="h-full p-4">
              {files?.media.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs font-bold uppercase tracking-widest">Nenhuma mídia encontrada</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {files?.media.map(item => (
                    <div key={item.id} className="aspect-square bg-accent rounded-lg overflow-hidden border border-border group relative">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary-foreground hover:bg-background/20" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="docs" className="h-full m-0 p-0">
            <ScrollArea className="h-full p-4">
              {files?.docs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs font-bold uppercase tracking-widest">Nenhum documento encontrado</div>
              ) : (
                <div className="space-y-3">
                  {files?.docs.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl border border-border group">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {DateTime.fromISO(item.date).toFormat('dd/MM/yy HH:mm')} • {item.sender}
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10" asChild>
                        <a href={item.url} download={item.name}>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="links" className="h-full m-0 p-0">
            <ScrollArea className="h-full p-4">
              {files?.links.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs font-bold uppercase tracking-widest">Nenhum link encontrado</div>
              ) : (
                <div className="space-y-3">
                  {files?.links.map(item => (
                    <div key={item.id} className="p-3 bg-accent/30 rounded-xl border border-border group space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold truncate hover:underline">
                          {new URL(item.url).hostname}
                        </a>
                      </div>
                      <p className="text-[11px] text-foreground/80 line-clamp-2 italic">"{item.text}"</p>
                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground">
                          {DateTime.fromISO(item.date).toFormat('dd/MM/yy HH:mm')}
                        </span>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7" 
                            onClick={() => {
                              navigator.clipboard.writeText(item.url);
                              toast.success("Link copiado");
                            }}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
