// frontend/src/pages/GroupPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { ArrowLeft, Users, Receipt, Plus, Calendar, DollarSign, X } from 'lucide-react';

const GroupPage = () => {
  const { groupId } = useParams();
  const { getToken } = useAuth();
  const { user: currentUser } = useUser();
  
  // Estados
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el Modal de Gastos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cargar datos del grupo y gastos
  const fetchData = async () => {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Peticiones en paralelo
      const [groupRes, expensesRes] = await Promise.all([
        axios.get(`/api/groups/${groupId}`, { headers }),
        axios.get(`/api/expenses/group/${groupId}`, { headers })
      ]);

      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudo cargar la información del grupo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId, getToken]);

  // 2. Manejar la creación de un gasto
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      await axios.post("/api/expenses", 
        { 
          description: newExpense.description, 
          amount: Number(newExpense.amount), 
          groupId 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reiniciar y recargar
      setNewExpense({ description: "", amount: "" });
      setIsModalOpen(false);
      await fetchData(); 
    } catch (err) {
      console.error(err);
      alert("Error al guardar el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !group) return (
    <div className="text-center py-20">
      <p className="text-red-500 text-lg font-medium">{error || "Grupo no encontrado"}</p>
      <Link to="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">Volver al Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Botón Volver */}
      <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Volver al Dashboard
      </Link>

      {/* Header del Grupo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">{group.name}</h1>
            <div className="flex items-center text-gray-500 bg-gray-50 w-fit px-3 py-1 rounded-full border border-gray-100">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">{group.members.length} miembros en total</span>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir Gasto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Principal: Gastos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                Historial de Gastos
              </h2>
            </div>

            <div className="divide-y divide-gray-50">
              {expenses.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No hay gastos registrados aún.</p>
                  <p className="text-sm text-gray-400">Comienza añadiendo el primero.</p>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div key={expense._id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Receipt className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{expense.description}</h3>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(expense.date).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          <span>Pagado por {expense.paidBy === currentUser?.id ? 'Ti' : 'otro miembro'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">${expense.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna Lateral: Miembros */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Miembros del grupo</h2>
            <div className="space-y-3">
              {group.members.map((member, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mr-3 shadow-sm">
                    {member.userId === currentUser?.id ? "TÚ" : member.userId.slice(-2).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {member.userId === currentUser?.id ? "Tú (Administrador)" : `Usuario ${member.userId.slice(-5)}`}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 px-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-sm hover:border-blue-400 hover:text-blue-500 transition-all">
              + Invitar amigos
            </button>
          </div>
        </div>
      </div>

      {/* Modal Añadir Gasto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">Nuevo Gasto</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-500 p-1 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">¿Qué compraste?</label>
                <input 
                  type="text" 
                  placeholder="Ej: Pizza, Nafta, Supermercado..." 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">¿Cuánto costó?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Confirmar Gasto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;