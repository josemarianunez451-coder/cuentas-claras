// frontend/src/pages/PrivacyPolicy.jsx
import { Lock, EyeOff, Database, Server } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-16 space-y-4">
        <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-blue-600 shadow-sm">
          <Lock size={32} />
        </div>
        <h1 className="text-4xl font-black text-gray-900">Política de Privacidad</h1>
        <p className="text-gray-500 font-medium italic">Última actualización: Febrero 2026</p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Database size={20} className="text-blue-600"/> ¿Qué datos recolectamos?
          </h2>
          <p>
            En <strong>Cuentas Claras</strong> valoramos tu privacidad. Solo recolectamos la información necesaria para el funcionamiento del servicio:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Identidad:</strong> Tu nombre y email (gestionados de forma segura por <strong>Clerk</strong>).</li>
            <li><strong>Datos de Uso:</strong> Los nombres de los grupos que creas y los gastos que registras.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Server size={20} className="text-blue-600"/> Uso y Almacenamiento
          </h2>
          <p>
            Tus datos se almacenan en <strong>MongoDB Atlas</strong> con cifrado en reposo. No vendemos tus datos a terceros ni los utilizamos para fines publicitarios. La información de los grupos es visible únicamente para los miembros que se unan mediante el ID único.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <EyeOff size={20} className="text-blue-600"/> Tus Derechos
          </h2>
          <p>
            Puedes eliminar tus gastos o grupos en cualquier momento. Al eliminar un grupo, toda la información asociada a los gastos de ese grupo se borra permanentemente de nuestros servidores.
          </p>
        </section>

        <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Lock size={18} className="text-blue-400"/> Seguridad Garantizada
          </h3>
          <p className="text-gray-400 text-sm">
            Toda la comunicación entre tu navegador y nuestros servidores viaja cifrada mediante protocolos SSL/TLS. Tu contraseña nunca toca nuestros servidores; es gestionada exclusivamente por Clerk bajo estándares de seguridad bancaria.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;