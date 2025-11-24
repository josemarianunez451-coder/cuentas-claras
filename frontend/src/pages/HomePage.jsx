import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
        Gestiona tus gastos compartidos sin complicaciones.
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
        Ideal para viajes, compañeros de piso, eventos y más. Olvídate de las hojas de cálculo y las deudas confusas.
      </p>
      <div className="mt-8 flex justify-center gap-x-4">
        <Link 
          to="/sign-up" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Empezar Ahora
        </Link>
        <Link 
          to="/sign-in" 
          className="inline-block bg-white text-blue-600 font-bold py-3 px-6 rounded-lg text-lg border-2 border-gray-200 hover:bg-gray-100 transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
};

export default HomePage;