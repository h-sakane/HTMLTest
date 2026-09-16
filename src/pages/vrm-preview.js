import * as React from "react"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm"

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "./vrm-preview.module.css"

const MODEL_PATH = "/vrm/faia_beta.vrm"

const VrmPreviewPage = () => {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState("モデルを確認しています…")
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#e9e4d8")

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 1.35, 3.4)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    const ambientLight = new THREE.HemisphereLight("#fff9e8", "#8d7b6b", 2.2)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight("#fff4dd", 3.2)
    keyLight.position.set(-2, 4, 3)
    scene.add(keyLight)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 64),
      new THREE.MeshBasicMaterial({ color: "#d8ccb8", transparent: true, opacity: 0.5 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.85
    scene.add(floor)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1.05, 0)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 1.4
    controls.maxDistance = 6
    controls.minPolarAngle = 0.35
    controls.maxPolarAngle = Math.PI / 2

    let currentVrm
    let animationFrame
    let resizeObserver

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const safeWidth = Math.max(width, 1)
      const safeHeight = Math.max(height, 1)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(safeWidth, safeHeight, false)
      camera.aspect = safeWidth / safeHeight
      camera.updateProjectionMatrix()
    }

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const loader = new GLTFLoader()
    loader.register(parser => new VRMLoaderPlugin(parser))
    loader.load(
      MODEL_PATH,
      gltf => {
        currentVrm = gltf.userData.vrm
        if (!currentVrm) {
          setStatus("このファイルはVRMモデルとして読み込めませんでした。")
          return
        }

        VRMUtils.removeUnnecessaryVertices(gltf.scene)
        currentVrm.scene.rotation.y = Math.PI
        scene.add(currentVrm.scene)
        setStatus("ドラッグで回転 / ホイールで拡大縮小")
        setIsReady(true)
      },
      undefined,
      () => {
        setStatus("モデル未配置: static/vrm/faia_beta.vrm にファイルを置いてください。")
      }
    )

    const clock = new THREE.Clock()
    const animate = () => {
      const delta = clock.getDelta()
      if (currentVrm) currentVrm.update(delta)
      controls.update()
      renderer.render(scene, camera)
      animationFrame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver?.disconnect()
      controls.dispose()
      renderer.dispose()
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach(material => material.dispose())
        }
      })
    }
  }, [])

  const resetView = () => window.location.reload()

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>MODEL LAB / 01</p>
          <h1>Faia VRM Preview</h1>
          <p className={styles.lead}>ブラウザ上で VRM モデルの表情とシルエットを確認できます。</p>
        </div>

        <section className={styles.previewShell} aria-label="VRMモデルプレビュー">
          <div className={styles.previewHeader}>
            <div>
              <span className={styles.fileLabel}>CURRENT ASSET</span>
              <strong>faia_beta.vrm</strong>
            </div>
            <span className={`${styles.signal} ${isReady ? styles.signalReady : ""}`}>
              {isReady ? "READY" : "WAITING"}
            </span>
          </div>
          <div className={styles.stage}>
            <canvas ref={canvasRef} aria-label="VRMモデル表示領域" />
            <div className={styles.status}>{status}</div>
          </div>
          <div className={styles.controls}>
            <span>Orbit camera</span>
            <button type="button" onClick={resetView} aria-label="表示をリセット">
              Reset view
            </button>
          </div>
        </section>

        <p className={styles.note}>
          モデルの配置先: <code>static/vrm/faia_beta.vrm</code>
        </p>
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Faia VRM Preview" />

export default VrmPreviewPage