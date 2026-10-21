import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  BlendFunction,
  BloomEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing'
import { scrollState } from '../store/useStore'
import { local, T } from '../scroll/timeline'

/**
 * Bloom selectivo (solo superficies con color > 1: LEDs, lentes, lightbox), viñeta y grano sutil.
 * Se usa `postprocessing` directamente para no cargar efectos que no usamos.
 */
export function Effects() {
  const { gl, scene, camera, size } = useThree()

  const { composer, bloom } = useMemo(() => {
    const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType })
    const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 1, luminanceSmoothing: 0.2, intensity: 0.6, radius: 0.7 })
    const tone = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC })
    const vignette = new VignetteEffect({ offset: 0.25, darkness: 0.75 })
    const noise = new NoiseEffect({ premultiply: true, blendFunction: BlendFunction.SOFT_LIGHT })
    noise.blendMode.opacity.value = 0.22
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(new EffectPass(camera, bloom, tone, vignette, noise))
    return { composer, bloom }
  }, [gl, scene, camera])

  useEffect(() => {
    // el tone mapping lo hace el composer
    const prev = gl.toneMapping
    gl.toneMapping = THREE.NoToneMapping
    return () => {
      gl.toneMapping = prev
      composer.dispose()
    }
  }, [gl, composer])

  useEffect(() => composer.setSize(size.width, size.height), [composer, size])

  // prioridad 1: R3F deja de renderizar por su cuenta y lo hace el composer
  useFrame((_, dt) => {
    bloom.intensity = 0.35 + local(scrollState.build, T.lightboxOn) * 0.9
    composer.render(dt)
  }, 1)

  return null
}
