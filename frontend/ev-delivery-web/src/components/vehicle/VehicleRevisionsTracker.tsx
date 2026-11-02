import { useState } from 'react'
import {
  Wrench,
  CheckCircle2,
  Clock,
  Calendar,
  Shield,
  FileCheck2,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'

interface RevisionItem {
  id: string
  number: number
  title: string
  recommendedKm: number
  recommendedMonths: number
  isCompleted: boolean
  performedAt?: string
  performedKm?: number
  technician?: string
  dealership?: string
  checklist: string[]
  notes?: string
}

interface VehicleRevisionsTrackerProps {
  vin: string
  currentOdometerKm: number
  modelName: string
}

const DEFAULT_REVISIONS: RevisionItem[] = [
  {
    id: 'rev-0',
    number: 0,
    title: 'Revisão de Entrega PDI (0 km)',
    recommendedKm: 0,
    recommendedMonths: 0,
    isCompleted: true,
    performedAt: '2026-10-15',
    performedKm: 12,
    technician: 'Carlos Silveira (Matrícula BYD-8821)',
    dealership: 'BYD Flagship Delivery Center São Paulo',
    checklist: [
      'Diagnóstico de Alta Tensão 800V e balanceamento das Células Blade',
      'Inspeção do fluido de arrefecimento do Trem de Força 8 em 1',
      'Calibração de Sensores LiDAR DiPilot e Câmeras 360°',
      'Atualização OTA do Sistema DiLink OS v2.4.0',
      'Torqueamento das rodas e pressão dos pneus (36 PSI)',
      'Higienização completa da cabine com filtro antiviral CN95'
    ],
    notes: 'Veículo aprovado em 100% dos testes. Selo de garantia de 8 anos ou 160.000 km ativado.'
  },
  {
    id: 'rev-1',
    number: 1,
    title: '1ª Revisão Preventiva (1.000 km)',
    recommendedKm: 1000,
    recommendedMonths: 3,
    isCompleted: true,
    performedAt: '2026-10-24',
    performedKm: 1045,
    technician: 'Eduardo Ramos (Técnico Master BYD)',
    dealership: 'BYD Concessionária Morumbi',
    checklist: [
      'Reaperto estrutural dos parafusos do chassi e subquadro DiSus',
      'Teste de estanqueidade do circuito de refrigeração da bateria',
      'Leitura de códigos de falha DTC via scanner oficial BYD',
      'Verificação da regeneração de frenagem CRBS'
    ],
    notes: 'Reaperto realizado sem desvios. Desgaste de pneus 0%.'
  },
  {
    id: 'rev-2',
    number: 2,
    title: '2ª Revisão Programada (10.000 km ou 1 ano)',
    recommendedKm: 10000,
    recommendedMonths: 12,
    isCompleted: false,
    dealership: 'BYD Agendamento Automático',
    checklist: [
      'Troca do elemento filtrante de ar da cabine CN95',
      'Teste de capacidade SOH (State of Health) das células da Bateria Blade',
      'Inspeção visual da caixa de transmissão e semieixos',
      'Alinhamento e balanceamento computadorizado 3D',
      'Lubrificação das travas de portas e teto solar panorâmico'
    ],
    notes: 'Agendamento prévio liberado no app do proprietário.'
  },
  {
    id: 'rev-3',
    number: 3,
    title: '3ª Revisão Programada (20.000 km ou 2 anos)',
    recommendedKm: 20000,
    recommendedMonths: 24,
    isCompleted: false,
    dealership: 'BYD Rede Autorizada',
    checklist: [
      'Substituição do fluido de freio DOT 4 de alta performance',
      'Inspeção do sistema de direção assistida eletricamente (EPS)',
      'Verificação dos amortecedores adaptativos DiSus',
      'Inspeção de chicotes elétricos de alta tensão (cabos laranjas)'
    ]
  },
  {
    id: 'rev-4',
    number: 4,
    title: '4ª Revisão Programada (40.000 km ou 4 anos)',
    recommendedKm: 40000,
    recommendedMonths: 48,
    isCompleted: false,
    dealership: 'BYD Rede Autorizada',
    checklist: [
      'Substituição do líquido de arrefecimento especial de bateria',
      'Inspeção e substituição de palhetas do limpador dianteiro',
      'Diagnóstico profundo de desgaste dos inversores de Carbeto de Silício (SiC)'
    ]
  }
]

export default function VehicleRevisionsTracker({
  vin,
  currentOdometerKm,
  modelName
}: VehicleRevisionsTrackerProps) {
  const [revisions, setRevisions] = useState<RevisionItem[]>(DEFAULT_REVISIONS)
  const [expandedId, setExpandedId] = useState<string | null>('rev-0')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)

  const completedCount = revisions.filter(r => r.isCompleted).length
  const totalCount = revisions.length
  const nextRevision = revisions.find(r => !r.isCompleted)

  const handleToggleCompleted = (id: string) => {
    setRevisions(prev =>
      prev.map(r => {
        if (r.id === id) {
          const newState = !r.isCompleted
          return {
            ...r,
            isCompleted: newState,
            performedAt: newState ? new Date().toISOString().split('T')[0] : undefined,
            performedKm: newState ? currentOdometerKm : undefined,
            technician: newState ? 'Inspetor Técnico DiLink (Logado)' : undefined
          }
        }
        return r
      })
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <Wrench className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold">Plano de Revisões e Manutenção Preventiva</h3>
                <p className="text-xs text-slate-400">
                  Garantia Oficial BYD Blade: <span className="text-cyan-400 font-semibold">8 Anos ou 160.000 km</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold transition-all text-slate-200"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Certificado Digital
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Lançar Revisão
            </button>
          </div>
        </div>

        {/* Revision Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-700/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Histórico Realizado</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-cyan-400">{completedCount}</span>
              <span className="text-xs text-slate-400">de {totalCount} revisões efetuadas</span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Próxima Revisão Recomendada</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-white">
                {nextRevision ? `${nextRevision.recommendedKm.toLocaleString()} km` : 'Em dia!'}
              </span>
              {nextRevision && (
                <span className="text-[11px] text-amber-400 font-medium">
                  (Faltam ~{Math.max(0, nextRevision.recommendedKm - currentOdometerKm).toLocaleString()} km)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {nextRevision ? nextRevision.title : 'Todas as revisões programadas estão concluídas'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Status da Garantia de Fábrica</p>
            <div className="flex items-center gap-2 mt-1 text-emerald-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>Garantia 100% Vigente</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sem perda de cobertura por atraso de revisão
            </p>
          </div>
        </div>
      </div>

      {/* Revisions Timeline List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Cronograma de Revisões Oficiais BYD</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            ({completedCount} concluídas)
          </span>
        </h4>

        {revisions.map(rev => {
          const isExpanded = expandedId === rev.id
          return (
            <div
              key={rev.id}
              className={`rounded-2xl border transition-all ${
                rev.isCompleted
                  ? 'bg-white dark:bg-[#0c121e] border-emerald-500/30 dark:border-emerald-500/20'
                  : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Collapsed Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : rev.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                      rev.isCompleted
                        ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {rev.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `#${rev.number}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {rev.title}
                      </p>
                      {rev.isCompleted ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Realizada
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Pendente
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {rev.recommendedKm === 0 ? 'Entrega 0 km' : `${rev.recommendedKm.toLocaleString()} km`}
                      </span>
                      {rev.performedAt && (
                        <span>· Realizada em {rev.performedAt} ({rev.performedKm} km)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleToggleCompleted(rev.id)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rev.isCompleted
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    }`}
                  >
                    {rev.isCompleted ? 'Desmarcar' : 'Concluir'}
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Checklist & Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4 text-xs">
                  {/* Dealership & Tech metadata */}
                  {(rev.dealership || rev.technician) && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Concessionária Credenciada:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{rev.dealership ?? 'Rede BYD Oficial'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Técnico Certificado:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{rev.technician ?? 'Aguardando Atribuição'}</span>
                      </div>
                    </div>
                  )}

                  {/* Checklist of inspection tasks */}
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Itens de Inspeção e Manutenção ({rev.checklist.length} itens checados):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rev.checklist.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              rev.isCompleted ? 'text-emerald-500' : 'text-slate-400'
                            }`}
                          />
                          <span className="text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {rev.notes && (
                    <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300">
                      <span className="font-semibold">Parecer do Técnico:</span> {rev.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Revision Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Registrar Revisão Avulsa / Manutenção
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Veículo: {modelName} — <span className="font-mono">{vin}</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Título da Revisão / Serviço
                </label>
                <input
                  type="text"
                  placeholder="Ex: Alinhamento Especial / Inspeção de Pneus"
                  defaultValue="Inspeção Intermediária de Freios e Bateria"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Odômetro no Momento (km)
                </label>
                <input
                  type="number"
                  defaultValue={currentOdometerKm}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Técnico Responsável
                </label>
                <input
                  type="text"
                  defaultValue="Operador Técnico Especialista (BYD Service)"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  alert('Revisão registrada com sucesso no prontuário do veículo!')
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-md"
              >
                Salvar no Prontuário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-950 border-2 border-cyan-500/40 shadow-[0_0_80px_rgba(6,182,212,0.25)] text-white relative space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">CERTIFICADO DIGITAL DE REVISÕES BYD</h2>
              <p className="text-xs text-cyan-400 font-mono">Autenticação Criptográfica DiLink OS</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Veículo:</span>
                <span className="font-bold text-white">{modelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chassi (VIN):</span>
                <span className="font-mono font-bold text-cyan-300">{vin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total de Revisões Concluídas:</span>
                <span className="font-bold text-emerald-400">{completedCount} Revisões Oficiais</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Garantia Blade Battery:</span>
                <span className="font-bold text-emerald-400">Ativa até 2032 (8 Anos)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Este certificado atesta que o veículo realizou todas as inspeções prévias e de pré-entrega obrigatórias segundo as normas de engenharia da BYD Auto e está plenamente apto para circulação.
            </p>

            <button
              onClick={() => setShowCertificate(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              Fechar Certificado
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
