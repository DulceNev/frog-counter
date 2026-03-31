<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { SquarePen, CircleQuestionMark, RefreshCcwDot,  Info} from '@lucide/vue';
import gifStandby from './assets/gifs/standby.gif';
import gifHappy from './assets/gifs/happy.gif';
import gifSad from './assets/gifs/sad.gif';
import cartoonJumpSound from './assets/audio/cartoon-jump.mp3';
import bongSound from './assets/audio/bong.mp3';
import sparkleSound from './assets/audio/sparkle.mp3';

const playSound = (src) => { new Audio(src).play() }

const count = ref(0)
const target = ref(10)
const stitchGuide = ref('sc, inc')

const plusPressed = ref(false)
const minusPressed = ref(false)

const frogState = ref('standby')
let frogTimer = null

const setFrogState = (state) => {
  frogState.value = state
  if (frogTimer) clearTimeout(frogTimer)
  frogTimer = setTimeout(() => { frogState.value = 'standby' }, 1500)
}

const frogSrc = computed(() => {
  if (frogState.value === 'happy') return gifHappy
  if (frogState.value === 'sad') return gifSad
  return gifStandby
})

const showModal = ref(false)
const tempStitchGuide = ref('')
const tempTarget = ref(10)

const openModal = () => {
  tempStitchGuide.value = stitchGuide.value
  tempTarget.value = target.value
  showModal.value = true
}

const saveModal = () => {
  const changed = tempStitchGuide.value !== stitchGuide.value || Number(tempTarget.value) !== target.value
  stitchGuide.value = tempStitchGuide.value
  target.value = Number(tempTarget.value)
  if (changed) count.value = 0
  showModal.value = false
}

const closeModal = () => {
  showModal.value = false
}

const increment = () => {
  if (count.value < target.value) {
    count.value++
    setFrogState('happy')
    if (count.value === target.value) {
      playSound(sparkleSound)
    } else {
      playSound(cartoonJumpSound)
    }
  }
}

const decrement = () => {
  if (count.value > 0) {
    count.value--
    setFrogState('sad')
    playSound(bongSound)
  }
}

const reset = () => {
  count.value = 0
}

const animateButton = (which) => {
  if (which === 'plus') {
    plusPressed.value = true
    setTimeout(() => { plusPressed.value = false }, 120)
  } else {
    minusPressed.value = true
    setTimeout(() => { minusPressed.value = false }, 120)
  }
}

const handleKeyDown = (event) => {
  if (showModal.value) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    increment();
    animateButton('plus');
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    decrement();
    animateButton('minus');
  } else if (event.key === 'r' || event.key === 'R') {
    reset();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="grid grid-rows-[40px_1fr] h-full">
    <header class="bg-base text-light-green h-10 flex items-center justify-between px-3">
      <p class="font-bold text-xl">Frog Counter</p>
      <button
        @click="openModal"
        class="cursor-pointer text-light-green hover:text-white transition-transform duration-100 hover:scale-110 active:scale-90"
        title="Editar patrón y meta"
      >
        <SquarePen />
      </button>
    </header>

    <main class="flex flex-col justify-center items-center">
      
      <div class="flex justify-center items-center">
        <button class="cursor-pointer z-10 -mr-7" @click="decrement" @focus="$event.target.blur()">
        <img :class="['transition-transform duration-100 ease-out hover:scale-110 h-18 active:scale-90', { 'scale-90': minusPressed }]" src="./assets/svg/minus.svg" alt="minus-image">
      </button>
      <div class="flex flex-col justify-center items-center bg-light-green w-40 h-40 rounded-4xl border-4 border-base">

        <div class="contenedor-patron w-full flex flex-col justify-center items-center">
          <p :class="['font-extrabold text-xl text-center w-full truncate', stitchGuide ? 'text-base' : 'text-base/50']">
            {{ stitchGuide || 'sc, inc' }}
          </p>
          <p class="text-base font-extrabold text-6xl">
          {{ count }}</p>
            <p class="text-base font-extrabold text-xl">{{count}} / {{target}}</p>
        </div>

        
      </div>
      <button class="cursor-pointer z-10 -ml-7" @click="increment" @focus="$event.target.blur()">
        <img :class="['transition-transform duration-100 ease-out hover:scale-110 h-18 active:scale-90', { 'scale-90': plusPressed }]" src="./assets/svg/plus.svg" alt="plus-image">
      </button>
      </div>


      <img :src="frogSrc" :alt="`gif-${frogState}`" class="h-20 absolute top-47 ">
      <progress class="progress border-3 my-5 p-1 border-base w-56 h-6 rounded-full bg-light-green" :value="count" :max="target"></progress>

      <div class="flex gap-2">
      <button class="cursor-pointer text-dark-pinky transition-transform duration-100 hover:scale-110 active:scale-90 bg-pinky rounded-full p-1 border-2 border-dark-pinky" title="¿Cómo usar?">
        <CircleQuestionMark />
      </button>

      <button @click="reset" class="cursor-pointer text-dark-pinky transition-transform duration-100 hover:scale-110 active:scale-90 bg-pinky rounded-full p-1 border-2 border-dark-pinky" title="Reiniciar">
        <RefreshCcwDot />
      </button>

      <button class="cursor-pointer text-dark-pinky transition-transform duration-100 hover:scale-110 active:scale-90 bg-pinky rounded-full p-1 border-2 border-dark-pinky" title="Información">
        <Info />
      </button>
      </div>

    </main>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50" @click.self="closeModal">
        <div class="bg-[#deffe9e1] border-4 border-base rounded-2xl p-6 w-72 shadow-xl flex flex-col gap-4">
          <p class="font-extrabold text-xl text-base text-center">Editar vuelta</p>

          <div class="flex flex-col gap-1">
            <label class="font-bold text-sm text-base">Patrón (stitch guide)</label>
            <input
              v-model="tempStitchGuide"
              placeholder="ej: sc, inc"
              class="font-semibold text-base bg-light-green border-2 border-base rounded-lg px-3 py-1 outline-none focus:border-green w-full"
            >
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-bold text-sm text-base">Meta de vueltas</label>
            <input
              v-model.number="tempTarget"
              type="number"
              min="1"
              class="font-semibold text-base bg-light-green border-2 border-base rounded-lg px-3 py-1 outline-none focus:border-green w-full"
            >
          </div>

          <div class="flex gap-3 justify-end mt-1">
            <button
              @click="closeModal"
              class="cursor-pointer font-bold px-4 py-1 rounded-lg border-2 border-base text-base hover:bg-light-green transition-colors duration-100"
            >Cancelar</button>
            <button
              @click="saveModal"
              class="cursor-pointer font-bold px-4 py-1 rounded-lg bg-base text-light-green hover:opacity-90 transition-opacity duration-100"
            >Guardar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>

progress {
  appearance: none;
}

progress::-webkit-progress-bar {
  background-color: #C1E1C9;
  border-radius: 9999px;
}

progress::-webkit-progress-value {
  background-color: #4684A9;
  border-radius: 9999px;
}

progress::-moz-progress-bar {
  background-color: #4684A9;
  border-radius: 9999px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
