// frontend/src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import { CheckCircle2, Users2, Smartphone, BarChart3, Zap, DollarSign  } from "lucide-react";

const HomePage = () => {
  return (
    <div className="space-y-32 py-10">
      {/* SECCIÓN HERO */}
      <section className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100 animate-bounce">
          <Zap size={14} className="fill-current"/> ¡Nuevos gráficos de gastos!
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
          Dejá las deudas atrás con <span className="text-blue-600">Cuentas Claras.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed px-4">
          La aplicación que calcula quién debe a quién para que vos solo te preocupes por disfrutar. Ideal para viajes, cenas y roommates.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
          <Link to="/sign-up" className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95">
            Empezar Gratis
          </Link>
          <Link to="/how-it-works" className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-gray-50 transition-all active:scale-95">
            Ver cómo funciona
          </Link>
        </div>
      </section>

      {/* SECCIÓN CARACTERÍSTICAS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Users2/>, title: "Grupos Ilimitados", desc: "Creá grupos para cada viaje, cena o evento sin límites." },
          { icon: <BarChart3/>, title: "Algoritmo Inteligente", desc: "Calculamos los movimientos mínimos para saldar todas las deudas." },
          { icon: <Smartphone/>, title: "Resumen WhatsApp", desc: "Copiá un resumen perfecto para enviar al grupo de tus amigos." }
        ].map((feat, i) => (
          <div key={i} className="bg-gray-50 p-10 rounded-[2.5rem] space-y-4 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-50 group">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {feat.icon}
            </div>
            <h3 className="text-xl font-black text-gray-900">{feat.title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* SECCIÓN SOCIAL PROOF / TRUST */}
      <section className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-white text-center space-y-10 shadow-2xl shadow-blue-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
          <DollarSign size={400}/>
        </div>
        <h2 className="text-3xl md:text-5xl font-black max-w-2xl mx-auto leading-tight">
          Unite a miles de amigos que ya no discuten por plata.
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          {["Rápido", "Transparente", "Seguro", "Gratis"].map((tag, i) => (
            <div key={i} className="flex items-center gap-2 font-black uppercase tracking-tighter">
              <CheckCircle2 className="text-blue-300"/> {tag}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;