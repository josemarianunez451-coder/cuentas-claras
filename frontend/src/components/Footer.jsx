// frontend/src/components/Footer.jsx
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Columna 1: Branding */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-xl font-black text-gray-900 flex items-center gap-2">
              📊 Cuentas Claras
            </Link>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed">
              La forma más simple y transparente de dividir gastos con amigos, familiares y compañeros de viaje.
            </p>
          </div>

          {/* Columna 2: Producto */}
          <div>
            <h4 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Producto</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link to="/how-it-works" className="hover:text-blue-600 transition-colors">Cómo funciona</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-600 transition-colors">Mi Dashboard</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-500">
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacidad</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Términos de uso</Link></li>
            </ul>
          </div>

          {/* Columna 4: Redes */}
          <div>
            <h4 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Conectar</h4>
            <div className="flex gap-4">
              <a href="#" className="bg-gray-50 p-3 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Github size={20}/></a>
              <a href="#" className="bg-gray-50 p-3 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-blue-50 transition-all"><Twitter size={20}/></a>
              <a href="#" className="bg-gray-50 p-3 rounded-xl text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-all"><Linkedin size={20}/></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;