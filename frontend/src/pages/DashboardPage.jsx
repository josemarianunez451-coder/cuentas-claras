import { useUser } from "@clerk/clerk-react";

const DashboardPage = () => {
  const { user } = useUser();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Bienvenido de nuevo, {user?.firstName || 'Usuario'}!
      </h1>
      <p className="mt-2 text-gray-600">
        Este es tu panel principal. Desde aquí podrás ver y gestionar tus grupos de gastos.
      </p>
      
      {/* Aquí irá el contenido principal del dashboard, como la lista de grupos */}
      <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Tus Grupos</h2>
        <p className="mt-2 text-gray-500">
          Próximamente aquí verás la lista de tus grupos...
        </p>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
          + Crear Nuevo Grupo
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;