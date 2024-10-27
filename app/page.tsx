"use client";

import DocumentGraph from '@/components/document-graph';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Visibility } from '@prisma/client';
import { motion } from "framer-motion";
import { LogIn, LogOut, Plus } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Link {
  targetDocument: {
    id: string;
    title: string;
  };
  sourceDocument: {
    id: string;
    title: string;
  };
}

interface Document {
  id: string;
  title: string;
  content: string;
  visibility: Visibility;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  links?: Link[];
  linkedBy?: Link[];
}

export default function Home() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => setDocuments(data));
  }, []);

  const handlePlusClick = async () => {
    if (!session) {
      signIn("google");
      return;
    }
    try {
      const newDocumentTitle = `新文件 ${documents.length + 1}`;
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newDocumentTitle, content: '' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newDocument = await response.json();
      if (newDocument && newDocument.id) {
        router.push(`/documents/${newDocument.id}`);
      } else {
        console.error('創建文檔失敗: 無效的響應', newDocument);
      }
    } catch (error) {
      console.error('創建文檔時出錯:', error);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!session) {
      signIn("google");
      return;
    }
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: file.name, content }),
        }).then((response) => response.json())
          .then((newDocument) => router.push(`/documents/${newDocument.id}`));
      };
      reader.readAsText(file);
    }
  };

  const handleNodeClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  return (
    <main
      className="w-dvw h-dvh flex flex-col justify-center items-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
    >
      <div className="w-full h-full">
        <DocumentGraph documents={documents} onNodeClick={handleNodeClick} />
      </div>
      <motion.div
        className="fixed top-4 right-4 border rounded-full shadow-lg bg-background"
        initial={{ x: "200%", y: 0 }}
        animate={{ x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-4 mt-2">
              <DropdownMenuLabel>
                {session.user.name}
                <br />
                <span className="text-xs text-gray-500">{session.user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="rounded-full" size="icon" variant="ghost" onClick={() => signIn("google")}>
            <LogIn />
          </Button>
        )}
      </motion.div>

      <motion.div
        className="fixed bottom-4 left-1/2 flex border rounded-lg p-1 shadow-lg bg-background"
        initial={{ x: "-50%", y: "200%" }}
        animate={{ x: "-50%", y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button size="icon" variant="ghost" onClick={handlePlusClick}>
          <Plus className="w-4 h-4" />
        </Button>
      </motion.div>
    </main>
  );
}
