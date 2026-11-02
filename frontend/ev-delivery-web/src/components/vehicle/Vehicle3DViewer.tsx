import React, { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  RotateCw,
  Layers,
  Zap,
  Activity,
  ShieldCheck,
  Cpu,
  Info,
  Maximize2,
  Sparkles,
  Gauge,
  Palette,
  Eye,
  Camera,
  Compass
} from 'lucide-react'

interface Vehicle3DViewerProps {
  modelName: string
  colorName?: string
  batteryPercentage: number
  batteryCapacityKwh: number
  rangeKm: number
  vin: string
}

type ViewMode = 'exterior' | 'chassis' | 'battery' | 'powertrain'

// Official BYD Color Palette presets
const BYD_COLORS = [
  { name: 'Branco Cristal', hex: '#f1f5f9', desc: 'Acabamento perolizado multicamadas' },
  { name: 'Preto Delan', hex: '#0f172a', desc: 'Preto ônix profundo com verniz cerâmico' },
  { name: 'Rosa Dolphin', hex: '#f472b6', desc: 'Tom exclusivo Linha Ocean' },
  { name: 'Azul Oceano', hex: '#0284c7', desc: 'Azul metálico com pigmentos de mica' },
  { name: 'Verde Montanha', hex: '#065f46', desc: 'Verde imperial da linha Han Executive' },
  { name: 'Vermelho Solar', hex: '#dc2626', desc: 'Edição de lançamento Supercar Yangwang U9' },
  { name: 'Dourado Imperial', hex: '#b45309', desc: 'Edição de luxo Yangwang U8' },
  { name: 'Cinza Titânio', hex: '#64748b', desc: 'Picape Shark e Fangchengbao Bao 5' },
]

// Convert color string (e.g. "Pink / Gray", "Mountain Green") to approximate hex
function parseInitialColor(colorStr?: string): string {
  if (!colorStr) return '#0284c7'
  const c = colorStr.toLowerCase()
  if (c.includes('pink') || c.includes('rosa')) return '#f472b6'
  if (c.includes('green') || c.includes('verde') || c.includes('mountain')) return '#065f46'
  if (c.includes('red') || c.includes('vermelho')) return '#dc2626'
  if (c.includes('blue') || c.includes('azul') || c.includes('surfing')) return '#0284c7'
  if (c.includes('black') || c.includes('preto') || c.includes('delan')) return '#0f172a'
  if (c.includes('gold') || c.includes('dourado')) return '#b45309'
  if (c.includes('titan') || c.includes('cinza') || c.includes('gray') || c.includes('grey')) return '#64748b'
  if (c.includes('white') || c.includes('branco')) return '#f1f5f9'
  return '#0284c7'
}

export default function Vehicle3DViewer({
  modelName,
  colorName = 'White',
  batteryPercentage,
  batteryCapacityKwh,
  rangeKm,
  vin
}: Vehicle3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [currentColorHex, setCurrentColorHex] = useState(() => parseInitialColor(colorName))
  const [viewMode, setViewMode] = useState<ViewMode>('exterior')
  const [isAutoRotate, setIsAutoRotate] = useState(true)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  // Three.js object references across renders
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const carGroupRef = useRef<THREE.Group | null>(null)
  const bodyMeshRef = useRef<THREE.Mesh | null>(null)
  const batteryMeshRef = useRef<THREE.Mesh | null>(null)
  const motorsGroupRef = useRef<THREE.Group | null>(null)
  const chassisMeshRef = useRef<THREE.Group | null>(null)
  const wheelsGroupRef = useRef<THREE.Group | null>(null)

  // Camera control angles
  const mouseState = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    theta: 0.8, // horizontal angle
    phi: 0.35,  // vertical angle
    distance: 14 // camera distance
  })

  // Detect vehicle shape category
  const isSupercar = modelName.toLowerCase().includes('u9')
  const isSUV =
    modelName.toLowerCase().includes('u8') ||
    modelName.toLowerCase().includes('song') ||
    modelName.toLowerCase().includes('yuan') ||
    modelName.toLowerCase().includes('bao') ||
    modelName.toLowerCase().includes('sea lion')
  const isPickup = modelName.toLowerCase().includes('shark')

  // Setup Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 450

    // 1. Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#030712')
    scene.fog = new THREE.FogExp2('#030712', 0.025)
    sceneRef.current = scene

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(
      mouseState.current.distance * Math.sin(mouseState.current.theta) * Math.cos(mouseState.current.phi),
      mouseState.current.distance * Math.sin(mouseState.current.phi) + 1.5,
      mouseState.current.distance * Math.cos(mouseState.current.theta) * Math.cos(mouseState.current.phi)
    )
    camera.lookAt(0, 0.8, 0)

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    rendererRef.current = renderer
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(10, 15, 10)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.5)
    fillLight.position.set(-10, 8, -10)
    scene.add(fillLight)

    const rimLight = new THREE.SpotLight(0x06b6d4, 4, 30, Math.PI / 4, 0.5)
    rimLight.position.set(0, 8, -12)
    scene.add(rimLight)

    // Underbody Neon / Platform Glow
    const underglowLight = new THREE.PointLight(0x06b6d4, 2.5, 8)
    underglowLight.position.set(0, 0.2, 0)
    scene.add(underglowLight)

    // Ground Reflective Disc & Grid
    const groundGeo = new THREE.CircleGeometry(12, 64)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0b0f19,
      roughness: 0.3,
      metalness: 0.8,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Cyber Grid rings on ground
    const gridHelper = new THREE.PolarGridHelper(10, 8, 8, 64, 0x06b6d4, 0x1e293b)
    gridHelper.position.y = 0.01
    scene.add(gridHelper)

    // 5. Build 3D Car Aggregate
    const carGroup = new THREE.Group()
    carGroupRef.current = carGroup
    scene.add(carGroup)

    // Proportions depending on body type
    const carLength = isPickup ? 6.2 : isSupercar ? 5.6 : isSUV ? 5.8 : 5.2
    const carWidth = isSupercar ? 2.5 : isSUV ? 2.3 : 2.1
    const carHeight = isSupercar ? 1.0 : isSUV ? 1.7 : 1.3
    const groundClearance = isSupercar ? 0.35 : isSUV ? 0.65 : 0.45

    // A. Main Body / Shell
    const bodyGeo = new THREE.BoxGeometry(carWidth, carHeight * 0.75, carLength, 4, 4, 8)
    // Deform vertices for aerodynamic automotive shape
    const pos = bodyGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i)
      const y = pos.getY(i)
      // Taper front and rear
      if (z > carLength * 0.25) {
        // Front hood slope down
        pos.setY(i, y - (z - carLength * 0.25) * 0.35)
      } else if (z < -carLength * 0.2) {
        // Fastback rear slope
        pos.setY(i, y - (-z - carLength * 0.2) * 0.28)
      }
    }
    bodyGeo.computeVertexNormals()

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentColorHex),
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    })
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    bodyMesh.position.y = groundClearance + carHeight * 0.4
    bodyMesh.castShadow = true
    bodyMesh.receiveShadow = true
    bodyMeshRef.current = bodyMesh
    carGroup.add(bodyMesh)

    // B. Cabin Greenhouse / Glasshouse
    const cabinLength = isSupercar ? carLength * 0.4 : carLength * 0.52
    const cabinHeight = carHeight * 0.65
    const cabinWidth = carWidth * 0.85
    const cabinGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength, 2, 2, 4)
    const cabinMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
    })
    const cabin = new THREE.Mesh(cabinGeo, cabinMat)
    cabin.position.set(0, groundClearance + carHeight * 0.9, -0.2)
    carGroup.add(cabin)

    // DiLink Floating 15.6 Screen inside cabin
    const screenGeo = new THREE.BoxGeometry(0.7, 0.4, 0.05)
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    const screen = new THREE.Mesh(screenGeo, screenMat)
    screen.position.set(0, groundClearance + carHeight * 0.85, 0.4)
    carGroup.add(screen)

    // C. Wheels, Rims & Sport Brake Calipers (4 units)
    const wheelsGroup = new THREE.Group()
    wheelsGroupRef.current = wheelsGroup
    carGroup.add(wheelsGroup)

    const wheelRadius = isSUV ? 0.48 : isSupercar ? 0.42 : 0.44
    const wheelWidth = 0.28
    const wheelTrackX = carWidth * 0.52
    const wheelBaseZ = carLength * 0.32

    const wheelPositions = [
      [-wheelTrackX, wheelRadius, wheelBaseZ],  // Front Left
      [wheelTrackX, wheelRadius, wheelBaseZ],   // Front Right
      [-wheelTrackX, wheelRadius, -wheelBaseZ], // Rear Left
      [wheelTrackX, wheelRadius, -wheelBaseZ],  // Rear Right
    ]

    wheelPositions.forEach(([x, y, z]) => {
      const wheelSub = new THREE.Group()
      wheelSub.position.set(x, y, z)

      // Tire Rubber
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24)
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
      const tire = new THREE.Mesh(tireGeo, tireMat)
      tire.rotation.z = Math.PI / 2
      tire.castShadow = true
      wheelSub.add(tire)

      // Alloy Rim (Two-tone Diamond Cut)
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.68, wheelRadius * 0.68, wheelWidth * 1.05, 16)
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 })
      const rim = new THREE.Mesh(rimGeo, rimMat)
      rim.rotation.z = Math.PI / 2
      wheelSub.add(rim)

      // Red Sport Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.08, 0.16, 0.12)
      const caliperMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.3 })
      const caliper = new THREE.Mesh(caliperGeo, caliperMat)
      caliper.position.set(x > 0 ? -0.1 : 0.1, 0.12, 0)
      wheelSub.add(caliper)

      wheelsGroup.add(wheelSub)
    })

    // D. Blade Battery CTB Structural Pack (Underfloor)
    const batteryPackGeo = new THREE.BoxGeometry(carWidth * 0.85, 0.22, carLength * 0.58)
    const batteryPackMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x059669,
      emissiveIntensity: 0.3,
    })
    const batteryPack = new THREE.Mesh(batteryPackGeo, batteryPackMat)
    batteryPack.position.set(0, groundClearance * 0.7, 0)
    batteryMeshRef.current = batteryPack
    carGroup.add(batteryPack)

    // Cell Stripe visual accents on battery
    for (let i = -5; i <= 5; i++) {
      const stripeGeo = new THREE.BoxGeometry(carWidth * 0.82, 0.02, 0.1)
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0x34d399 })
      const stripe = new THREE.Mesh(stripeGeo, stripeMat)
      stripe.position.set(0, groundClearance * 0.7 + 0.12, i * 0.25)
      batteryPack.add(stripe)
    }

    // E. Dual Electric Motors (8-in-1 Powertrain)
    const motorsGroup = new THREE.Group()
    motorsGroupRef.current = motorsGroup
    carGroup.add(motorsGroup)

    // Front Motor
    const fMotorGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.65, 16)
    const motorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.25, emissive: 0xd97706, emissiveIntensity: 0.2 })
    const fMotor = new THREE.Mesh(fMotorGeo, motorMat)
    fMotor.rotation.z = Math.PI / 2
    fMotor.position.set(0, wheelRadius, wheelBaseZ)
    motorsGroup.add(fMotor)

    // Rear Motor
    const rMotor = new THREE.Mesh(fMotorGeo, motorMat)
    rMotor.rotation.z = Math.PI / 2
    rMotor.position.set(0, wheelRadius, -wheelBaseZ)
    motorsGroup.add(rMotor)

    // High Voltage 800V Orange Busbar Cables
    const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, carLength * 0.6, 8)
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xf97316 })
    const cable = new THREE.Mesh(cableGeo, cableMat)
    cable.rotation.x = Math.PI / 2
    cable.position.set(0.3, groundClearance * 0.8, 0)
    motorsGroup.add(cable)

    // F. Headlights & Taillights
    // Crystal LED Headlights
    const hlGeo = new THREE.BoxGeometry(0.35, 0.08, 0.1)
    const hlMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const hlLeft = new THREE.Mesh(hlGeo, hlMat)
    hlLeft.position.set(-carWidth * 0.35, groundClearance + carHeight * 0.45, carLength * 0.5)
    carGroup.add(hlLeft)

    const hlRight = hlLeft.clone()
    hlRight.position.x = carWidth * 0.35
    carGroup.add(hlRight)

    // Full-width continuous LED Taillight Bar
    const tlGeo = new THREE.BoxGeometry(carWidth * 0.85, 0.06, 0.08)
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xef4444 })
    const tlBar = new THREE.Mesh(tlGeo, tlMat)
    tlBar.position.set(0, groundClearance + carHeight * 0.55, -carLength * 0.5)
    carGroup.add(tlBar)

    // 6. Animation Loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)

      // Auto rotation
      if (isAutoRotate) {
        mouseState.current.theta += 0.007
      }

      // Smooth camera position from orbit angles
      const { theta, phi, distance } = mouseState.current
      camera.position.x = distance * Math.sin(theta) * Math.cos(phi)
      camera.position.y = distance * Math.sin(phi) + 1.2
      camera.position.z = distance * Math.cos(theta) * Math.cos(phi)
      camera.lookAt(0, 0.8, 0)

      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight || 450
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [modelName, isSupercar, isSUV, isPickup])

  // Update Body Color dynamically in real-time
  useEffect(() => {
    if (bodyMeshRef.current) {
      const mat = bodyMeshRef.current.material as THREE.MeshPhysicalMaterial
      mat.color.set(currentColorHex)
    }
  }, [currentColorHex])

  // Update View Mode (X-Ray / Chassis / Battery / Powertrain)
  useEffect(() => {
    if (!bodyMeshRef.current || !batteryMeshRef.current || !motorsGroupRef.current) return

    const bodyMat = bodyMeshRef.current.material as THREE.MeshPhysicalMaterial
    const batteryMat = batteryMeshRef.current.material as THREE.MeshStandardMaterial

    if (viewMode === 'exterior') {
      bodyMat.transparent = false
      bodyMat.opacity = 1.0
      bodyMat.wireframe = false
      bodyMat.color.set(currentColorHex)
      batteryMat.emissiveIntensity = 0.2
    } else if (viewMode === 'chassis') {
      bodyMat.transparent = true
      bodyMat.opacity = 0.2
      bodyMat.wireframe = true
      batteryMat.emissiveIntensity = 0.8
    } else if (viewMode === 'battery') {
      bodyMat.transparent = true
      bodyMat.opacity = 0.15
      bodyMat.wireframe = false
      batteryMat.emissiveIntensity = 1.4
    } else if (viewMode === 'powertrain') {
      bodyMat.transparent = true
      bodyMat.opacity = 0.15
      bodyMat.wireframe = true
      batteryMat.emissiveIntensity = 0.3
    }
  }, [viewMode, currentColorHex])

  // Mouse interaction handlers (360 Orbit)
  const onMouseDown = (e: React.MouseEvent) => {
    mouseState.current.isDragging = true
    mouseState.current.prevX = e.clientX
    mouseState.current.prevY = e.clientY
    setIsAutoRotate(false)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!mouseState.current.isDragging) return
    const dx = e.clientX - mouseState.current.prevX
    const dy = e.clientY - mouseState.current.prevY
    mouseState.current.prevX = e.clientX
    mouseState.current.prevY = e.clientY

    mouseState.current.theta -= dx * 0.008
    mouseState.current.phi = Math.max(0.05, Math.min(Math.PI / 2.3, mouseState.current.phi + dy * 0.006))
  }

  const onMouseUp = () => {
    mouseState.current.isDragging = false
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    mouseState.current.distance = Math.max(7, Math.min(22, mouseState.current.distance + e.deltaY * 0.01))
  }

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-[#0b0f19] via-[#050811] to-black border border-slate-800 shadow-2xl overflow-hidden text-white select-none">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">{modelName}</h2>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-800/70 text-cyan-300 font-bold">
                WebGL 3D Engine · BYD DiLink
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Chassi (VIN): <span className="text-cyan-400 font-semibold">{vin}</span> · Cor Atual:{' '}
              <span className="text-slate-200 font-semibold">{colorName}</span>
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 gap-1 flex-wrap">
          <button
            onClick={() => setViewMode('exterior')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'exterior'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Carroceria 3D
          </button>
          <button
            onClick={() => setViewMode('chassis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'chassis'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Chassi e-Platform
          </button>
          <button
            onClick={() => setViewMode('battery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'battery'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Blade Battery
          </button>
          <button
            onClick={() => setViewMode('powertrain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'powertrain'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            Motores 8-em-1
          </button>
        </div>
      </div>

      {/* Interactive 3D Canvas Area */}
      <div
        ref={mountRef}
        className="h-[430px] sm:h-[480px] w-full cursor-grab active:cursor-grabbing relative"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      />

      {/* Floating 360 & Zoom Instructions */}
      <div className="absolute bottom-24 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md pointer-events-none">
        <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
        <span>Gire 360° com o mouse · Role para Zoom in/out</span>
      </div>

      {/* Auto Rotate Control */}
      <div className="absolute bottom-24 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-md transition-all ${
            isAutoRotate
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          {isAutoRotate ? 'Pausar Rotação 360°' : 'Girar Automaticamente'}
        </button>
      </div>

      {/* Real-time Color Picker Palette Bar */}
      <div className="p-4 bg-slate-950/95 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Personalizar Cor da Pintura no 3D:
          </span>
        </div>

        {/* Color Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {BYD_COLORS.map(c => {
            const isSelected = currentColorHex.toLowerCase() === c.hex.toLowerCase()
            return (
              <button
                key={c.name}
                onClick={() => setCurrentColorHex(c.hex)}
                className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/50 text-white ring-2 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
                title={c.desc}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[11px] font-semibold">{c.name}</span>
              </button>
            )
          })}

          {/* Custom Color Input */}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 cursor-pointer hover:border-cyan-400 transition-colors">
            <input
              type="color"
              value={currentColorHex}
              onChange={e => setCurrentColorHex(e.target.value)}
              className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
              title="Escolher cor personalizada"
            />
            <span className="text-[11px] font-semibold text-slate-300">Custom</span>
          </label>
        </div>
      </div>

      {/* Telemetry Bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-medium text-slate-400">Bateria Blade (SoC)</p>
            <div className="flex items-center gap-2">
              <span className={`text-base font-extrabold ${batteryPercentage >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {batteryPercentage}%
              </span>
              <span className="text-[9px] text-emerald-300 px-1 rounded bg-emerald-950 border border-emerald-800/50">
                100% SOH
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-medium text-slate-400">Autonomia WLTP</p>
            <p className="text-base font-extrabold text-white">{rangeKm} km</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-medium text-slate-400">Capacidade da Bateria</p>
            <p className="text-base font-extrabold text-white">{batteryCapacityKwh} kWh</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-medium text-slate-400">Plataforma</p>
            <p className="text-xs font-bold text-cyan-300">
              {isSupercar ? 'e-Platform 800V DiSus-X' : isSUV ? 'e-Platform 3.0 DMO AWD' : 'e-Platform 3.0 CTB'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
