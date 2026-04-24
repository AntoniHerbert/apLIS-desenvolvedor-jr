import React, { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';

const API_MEDICOS = import.meta.env.VITE_API_MEDICOS;
const API_PACIENTES = import.meta.env.VITE_API_PACIENTES;

export default function App() {
  const [activeTab, setActiveTab] = useState('medicos');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 selection:bg-blue-200">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col p-6 shadow-2xl z-10">
        <div className="flex items-center gap-3 mb-10 mt-4">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <span className="text-2xl">🏥</span>
          </div>
          <h1 className="text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
            apLIS Clinic
          </h1>
        </div>

        <nav className="flex flex-col gap-3">
          <button 
            onClick={() => setActiveTab('medicos')}
            className={`text-left px-5 py-3 rounded-xl transition-all duration-300 font-medium flex items-center gap-3 ${activeTab === 'medicos' ? 'bg-white text-blue-900 shadow-md transform scale-105' : 'text-blue-100 hover:bg-white/10 hover:translate-x-1'}`}
          >
            <span className="text-xl">👨‍⚕️</span> Médicos
          </button>
          <button 
            onClick={() => setActiveTab('pacientes')}
            className={`text-left px-5 py-3 rounded-xl transition-all duration-300 font-medium flex items-center gap-3 ${activeTab === 'pacientes' ? 'bg-white text-blue-900 shadow-md transform scale-105' : 'text-blue-100 hover:bg-white/10 hover:translate-x-1'}`}
          >
            <span className="text-xl">🛌</span> Pacientes
          </button>
        </nav>

        <div className="mt-auto pt-8 text-xs text-blue-300/60 text-center">
          © 2026 apLIS Systems
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 transition-all">
          {activeTab === 'medicos' ? <MedicosView /> : <PacientesView />}
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------
// COMPONENTE: Médicos
// ----------------------------------------------------
function MedicosView() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, nome: '', CRM: '', UFCRM: '' });
  const [totalMedicos, setTotalMedicos] = useState(0);
  const [mensagem, setMensagem] = useState(null);
  const [erroValidacao, setErroValidacao] = useState(null);
  
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [filtroUF, setFiltroUF] = useState('');

  const ufsBrasil = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => { 
    fetchMedicos(); 
  }, [pagina]);

  const fetchMedicos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_MEDICOS}?q=${busca}&uf=${filtroUF}&page=${pagina}&limit=5`);
      if (!res.ok) throw new Error('Falha no servidor');
      const json = await res.json();
      setMedicos(json.data || []);
      setTotalMedicos(json.total || 0);
    } catch (error) { 
      setErroValidacao("Erro de comunicação: Não foi possível carregar os médicos.");
      setMedicos([]); 
      setTotalMedicos(0);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Tem a certeza que quer apagar?')) return;
    try {
      const res = await fetch(`${API_MEDICOS}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao apagar');
      setMensagem("Médico apagado com sucesso!");
      fetchMedicos();
    } catch (error) { 
      setErroValidacao("Erro ao apagar o médico. Verifique a sua conexão.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagina(1);
    fetchMedicos();
  };

  const validarFormulario = () => {
    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!regexNome.test(form.nome.trim())) return "O nome deve conter apenas letras e espaços.";
    if (form.nome.trim().length < 3) return "O nome deve ter pelo menos 3 letras.";

    const regexCRM = /^\d+$/;
    if (!regexCRM.test(form.CRM.trim())) return "O CRM deve conter apenas números.";
    if (form.CRM.trim().length < 4 || form.CRM.trim().length > 10) return "O CRM deve ter entre 4 e 10 dígitos.";
    if (!form.UFCRM) return "Por favor, selecione a UF do CRM.";

    return null; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const erro = validarFormulario();
    if (erro) {
      setErroValidacao(erro);
      setTimeout(() => setErroValidacao(null), 5000);
      return;
    }

    const isEdit = form.id !== null;
    const url = isEdit ? `${API_MEDICOS}/${form.id}` : API_MEDICOS;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nome: form.nome.trim(), CRM: form.CRM.trim() })
      });
      
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { data = { mensagem: "Erro inesperado do servidor" }; }

      setMensagem(data.mensagem || "Operação realizada com sucesso!");
      resetForm();
      fetchMedicos();
      setTimeout(() => setMensagem(null), 3000);
    } catch (error) { console.error(error); }
  };

  const resetForm = () => {
    setForm({ id: null, nome: '', CRM: '', UFCRM: '' });
    setErroValidacao(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestão de Médicos</h2>
          <p className="text-slate-500 mt-1">Registe e gira o corpo clínico</p>
        </div>
      </div>
      
      {erroValidacao && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium rounded-r-lg shadow-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span> {erroValidacao}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-10 p-6 md:p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
            <input 
              required 
              type="text" 
              value={form.nome} 
              onChange={e => setForm({...form, nome: e.target.value})} 
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm" 
              placeholder="Ex: Dr. João da Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">CRM</label>
            <input 
              required 
              type="text" 
              maxLength={10}
              value={form.CRM} 
              onChange={e => setForm({...form, CRM: e.target.value.replace(/\D/g, '')})} 
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm font-mono" 
              placeholder="Ex: 123456"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">UF do CRM</label>
            <select 
              required
              value={form.UFCRM}
              onChange={e => setForm({...form, UFCRM: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm bg-white"
            >
              <option value="" disabled>Selecione...</option>
              {ufsBrasil.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-8 pt-4 border-t border-slate-200">
          <button type="submit" className={`px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 text-white ${form.id ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
            {form.id ? 'Salvar Alterações' : '+ Cadastrar Médico'}
          </button>
          {form.id && (
            <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-200 rounded-lg transition-colors">
              Cancelar
            </button>
          )}
          {mensagem && <span className="text-teal-600 font-bold bg-teal-50 px-4 py-2 rounded-lg ml-auto animate-pulse">{mensagem}</span>}
        </div>
      </form>

      {/* Barra de Pesquisa */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-3 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar médico por nome ou CRM..." 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
            className="w-full py-3 pl-11 pr-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-shadow" 
          />
        </div>
        <select value={filtroUF} onChange={e => setFiltroUF(e.target.value)} className="py-3 px-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-medium text-slate-600 cursor-pointer">
          <option value="">Todas UFs</option>
          {ufsBrasil.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
        <button type="submit" className="bg-slate-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-sm">
          Buscar
        </button>
        {(busca || filtroUF) && (
          <button type="button" onClick={() => { setBusca(''); setFiltroUF(''); setPagina(1); fetchMedicos();}} className="bg-slate-100 text-slate-600 font-medium px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors">
            Limpar
          </button>
        )}
      </form>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400 font-medium animate-pulse">
          <span className="mr-2">⏳</span> A carregar base de dados...
        </div>
      ) : (
        <div className="overflow-hidden shadow-sm rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Profissional</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registro (CRM)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">UF</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-40">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicos.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-medium">Nenhum médico encontrado na base de dados.</td></tr>
              ) : medicos.map(m => (
                <tr key={m.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 text-slate-400 font-mono text-sm">{m.id}</td>
                  <td className="p-4 font-bold text-slate-800">{m.nome}</td>
                  <td className="p-4 text-slate-600 font-mono">{m.CRM}</td>
                  <td className="p-4">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{m.UFCRM}</span>
                  </td>
                  <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => { setForm(m); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold text-sm mr-2 transition-colors">Editar</button>
                    <button onClick={() => handleDelete(m.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors">Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          <div className="flex justify-between items-center p-4 bg-slate-50 border-t border-slate-200">
            <button 
              disabled={pagina === 1} 
              onClick={() => setPagina(pagina - 1)} 
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-all"
            >
              ← Anterior
            </button>
            <div className="bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="text-slate-600 font-bold text-sm">Página {pagina}</span>
            </div>
            <button 
              disabled={pagina * 5 >= totalMedicos} onClick={() => setPagina(pagina + 1)} 
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-all"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// COMPONENTE: Pacientes
// ----------------------------------------------------
function PacientesView() {
  const [pacientes, setPacientes] = useState([]);
  const [totalPacientes, setTotalPacientes] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, nome: '', dataNascimento: '', carteirinha: '', cpf: '' });
  
  const [mensagem, setMensagem] = useState(null);
  const [erroValidacao, setErroValidacao] = useState(null);

  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [filtroData, setFiltroData] = useState('');

  useEffect(() => { 
    fetchPacientes(); 
  }, [pagina]);

  const fetchPacientes = async () => {
    setLoading(true);
    setErroValidacao(null); 
    try {
      const res = await fetch(`${API_PACIENTES}?q=${busca}&data=${filtroData}&page=${pagina}&limit=5`);
      if (!res.ok) throw new Error('Falha no servidor');
      
      const json = await res.json();
      
      setPacientes(json.data || []);
      setTotalPacientes(json.total || 0); 
    } catch (error) { 
      console.error(error);
      setErroValidacao("Erro de comunicação: Não foi possível carregar a lista de pacientes."); 
      setPacientes([]);
      setTotalPacientes(0);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagina(1);
    fetchPacientes();
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; 
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  const validarFormulario = () => {
    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!regexNome.test(form.nome.trim())) return "O nome deve conter apenas letras e espaços.";
    if (form.nome.trim().length < 3) return "O nome deve ter pelo menos 3 letras.";

    if (!form.dataNascimento) return "Selecione a data de nascimento.";
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    const [ano, mes, dia] = form.dataNascimento.split('-');
    const dataNasc = new Date(ano, mes - 1, dia);
    if (dataNasc > hoje) return "A data de nascimento não pode ser no futuro.";

    const regexCarteirinha = /^\d+$/; 
    if (!regexCarteirinha.test(form.carteirinha.trim())) return "A carteirinha deve conter apenas números.";

    const cpfLimpo = form.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return "O CPF deve ter exatamente 11 números.";
    if (!validarCPF(cpfLimpo)) return "O CPF digitado é inválido.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erro = validarFormulario();
    if (erro) {
      setErroValidacao(erro);
      setTimeout(() => setErroValidacao(null), 5000);
      return;
    }

    const isEdit = form.id !== null;
    const url = isEdit ? `${API_PACIENTES}/${form.id}` : API_PACIENTES;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          nome: form.nome.trim(),
          carteirinha: form.carteirinha.trim(),
          cpf: form.cpf.replace(/\D/g, '') 
        })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        setErroValidacao(json.mensagem || "Erro ao guardar paciente.");
        setTimeout(() => setErroValidacao(null), 5000);
        return;
      }

      setMensagem(json.mensagem || "Operação realizada com sucesso!");
      resetForm();
      fetchPacientes();
      setTimeout(() => setMensagem(null), 3000);
    } catch (error) { 
      console.error(error); 
      setErroValidacao("Falha de conexão. O servidor backend pode estar offline.");
      setTimeout(() => setErroValidacao(null), 5000);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Tem a certeza que quer apagar este paciente?')) return;
    try {
      const res = await fetch(`${API_PACIENTES}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao apagar');
      
      setMensagem("Paciente apagado com sucesso!");
      fetchPacientes();
      setTimeout(() => setMensagem(null), 3000);
    } catch (error) { 
      console.error(error);
      setErroValidacao("Erro ao apagar. Verifique a sua conexão.");
      setTimeout(() => setErroValidacao(null), 5000);
    }
  };

  const resetForm = () => {
    setForm({ id: null, nome: '', dataNascimento: '', carteirinha: '', cpf: '' });
    setErroValidacao(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestão de Pacientes</h2>
          <p className="text-slate-500 mt-1">Prontuário e registo central</p>
        </div>
      </div>
      
      {erroValidacao && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium rounded-r-lg shadow-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span> {erroValidacao}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-10 p-6 md:p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
            <input 
              required 
              type="text" 
              value={form.nome} 
              onChange={e => setForm({...form, nome: e.target.value})} 
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow shadow-sm" 
              placeholder="Ex: Maria Antonieta"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Data de Nascimento</label>
            <input 
              required 
              type="date" 
              value={form.dataNascimento} 
              max={new Date().toISOString().split("T")[0]}
              onChange={e => setForm({...form, dataNascimento: e.target.value})} 
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow shadow-sm bg-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Cartão de Saúde / SUS (Apenas Nrs)</label>
            <input 
              required 
              type="text" 
              maxLength={15}
              value={form.carteirinha} 
              onChange={e => setForm({...form, carteirinha: e.target.value.replace(/\D/g, '')})} 
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow shadow-sm font-mono" 
              placeholder="Ex: 700012345678901"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">CPF (Documento)</label>
            <IMaskInput
              required
              mask="000.000.000-00"
              value={form.cpf}
              unmask={false} 
              onAccept={(value) => setForm({ ...form, cpf: value })}
              placeholder="Ex: 123.456.789-09"
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow shadow-sm font-mono"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-8 pt-4 border-t border-slate-200">
          <button type="submit" className={`px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 text-white ${form.id ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-teal-600 to-emerald-600'}`}>
            {form.id ? 'Salvar Alterações' : '+ Cadastrar Paciente'}
          </button>
          {form.id && (
            <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-200 rounded-lg transition-colors">
              Cancelar
            </button>
          )}
          {mensagem && <span className="text-teal-600 font-bold bg-teal-50 px-4 py-2 rounded-lg ml-auto animate-pulse">{mensagem}</span>}
        </div>
      </form>

      {/* Barra de Pesquisa */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-3 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou cartão..." 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
            className="w-full py-3 pl-11 pr-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-100 transition-shadow" 
          />
        </div>
        <input 
          type="date" 
          value={filtroData} 
          onChange={e => setFiltroData(e.target.value)} 
          className="py-3 px-4 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-100 font-medium text-slate-600 cursor-pointer" 
          title="Filtrar por data de nascimento" 
        />
        <button type="submit" className="bg-slate-800 text-white font-medium px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-sm">
          Buscar
        </button>
        {(busca || filtroData) && (
          <button type="button" onClick={() => { setBusca(''); setFiltroData(''); setPagina(1); fetchPacientes(); }} className="bg-slate-100 text-slate-600 font-medium px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors">
            Limpar
          </button>
        )}
      </form>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400 font-medium animate-pulse">
          <span className="mr-2">⏳</span> A carregar prontuários...
        </div>
      ) : (
        <div className="overflow-hidden shadow-sm rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Nascimento</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Cartão SUS</th> 
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">Documento (CPF)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-40">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacientes.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-slate-400 font-medium">Nenhum paciente encontrado na base de dados.</td></tr>
              ) : pacientes.map(p => (
                <tr key={p.id} className="hover:bg-teal-50/50 transition-colors group">
                  <td className="p-4 text-slate-400 font-mono text-sm">{p.id}</td>
                  <td className="p-4 font-bold text-slate-800">{p.nome}</td>
                  <td className="p-4 text-slate-600 font-medium">
                    {p.dataNascimento.split('-').reverse().join('/')}
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-sm tracking-wider bg-slate-50 rounded-md my-2 inline-block px-2">{p.carteirinha}</td>
                  <td className="p-4 text-slate-600 font-mono text-sm">
                    {p.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                  </td>
                  <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => { setForm(p); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold text-sm mr-2 transition-colors">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors">Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          <div className="flex justify-between items-center p-4 bg-slate-50 border-t border-slate-200">
            <button 
              disabled={pagina === 1} 
              onClick={() => setPagina(pagina - 1)} 
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-all cursor-pointer"
            >
              ← Anterior
            </button>
            <div className="flex items-center gap-4">
              <span className="text-slate-500 text-sm">Total: {totalPacientes} registos</span>
              <div className="bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <span className="text-slate-600 font-bold text-sm">Página {pagina}</span>
              </div>
            </div>
            <button 
              disabled={pagina * 5 >= totalPacientes} 
              onClick={() => setPagina(pagina + 1)} 
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-all cursor-pointer"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}