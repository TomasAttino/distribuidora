export default function ContactRoute() {
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12">
      <h1 className="text-4xl font-extrabold text-slate-800 mb-8 text-center">Contáctanos</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-pink-600 mb-6">Información Directa</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">📍 Visítanos</h3>
              <p className="text-slate-600 mt-1">Av. San Martín 1324, Ramos Mejía, Buenos Aires.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">🕒 Horarios de Atención</h3>
              <p className="text-slate-600 mt-1">Lunes a Viernes: 8:00 a 14:00 hs</p>
              <p className="text-slate-600">Sábados: 8:00 a 13:30 hs</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">📞 Contacto</h3>
              <p className="text-slate-600 mt-1">Ventas: +54 9 11 4528-5953</p>
              <p className="text-slate-600 text-sm italic">O haz clic en el botón inferior para WhatsApp directo.</p>
            </div>
          </div>
          <a href="https://wa.me/5491145285953" target="_blank" rel="noreferrer" className="block w-full mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-center shadow-lg transition-transform hover:scale-[1.02]">
            📲 Chatear por WhatsApp
          </a>
        </div>

        <div className="bg-slate-200 rounded-2xl overflow-hidden shadow-sm h-[400px] md:h-auto border border-slate-200 relative flex items-center justify-center">
          <span className="text-slate-400 absolute font-bold z-0">Cargando Mapa...</span>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.0601808539127!2d-58.553698224522236!3d-34.6531830601118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcc876fbc2ccc1%3A0xed76df970da3f49b!2sAv.%20Gral.%20San%20Mart%C3%ADn%201324%2C%20B1704ABN%20Ramos%20Mej%C3%ADa%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1775605194317!5m2!1ses!2sar"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="relative z-10"
          ></iframe>
        </div>
      </div>
    </div>
  )
}
