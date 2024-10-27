import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getServerSession } from "next-auth/next"
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  let whereCondition: Prisma.DocumentWhereInput = { visibility: 'PUBLIC' }

  if (session && session.user?.id) {
    whereCondition = {
      OR: [
        { userId: session.user.id },
        { visibility: 'PUBLIC' }
      ]
    }
  }

  const documents = await prisma.document.findMany({
    where: whereCondition,
    include: {
      links: {
        include: {
          targetDocument: {
            select: { id: true, title: true }
          }
        }
      },
      linkedBy: {
        include: {
          sourceDocument: {
            select: { id: true, title: true }
          }
        }
      }
    },
  })
  return NextResponse.json(documents)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { title, content, visibility = 'PRIVATE' } = await request.json() as {
      title: string;
      content: string;
      visibility?: 'PUBLIC' | 'PRIVATE';
    }
    const document = await prisma.document.create({
      data: {
        title,
        content,
        userId: session.user.id,
        visibility,
      },
    })
    return NextResponse.json(document)
  } catch (error) {
    console.error('創建文檔時出錯:', error)
    return NextResponse.json({ error: '創建文檔時出錯' }, { status: 500 })
  }
}
