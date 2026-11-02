import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users,
  Search,
  Plus,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  FileText,
  UserCheck,
  Building,
  Shield,
  X,
  CheckCircle2,
  Car
} from 'lucide-react'
import { customerApi } from '../services/customerService'
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/ui'
import { getCustomerFullName, getCustomerInitials } from '../lib/utils'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [selectedState, setSelectedState] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    documentNumber: '',
    street: '',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01452-000',
  })

  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getAll(1, 100),
  })

  const createMutation = useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setIsAddModalOpen(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        documentNumber: '',
        street: '',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01452-000',
      })
    },
    onError: (err: any) => {
      alert(`Erro ao cadastrar cliente: ${err?.message || 'Verifique os dados informados.'}`)
    }
  })

  if (isLoading) return <LoadingSpinner text="Carregando clientes da base BYD..." />
  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <ErrorMessage
          title="Erro ao Carregar Clientes"
          message="Não foi possível recuperar a base de clientes do Customer Service."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const customers = data?.items ?? []

  const states = Array.from(new Set(customers.map(c => c.state).filter(Boolean)))

  const filtered = customers.filter(c => {
    const fullName = getCustomerFullName(c).toLowerCase()
    const email = (c.email ?? '').toLowerCase()
    const phone = (c.phone ?? '').toLowerCase()
    const doc = (c.documentNumber ?? '').toLowerCase()
    const city = (c.city ?? '').toLowerCase()
    const query = search.toLowerCase()

    const matchesSearch =
      !search ||
      fullName.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      doc.includes(query) ||
      city.includes(query)

    const matchesState = selectedState === 'all' || c.state === selectedState

    return matchesSearch && matchesState
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Por favor, preencha os campos obrigatórios (Nome, E-mail e Telefone).')
      return
    }
    createMutation.mutate(formData)
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1550px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-semibold">
              BYD DiLink CRM & Proprietários
            </span>
            <span className="text-xs text-slate-400">· Base de Clientes Cadastrados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clientes & Proprietários
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Gestão de titulares de pedidos, documentação para faturamento e vinculação de chassi de entrega.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-xs sm:text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nome, CPF, E-mail, Telefone ou Cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-sm"
          />
        </div>

        {/* State Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedState('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedState === 'all'
                ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-sm'
                : 'bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            Todos os Estados ({customers.length})
          </button>
          {states.map(st => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedState === st
                  ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-sm'
                  : 'bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customers List / Cards */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <EmptyState
            icon={<Users className="w-16 h-16 text-slate-400" />}
            title="Nenhum cliente encontrado"
            description="Tente ajustar sua busca ou cadastrar um novo cliente usando o botão acima."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => {
            const fullName = getCustomerFullName(c)
            const initials = getCustomerInitials(c)
            const isSelected = selectedCustomer?.id === c.id

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className={`card p-5 cursor-pointer border transition-all group ${
                  isSelected
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-slate-50/50 dark:bg-slate-900/90'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/50 hover:shadow-lg'
                }`}
              >
                {/* Header: Avatar, Name & Role */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-md shadow-blue-500/20">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-cyan-500 transition-colors">
                        {fullName}
                      </p>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {c.documentNumber ? `CPF: ${c.documentNumber}` : 'Titular Cadastrado'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-cyan-400 transition-colors mt-1 flex-shrink-0" />
                </div>

                {/* Contact & Location Details */}
                <div className="space-y-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span>{c.phone}</span>
                  </div>

                  {(c.city || c.street) && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">
                        {c.city ? `${c.city} - ${c.state || 'Brasil'}` : c.street}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Cliente desde: {new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                  <Link
                    to="/deliveries"
                    onClick={e => e.stopPropagation()}
                    className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Ver Entregas</span>
                    <Car className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Customer Quick View Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white space-y-5 animate-fadeIn">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-base shadow-md">
                  {getCustomerInitials(selectedCustomer)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {getCustomerFullName(selectedCustomer)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Documento: <span className="font-mono">{selectedCustomer.documentNumber || 'Não informado'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">E-mail Oficial:</span>
                <span className="font-semibold">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telefone / WhatsApp:</span>
                <span className="font-semibold">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Endereço Residencial:</span>
                <span className="font-semibold text-right">{selectedCustomer.street || 'Não informado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cidade / UF:</span>
                <span className="font-semibold">{selectedCustomer.city} - {selectedCustomer.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CEP:</span>
                <span className="font-mono font-semibold">{selectedCustomer.postalCode || '01000-000'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                Fechar
              </button>
              <Link
                to="/deliveries"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-md flex items-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Vincular / Ver Entregas</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-white space-y-5 my-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-500" />
                <h3 className="text-base font-bold">Cadastrar Novo Cliente BYD</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Nome Completo do Titular *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Silva Ribeiro"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    CPF / Documento *
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.documentNumber}
                    onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+55 11 98888-7777"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  E-mail do Proprietário *
                </label>
                <input
                  type="email"
                  required
                  placeholder="cliente@exemplo.com.br"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Endereço de Entrega (Rua, Número, Bairro)
                </label>
                <input
                  type="text"
                  placeholder="Av. Paulista, 1500, Apto 82"
                  value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Estado (UF)</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">CEP</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
