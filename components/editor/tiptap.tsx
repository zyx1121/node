import BubbleMenu from '@/components/editor/bubble-menu'
import SaveStatusIcon from '@/components/editor/save-status-icon'
import Toolbar from '@/components/editor/toolbar'
import VisibilityIcon from '@/components/editor/visibility-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SaveStatus } from '@/types/editor'
import { Document } from '@prisma/client'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { motion } from 'framer-motion'
import 'github-markdown-css/github-markdown-light.css'
import { ArrowLeft, Redo, Trash2, Undo } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Markdown } from 'tiptap-markdown'
import Image from '@tiptap/extension-image'

interface TiptapEditorProps {
  initialDocument: {
    title: string;
    content: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    user: {
      name: string;
    };
  };
  canEdit: boolean;
}

export default function Editor({ initialDocument, canEdit }: TiptapEditorProps) {
  const router = useRouter();
  const params = useParams();
  const [title, setTitle] = useState(initialDocument.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(SaveStatus.Saved);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>(initialDocument.visibility);
  const [documents, setDocuments] = useState<Document[]>([]);

  const initialContent = initialDocument.content || `# ${initialDocument.title}`;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        breaks: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'markdown-body focus:outline-none',
      },
    },
    onUpdate: () => {
      if (canEdit) {
        setSaveStatus(SaveStatus.Unsaved);
      }
    },
    editable: canEdit,
  })

  useEffect(() => {
    fetch('/api/documents?visibility=PUBLIC')
      .then(res => res.json())
      .then(data => setDocuments(data));
  }, []);

  const setLink = useCallback((url?: string) => {
    if (url === undefined) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  useEffect(() => {
    if (editor && initialContent !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(initialContent);
    }
    setTitle(initialDocument.title);
    setVisibility(initialDocument.visibility);
  }, [initialDocument, editor, initialContent]);

  const handleSave = useCallback(async () => {
    if (!editor) return;

    const markdown = editor.storage.markdown.getMarkdown();
    setSaveStatus(SaveStatus.Saving);

    function extractLinks(markdown: string): string[] {
      const regex = /\[([^\]]+)\]\(\/documents\/([^\)]+)\)/g;
      const links: string[] = [];
      let match;
      while ((match = regex.exec(markdown)) !== null) {
        links.push(match[2]);  // 這是文檔 ID
      }
      return links;
    }

    try {
      const links = extractLinks(markdown);
      if (params.id) {
        await fetch(`/api/documents/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: markdown, visibility, links }),
        });
      } else {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: markdown, visibility, links }),
        });
        const newDocument = await response.json();
        router.push(`/editor/${newDocument.id}`, { scroll: false });
      }
      setSaveStatus(SaveStatus.Saved);
    } catch (error) {
      console.error('保存失敗:', error);
      setSaveStatus(SaveStatus.Error);
    }
  }, [editor, title, visibility, params.id, router]);

  const toggleVisibility = () => {
    setVisibility(prev => prev === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC');
    setSaveStatus(SaveStatus.Unsaved);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleDelete = async () => {
    if (params.id && confirm('確定要刪除這個文件嗎？')) {
      await fetch(`/api/documents/${params.id}`, {
        method: 'DELETE',
      });
      router.push('/');
    }
  };

  if (!editor) {
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="markdown-body p-4">
        <EditorContent editor={editor} />
      </div>
      {canEdit && (
        <motion.div
          className="fixed top-4 space-x-2 flex items-center left-1/2 border rounded-lg bg-opacity-70 backdrop-blur-sm shadow-lg p-1"
          initial={{ x: "-50%", y: "-200%" }}
          animate={{ x: "-50%", y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button variant="ghost" className="w-8 h-8" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-8 h-8" onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-8 h-8" onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="w-4 h-4" />
          </Button>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setSaveStatus(SaveStatus.Unsaved)
            }}
            className="flex-grow h-8 text-center border-none shadow-none"
            placeholder="文件標題"
          />
          <VisibilityIcon visibility={visibility} onClick={toggleVisibility} />
          <SaveStatusIcon status={saveStatus} onClick={handleSave} />
          <Button variant="ghost" className="w-8 h-8" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
      {canEdit && (
        <motion.div
          className="fixed bottom-4 flex gap-1 items-center left-1/2 border rounded-lg bg-opacity-70 backdrop-blur-sm shadow-lg p-1"
          initial={{ x: "-50%", y: "200%" }}
          animate={{ x: "-50%", y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Toolbar editor={editor} setLink={setLink} documents={documents} currentDocumentId={params.id as string} />
        </motion.div>
      )}
      {canEdit && <BubbleMenu editor={editor} />}
    </div>
  )
}
