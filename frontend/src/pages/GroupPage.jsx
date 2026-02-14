// frontend/src/pages/GroupPage.jsx
import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { 
  ArrowLeft, Users, Receipt, Plus, Calendar, 
  DollarSign, X, CheckCircle, MessageSquare, 
  Info, Trash2, Share2, Edit2, PieChart as PieChartIcon
} from 'lucide-react';
// Importamos los componentes de la librería de gráficos
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Constantes para categorías y colores del gráfico
const CATEGORIES = ['Comida', 'Transporte', 'Vivienda', 'Entretenimiento', 'Otros'];
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#64748b'];

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user: currentUser } = useUser();
  
  // Estados principales
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el Modal (Crear y Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [newExpense, setNewExpense] = useState({ 
    description: "", 
    amount: "", 
    comment: "", 
    category: "Otros" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cargar datos del grupo y gastos
  const fetchData = async () => {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

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

  // 2. Lógica para el gráfico: Agrupar gastos por categoría
  const chartData = useMemo(() => {
    const data = CATEGORIES.map(cat => ({ name: cat, value: 0 }));
    expenses.forEach(exp => {
      // Solo sumamos al gráfico si el gasto no está saldado (opcional)
      if (!exp.isSettled) {
        const index = CATEGORIES.indexOf(exp.category || 'Otros');
        if (index !== -1) data[index].value += exp.amount;
      }
    });
    // Retornamos solo las categorías que tienen gastos mayores a 0
    return data.filter(d => d.value > 0);
  }, [expenses]);

  // 3. Manejar creación o edición (Submit del Modal)
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const data = { 
        ...newExpense, 
        amount: Number(newExpense.amount), 
        groupId 
      };

      if (editingId) {
        // Modo Edición
        await axios.put(`/api/expenses/${editingId}`, data, { headers });
      } else {
        // Modo Creación
        await axios.post("/api/expenses", data, { headers });
      }
      
      setNewExpense({ description: "", amount: "", comment: "", category: "Otros" });
      setEditingId(null);
      setIsModalOpen(false);
      await fetchData(); 
    } catch (err) {
      console.error(err);
      alert("Error al guardar el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Preparar el modal para editar
  const handleEditClick = (expense) => {
    setNewExpense({
      description: expense.description,
      amount: expense.amount,
      comment: expense.comment || "",
      category: expense.category || "Otros"
    });
    setEditingId(expense._id);
    setIsModalOpen(true);
  };

  // 5. Eliminar un gasto
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("¿Borrar este gasto definitivamente?")) return;
    try {
      const token = await getToken();
      await axios.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData();
    } catch (err) {
      alert("No tienes permiso para borrar este gasto");
    }
  };

  // 6. Marcar como pagado
  const handleSettleExpense = async (expenseId) => {
    if (!window.confirm("¿Marcar este gasto como pagado?")) return;
    try {
      const token = await getToken();
      await axios.patch(`/api/expenses/${expenseId}/settle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData();
    } catch (err) {
      alert("Error al actualizar");
    }
  };

  // 7. Borrar grupo completo
  const handleDeleteGroup = async () => {
    if (!window.confirm("¿Borrar grupo y todos sus gastos?")) return;
    try {
      const token = await getToken();
      await axios.delete(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/dashboard");
    } catch (err) {
      alert("Solo el administrador puede borrar el grupo");
    }
  };

  // 8. Mensaje de WhatsApp
  const copyWhatsAppMessage = () => {
    if (!group) return;

    const cuotaJusta = group.currentActiveAmount / group.members.length;

    let msg = `*CUENTAS CLARAS: ${group.name.toUpperCase()}* 📊\n\n`;
    msg += `¡Hola grupo! Para que todos quedemos a mano de la forma más simple, acá está el resumen de las cuentas:\n\n`;
    
    msg += `💰 *Gasto total:* $${group.currentActiveAmount?.toLocaleString()}\n`;
    msg += `📉 *Costo final por persona:* $${cuotaJusta.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`; 
    msg += `_(Este es el monto que todos habremos pagado realmente al final)_\n\n`;

    msg += `✅ *Aportes reales de cada uno:*\n`;
    group.members.forEach(m => {
      msg += `- *${m.name}* puso: $${(m.totalPaid || 0).toLocaleString()}\n`;
    });
    
    msg += `\n----------------------------------\n`;
    msg += `🚀 *MOVIMIENTOS INTELIGENTES:*\n`;
    msg += `_La app calculó las transferencias mínimas para evitar que todos se pasen plata entre sí:_\n\n`;
    
    if (group.suggestedPayments.length === 0) {
      msg += `¡No hay deudas pendientes! Todos pusimos lo mismo. 🥳\n`;
    } else {
      group.suggestedPayments.forEach(p => {
        msg += `- *${p.from}* debe transferir *$${p.amount.toLocaleString()}* a *${p.to}*\n`;
      });
    }

    msg += `\n*¡Con estos pagos ya quedamos todos en $0!* 🏁\n`;
    msg += `\n_Resumen generado por Cuentas Claras_`;

    navigator.clipboard.writeText(msg);
    alert("¡Resumen redactado y copiado para WhatsApp!");
  };
  
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <p className="text-blue-600 font-black animate-pulse">Cargando cuentas...</p>
    </div>
  );

  if (error || !group) return (
    <div className="text-center py-20">
      <p className="text-red-500 text-lg font-bold">{error || "Grupo no encontrado"}</p>
      <Link to="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block font-bold">Volver al Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
      
      <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Dashboard
      </Link>

      {/* HEADER PRINCIPAL */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-gray-900 leading-none">{group.name}</h1>
            <div className="flex flex-wrap gap-3">
              <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black border border-blue-100 flex items-center">
                <DollarSign className="w-3 h-3 mr-1"/>Vigente: ${group.currentActiveAmount?.toLocaleString()}
              </span>
              <span className="bg-gray-50 text-gray-500 px-4 py-1.5 rounded-full text-xs font-black border border-gray-100">
                {group.members.length} integrantes
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={copyWhatsAppMessage} 
              className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95"
              title="Compartir en WhatsApp"
            >
              <Share2 className="w-5 h-5"/>
            </button>
            <button 
              onClick={() => { setEditingId(null); setIsModalOpen(true); }} 
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" /> Añadir Gasto
            </button>
            {group.createdBy === currentUser?.id && (
              <button 
                onClick={handleDeleteGroup}
                className="p-4 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-all"
                title="Borrar Grupo"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: GRÁFICO E HISTORIAL */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* GRÁFICO POR CATEGORÍA */}
          {expenses.length > 0 && chartData.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-purple-500"/>
                Distribución por Categoría
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={chartData} 
                      innerRadius={60} 
                      outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[CATEGORIES.indexOf(entry.name)]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* LISTA DE GASTOS */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-xl font-black text-gray-800">Historial de Gastos</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {expenses.length === 0 ? (
                <div className="p-20 text-center text-gray-400 font-bold">No hay gastos registrados.</div>
              ) : (
                expenses.map((expense) => (
                  <div key={expense._id} className={`p-6 flex items-center justify-between group transition-all ${expense.isSettled ? 'opacity-40 grayscale bg-gray-50/50' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-2xl ${expense.isSettled ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'} transition-colors`}>
                        {expense.isSettled ? <CheckCircle className="w-6 h-6" /> : <Receipt className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className={`font-black text-gray-900 leading-tight ${expense.isSettled ? 'line-through text-gray-400' : ''}`}>
                          {expense.description}
                        </h3>
                        <div className="flex flex-col text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">
                          <span>{group.userNames?.[expense.paidBy] || "Usuario"} • {expense.category || "Otros"}</span>
                          {expense.comment && (
                            <span className="text-blue-500 italic normal-case tracking-normal font-medium flex items-center mt-1">
                              <MessageSquare className="w-3 h-3 mr-1"/> {expense.comment}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-xl font-black text-gray-900">${expense.amount.toLocaleString()}</p>
                      {!expense.isSettled && (
                        <div className="flex gap-2 justify-end md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleSettleExpense(expense._id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Saldar"><CheckCircle className="w-4 h-4"/></button>
                          {expense.paidBy === currentUser?.id && (
                            <>
                              <button onClick={() => handleEditClick(expense)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Editar"><Edit2 className="w-4 h-4"/></button>
                              <button onClick={() => handleDeleteExpense(expense._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Borrar"><Trash2 className="w-4 h-4"/></button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: SIDEBAR */}
        <div className="space-y-6">
          {/* ESTADO DE CUENTAS */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-black text-gray-800 mb-6">Estado Final</h2>
            <div className="space-y-4">
              {group.members.map((member, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-sm font-black text-gray-700">{member.name}</span>
                  <span className={`text-sm font-black ${member.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {member.balance >= 0 ? `+ $${member.balance.toFixed(0)}` : `- $${Math.abs(member.balance).toFixed(0)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PAGOS SUGERIDOS */}
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
            <h2 className="text-xl font-black mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2 opacity-50"/>
              Pagos Sugeridos
            </h2>
            <div className="space-y-4">
              {group.suggestedPayments?.map((p, idx) => (
                <div key={idx} className="bg-white/10 p-5 rounded-3xl border border-white/10 text-sm">
                  <p className="font-bold opacity-70 mb-1">{p.from} debe dar</p>
                  <p className="text-3xl font-black mb-1">${p.amount.toLocaleString()}</p>
                  <p className="font-bold opacity-70 text-right text-xs">a {p.to}</p>
                </div>
              ))}
              {group.suggestedPayments?.length === 0 && (
                <p className="text-center py-4 font-bold opacity-60 italic">¡No hay deudas! 🥳</p>
              )}
            </div>
          </div>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(groupId);
              alert("ID del grupo copiado: " + groupId);
            }}
            className="w-full py-5 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-black text-sm hover:border-blue-300 hover:text-blue-500 transition-all uppercase tracking-widest"
          >
            Invitar amigos
          </button>
        </div>
      </div>

      {/* MODAL UNIFICADO: CREAR Y EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-8 text-white">
              <h2 className="text-3xl font-black">{editingId ? "Editar Gasto" : "Nuevo Gasto"}</h2>
              <p className="opacity-70 font-bold uppercase tracking-widest text-[10px] mt-1">{group.name}</p>
            </div>
            
            <form onSubmit={handleSubmitExpense} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] uppercase font-black text-gray-400 ml-2">¿En qué se gastó?</label>
                <input 
                  placeholder="Ej: Pizza, Nafta..." 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  required 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Monto total</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  required 
                />
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Categoría</label>
                <select 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Comentario (opcional)</label>
                <textarea 
                  placeholder="Detalles extra..." 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-medium text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newExpense.comment}
                  onChange={e => setNewExpense({...newExpense, comment: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                  className="flex-1 py-4 font-black text-gray-400 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : (editingId ? "Guardar Cambios" : "Confirmar Gasto")}
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