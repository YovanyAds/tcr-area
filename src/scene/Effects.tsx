import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { scrollState } from '../store/useStore'
import { local, T } from '../scroll/timeline'

/** Bloom selectivo (solo superficies con color > 1: LEDs, lentes, lightbox), viñeta y grano sutil. */
export function Effects() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bloom = useRef<any>(null)
  useFrame(() => {
    if (!bloom.current) return
    const p = scrollState.build
    bloom.current.intensity = 0.35 + local(p, T.lightboxOn) * 0.9
  })
  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.6} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.22} />
    </EffectComposer>
  )
}
