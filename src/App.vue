<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const count = ref(0)
const target = ref(10)
const stitchGuide = ref('ej: sc, inc')

const plusPressed = ref(false)
const minusPressed = ref(false)

const showModal = ref(false)
const tempStitchGuide = ref('')
const tempTarget = ref(10)

const openModal = () => {
  tempStitchGuide.value = stitchGuide.value
  tempTarget.value = target.value
  showModal.value = true
}

const saveModal = () => {
  stitchGuide.value = tempStitchGuide.value
  target.value = Number(tempTarget.value)
  showModal.value = false
}

const closeModal = () => {
  showModal.value = false
}

const increment = () => {
  if (count.value < target.value) {
    count.value++
  }
}

const decrement = () => {
  if (count.value > 0) {
    count.value--
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
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    </header>

    <main class="flex flex-col justify-center items-center">
      
      <div class="flex justify-center items-center">
        <button class="cursor-pointer z-10 -mr-7" @keyup.down="decrement" @click="decrement">
        <img :class="['transition-transform duration-100 ease-out hover:scale-110 h-20 active:scale-90', { 'scale-90': minusPressed }]" src="./assets/svg/minus.svg" alt="minus-image">
      </button>
      <div class="flex flex-col justify-center items-center bg-light-green w-50 h-50 rounded-4xl border-4 border-base">

        <div class="contenedor-patron w-full px-3">
          <p :class="['font-extrabold text-lg text-center w-full truncate', stitchGuide ? 'text-base' : 'text-base/50']">
            {{ stitchGuide || 'ej: sc, inc' }}
          </p>
        </div>

        <p class="text-base font-extrabold text-[70px]">
          {{ count }}</p>
        <p class="text-base font-extrabold text-xl">{{count}} / {{target}}</p>
      </div>
      <button class="cursor-pointer z-10 -ml-7" @keyup.up="increment" @click="increment">
        <img :class="['transition-transform duration-100 ease-out hover:scale-110 h-20 active:scale-90', { 'scale-90': plusPressed }]" src="./assets/svg/plus.svg" alt="plus-image">
      </button>
      </div>

      

      <progress class="progress border-3 my-4 p-1 border-base w-72 h-6 rounded-full bg-light-green" :value="count" :max="target"></progress>


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
