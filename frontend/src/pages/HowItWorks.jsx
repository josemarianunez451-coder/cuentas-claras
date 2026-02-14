// frontend/src/pages/HowItWorks.jsx
const HowItWorks = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900">¿Cómo funciona?</h1>
        <p className="text-gray-500 font-medium text-lg">Es más fácil que contar hasta tres.</p>
      </div>

      <div className="space-y-32">
        {[
          { step: "01", title: "Creá un grupo", desc: "Dale un nombre a tu aventura, ya sea un viaje a las sierras o los gastos mensuales del departamento.", img: "📊" },
          { step: "02", title: "Invitá a tus amigos", desc: "Pasales el ID único de tu grupo. Ellos se unen en un segundo sin formularios largos.", img: "👥" },
          { step: "03", title: "Anotá los gastos", desc: "Cada vez que alguien pague algo, anotalo con descripción y categoría. Nosotros hacemos la matemática.", img: "💸" },
          { step: "04", title: "Saldá deudas", desc: "Usá nuestro resumen para saber exactamente quién debe pagarle a quién con el menor movimiento de plata posible.", img: "🏁" }
        ].map((s, i) => (
          <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16`}>
            <div className="flex-1 space-y-6 text-center md:text-left">
              <span className="text-6xl font-black text-blue-100">{s.step}</span>
              <h3 className="text-3xl font-black text-gray-900">{s.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-lg">{s.desc}</p>
            </div>
            <div className="flex-1 bg-gray-50 w-full aspect-square rounded-[3rem] flex items-center justify-center text-[10rem] shadow-inner">
              {s.img}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;