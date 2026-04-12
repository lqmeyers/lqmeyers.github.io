import { useEffect, useState, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import Papa from 'papaparse'
import styles from './EmbeddingViewer.module.css'

// ---------- Viewer config ----------
// Swap datasets, tweak visuals, or change camera behaviour here.
const VIEWER_CONFIG = {
  // CSV path (relative to /public)
  csvPath: '/data/bat_bot_umap.csv',
  // CSV column names — change these to match your CSV headers
  columns: {
    x: 'x',
    y: 'y',
    z: 'z',
    label: 'label',       // shown in tooltip and info panel
    class: 'class',       // used for color grouping / legend
    imageUrl: 'photo_url', // direct image URL column; null if not present
    hfIndex: 'hf_index',  // HuggingFace row index column; null if not present
  },
  // Point rendering
  pointSize: 0.12,
  // Camera
  cameraPosition: [0, 0, 3],
  cameraFov: 60,
  // Auto-rotation (stops on first click or manual drag)
  autoRotate: true,
  autoRotateSpeed: 0.6,
}

// ---------- HuggingFace dataset config ----------
// Change dataset/config/split/imageField here to swap to a different HF dataset.
// imageField: the column name in the dataset that holds the image object ({ src, height, width }).
// Two image columns available in red_bee_reID: 'rotated_masked' | 'unrotated_unmasked'
const HF_CONFIG = {
  dataset: 'megretlab/red_bee_reID',
  config: 'default',
  split: 'train',
  imageField: 'rotated_masked',
}

// ---------- circle sprite ----------

function makeCircleTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const r = size / 2
  ctx.beginPath()
  ctx.arc(r, r, r, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()
  return new THREE.CanvasTexture(canvas)
}

const circleTexture = makeCircleTexture()

// ---------- helpers ----------

function classToColor(className, allClasses) {
  const idx = allClasses.indexOf(className)
  const hue = (idx / allClasses.length) * 360
  const color = new THREE.Color()
  color.setHSL(hue / 360, 0.7, 0.55)
  return color
}

function generateSampleData() {
  const classes = ['group A', 'group B', 'group C']
  const points = []
  for (let i = 0; i < 90; i++) {
    const cls = classes[i % 3]
    const angle = (i / 30) * Math.PI * 2
    const radius = 1.5 + Math.random() * 1.5
    points.push({
      x: Math.cos(angle) * radius + (Math.random() - 0.5) * 0.6,
      y: (Math.random() - 0.5) * 2,
      z: Math.sin(angle) * radius + (Math.random() - 0.5) * 0.6,
      label: `Sample ${i + 1}`,
      class: cls,
      imageUrl: null,
    })
  }
  return points
}

// ---------- inner Three.js components ----------

function PointCloud({ points, allClasses, onPointClick, onPointHover }) {
  const meshRef = useRef()

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(points.length * 3)
    const col = new Float32Array(points.length * 3)
    points.forEach((pt, i) => {
      pos[i * 3] = pt.x
      pos[i * 3 + 1] = pt.y
      pos[i * 3 + 2] = pt.z
      const c = classToColor(pt.class, allClasses)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    })
    return { positions: pos, colors: col }
  }, [points, allClasses])

  function handleClick(e) {
    e.stopPropagation()
    if (e.index !== undefined && points[e.index]) {
      onPointClick(points[e.index])
    }
  }

  function handlePointerMove(e) {
    e.stopPropagation()
    if (e.index !== undefined && points[e.index]) {
      onPointHover({ point: points[e.index], position: e.point })
    }
  }

  function handlePointerOut() {
    onPointHover(null)
  }

  return (
    <points
      ref={meshRef}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={VIEWER_CONFIG.pointSize}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.9}
        alphaMap={circleTexture}
        alphaTest={0.1}
        depthWrite={false}
      />
    </points>
  )
}

function HoverTooltip({ hoverInfo }) {
  if (!hoverInfo) return null
  return (
    <Html position={[hoverInfo.position.x, hoverInfo.position.y, hoverInfo.position.z]} zIndexRange={[100, 0]}>
      <div className={styles.tooltip}>
        <strong>{hoverInfo.point.label}</strong>
        <span>{hoverInfo.point.class}</span>
      </div>
    </Html>
  )
}

// ---------- Legend ----------

function Legend({ allClasses }) {
  return (
    <div className={styles.legend}>
      {allClasses.map((cls, idx) => {
        const hue = (idx / allClasses.length) * 360
        return (
          <div key={cls} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: `hsl(${hue}, 70%, 55%)` }}
            />
            <span>{cls}</span>
          </div>
        )
      })}
    </div>
  )
}

// ---------- main export ----------

export default function EmbeddingViewer() {
  const [points, setPoints] = useState(() => generateSampleData())
  const [loading, setLoading] = useState(true)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [hoverInfo, setHoverInfo] = useState(null)
  const [imageState, setImageState] = useState({ url: null, loading: false, error: false })
  const [imgAspect, setImgAspect] = useState(null)
  const [isAutoRotating, setIsAutoRotating] = useState(VIEWER_CONFIG.autoRotate)
  const imageCache = useRef(new Map())

  useEffect(() => {
    const { columns: cols } = VIEWER_CONFIG
    fetch(VIEWER_CONFIG.csvPath)
      .then((r) => {
        if (!r.ok) throw new Error('CSV not found')
        return r.text()
      })
      .then((text) => {
        const result = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })
        if (result.data.length > 0) {
          setPoints(result.data.map((row) => ({
            x: row[cols.x],
            y: row[cols.y],
            z: row[cols.z],
            label: row[cols.label],
            class: row[cols.class],
            imageUrl: cols.imageUrl ? (row[cols.imageUrl] || null) : null,
            hfIndex: cols.hfIndex && row[cols.hfIndex] != null ? Number(row[cols.hfIndex]) : null,
          })))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Fetch image when selected point changes.
  // Priority 1: direct imageUrl — used as-is.
  // Priority 2: hfIndex — fetches from HF Datasets Server API on demand.
  useEffect(() => {
    setImgAspect(null)

    if (!selectedPoint) {
      setImageState({ url: null, loading: false, error: false })
      return
    }

    if (selectedPoint.imageUrl) {
      setImageState({ url: selectedPoint.imageUrl, loading: false, error: false })
      return
    }

    const idx = selectedPoint.hfIndex
    if (idx == null) {
      setImageState({ url: null, loading: false, error: false })
      return
    }

    if (imageCache.current.has(idx)) {
      setImageState({ url: imageCache.current.get(idx), loading: false, error: false })
      return
    }

    setImageState({ url: null, loading: true, error: false })
    const { dataset, config, split, imageField } = HF_CONFIG
    fetch(
      `https://datasets-server.huggingface.co/rows?dataset=${dataset}&config=${config}&split=${split}&offset=${idx}&length=1`
    )
      .then((r) => { if (!r.ok) throw new Error('HF fetch failed'); return r.json() })
      .then((data) => {
        const src = data.rows[0].row[imageField].src
        imageCache.current.set(idx, src)
        setImageState({ url: src, loading: false, error: false })
      })
      .catch(() => setImageState({ url: null, loading: false, error: true }))
  }, [selectedPoint])

  const allClasses = useMemo(
    () => [...new Set(points.map((p) => p.class))].sort(),
    [points]
  )

  function handlePointClick(point) {
    setSelectedPoint(point)
    setIsAutoRotating(false)
  }

  return (
    <div className={styles.viewer}>
      {/* 3D canvas panel */}
      <div className={styles.canvasPanel}>
        {loading && <div className={styles.loadingOverlay}>Loading…</div>}
        <Canvas
          camera={{ position: VIEWER_CONFIG.cameraPosition, fov: VIEWER_CONFIG.cameraFov }}
          style={{ background: '#0f0f0f' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 2]} intensity={0.4} />
          <axesHelper args={[1.3]} />
          <PointCloud
            points={points}
            allClasses={allClasses}
            onPointClick={handlePointClick}
            onPointHover={setHoverInfo}
          />
          <HoverTooltip hoverInfo={hoverInfo} />
          <OrbitControls
            autoRotate={isAutoRotating}
            autoRotateSpeed={VIEWER_CONFIG.autoRotateSpeed}
            onStart={() => setIsAutoRotating(false)}
            makeDefault
          />
        </Canvas>
        <Legend allClasses={allClasses} />
      </div>

      {/* Image panel */}
      <div className={styles.imagePanel}>
        <h4>Selected Point</h4>
        {selectedPoint ? (
          <>
            {imageState.loading && (
              <div className={styles.imageLoading}>Loading…</div>
            )}
            {imageState.error && (
              <div className={styles.noImage}>Image unavailable</div>
            )}
            {!imageState.loading && !imageState.error && imageState.url && (
              <img
                src={imageState.url}
                alt={selectedPoint.label}
                className={styles.selectedImage}
                style={imgAspect ? { aspectRatio: imgAspect } : undefined}
                onLoad={(e) => setImgAspect(e.target.naturalWidth / e.target.naturalHeight)}
              />
            )}
            {!imageState.loading && !imageState.error && !imageState.url && (
              <div className={styles.noImage}>No image available</div>
            )}
            <div className={styles.pointInfo}>
              <p className={styles.pointLabel}>{selectedPoint.label}</p>
            </div>
          </>
        ) : (
          <div className={styles.noSelection}>
            Click a point to inspect it
          </div>
        )}
      </div>
    </div>
  )
}
