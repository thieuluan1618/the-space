// app/test/page.tsx — Dev sandbox for Lobby & CollectionRoom
'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import type { Collection, Look } from '@/app/lib/types'

const Scene = dynamic(() => import('@/app/components/Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white text-sm">
      Loading 3D…
    </div>
  ),
})

// ─── Mock data ────────────────────────────────────────────────────────────────

const COLLECTION_NAMES = [
  'Hoa Sắc Đông Hồ', 'The Radiant Petals', 'Golden Migrate', 'Silk & Ashes',
]
const LOOK_NAMES = [
  'First Light', 'Crimson Veil', 'Quiet Storm', 'Ember Drift',
  'Jade Echo', 'Ivory Arc', 'Dusk Bloom', 'Pale Flame',
  'Iron Lotus', 'Saffron Wind', 'Obsidian Grace', 'Pearl Tide',
  'Twilight Fold', 'Copper Haze', 'Silver Reed', 'Midnight Bloom',
  'Golden Hour', 'Mist & Bone', 'Ash Petal', 'Dawn Fracture',
]
const LOOK_TAGS = [
  'silk, hand-embroidered, natural dye',
  'linen, block-printed, traditional motif',
  'organza, gold thread, contemporary cut',
  'cotton, indigo wash, minimalist drape',
]
const LOOK_INSPIRATION = [
  'Inspired by the fleeting hues of the Mekong at dusk.',
  'A meditation on transience, rendered in cloth and silence.',
  'Where ancient craft meets the restless spirit of now.',
  'The rivers remember what the hands have long forgotten.',
]
const SAMPLE_IMAGES = [
  'https://htqgmkmpisftapfaffsf.supabase.co/storage/v1/object/public/media/looks/hoa-sac-dong-ho/IMG_9074.JPG',
  'https://htqgmkmpisftapfaffsf.supabase.co/storage/v1/object/public/media/looks/hoa-sac-dong-ho/IMG_9075.JPG',
  'https://htqgmkmpisftapfaffsf.supabase.co/storage/v1/object/public/media/looks/the-radiant-petals/IMG_8900.JPG',
  'https://htqgmkmpisftapfaffsf.supabase.co/storage/v1/object/public/media/looks/golden-migrate/IMG_8831.JPG',
]

function makeMockCollections(count: number): Collection[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-col-${i}`,
    name: COLLECTION_NAMES[i % COLLECTION_NAMES.length],
    description: 'A seasonal showcase of form and restraint.',
    slug: `mock-col-${i}`,
    order: i,
  }))
}

function makeMockLooks(collectionId: string, count: number, withImages: boolean): Look[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-look-${collectionId}-${i}`,
    collection_id: collectionId,
    name: LOOK_NAMES[i % LOOK_NAMES.length],
    materials: LOOK_TAGS[i % LOOK_TAGS.length],
    inspiration: LOOK_INSPIRATION[i % LOOK_INSPIRATION.length],
    image_url: withImages ? SAMPLE_IMAGES[i % SAMPLE_IMAGES.length] : '',
    order: i,
  }))
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-3 space-y-2.5">
      <p className="text-white/30 text-[9px] font-mono uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}

function Slider({
  label, value, min, max, step = 1, unit = '', onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number
  unit?: string; onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-white/70">
      <span className="w-32 shrink-0 leading-tight">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 accent-amber-400"
      />
      <span className="w-12 text-right tabular-nums text-amber-400 text-[11px]">
        {value}{unit}
      </span>
    </label>
  )
}

function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
      <span className="w-32 shrink-0">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full transition-colors ${value ? 'bg-amber-400' : 'bg-white/20'} relative shrink-0`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : ''}`} />
      </button>
      <span className="text-amber-400 text-[11px]">{value ? 'On' : 'Off'}</span>
    </label>
  )
}

function ViewBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1 px-2 rounded text-[11px] font-mono transition-colors ${
        active ? 'bg-amber-400 text-black font-bold' : 'bg-white/10 text-white/60 hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  )
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

type CameraConfig = {
  fov: number
  cameraY: number
  cameraZ: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
  azimuthLimit: number
}

const CAMERA_DEFAULTS = {
  fov: 50,
  cameraY: 2,
  cameraZ: 10,
  maxDistanceLobby: 10,
  maxDistanceRoom: 8,
  minPolarDeg: 22,   // π/8 ≈ 22.5°
  maxPolarDeg: 86,   // π/2.1 ≈ 85.7°
  azimuthDeg: 95,    // π*0.53 ≈ 95.4°
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TestPage() {
  type ViewState = 'lobby' | 'collection' | 'detail'
  const [currentView, setCurrentView] = useState<ViewState>('lobby')

  // Scene content controls
  const [collectionCount, setCollectionCount] = useState(3)
  const [lookCount, setLookCount] = useState(8)
  const [withImages, setWithImages] = useState(true)
  const [selectedCollectionIdx, setSelectedCollectionIdx] = useState(0)

  // Camera controls
  const [fov, setFov] = useState(CAMERA_DEFAULTS.fov)
  const [cameraY, setCameraY] = useState(CAMERA_DEFAULTS.cameraY)
  const [cameraZ, setCameraZ] = useState(CAMERA_DEFAULTS.cameraZ)
  const [maxDistLobby, setMaxDistLobby] = useState(CAMERA_DEFAULTS.maxDistanceLobby)
  const [maxDistRoom, setMaxDistRoom] = useState(CAMERA_DEFAULTS.maxDistanceRoom)
  const [minPolarDeg, setMinPolarDeg] = useState(CAMERA_DEFAULTS.minPolarDeg)
  const [maxPolarDeg, setMaxPolarDeg] = useState(CAMERA_DEFAULTS.maxPolarDeg)
  const [azimuthDeg, setAzimuthDeg] = useState(CAMERA_DEFAULTS.azimuthDeg)

  // Reset camera to defaults
  const [cameraKey, setCameraKey] = useState(0)
  const resetCamera = () => {
    setFov(CAMERA_DEFAULTS.fov)
    setCameraY(CAMERA_DEFAULTS.cameraY)
    setCameraZ(CAMERA_DEFAULTS.cameraZ)
    setMaxDistLobby(CAMERA_DEFAULTS.maxDistanceLobby)
    setMaxDistRoom(CAMERA_DEFAULTS.maxDistanceRoom)
    setMinPolarDeg(CAMERA_DEFAULTS.minPolarDeg)
    setMaxPolarDeg(CAMERA_DEFAULTS.maxPolarDeg)
    setAzimuthDeg(CAMERA_DEFAULTS.azimuthDeg)
    setCameraKey((k) => k + 1)
  }

  const deg = (d: number) => (d * Math.PI) / 180

  const cameraConfig: CameraConfig = {
    fov,
    cameraY,
    cameraZ,
    maxDistance: currentView === 'lobby' ? maxDistLobby : maxDistRoom,
    minPolarAngle: deg(minPolarDeg),
    maxPolarAngle: deg(maxPolarDeg),
    azimuthLimit: deg(azimuthDeg),
  }

  const collections = makeMockCollections(collectionCount)
  const selectedCollection = collections[selectedCollectionIdx] ?? collections[0] ?? null
  const looks = selectedCollection
    ? makeMockLooks(selectedCollection.id, lookCount, withImages)
    : []

  const handleCollectionSelect = (col: Collection) => {
    const idx = collections.findIndex((c) => c.id === col.id)
    setSelectedCollectionIdx(idx >= 0 ? idx : 0)
    setCurrentView('collection')
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#0F0F0D] flex flex-col">
      {/* Header */}
      <div className="shrink-0 bg-black/60 backdrop-blur border-b border-white/10 px-4 py-2 flex items-center gap-4">
        <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Dev Sandbox</span>
        <span className="text-white/20 text-xs">·</span>
        <span className="text-amber-400/80 text-xs font-mono">
          View: <strong className="text-amber-400">{currentView}</strong>
        </span>
        {selectedCollection && currentView !== 'lobby' && (
          <>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-amber-400/80 text-xs font-mono truncate max-w-48">
              Collection: <strong className="text-amber-400">{selectedCollection.name}</strong>
            </span>
          </>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <Suspense fallback={null}>
          <Scene
            key={cameraKey}
            currentView={currentView}
            collections={collections}
            selectedCollection={selectedCollection}
            looks={looks}
            onCollectionSelect={handleCollectionSelect}
            onLookSelect={() => {}}
            onBackToLobby={() => setCurrentView('lobby')}
          />
        </Suspense>

        {/* Control panel */}
        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur border border-white/10 rounded-lg p-4 space-y-3 w-[300px] max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Controls</p>
            <button
              onClick={resetCamera}
              className="text-[10px] text-white/30 hover:text-amber-400 font-mono transition-colors"
            >
              Reset camera
            </button>
          </div>

          {/* View switcher */}
          <div className="flex gap-1">
            <ViewBtn label="lobby" active={currentView === 'lobby'} onClick={() => setCurrentView('lobby')} />
            <ViewBtn label="collection" active={currentView === 'collection'} onClick={() => setCurrentView('collection')} />
          </div>

          {/* Scene */}
          <Section title="Scene">
            <Slider label="Collections (lobby)" value={collectionCount} min={1} max={4} onChange={setCollectionCount} />
            <Slider label="Looks (room)" value={lookCount} min={0} max={20} onChange={setLookCount} />
            <Toggle label="Look images" value={withImages} onChange={setWithImages} />
          </Section>

          {/* Collection picker */}
          {currentView === 'collection' && collections.length > 1 && (
            <Section title="Active collection">
              <div className="space-y-1">
                {collections.map((col, i) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollectionIdx(i)}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] truncate transition-colors ${
                      i === selectedCollectionIdx
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* Camera — initial position */}
          <Section title="Camera — start position">
            <Slider label="FOV" value={fov} min={20} max={100} onChange={setFov} unit="°" />
            <Slider label="Height (Y)" value={cameraY} min={0} max={8} step={0.1} onChange={setCameraY} />
            <Slider label="Distance (Z)" value={cameraZ} min={2} max={20} step={0.5} onChange={setCameraZ} />
          </Section>

          {/* Camera — orbit limits */}
          <Section title="Camera — orbit limits">
            <Slider
              label={`Max dist (${currentView === 'lobby' ? 'lobby' : 'room'})`}
              value={currentView === 'lobby' ? maxDistLobby : maxDistRoom}
              min={2} max={20} step={0.5}
              onChange={currentView === 'lobby' ? setMaxDistLobby : setMaxDistRoom}
            />
            <Slider label="Tilt up limit" value={minPolarDeg} min={0} max={60} onChange={setMinPolarDeg} unit="°" />
            <Slider label="Tilt down limit" value={maxPolarDeg} min={45} max={90} onChange={setMaxPolarDeg} unit="°" />
            <Slider label="Azimuth limit (±)" value={azimuthDeg} min={30} max={180} onChange={setAzimuthDeg} unit="°" />
          </Section>

          <div className="border-t border-white/10 pt-2">
            <p className="text-white/20 text-[10px] font-mono">Drag to orbit · Scroll to zoom</p>
          </div>
        </div>
      </div>
    </main>
  )
}
