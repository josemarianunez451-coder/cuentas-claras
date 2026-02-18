// frontend/src/pages/TermsOfUse.jsx
import { ShieldCheck, Scale, AlertCircle } from "lucide-react";

const TermsOfUse = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-16 space-y-4">
        <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-blue-600 shadow-sm">
          <Scale size={32} />
        </div>
        <h1 className="text-4xl font-black text-gray-900">Términos de Uso</h1>
        <p className="text-gray-500 font-medium italic">Última actualización: Febrero 2026</p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-blue-600"/> 1. Aceptación de los Términos
          </h2>
          <p>
            Al utilizar <strong>Cuentas Claras</strong>, aceptas cumplir con estos términos. Esta aplicación es una herramienta diseñada para facilitar el cálculo de gastos compartidos y no representa una entidad financiera o bancaria.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-blue-600"/> 2. Registro y Responsabilidad
          </h2>
          <p>
            Para usar las funciones de grupos, deberás registrarte a través de Clerk. Eres responsable de mantener la seguridad de tu sesión. No nos hacemos responsables por el mal uso de la plataforma por parte de terceros si tu cuenta es comprometida.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <AlertCircle size={20} className="text-blue-600"/> 3. Precisión de los Cálculos
          </h2>
          <p className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-blue-900 font-medium">
            Si bien nuestro algoritmo busca la máxima eficiencia y precisión, el usuario debe verificar los saldos antes de realizar transferencias reales de dinero. Cuentas Claras no se responsabiliza por errores humanos en la carga de datos o discrepancias en los pagos realizados fuera de la plataforma.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <X size={20} className="text-blue-600"/> 4. Terminación del Servicio
          </h2>
          <p>
            Nos reservamos el derecho de suspender el acceso a cuentas que realicen un uso indebido de la plataforma o que intenten vulnerar la seguridad del sistema.
          </p>
        </section>
      </div>
    </div>
  );
};

// Necesitamos importar estos para que no den error
import { CheckCircle2, Users, X } from "lucide-react";
export default TermsOfUse;