import prisma from '@/lib/prisma'
import CarouselClient from './CarouselClient'

export const dynamic = 'force-dynamic';

export default async function AdminCarouselPage() {
  const slides = await prisma.carouselSlide.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Carrusel Principal</h1>
        <p className="text-slate-500 mt-2">Administra las imágenes y banners rotativos que se muestran en la pantalla de Inicio de BringShop.</p>
      </div>

      <CarouselClient initialSlides={slides} />
    </div>
  )
}
