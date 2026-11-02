import React, { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  RotateCw,
  Layers,
  Zap,
  Activity,
  ShieldCheck,
  Gauge,
  Palette,
  Sparkles,
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

const BYD_COLORS = [
  { name: 'Branco Cristal',  hex: '#f1f5f9', desc: 'Acabamento perolizado multicamadas' },
  { name: 'Preto Delan',     hex: '#0f172a', desc: 'Preto ônix profundo com verniz cerâmico' },
  { name: 'Rosa Dolphin',    hex: '#f472b6', desc: 'Tom exclusivo Linha Ocean' },
  { name: 'Azul Oceano',     hex: '#0284c7', desc: 'Azul metálico com pigmentos de mica' },
  { name: 'Verde Montanha',  hex: '#16a34a', desc: 'Verde imperial da linha Han Executive' },
  { name: 'Vermelho Solar',  hex: '#dc2626', desc: 'Edição de lançamento Supercar Yangwang U9' },
  { name: 'Dourado Imperial',hex: '#b45309', desc: 'Edição de luxo Yangwang U8' },
  { name: 'Cinza Titânio',   hex: '#64748b', desc: 'Picape Shark e Fangchengbao Bao 5' },
]

function parseInitialColor(colorStr?: string): string {
  if (!colorStr) return '#0284c7'
  const c = colorStr.toLowerCase()
  if (c.includes('pink') || c.includes('rosa'))   return '#f472b6'
  if (c.includes('green') || c.includes('verde'))  return '#16a34a'
  if (c.includes('red') || c.includes('vermelho')) return '#dc2626'
  if (c.includes('blue') || c.includes('azul'))    return '#0284c7'
  if (c.includes('black') || c.includes('preto'))  return '#0f172a'
  if (c.includes('gold') || c.includes('dourado')) return '#b45309'
  if (c.includes('gray') || c.includes('cinza') || c.includes('grey')) return '#64748b'
  if (c.includes('white') || c.includes('branco')) return '#f1f5f9'
  return '#0284c7'
}

// ─── Build the detailed car geometry ───────────────────────────────────────────
function buildCar(scene: THREE.Scene, color: string, type: 'sedan' | 'suv' | 'pickup' | 'supercar') {
  const group = new THREE.Group()

  const bodyColor = new THREE.Color(color)

  // Paint material – MeshPhysicalMaterial for clearcoat gloss
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: bodyColor,
    metalness: 0.8,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 1.0,
  })

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x7dd3fc,
    metalness: 0.0,
    roughness: 0.05,
    transmission: 0.75,
    transparent: true,
    opacity: 0.55,
  })

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 1.0,
    roughness: 0.05,
  })

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.3,
    roughness: 0.7,
  })

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.95,
    metalness: 0.0,
  })

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.95,
    roughness: 0.1,
  })

  // ── Dimensions by type ──
  const L  = type === 'pickup' ? 6.4 : type === 'suv' ? 5.9 : type === 'supercar' ? 5.5 : 5.2
  const W  = type === 'supercar' ? 2.5 : type === 'suv' ? 2.35 : 2.1
  const CH = type === 'supercar' ? 0.95 : type === 'suv' ? 1.75 : 1.35   // cabin height above ground
  const GC = type === 'supercar' ? 0.3  : type === 'suv' ? 0.65 : 0.42   // ground clearance

  const WR  = type === 'suv' ? 0.50 : type === 'supercar' ? 0.40 : 0.44  // wheel radius
  const WW  = 0.3   // wheel width
  const WTX = W * 0.51  // wheel track X
  const WBZ = L * 0.32  // wheelbase half

  // ═══════════════════════════════════════════════════════════
  //  A.  LOWER BODY / SILL  (rounded box – wider at bottom)
  // ═══════════════════════════════════════════════════════════
  {
    const geo = new THREE.BoxGeometry(W, GC + CH * 0.42, L, 6, 3, 12)
    const pos = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = pos.getY(i)
      // taper sides inward at top
      const tY = (y + (GC + CH * 0.42) / 2) / (GC + CH * 0.42)
      pos.setX(i, x * (1 - tY * 0.12))
      // front nose taper
      if (z > L * 0.3) {
        const t = (z - L * 0.3) / (L * 0.2)
        pos.setY(i, y - t * GC * 0.7)
        pos.setX(i, pos.getX(i) * (1 - t * 0.25))
      }
      // rear taper
      if (z < -L * 0.32) {
        const t = (-z - L * 0.32) / (L * 0.18)
        pos.setX(i, pos.getX(i) * (1 - t * 0.18))
      }
    }
    geo.computeVertexNormals()
    const mesh = new THREE.Mesh(geo, paintMat)
    mesh.position.y = GC + (GC + CH * 0.42) * 0.5 - GC
    mesh.castShadow = true
    mesh.name = 'body_lower'
    group.add(mesh)
  }

  // ═══════════════════════════════════════════════════════════
  //  B.  UPPER CABIN / GREENHOUSE
  // ═══════════════════════════════════════════════════════════
  {
    const cabL = type === 'supercar' ? L * 0.38 : type === 'pickup' ? L * 0.32 : L * 0.52
    const cabH = type === 'supercar' ? CH * 0.55 : type === 'suv' ? CH * 0.48 : CH * 0.62
    const cabW = W * 0.88
    const yBase = GC + CH * 0.42 * 0.9

    const geo = new THREE.BoxGeometry(cabW, cabH, cabL, 4, 3, 8)
    const pos = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i)
      const y = pos.getY(i)
      const x = pos.getX(i)
      const tY = (y + cabH / 2) / cabH          // 0 at bottom, 1 at top
      // Roof narrowing
      pos.setX(i, x * (1 - tY * 0.12))
      // Windscreen rake – slope front
      if (z > cabL * 0.2) {
        const t = (z - cabL * 0.2) / (cabL * 0.3)
        pos.setY(i, y - t * cabH * 0.55)
        pos.setZ(i, z + t * cabL * 0.08)
      }
      // Rear fastback slope
      if (z < -cabL * 0.2) {
        const t = (-z - cabL * 0.2) / (cabL * 0.3)
        pos.setY(i, y - t * cabH * (type === 'supercar' ? 0.8 : 0.4))
      }
    }
    geo.computeVertexNormals()
    const mesh = new THREE.Mesh(geo, paintMat)
    mesh.position.set(0, yBase + cabH * 0.5, type === 'supercar' ? -0.3 : -0.1)
    mesh.castShadow = true
    mesh.name = 'cabin'
    group.add(mesh)

    // ─ Windscreen glass ─
    const wsGeo = new THREE.PlaneGeometry(cabW * 0.85, cabH * 0.7)
    const wsMesh = new THREE.Mesh(wsGeo, glassMat)
    wsMesh.rotation.x = Math.PI / 2.7
    wsMesh.position.set(0, yBase + cabH * 0.55, cabL * 0.38)
    wsMesh.name = 'windscreen'
    group.add(wsMesh)

    // ─ Rear glass ─
    const rgMesh = new THREE.Mesh(wsGeo, glassMat)
    rgMesh.rotation.x = -Math.PI / (type === 'supercar' ? 2.2 : 3.0)
    rgMesh.position.set(0, yBase + cabH * 0.5, -cabL * 0.36)
    rgMesh.name = 'rear_glass'
    group.add(rgMesh)

    // ─ Side windows L & R ─
    const swGeo = new THREE.PlaneGeometry(cabL * 0.65, cabH * 0.72)
    for (const sx of [-cabW / 2 - 0.01, cabW / 2 + 0.01]) {
      const swMesh = new THREE.Mesh(swGeo, glassMat)
      swMesh.rotation.y = Math.PI / 2
      swMesh.position.set(sx, yBase + cabH * 0.55, -0.1)
      group.add(swMesh)
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  C.  HOOD / BONNET
  // ═══════════════════════════════════════════════════════════
  {
    const hoodGeo = new THREE.BoxGeometry(W * 0.92, 0.06, L * 0.28, 4, 1, 6)
    const pos = hoodGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i)
      // slope down toward nose
      if (z > 0) pos.setY(i, pos.getY(i) - z * 0.22)
    }
    hoodGeo.computeVertexNormals()
    const hood = new THREE.Mesh(hoodGeo, paintMat)
    hood.position.set(0, GC + CH * 0.41, L * 0.35)
    hood.castShadow = true
    group.add(hood)
  }

  // ═══════════════════════════════════════════════════════════
  //  D.  TRUNK LID / BED (pickup)
  // ═══════════════════════════════════════════════════════════
  if (type !== 'pickup') {
    const tGeo = new THREE.BoxGeometry(W * 0.9, 0.055, L * 0.22, 4, 1, 4)
    const trunk = new THREE.Mesh(tGeo, paintMat)
    trunk.position.set(0, GC + CH * 0.41, -L * 0.37)
    trunk.castShadow = true
    group.add(trunk)
  } else {
    // pickup bed walls
    const bedMat = paintMat
    for (const [bx, bw, bz, bl] of [
      [0, W * 0.86, -L * 0.28, 0.08],   // floor
      [0, W * 0.86, -L * 0.47, 0.08],   // rear gate
      [-W * 0.43, 0.06, -L * 0.32, L * 0.32],  // left wall
      [ W * 0.43, 0.06, -L * 0.32, L * 0.32],  // right wall
    ] as number[][]) {
      const g = new THREE.BoxGeometry(bw, 0.22, bl)
      const m = new THREE.Mesh(g, bedMat)
      m.position.set(bx, GC + CH * 0.4, bz)
      group.add(m)
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  E.  FRONT BUMPER & GRILLE DETAILS
  // ═══════════════════════════════════════════════════════════
  {
    // Bumper main
    const bGeo = new THREE.BoxGeometry(W * 0.94, GC * 0.65, 0.12, 4, 2, 1)
    const bumper = new THREE.Mesh(bGeo, blackMat)
    bumper.position.set(0, GC * 0.35, L * 0.505)
    group.add(bumper)

    // Grille mesh opening (Dragon Face style)
    const grilleGeo = new THREE.BoxGeometry(W * 0.62, GC * 0.35, 0.06)
    const grilleMesh = new THREE.Mesh(grilleGeo, blackMat)
    grilleMesh.position.set(0, GC * 0.7, L * 0.508)
    group.add(grilleMesh)

    // Thin horizontal grille bars
    for (let i = 0; i < 4; i++) {
      const barGeo = new THREE.BoxGeometry(W * 0.6, 0.025, 0.05)
      const bar = new THREE.Mesh(barGeo, chromeMat)
      bar.position.set(0, GC * 0.55 + i * 0.07, L * 0.51)
      group.add(bar)
    }

    // BYD logo badge (simple disc)
    const badgeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16)
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 1, roughness: 0.05 })
    const badge = new THREE.Mesh(badgeGeo, badgeMat)
    badge.rotation.x = Math.PI / 2
    badge.position.set(0, GC * 0.85, L * 0.512)
    group.add(badge)
  }

  // ═══════════════════════════════════════════════════════════
  //  F.  CRYSTAL LED HEADLIGHTS (split DRL + main)
  // ═══════════════════════════════════════════════════════════
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xbfdbfe })
  const drlMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd })

  for (const sx of [-1, 1]) {
    const hx = sx * W * 0.4

    // Main housing
    const hlGeo = new THREE.BoxGeometry(0.42, 0.11, 0.1)
    const hl = new THREE.Mesh(hlGeo, hlMat)
    hl.position.set(hx, GC + CH * 0.35, L * 0.5)
    group.add(hl)

    // DRL strip
    const drlGeo = new THREE.BoxGeometry(0.38, 0.03, 0.06)
    const drl = new THREE.Mesh(drlGeo, drlMat)
    drl.position.set(hx, GC + CH * 0.41, L * 0.508)
    group.add(drl)

    // Point light for glow
    const light = new THREE.PointLight(0x60a5fa, 0.8, 3)
    light.position.set(hx, GC + CH * 0.38, L * 0.52)
    group.add(light)
  }

  // ═══════════════════════════════════════════════════════════
  //  G.  FULL-WIDTH LED TAILLIGHT BAR
  // ═══════════════════════════════════════════════════════════
  {
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xef4444 })
    const tlGeo = new THREE.BoxGeometry(W * 0.84, 0.055, 0.07)
    const tl = new THREE.Mesh(tlGeo, tlMat)
    tl.position.set(0, GC + CH * 0.45, -L * 0.503)
    group.add(tl)

    // Split outer housings
    for (const sx of [-1, 1]) {
      const hGeo = new THREE.BoxGeometry(0.38, 0.14, 0.1)
      const h = new THREE.Mesh(hGeo, tlMat)
      h.position.set(sx * W * 0.38, GC + CH * 0.38, -L * 0.502)
      group.add(h)

      const rLight = new THREE.PointLight(0xff4444, 0.6, 2.5)
      rLight.position.set(sx * W * 0.38, GC + CH * 0.38, -L * 0.54)
      group.add(rLight)
    }

    // Rear bumper
    const rbGeo = new THREE.BoxGeometry(W * 0.93, GC * 0.5, 0.1)
    const rb = new THREE.Mesh(rbGeo, blackMat)
    rb.position.set(0, GC * 0.28, -L * 0.505)
    group.add(rb)

    // Diffuser / exhaust area (cosmetic)
    const diffGeo = new THREE.BoxGeometry(W * 0.55, 0.065, 0.14)
    const diff = new THREE.Mesh(diffGeo, blackMat)
    diff.position.set(0, GC * 0.12, -L * 0.51)
    group.add(diff)
  }

  // ═══════════════════════════════════════════════════════════
  //  H.  SIDE MIRRORS
  // ═══════════════════════════════════════════════════════════
  for (const sx of [-1, 1]) {
    const mGeo = new THREE.BoxGeometry(0.06, 0.09, 0.22)
    const mirror = new THREE.Mesh(mGeo, paintMat)
    mirror.position.set(sx * (W * 0.5 + 0.05), GC + CH * 0.7, L * 0.12)
    group.add(mirror)
    // mirror glass face
    const mgGeo = new THREE.PlaneGeometry(0.08, 0.08)
    const mg = new THREE.Mesh(mgGeo, glassMat)
    mg.rotation.y = -sx * Math.PI / 2
    mg.position.set(sx * (W * 0.5 + 0.09), GC + CH * 0.7, L * 0.12)
    group.add(mg)
  }

  // ═══════════════════════════════════════════════════════════
  //  I.  DOOR HANDLES (flush)
  // ═══════════════════════════════════════════════════════════
  for (const sx of [-1, 1]) {
    for (const dz of [L * 0.1, -L * 0.12]) {
      const dhGeo = new THREE.BoxGeometry(0.04, 0.04, 0.18)
      const dh = new THREE.Mesh(dhGeo, chromeMat)
      dh.position.set(sx * (W * 0.5 + 0.02), GC + CH * 0.52, dz)
      group.add(dh)
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  J.  SPOILER / LIP  (type-dependent)
  // ═══════════════════════════════════════════════════════════
  if (type === 'supercar' || type === 'sedan') {
    const spoilerGeo = new THREE.BoxGeometry(W * 0.75, 0.07, 0.25)
    const spoiler = new THREE.Mesh(spoilerGeo, paintMat)
    spoiler.position.set(0, GC + CH * 0.78, -L * 0.5)
    spoiler.rotation.x = type === 'supercar' ? 0.25 : 0.1
    group.add(spoiler)

    // Spoiler vertical winglets
    for (const sx of [-1, 1]) {
      const wingGeo = new THREE.BoxGeometry(0.06, 0.12, 0.22)
      const wing = new THREE.Mesh(wingGeo, paintMat)
      wing.position.set(sx * W * 0.36, GC + CH * 0.78, -L * 0.5)
      group.add(wing)
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  K.  BLADE BATTERY PACK (underfloor, flat & wide)
  // ═══════════════════════════════════════════════════════════
  const batteryMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    metalness: 0.55,
    roughness: 0.35,
    emissive: 0x065f46,
    emissiveIntensity: 0.25,
  })
  const battGeo = new THREE.BoxGeometry(W * 0.82, 0.2, L * 0.6)
  const battMesh = new THREE.Mesh(battGeo, batteryMat)
  battMesh.position.set(0, GC * 0.58, 0)
  battMesh.name = 'battery'
  group.add(battMesh)

  // Blade cell stripes
  for (let i = -7; i <= 7; i++) {
    const sGeo = new THREE.BoxGeometry(W * 0.79, 0.015, 0.08)
    const sMat = new THREE.MeshBasicMaterial({ color: 0x34d399 })
    const s = new THREE.Mesh(sGeo, sMat)
    s.position.set(0, GC * 0.58 + 0.11, i * 0.22)
    group.add(s)
  }

  // ═══════════════════════════════════════════════════════════
  //  L.  ELECTRIC MOTORS (cylindrical, front & rear)
  // ═══════════════════════════════════════════════════════════
  const motorsGroup = new THREE.Group()
  motorsGroup.name = 'motors'
  const motorMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24, metalness: 0.75, roughness: 0.2,
    emissive: 0xb45309, emissiveIntensity: 0.18,
  })
  for (const mz of [WBZ, -WBZ]) {
    const mGeo = new THREE.CylinderGeometry(0.26, 0.26, W * 0.55, 20)
    const m = new THREE.Mesh(mGeo, motorMat)
    m.rotation.z = Math.PI / 2
    m.position.set(0, WR + 0.02, mz)
    motorsGroup.add(m)
  }
  // HV orange cable
  const cableGeo = new THREE.CylinderGeometry(0.032, 0.032, L * 0.58, 8)
  const cableMat = new THREE.MeshBasicMaterial({ color: 0xf97316 })
  const cable = new THREE.Mesh(cableGeo, cableMat)
  cable.rotation.x = Math.PI / 2
  cable.position.set(0.28, GC * 0.75, 0)
  motorsGroup.add(cable)
  group.add(motorsGroup)

  // ═══════════════════════════════════════════════════════════
  //  M.  WHEELS – Full detail (tire + multi-spoke rim + caliper)
  // ═══════════════════════════════════════════════════════════
  const wheelsGroup = new THREE.Group()
  wheelsGroup.name = 'wheels'

  const spokeCount = type === 'supercar' ? 10 : 5

  const wheelPositions: [number, number, number][] = [
    [-WTX, WR, WBZ],
    [ WTX, WR, WBZ],
    [-WTX, WR, -WBZ],
    [ WTX, WR, -WBZ],
  ]

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wGroup = new THREE.Group()
    wGroup.position.set(wx, wy, wz)

    // Tire
    const tireGeo = new THREE.TorusGeometry(WR, WW * 0.42, 16, 40)
    const tire = new THREE.Mesh(tireGeo, tireMat)
    tire.rotation.y = Math.PI / 2
    wGroup.add(tire)

    // Rim face disc
    const rimFaceGeo = new THREE.CylinderGeometry(WR * 0.66, WR * 0.66, WW * 0.12, 32)
    const rimFace = new THREE.Mesh(rimFaceGeo, rimMat)
    rimFace.rotation.z = Math.PI / 2
    wGroup.add(rimFace)

    // Hub cap
    const hubGeo = new THREE.CylinderGeometry(WR * 0.15, WR * 0.15, WW * 0.14, 12)
    const hub = new THREE.Mesh(hubGeo, chromeMat)
    hub.rotation.z = Math.PI / 2
    wGroup.add(hub)

    // Spokes
    for (let s = 0; s < spokeCount; s++) {
      const angle = (s / spokeCount) * Math.PI * 2
      const spokeGeo = new THREE.BoxGeometry(WW * 0.11, WR * 0.48, 0.04)
      const spoke = new THREE.Mesh(spokeGeo, rimMat)
      spoke.position.set(
        0,
        Math.sin(angle) * WR * 0.38,
        Math.cos(angle) * WR * 0.38
      )
      spoke.rotation.x = angle
      wGroup.add(spoke)
    }

    // Brake disc (ventilated look)
    const discGeo = new THREE.CylinderGeometry(WR * 0.52, WR * 0.52, WW * 0.06, 24)
    const discMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.7, roughness: 0.4 })
    const disc = new THREE.Mesh(discGeo, discMat)
    disc.rotation.z = Math.PI / 2
    wGroup.add(disc)

    // Red sport caliper
    const calGeo = new THREE.BoxGeometry(WW * 0.18, WR * 0.3, 0.12)
    const calMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.3 })
    const cal = new THREE.Mesh(calGeo, calMat)
    cal.position.set(wx > 0 ? -WW * 0.25 : WW * 0.25, -WR * 0.2, 0)
    wGroup.add(cal)

    wheelsGroup.add(wGroup)
  })
  group.add(wheelsGroup)

  // ═══════════════════════════════════════════════════════════
  //  N.  EXHAUST / CHARGE PORT ACCENT
  // ═══════════════════════════════════════════════════════════
  // Charge port (rear quarter panel – small circle)
  {
    const cpGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12)
    const cpMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8, roughness: 0.1, emissive: 0x0891b2, emissiveIntensity: 0.6 })
    const cp = new THREE.Mesh(cpGeo, cpMat)
    cp.rotation.z = Math.PI / 2
    cp.position.set(-W * 0.51, GC + CH * 0.48, -L * 0.3)
    group.add(cp)
  }

  scene.add(group)
  return { group, battMesh, motorsGroup, wheelsGroup }
}

// ───────────────────────────────────────────────────────────────────────────────

export default function Vehicle3DViewer({
  modelName,
  colorName = 'White',
  batteryPercentage,
  batteryCapacityKwh,
  rangeKm,
  vin,
}: Vehicle3DViewerProps) {
  const mountRef    = useRef<HTMLDivElement>(null)
  const [currentColorHex, setCurrentColorHex] = useState(() => parseInitialColor(colorName))
  const [viewMode,   setViewMode]   = useState<ViewMode>('exterior')
  const [isAutoRotate, setIsAutoRotate] = useState(true)

  // Three.js refs
  const sceneRef      = useRef<THREE.Scene | null>(null)
  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null)
  const carGroupRef   = useRef<THREE.Group | null>(null)
  const battMeshRef   = useRef<THREE.Mesh | null>(null)
  const motorsRef     = useRef<THREE.Group | null>(null)
  const wheelsRef     = useRef<THREE.Group | null>(null)
  const bodyMeshesRef = useRef<THREE.Mesh[]>([])

  const mouseState = useRef({
    isDragging: false,
    prevX: 0, prevY: 0,
    theta: 0.72,
    phi: 0.28,
    distance: 13,
  })

  const isSupercar = modelName.toLowerCase().includes('u9')
  const isSUV      = modelName.toLowerCase().match(/u8|song|yuan|bao|sea lion|seagull|seal u|atto/)
  const isPickup   = modelName.toLowerCase().includes('shark')
  const carType: 'supercar' | 'suv' | 'pickup' | 'sedan' =
    isSupercar ? 'supercar' : isPickup ? 'pickup' : isSUV ? 'suv' : 'sedan'

  // ── Init Three.js ────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const W = container.clientWidth
    const H = container.clientHeight || 460

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#040810')
    scene.fog = new THREE.FogExp2('#040810', 0.022)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 120)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    rendererRef.current = renderer
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // ── Lighting ──────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.4))

    const key = new THREE.DirectionalLight(0xffffff, 2.8)
    key.position.set(8, 14, 10)
    key.castShadow = true
    key.shadow.mapSize.width  = 2048
    key.shadow.mapSize.height = 2048
    key.shadow.camera.near = 0.1
    key.shadow.camera.far  = 50
    key.shadow.camera.left = key.shadow.camera.bottom = -12
    key.shadow.camera.right = key.shadow.camera.top = 12
    scene.add(key)

    const fill = new THREE.DirectionalLight(0x7dd3fc, 1.6)
    fill.position.set(-10, 7, -8)
    scene.add(fill)

    const rim = new THREE.SpotLight(0x06b6d4, 5, 35, Math.PI / 5, 0.4)
    rim.position.set(0, 9, -14)
    scene.add(rim)

    // Under-car neon glow (EV tech vibe)
    const underglow = new THREE.PointLight(0x06b6d4, 3, 7)
    underglow.position.set(0, 0.15, 0)
    scene.add(underglow)

    // ── Ground ────────────────────────────────────────────────
    const groundGeo = new THREE.CircleGeometry(14, 80)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1a,
      roughness: 0.25,
      metalness: 0.85,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Polar grid (cyber showroom)
    const grid = new THREE.PolarGridHelper(12, 8, 8, 72, 0x06b6d4, 0x1e293b)
    grid.position.y = 0.01
    scene.add(grid)

    // Reflection disc
    const discGeo = new THREE.CircleGeometry(5.5, 64)
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x0f1a2e,
      roughness: 0.05,
      metalness: 1.0,
      opacity: 0.75,
      transparent: true,
    })
    const disc = new THREE.Mesh(discGeo, discMat)
    disc.rotation.x = -Math.PI / 2
    disc.position.y = 0.005
    scene.add(disc)

    // ── Build Car ─────────────────────────────────────────────
    const { group, battMesh, motorsGroup, wheelsGroup } = buildCar(scene, currentColorHex, carType)
    carGroupRef.current  = group
    battMeshRef.current  = battMesh
    motorsRef.current    = motorsGroup
    wheelsRef.current    = wheelsGroup

    // Collect all paint meshes for color/transparency updates
    const bodyMeshes: THREE.Mesh[] = []
    group.traverse(obj => {
      if (
        obj instanceof THREE.Mesh &&
        (obj.material as THREE.MeshPhysicalMaterial).clearcoat !== undefined &&
        !['battery', 'motors'].includes(obj.name)
      ) {
        bodyMeshes.push(obj)
      }
    })
    bodyMeshesRef.current = bodyMeshes

    // ── Animate ───────────────────────────────────────────────
    let animId: number
    let t = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)
      t += 0.016

      if (isAutoRotate) mouseState.current.theta += 0.006

      const { theta, phi, distance } = mouseState.current
      camera.position.set(
        distance * Math.sin(theta) * Math.cos(phi),
        distance * Math.sin(phi) + 1.5,
        distance * Math.cos(theta) * Math.cos(phi)
      )
      camera.lookAt(0, 1.1, 0)

      // Wheel spin while rotating
      if (wheelsRef.current && isAutoRotate) {
        wheelsRef.current.children.forEach(w => {
          w.children.forEach(part => { part.rotation.x -= 0.04 })
        })
      }

      // Underglow pulse
      underglow.intensity = 2.5 + Math.sin(t * 2) * 0.8

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight || 460
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelName, carType])

  // ── Color update ──────────────────────────────────────────
  useEffect(() => {
    bodyMeshesRef.current.forEach(m => {
      const mat = m.material as THREE.MeshPhysicalMaterial
      mat.color.set(currentColorHex)
      mat.needsUpdate = true
    })
  }, [currentColorHex])

  // ── View Mode (X-Ray) ─────────────────────────────────────
  useEffect(() => {
    if (!battMeshRef.current || !motorsRef.current) return
    const battMat = battMeshRef.current.material as THREE.MeshStandardMaterial

    bodyMeshesRef.current.forEach(m => {
      const mat = m.material as THREE.MeshPhysicalMaterial
      if (viewMode === 'exterior') {
        mat.transparent = false; mat.opacity = 1.0; mat.wireframe = false
        mat.color.set(currentColorHex)
      } else if (viewMode === 'chassis') {
        mat.transparent = true; mat.opacity = 0.14; mat.wireframe = true
      } else {
        mat.transparent = true; mat.opacity = 0.12; mat.wireframe = false
      }
      mat.needsUpdate = true
    })

    battMat.emissiveIntensity =
      viewMode === 'battery' ? 1.5 : viewMode === 'chassis' ? 0.8 : 0.25
    battMat.needsUpdate = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, currentColorHex])

  // ── Mouse handlers ────────────────────────────────────────
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
    mouseState.current.theta -= dx * 0.007
    mouseState.current.phi = Math.max(0.05, Math.min(Math.PI / 2.1, mouseState.current.phi + dy * 0.005))
  }
  const onMouseUp = () => { mouseState.current.isDragging = false }
  const onWheel   = (e: React.WheelEvent) => {
    e.preventDefault()
    mouseState.current.distance = Math.max(6, Math.min(22, mouseState.current.distance + e.deltaY * 0.012))
  }

  // Touch support
  const touchState = useRef({ prevX: 0, prevY: 0 })
  const onTouchStart = (e: React.TouchEvent) => {
    touchState.current.prevX = e.touches[0].clientX
    touchState.current.prevY = e.touches[0].clientY
    setIsAutoRotate(false)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchState.current.prevX
    const dy = e.touches[0].clientY - touchState.current.prevY
    touchState.current.prevX = e.touches[0].clientX
    touchState.current.prevY = e.touches[0].clientY
    mouseState.current.theta -= dx * 0.007
    mouseState.current.phi = Math.max(0.05, Math.min(Math.PI / 2.1, mouseState.current.phi + dy * 0.005))
  }

  // ── UI ────────────────────────────────────────────────────
  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-[#060d1a] via-[#040810] to-black border border-slate-800/80 shadow-2xl overflow-hidden text-white select-none">

      {/* ── Header ── */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">{modelName}</h2>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-800/60 text-cyan-300 font-bold">
                WebGL · BYD DiLink
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              VIN: <span className="text-cyan-400 font-semibold">{vin}</span>
              {' '}· <span className="text-slate-300">{colorName}</span>
            </p>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 gap-1 flex-wrap">
          {([
            { id: 'exterior',   label: 'Carroceria',       icon: null,     activeClass: 'bg-blue-600' },
            { id: 'chassis',    label: 'Chassi X-Ray',     icon: <Layers className="w-3.5 h-3.5" />,   activeClass: 'bg-cyan-600' },
            { id: 'battery',    label: 'Blade Battery',    icon: <Zap className="w-3.5 h-3.5" />,      activeClass: 'bg-emerald-600' },
            { id: 'powertrain', label: 'Motores 8-em-1',   icon: <Activity className="w-3.5 h-3.5" />, activeClass: 'bg-amber-600' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === tab.id ? `${tab.activeClass} text-white shadow-md` : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3D Canvas ── */}
      <div
        ref={mountRef}
        className="h-[440px] sm:h-[500px] w-full cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      />

      {/* ── Overlay hints ── */}
      <div className="absolute bottom-[185px] left-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md pointer-events-none">
        <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
        <span>Arraste para girar · Scroll para zoom</span>
      </div>
      <div className="absolute bottom-[185px] right-4 flex items-center gap-2">
        <button
          onClick={() => setIsAutoRotate(v => !v)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-md transition-all ${
            isAutoRotate
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          {isAutoRotate ? '⏸ Pausar 360°' : '▶ Auto-Rodar'}
        </button>
      </div>

      {/* ── Color Picker ── */}
      <div className="px-5 py-3 bg-slate-950/95 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
        <Palette className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cor:</span>
        <div className="flex items-center gap-2 flex-wrap">
          {BYD_COLORS.map(c => {
            const sel = currentColorHex.toLowerCase() === c.hex.toLowerCase()
            return (
              <button
                key={c.name}
                onClick={() => setCurrentColorHex(c.hex)}
                title={c.desc}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                  sel
                    ? 'border-cyan-400 bg-cyan-950/50 text-white ring-2 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-white/25 shadow-sm flex-shrink-0" style={{ backgroundColor: c.hex }} />
                {c.name}
              </button>
            )
          })}
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 cursor-pointer hover:border-cyan-400 transition-colors">
            <input
              type="color"
              value={currentColorHex}
              onChange={e => setCurrentColorHex(e.target.value)}
              className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
              title="Cor personalizada"
            />
            <span className="text-[11px] font-semibold text-slate-300">Custom</span>
          </label>
        </div>
      </div>

      {/* ── Telemetry Bar ── */}
      <div className="px-5 py-4 bg-slate-950/90 border-t border-slate-800/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
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
              <span className="text-[9px] text-emerald-300 px-1 rounded bg-emerald-950 border border-emerald-800/50">100% SOH</span>
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
            <p className="text-[10px] uppercase font-medium text-slate-400">Capacidade Blade</p>
            <p className="text-base font-extrabold text-white">{batteryCapacityKwh} kWh</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-medium text-slate-400">Plataforma</p>
            <p className="text-[11px] font-bold text-cyan-300">
              {carType === 'supercar' ? 'e-Platform 800V DiSus-X' : carType === 'suv' ? 'e-Platform 3.0 DMO AWD' : 'e-Platform 3.0 CTB'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
