import prisma from '@/lib/prisma'
import Link from 'next/link'
import HomeCarousel from './HomeCarousel'

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const slides = await prisma.carouselSlide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 8,
    orderBy: { createdAt: 'desc' }
  });

  const newArrivals = await prisma.product.findMany({
    where: { isActive: true, isNewArrival: true },
    take: 8,
    orderBy: { createdAt: 'desc' }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto flex flex-col gap-10 cursor-default">
      {/* Promos Carousel */}
      {slides.length > 0 && <HomeCarousel slides={slides} />}

      {/* Intro Banner */}
      {slides.length === 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-10 md:p-16 text-center text-white shadow-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">La Mejor Variedad para tu Kiosco</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">Descubrí todos nuestros productos y hacé tu pedido rápido por WhatsApp con BringShop.</p>
          <Link href="/productos" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition">
            Ver Catálogo Completo
          </Link>
        </div>
      )}

      {/* Featured Favorites Section */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">⭐ Favoritos de la gente</h2>
              <p className="text-sm text-slate-500 mt-1">Los combos y productos más elegidos por nuestros kiosqueros.</p>
            </div>
            <Link href="/productos?cat=⭐ Favoritos" className="text-pink-600 font-bold hover:underline text-sm truncate ml-4">Ver Catálogo →</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((p: any) => (
              <Link href="/productos" key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-pink-200 transition group block">
                <div className="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <span className="text-4xl group-hover:scale-125 transition drop-shadow-sm">🍭</span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1 truncate">{p.name}</h3>
                <div className="text-pink-600 font-black">{formatPrice(p.price)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">🆕 Recién Llegados</h2>
              <p className="text-sm text-slate-500 mt-1">Explora las últimas novedades de nuestro inventario.</p>
            </div>
            <Link href="/productos?cat=🆕 Novedades" className="text-pink-600 font-bold hover:underline text-sm truncate ml-4">Ver Todos →</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((p: any) => (
              <Link href="/productos" key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-pink-200 transition group block">
                <div className="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <span className="text-4xl group-hover:scale-125 transition drop-shadow-sm">🍭</span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1 truncate">{p.name}</h3>
                <div className="text-pink-600 font-black">{formatPrice(p.price)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Banners */}
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <Link href="/contacto" className="bg-blue-50 hover:bg-pink-100 transition p-8 rounded-3xl border border-pink-200 flex flex-col items-start justify-center group overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-pink-800 mb-2">Visita Nuestro Local</h3>
            <p className="text-pink-700">Conoce nuestro local en Av. San Martín 1324, Ramos Mejía.</p>
            <span className="inline-block mt-4 text-sm font-bold border-b-2 border-pink-500 pb-1 text-pink-700">Ver en Mapa →</span>
          </div>
          <span className="absolute right-0 bottom-0 text-9xl opacity-10 group-hover:scale-110 group-hover:rotate-12 transition duration-500">📍</span>
        </Link>
        <Link href="/promociones" className="bg-blue-50 hover:bg-blue-100 transition p-8 rounded-3xl border border-blue-100 flex flex-col items-start justify-center group overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-blue-800 mb-2">Sección de Ofertas</h3>
            <p className="text-blue-700">Ahorrá en grande con nuestras promociones limitadas y descuentos por cantidad.</p>
            <span className="inline-block mt-4 text-sm font-bold border-b-2 border-blue-500 pb-1 text-blue-700">Quiero ver Promo →</span>
          </div>
          <span className="absolute right-0 bottom-0 text-9xl opacity-20 group-hover:scale-110 -group-hover:rotate-12 transition duration-500">💰</span>
        </Link>
      </div>

    </main>
  )
}
