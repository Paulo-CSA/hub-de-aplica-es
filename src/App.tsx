import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Wifi, 
  ShieldCheck, 
  HardDrive, 
  Terminal, 
  ExternalLink, 
  Search, 
  LayoutDashboard, 
  Settings, 
  Bell, 
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  X,
  Server,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ICON_MAP = {
  Terminal,
  Database,
  HardDrive,
  Wifi,
  ShieldCheck,
  Activity,
  Server,
  Network,
  Search,
  Settings
};

interface AppService {
  id: string;
  name: string;
  description: string;
  url: string;
  iconName: keyof typeof ICON_MAP;
  category: string;
  status: 'online' | 'warning' | 'offline';
}

const DEFAULT_SERVICES: AppService[] = [
  {
    id: 'graylog',
    name: 'Graylog',
    description: 'Centralized log collection, real-time event monitoring, and efficient volume management.',
    url: 'http://graylog.inema.intranet:9000/',
    iconName: 'Terminal',
    category: 'Monitoring',
    status: 'online'
  },
  {
    id: 'netbox',
    name: 'Netbox',
    description: 'Infrastructure management, equipment inventory, and specialized network documentation.',
    url: 'http://netbox.inema.ba.gov.br/',
    iconName: 'Database',
    category: 'Infrastructure',
    status: 'online'
  },
  {
    id: 'storage',
    name: 'Monitoramento Storage',
    description: 'Dedicated monitoring for file servers and storage health performance.',
    url: 'http://172.16.0.7:5000/',
    iconName: 'HardDrive',
    category: 'Monitoring',
    status: 'online'
  },
  {
    id: 'wifi',
    name: 'Gerenciamento Wifi',
    description: 'Wifi infrastructure monitoring and secure access control management.',
    url: 'http://172.16.6.4:3000/',
    iconName: 'Wifi',
    category: 'Network',
    status: 'online'
  },
  {
    id: 'security',
    name: 'Segurança',
    description: 'Open-source platform for vulnerability, threat management, and compliance.',
    url: 'https://seguranca.inema.ba.gov.br/app/login?',
    iconName: 'ShieldCheck',
    category: 'Security',
    status: 'online'
  },
  {
    id: 'zabbix',
    name: 'Zabbix',
    description: 'Enterprise-class monitoring solution for network, servers, and applications.',
    url: 'http://noc-zbx.inema.ba.gov.br/zabbix/index.php',
    iconName: 'Activity',
    category: 'Monitoring',
    status: 'online'
  }
];

export default function App() {
  const [services, setServices] = useState<AppService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingService, setEditingService] = useState<AppService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data from server
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading services:", err);
        setLoading(false);
      });
  }, []);

  // Save data to server whenever services change
  const persistServices = async (updatedServices: AppService[]) => {
    try {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedServices)
      });
    } catch (err) {
      console.error("Error persisting services:", err);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) || 
                         service.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory ? service.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(services.map(s => s.category)));

  const handleSaveService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newService: AppService = {
      id: editingService?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      url: formData.get('url') as string,
      iconName: formData.get('iconName') as keyof typeof ICON_MAP,
      category: formData.get('category') as string,
      status: formData.get('status') as 'online' | 'warning' | 'offline',
    };

    let updated;
    if (editingService) {
      updated = services.map(s => s.id === editingService.id ? newService : s);
    } else {
      updated = [...services, newService];
    }
    setServices(updated);
    persistServices(updated);
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      persistServices(updated);
    }
  };

  const openEditModal = (service: AppService) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-md hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            <ShieldAlert className="text-slate-950" size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">INEMA CTRL</span>
        </div>

        <nav className="space-y-2 flex-grow">
          <button 
            onClick={() => setIsConfigOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              !isConfigOpen ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setIsConfigOpen(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              isConfigOpen ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Settings size={20} />
            Configurações
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
            Sistema Online
          </div>
          <div className="px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">Rede Estável</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isConfigOpen ? 'Configurações de Sistema' : 'Painel de Aplicações'}
            </h1>
            <p className="text-slate-400">
              {isConfigOpen 
                ? 'Gerencie os cards de serviços, conexões e preferências do dashboard' 
                : 'Monitoramento centralizado de infraestrutura e serviços'}
            </p>
          </div>
          
          {!isConfigOpen && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar serviços..."
                  className="bg-slate-900 border border-slate-800 rounded-full pl-12 pr-6 py-2.5 w-full md:w-64 focus:outline-none focus:border-brand-primary/50 transition-colors text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
                <Bell size={20} />
              </button>
            </div>
          )}

          {isConfigOpen && (
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-brand-primary text-slate-950 px-6 py-2.5 rounded-full font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} />
              Novo Serviço
            </button>
          )}
        </header>

        {!isConfigOpen && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button 
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === null ? 'bg-brand-primary text-slate-950 shadow-lg shadow-brand-primary/20' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat ? 'bg-brand-primary text-slate-950 shadow-lg shadow-brand-primary/20' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredServices.map((service, index) => {
                  const Icon = ICON_MAP[service.iconName];
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      key={service.id}
                      className="glass-card group relative"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 group-hover:border-brand-primary/30 transition-colors">
                            <Icon size={20} className="text-brand-primary" />
                          </div>
                          <div className="flex items-center gap-2">
                             <span className={`w-2 h-2 rounded-full ${
                               service.status === 'online' ? 'bg-green-500' : service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                             }`}></span>
                             <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{service.status}</span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2 truncate">
                          {service.name}
                          <ExternalLink size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        
                        <p className="text-slate-400 text-[11px] font-medium leading-relaxed mb-4 h-8 overflow-hidden line-clamp-2">
                          {service.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500">
                            {service.category}
                          </span>
                          <a 
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-primary hover:text-white transition-colors group/link"
                          >
                            Connect
                            <motion.span
                              animate={{ x: [0, 3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            >
                              →
                            </motion.span>
                          </a>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 h-0.5 bg-brand-primary w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl opacity-50"></div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}

        {isConfigOpen && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 text-xs font-mono uppercase tracking-widest">
                    <th className="px-6 py-4 font-medium">Serviço</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium">URL</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {services.map(service => (
                    <tr key={service.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-950 rounded-lg text-brand-primary">
                            {React.createElement(ICON_MAP[service.iconName], { size: 18 })}
                          </div>
                          <span className="font-bold text-white">{service.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-0.5 border border-slate-800 rounded bg-slate-950 text-slate-400">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                        {service.url}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(service)}
                            className="p-2 hover:bg-brand-primary/10 hover:text-brand-primary rounded-lg transition-colors text-slate-500"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service.id)}
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-slate-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-xl shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">
                    {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveService} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">Nome do Serviço</label>
                      <input 
                        name="name" 
                        required 
                        defaultValue={editingService?.name}
                        placeholder="Ex: Graylog"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">Ícone</label>
                      <select 
                        name="iconName" 
                        defaultValue={editingService?.iconName || 'Terminal'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary text-white"
                      >
                        {Object.keys(ICON_MAP).map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">Descrição</label>
                    <textarea 
                      name="description" 
                      required 
                      defaultValue={editingService?.description}
                      placeholder="Breve resumo da ferramenta..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary h-24 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">URL de Conexão</label>
                    <input 
                      name="url" 
                      required 
                      defaultValue={editingService?.url}
                      placeholder="http://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">Categoria</label>
                      <input 
                        name="category" 
                        required 
                        defaultValue={editingService?.category}
                        placeholder="Monitoramento, Segurança..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">Status</label>
                      <select 
                        name="status" 
                        defaultValue={editingService?.status || 'online'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary text-white"
                      >
                        <option value="online">Online</option>
                        <option value="warning">Aviso</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button type="submit" className="w-full bg-brand-primary text-slate-950 py-3 rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                      {editingService ? 'Atualizar Serviço' : 'Criar Card de Serviço'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {filteredServices.length === 0 && (
          <div className="text-center py-24">
            <p className="text-slate-500 text-lg">Nenhum serviço encontrado.</p>
          </div>
        )}

        {/* Footer info */}
        <footer className="mt-24 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm font-mono">
          <div>© 2026 INEMA IT INFRASTRUCTURE</div>
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
              v2.4.0-estável
            </span>
            <span>PROXY SEGURO ATIVADO</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
