import { useEffect, useState, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import Papa from 'papaparse'
import styles from './EmbeddingViewer.module.css'

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
  // deterministic hue based on class index in sorted list
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
  const { camera, raycaster, gl } = useThree()
  const meshRef = useRef()

  const { positions, colors, pointCount } = useMemo(() => {
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
    return { positions: pos, colors: col, pointCount: points.length }
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
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

  useEffect(() => {
    fetch('/data/bat_bot_umap.csv')
      .then((r) => {
        if (!r.ok) throw new Error('CSV not found')
        return r.text()
      })
      .then((text) => {
        const result = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true })
        if (result.data.length > 0) {
          setPoints(result.data.map((row) => ({ ...row, imageUrl: row.photo_url })))
        }
        setLoading(false)
      })
      .catch(() => {
        // silently fall back to sample data
        setLoading(false)
      })
  }, [])

  const allClasses = useMemo(
    () => [...new Set(points.map((p) => p.class))].sort(),
    [points]
  )

  return (
    <div className={styles.viewer}>
      {/* 3D canvas panel */}
      <div className={styles.canvasPanel}>
        {loading && <div className={styles.loadingOverlay}>Loading…</div>}
        <Canvas
          camera={{ position: [0, 0, 3], fov: 60 }}
          style={{ background: '#0f0f0f' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 2]} intensity={0.4} />
          <axesHelper args={[1.3]} />
          <PointCloud
            points={points}
            allClasses={allClasses}
            onPointClick={setSelectedPoint}
            onPointHover={setHoverInfo}
          />
          <HoverTooltip hoverInfo={hoverInfo} />
          <OrbitControls autoRotate autoRotateSpeed={0.6} makeDefault />
        </Canvas>
        <Legend allClasses={allClasses} />
      </div>

      {/* Image panel */}
      <div className={styles.imagePanel}>
        <h4>Selected Point</h4>
        {selectedPoint ? (
          <>
            {selectedPoint.imageUrl ? (
              <img
                src={selectedPoint.imageUrl}
                alt={selectedPoint.label}
                className={styles.selectedImage}
              />
            ) : (
              <div className={styles.noImage}>No image available</div>
            )}
            <div className={styles.pointInfo}>
              <p className={styles.pointLabel}>{selectedPoint.label}</p>
              {/* <p className={styles.pointClass}>{selectedPoint.class}</p> */}
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
