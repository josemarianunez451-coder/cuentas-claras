// frontend/src/pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Plus, Users, ArrowRight, UserPlus, X } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate(); 
  const { user } = useUser();
  const { getToken } = useAuth();
  
  // Estados de la aplicación
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Crear Grupo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Estados para Unirse a Grupo
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinGroupId, setJoinGroupId] = useState("");

  const API_URL = "/api/groups";

  // 1. Cargar los grupos
  const fetchGroups = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (Array.isArray(response.data)) {
        setGroups(response.data);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("Error al cargar grupos:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // 2. Crear un nuevo grupo
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const token = await getToken();
      await axios.post(API_URL, 
        { name: newGroupName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewGroupName("");
      setIsModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Error al crear grupo:", error);
      alert("Hubo un error al crear el grupo");
    }
  };

  // 3. Unirse a un grupo existente
  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinGroupId.trim()) return;

    try {
      const token = await getToken();
      await axios.post(`${API_URL}/join`, 
        { groupId: joinGroupId.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoinGroupId("");
      setIsJoinModalOpen(false);
      fetchGroups(); // Recargar la lista para ver el nuevo grupo
    } catch (error) {
      console.error("Error al unirse:", error);
      alert(error.response?.data?.msg || "ID de grupo inválido o ya eres miembro");
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
        
        {/* Grupo de Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setIsJoinModalOpen(true)}
            className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
            Unirse a Grupo
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Grupo
          </button>
        </div>
      </div>

      {/* Lista de Grupos */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No tienes grupos aún</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-1 mb-6">
            Crea un grupo o únete a uno de tus amigos para empezar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div 
              key={group._id} 
              onClick={() => navigate(`/group/${group._id}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all p-6 flex flex-col justify-between h-48 cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">
                  {group.name}
                </h3>
                <p className="text-sm font-bold text-gray-400 mt-1">
                  {group.members.length} {group.members.length === 1 ? 'miembro' : 'miembros'}
                </p>
              </div>
              
              <div className="flex items-center text-blue-600 text-sm font-bold mt-4">
                Ver detalles <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREAR GRUPO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Nuevo Grupo</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del grupo</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ej: Viaje a la playa 🏖️"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={!newGroupName.trim()} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all disabled:opacity-50">Crear Grupo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UNIRSE A GRUPO */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Unirse a Grupo</h2>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <p className="text-gray-500 text-sm mb-4 font-medium">Pega el ID que te compartieron para entrar al grupo.</p>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ID del Grupo</label>
                <input 
                  type="text" 
                  value={joinGroupId}
                  onChange={(e) => setJoinGroupId(e.target.value)}
                  placeholder="Ej: 65f21a..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={!joinGroupId.trim()} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all disabled:opacity-50">Unirme ahora</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;