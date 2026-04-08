import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    
    const cat = await prisma.category.create({ data: { name: name.trim() } });
    return NextResponse.json({ success: true, category: cat });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'La categoría ya existe' }, { status: 400 });
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
