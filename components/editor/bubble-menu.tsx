import { BubbleMenu, Editor } from '@tiptap/react'
import { Toggle } from "@/components/ui/toggle"
import { Bold, Italic, Underline } from 'lucide-react'

export default function EditorBubbleMenu({ editor }: { editor: Editor }) {
  if (!editor) {
    return null
  }

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <div className="flex gap-1 border rounded-lg p-1 bg-opacity-70 backdrop-blur-sm shadow-lg">
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
      </div>
    </BubbleMenu>
  )
}
