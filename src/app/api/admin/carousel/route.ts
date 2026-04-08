import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const slides = await prisma.carouselSlide.findMany({
    orderBy: { order: 'asc' }
  });
  return NextResponse.json(slides);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newSlide = await prisma.carouselSlide.create({
      data: {
        title: data.title || null,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        isActive: data.isActive ?? true,
        order: data.order ?? 0,
      }
    });
    return NextResponse.json(newSlide);
  } catch (error: any) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const updated = await prisma.carouselSlide.update({
      where: { id: data.id },
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        isActive: data.isActive,
        order: data.order,
      }
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.carouselSlide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
