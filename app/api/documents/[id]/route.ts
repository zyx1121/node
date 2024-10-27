import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const session = await getServerSession(authOptions)
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true }
      },
      links: {
        select: {
          targetDocument: {
            select: { id: true, title: true }
          }
        }
      }
    }
  })
  if (!document || (document.visibility === 'PRIVATE' && document.userId !== session?.user?.id)) {
    return new NextResponse('Not Found', { status: 404 })
  }
  return NextResponse.json(document)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const document = await prisma.document.findUnique({ where: { id } })
  if (!document || (document.visibility === 'PRIVATE' && document.userId !== session.user?.id)) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const { title, content, visibility, links } = await request.json()
  const updatedDocument = await prisma.document.update({
    where: { id },
    data: {
      title,
      content,
      visibility,
      links: {
        deleteMany: {},
        create: links.map((targetDocumentId: string) => ({
          targetDocument: { connect: { id: targetDocumentId } }
        }))
      }
    },
  })
  return NextResponse.json(updatedDocument)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const document = await prisma.document.findUnique({ where: { id } })
  if (!document || document.userId !== session.user?.id) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    await prisma.link.deleteMany({
      where: {
        OR: [
          { sourceDocumentId: id },
          { targetDocumentId: id }
        ]
      }
    });

    await prisma.document.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Delete error:', error);
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
