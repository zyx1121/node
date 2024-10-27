"use client";

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';

const Editor = dynamic(() => import("@/components/editor/tiptap"), { ssr: false });

export default function EditorPage() {
  const [document, setDocument] = useState({ title: '', content: '', visibility: 'PRIVATE' as 'PUBLIC' | 'PRIVATE', user: { name: '', id: '' } });
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const session = useSession();

  useEffect(() => {
    if (params.id) {
      setIsLoading(true);
      fetch(`/api/documents/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setDocument({
            title: data.title,
            content: data.content,
            visibility: data.visibility,
            user: data.user
          });
          setIsCreator(session.data?.user?.id === data.user.id);
          setIsLoading(false);
        });
    }
  }, [params.id, session]);

  const canEdit = isCreator || (document.visibility === 'PUBLIC' && isCreator);
  const canView = canEdit || document.visibility === 'PUBLIC';

  if (session.status === 'loading' || isLoading) {
    return (
      <AnimatePresence>
        <motion.main
          className="w-dvw h-dvh flex items-center justify-center fixed inset-0 z-50 bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-32 h-32 border-t-2 border-foreground rounded-full blur-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.main>
      </AnimatePresence>
    );
  }

  if (session.status === 'authenticated' && !isLoading && !canView) {
    return (
      <main className="w-dvw h-dvh flex items-center justify-center">
        您沒有權限查看此文檔。
      </main>
    );
  }

  return (
    <main className="w-dvw h-dvh p-4">
      <Editor initialDocument={document} canEdit={canEdit} />
    </main>
  );
}
