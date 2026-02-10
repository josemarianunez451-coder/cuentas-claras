// frontend/src/pages/GroupPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { ArrowLeft, Users, Receipt, Plus } from 'lucide-react';

const GroupPage = () => {
  const { groupId } = useParams(); // Obtenemos el ID de la URL
  const { getToken } = useAuth();
  const { user } = useUser();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = await getToken();
        // Nota: Asegúrate de que la URL coincida con tu backend
        const response = await axios.get(`http://localhost:4000/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroup(response.data);
      } catch (err) {
        console.error("Error cargando grupo:", err);
        setError("No se pudo cargar el grupo o no tienes permisos.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, getToken]);

  if (loading) return <div className="text-center py-10">Cargando detalles del grupo...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!group) return <div className="text-center py-10">Grupo no encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabecera del Grupo */}
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{group.name}</h1>
            <div className="flex items-center mt-2 text-gray-500">
              <Users className="w-4 h-4 mr-2" />
              <span>{group.members.length} miembros</span>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition-all">
            <Plus className="w-5 h-5 mr-2" />
            Añadir Gasto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna Izquierda: Lista de Gastos (Próximamente) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-600" />
              Gastos Recientes
            </h2>
            
            {/* Estado vacío temporal */}
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p>Aún no hay gastos registrados.</p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Miembros y Resumen */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Miembros</h2>
            <ul className="space-y-3">
              {group.members.map((member, index) => (
                <li key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                    {/* Como solo guardamos ID por ahora, ponemos un icono o inicial generica */}
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">
                     {/* Aquí idealmente mostraríamos el nombre, pero por ahora mostramos el ID acortado */}
                    {member.userId === user?.id ? "Tú" : `Usuario ...${member.userId.slice(-4)}`}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 text-sm text-blue-600 font-medium hover:underline border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors">
              + Invitar Amigo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;