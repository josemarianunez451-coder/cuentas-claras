import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Plus, Users, ArrowRight } from "lucide-react"; 
import { useNavigate } from "react-router-dom";



const DashboardPage = () => {
  const navigate = useNavigate(); 
  const { user } = useUser();
  const { getToken } = useAuth(); // Hook para obtener el token de seguridad
  
  // Estados de la aplicación
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // URL del Backend (Asegúrate de que coincida con tu puerto)
  const API_URL = "/api/groups";

  // 1. Función para cargar los grupos desde el Backend
  const fetchGroups = async () => {
    try {
      const token = await getToken(); // Pedimos el token a Clerk
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` } // Enviamos el token en la cabecera
      });
      setGroups(response.data);
    } catch (error) {
      console.error("Error al cargar grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar grupos al iniciar el componente
  useEffect(() => {
    fetchGroups();
  }, []);

  // 2. Función para crear un nuevo grupo
  const handleCreateGroup = async (e) => {
    e.preventDefault(); // Evitar recarga de página
    if (!newGroupName.trim()) return;

    try {
      const token = await getToken();
      await axios.post(API_URL, 
        { name: newGroupName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Limpiar y cerrar modal
      setNewGroupName("");
      setIsModalOpen(false);
      // Recargar la lista de grupos
      fetchGroups();
    } catch (error) {
      console.error("Error al crear grupo:", error);
      alert("Hubo un error al crear el grupo");
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hola, {user?.firstName || 'Amigo'} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Aquí tienes un resumen de tus grupos de gastos.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Grupo
        </button>
      </div>

      {/* Lista de Grupos */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando tus grupos...</div>
      ) : groups.length === 0 ? (
        // Estado Vacio (Empty State)
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No tienes grupos aún</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-1 mb-6">
            Crea tu primer grupo para empezar a dividir gastos con tus amigos o compañeros.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 font-medium hover:underline"
          >
            Crear mi primer grupo &rarr;
          </button>
        </div>
      ) : (
       // Grid de Grupos
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div 
              key={group._id} 
              onClick={() => navigate(`/group/${group._id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-48 cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {group.members.length} {group.members.length === 1 ? 'miembro' : 'miembros'}
                </p>
              </div>
              
              <div className="flex items-center text-blue-600 text-sm font-medium mt-4">
                Ver gastos <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear Grupo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Nuevo Grupo</h2>
            <p className="text-gray-500 mb-6">Dale un nombre a tu grupo para empezar.</p>
            
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del grupo</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ej: Viaje al Sur, Cena de Viernes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;