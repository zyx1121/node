import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from '@/components/ui/input'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button'
import { Document } from '@prisma/client'
import { Link } from "lucide-react"

interface LinkPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  setLink: (url: string) => void;
  documents: Document[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentDocumentId: string;
}

export default function LinkPopover({
  isOpen,
  onOpenChange,
  setLink,
  documents,
  searchTerm,
  setSearchTerm,
  currentDocumentId
}: LinkPopoverProps) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-8 h-8">
          <Link className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <Input
            placeholder="搜尋文件..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScrollArea className="h-[200px]">
            {documents
              .filter(doc =>
                doc.id !== currentDocumentId &&
                doc.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(doc => (
                <Button
                  key={doc.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setLink(`/documents/${doc.id}`)}
                >
                  {doc.title}
                </Button>
              ))
            }
          </ScrollArea>
          <Input
            placeholder="或輸入外部連結..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setLink((e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
