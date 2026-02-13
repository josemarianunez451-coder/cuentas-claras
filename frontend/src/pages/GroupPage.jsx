// frontend/src/pages/GroupPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { 
  ArrowLeft, Users, Receipt, Plus, Calendar, 
  DollarSign, X, CheckCircle, MessageSquare, 
  Info, Trash2, Share2 
} from 'lucide-react';

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user: currentUser } = useUser();
  
  // Estados
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el Modal de Gastos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: "", amount: "", comment: "" });
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
          comment: newExpense.comment,
          groupId 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewExpense({ description: "", amount: "", comment: "" });
      setIsModalOpen(false);
      await fetchData(); 
    } catch (err) {
      console.error(err);
      alert("Error al guardar el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Marcar un gasto como saldado
  const handleSettleExpense = async (expenseId) => {
    if (!window.confirm("¿Marcar este gasto como pagado?")) return;
    try {
      const token = await getToken();
      await axios.patch(`/api/expenses/${expenseId}/settle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData();
    } catch (err) {
      alert("Error al actualizar el gasto");
    }
  };

  // 4. Borrar el grupo completo
  const handleDeleteGroup = async () => {
    if (!window.confirm("¿ESTÁS SEGURO? Se borrará el grupo y todos sus gastos de forma permanente.")) return;
    try {
      const token = await getToken();
      await axios.delete(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Error al eliminar el grupo");
    }
  };

  // 5. Generar y copiar mensaje de WhatsApp
  
  const copyWhatsAppMessage = () => {
    if (!group) return;

    const cuotaJusta = group.currentActiveAmount / group.members.length;

    let msg = `*CUENTAS CLARAS: ${group.name.toUpperCase()}* 📊\n\n`;
    msg += `¡Hola grupo! Para que todos quedemos a mano de la forma más simple, acá está el resumen:\n\n`;
    
    msg += `💰 *Gasto total:* $${group.currentActiveAmount?.toLocaleString()}\n`;
    msg += `📉 *Costo final por persona:* $${cuotaJusta.toLocaleString(undefined, {maximumFractionDigits: 0})}\n`; 
    msg += `_(Este es el monto que todos habremos pagado realmente al final)_\n\n`;

    msg += `✅ *¿Cuánto puso cada uno hasta ahora?*\n`;
    group.members.forEach(m => {
      msg += `- *${m.name}*: $${(m.totalPaid || 0).toLocaleString()}\n`;
    });
    
    msg += `\n----------------------------------\n`;
    msg += `🚀 *MOVIMIENTOS PARA QUEDAR A MANO:*\n`;
    msg += `_Con estas transferencias, los que pusieron de más recuperan su plata y todos terminamos habiendo pagado los $${cuotaJusta.toLocaleString(undefined, {maximumFractionDigits: 0})} que nos corresponden:_\n\n`;
    
    if (group.suggestedPayments.length === 0) {
      msg += `¡No hay deudas pendientes! 🥳\n`;
    } else {
      group.suggestedPayments.forEach(p => {
        msg += `- *${p.from}* le transfiere *$${p.amount.toLocaleString()}* a *${p.to}*\n`;
      });
    }

    msg += `\n*¡Listo! Con esto las cuentas quedan cerradas.* 🏁\n`;
    msg += `\n_Resumen generado por Cuentas Claras_`;

    navigator.clipboard.writeText(msg);
    alert("¡Resumen redactado y copiado!");
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Volver al Dashboard
      </Link>

      {/* Header del Grupo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">{group.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 text-xs font-bold">
                <Users className="w-3 h-3 mr-1 text-blue-500" />
                {group.members.length} miembros
              </div>
              <div className="flex items-center text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 text-xs font-bold">
                <DollarSign className="w-3 h-3 mr-1" />
                Vigente: ${group.currentActiveAmount?.toLocaleString()}
              </div>
              <div className="flex items-center text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 text-xs font-bold">
                <Calendar className="w-3 h-3 mr-1" />
                Histórico: ${group.totalHistoricalAmount?.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={copyWhatsAppMessage}
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 text-sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir Resumen
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Gasto
            </button>

            {group.createdBy === currentUser?.id && (
              <button 
                onClick={handleDeleteGroup}
                className="flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 font-bold py-3 px-4 rounded-xl transition-all active:scale-95 text-sm"
                title="Borrar grupo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Historial de Gastos */}
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
                <div className="p-12 text-center text-gray-400">No hay gastos aún.</div>
              ) : (
                expenses.map((expense) => (
                  <div key={expense._id} className={`p-6 transition-all flex items-center justify-between group ${expense.isSettled ? 'bg-gray-50/50 opacity-60' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${expense.isSettled ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
                        {expense.isSettled ? <CheckCircle className="w-6 h-6" /> : <Receipt className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className={`font-bold ${expense.isSettled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {expense.description}
                        </h3>
                        <div className="flex flex-col text-xs text-gray-400 mt-1 space-y-1">
                          <span className="font-bold text-gray-600">
                            Pagado por {group.userNames?.[expense.paidBy] || "Usuario"}
                          </span>
                          {expense.comment && (
                            <span className="flex items-center italic text-blue-400">
                              <MessageSquare className="w-3 h-3 mr-1" /> {expense.comment}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-lg font-black text-gray-900">${expense.amount.toLocaleString()}</p>
                      {!expense.isSettled && (
                        <button 
                          onClick={() => handleSettleExpense(expense._id)}
                          className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md font-bold text-gray-400 hover:text-green-600 hover:border-green-200 transition-colors"
                        >
                          Marcar pagado
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lado Derecho: Saldos y Pagos Eficientes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Estado de Cuentas (Vigente)</h2>
            <div className="space-y-3">
              {group.members.map((member, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">{member.name}</span>
                    <span className={`text-sm font-black ${member.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {member.balance >= 0 ? `+ $${member.balance.toFixed(2)}` : `- $${Math.abs(member.balance).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl shadow-xl shadow-blue-100 p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-200" />
              <h2 className="text-lg font-black">Pagos sugeridos</h2>
            </div>
            <div className="space-y-3">
              {group.suggestedPayments?.length === 0 ? (
                <p className="text-sm text-blue-100 italic">No hay deudas pendientes.</p>
              ) : (
                group.suggestedPayments?.map((p, idx) => (
                  <div key={idx} className="bg-white/10 p-3 rounded-xl border border-white/10 text-sm">
                    <span className="font-bold">{p.from}</span> debe pagar <br/>
                    <span className="text-xl font-black text-blue-200">${p.amount.toLocaleString()}</span> a <br/>
                    <span className="font-bold">{p.to}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(groupId);
              alert("ID copiado: " + groupId);
            }}
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:border-blue-300 hover:text-blue-500 transition-all"
          >
            + Invitar amigos (Copiar ID)
          </button>
        </div>
      </div>

      {/* Modal de Nuevo Gasto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">Anotar Gasto</h2>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <input 
                placeholder="¿Qué compraste?" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                required
              />
              <input 
                type="number" 
                placeholder="Monto" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold"
                value={newExpense.amount}
                onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                required
              />
              <textarea 
                placeholder="Comentario opcional..." 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                value={newExpense.comment}
                onChange={e => setNewExpense({...newExpense, comment: e.target.value})}
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Confirmar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;