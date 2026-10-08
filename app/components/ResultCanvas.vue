<script setup lang="ts">
import { renderCutout, type CutoutSource, type MaskParams } from '~/utils/mask'
import { renderSticker } from '~/utils/sticker'

const { identifyLeaf } = useLeafPipeline()

const props = defineProps<{ source: CutoutSource | null; params: MaskParams }>()
const sticker = ref<HTMLCanvasElement>()
let cutout: HTMLCanvasElement | null = null // off-screen intermediate
let raf = 0

async function analyze() {
  sticker.value?.toBlob(async (b) => {
    if (!b) return
    console.log({ b })
    let result = await identifyLeaf(b)
    console.log({ result })
  })

}

async function draw() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    if (!props.source || !sticker.value) return
    cutout ??= document.createElement('canvas')
    renderCutout(props.source, props.params, cutout)
    renderSticker(cutout, sticker.value)
    sticker.value?.toBlob(async (blob) => {
      let i = await saveImage(blob)
      console.log(i)
    })
  })
}
watch(() => [props.source, { ...props.params }], draw, { deep: true, flush: 'post' })

function download() {
  sticker.value?.toBlob((b) => {
    if (!b) return
    const url = URL.createObjectURL(b)
    Object.assign(document.createElement('a'), { href: url, download: 'leaf-sticker.png' }).click()
    URL.revokeObjectURL(url)
  })
}

</script>

<template>
  <div>
    <div class="stage"><canvas ref="sticker" /></div>
    <p v-if="source"><button @click="download">Download sticker</button></p>
    <p v-if="sticker"><button @click="analyze">Analyze</button></p>
  </div>
</template>

<style scoped>
.stage {
  /* background: #aab7b0; */
  /* border: 1px solid #ccc; */
  line-height: 0;
}

canvas {
  max-width: 100%;
}
</style>
