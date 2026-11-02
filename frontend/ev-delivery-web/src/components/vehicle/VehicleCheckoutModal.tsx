import { useState } from 'react'
import {
  CheckCircle2,
  Zap,
  ShieldCheck,
  Smartphone,
  Key,
  FileCheck,
  AlertTriangle,
  X,
  BatteryCharging
} from 'lucide-react'

interface VehicleCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: any
  onCompleteCheckout: () => void
}

export default function VehicleCheckoutModal({
  isOpen,
  onClose,
  vehicle,
  onCompleteCheckout
}: VehicleCheckoutModalProps) {
  const [currentBatteryPercentage, setCurrentBatteryPercentage] = useState<number>(
    vehicle?.batteryLevelPercentage ?? 98
  )
  const [isCharging, setIsCharging] = useState(false)
  const [checklist, setChecklist] = useState({
    batteryCharged: true,
    chassisVerified: true,
    keysDelivered: true,
    appPaired: true,
    docsSigned: true,
    photosTaken: true
  })
  const [customerName, setCustomerName] = useState('Guilherme Ramos')
  const [operatorNotes, setOperatorNotes] = useState('Veículo impecável. Cliente orientado sobre carregamento AC/DC e app BYD DiLink.')

  if (!isOpen || !vehicle) return null

  const allItemsChecked = Object.values(checklist).every(Boolean)

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleChargeTo100 = () => {
    setIsCharging(true)
    setTimeout(() => {
      setCurrentBatteryPercentage(100)
      setIsCharging(false)
    }, 800)
  }

  const handleFinish = () => {
    if (!allItemsChecked) {
      alert('Por favor, marque todos os itens do checklist antes de finalizar o checkout!')
      return
    }
    onCompleteCheckout()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white my-8 animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Checkout & Entrega Final do Veículo</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {vehicle.brand || vehicle.make || 'BYD'} {vehicle.model} — VIN: <span className="font-mono text-cyan-500 font-semibold">{vehicle.vin}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Battery Status Inspection Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  currentBatteryPercentage >= 95
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                {currentBatteryPercentage === 100 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-semibold text-slate-400">Status de Carga da Bateria Blade</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    currentBatteryPercentage === 100
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {currentBatteryPercentage === 100 ? '100% Carga Completa' : `${currentBatteryPercentage}% SoC`}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-white mt-0.5">
                  Autonomia Disponível: ~{Math.round(((vehicle.estimatedRangeKm || 450) * currentBatteryPercentage) / 100)} km WLTP
                </p>
              </div>
            </div>

            {/* Quick Charge Button */}
            {currentBatteryPercentage < 100 ? (
              <button
                onClick={handleChargeTo100}
                disabled={isCharging}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold shadow-md hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50"
              >
                <BatteryCharging className="w-4 h-4 animate-bounce" />
                {isCharging ? 'Recarregando...' : 'Carregar para 100%'}
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4" />
                Pronto para Entrega
              </span>
            )}
          </div>

          {currentBatteryPercentage < 80 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Atenção: O protocolo BYD recomenda que o veículo seja entregue ao cliente com no mínimo 80% de carga.</span>
            </div>
          )}

          {/* Checklist de Validação Final */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Checklist Obrigatório de Checkout & Handover
            </h3>

            <div className="space-y-2">
              {[
                {
                  key: 'batteryCharged',
                  title: 'Bateria Blade Verificada e Carregada',
                  desc: 'Bateria testada, balanceada e pronta para viagem inaugural do cliente.',
                  icon: Zap
                },
                {
                  key: 'chassisVerified',
                  title: 'Chassi (VIN) Conferido com o Documento',
                  desc: `Chassi físico conferido no parabrisa e torre de suspensão: ${vehicle.vin}.`,
                  icon: ShieldCheck
                },
                {
                  key: 'keysDelivered',
                  title: 'Par de Chaves Presenciais e Cartão NFC Entregues',
                  desc: '2 Chaves Smart Key + 1 Cartão de Abertura por Aproximação NFC.',
                  icon: Key
                },
                {
                  key: 'appPaired',
                  title: 'App BYD Pareado no Smartphone do Cliente',
                  desc: 'Chave digital no celular, controle de climatização remota e localização GPS.',
                  icon: Smartphone
                },
                {
                  key: 'docsSigned',
                  title: 'Termo de Entrega e Manual de Garantia Assinados',
                  desc: 'Certificado de 8 anos da bateria Blade e nota fiscal emitidos.',
                  icon: FileCheck
                }
              ].map(item => {
                const checked = checklist[item.key as keyof typeof checklist]
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleCheck(item.key as keyof typeof checklist)}
                    className={`p-3.5 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                      checked
                        ? 'bg-slate-50 dark:bg-slate-900/60 border-emerald-500/40 dark:border-emerald-500/30'
                        : 'bg-white dark:bg-[#0c121e] border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        checked
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-transparent border-slate-300 dark:border-slate-700 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Customer & Handover Notes */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nome do Cliente / Proprietário:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Observações de Entrega (Técnico / Operador):
              </label>
              <textarea
                rows={2}
                value={operatorNotes}
                onChange={e => setOperatorNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleFinish}
            disabled={!allItemsChecked}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-extrabold shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Concluir Checkout & Entregar Veículo
          </button>
        </div>
      </div>
    </div>
  )
}
