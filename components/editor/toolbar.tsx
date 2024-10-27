import LinkPopover from '@/components/editor/link-popover';
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Document } from '@prisma/client';
import { AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3, Heading4, Image, Italic, List, ListOrdered, Underline } from 'lucide-react';
import { useState } from 'react';
import { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor | null;
  setLink: (url?: string) => void;
  documents: Document[];
  currentDocumentId: string;
}

export default function Toolbar({ editor, setLink, documents, currentDocumentId }: ToolbarProps) {
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('輸入圖片 URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <>
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 4 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <Heading4 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>
      <LinkPopover
        isOpen={isLinkMenuOpen}
        onOpenChange={setIsLinkMenuOpen}
        setLink={setLink}
        documents={documents}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentDocumentId={currentDocumentId}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={addImage}
        className="h-8 w-8 p-0"
        title="插入圖片"
      >
        <Image className="h-4 w-4" />
      </Button>
    </>
  )
}
