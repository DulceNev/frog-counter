<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const count = ref(0)
const target = ref(10)


const stitchGuide = ref('ej: sc, inc')

const plusPressed = ref(false)
const minusPressed = ref(false)

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
  if (event.target.tagName === 'INPUT') return;
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
    <header class="bg-base text-light-green h-10">
      <p class="font-bold text-xl">Frog Counter</p>
    </header>
    <main class="flex justify-center items-center">
      <button class="cursor-pointer z-10 -mr-7" @keyup.down="decrement" @click="decrement">
        <img :class="['transition-transform duration-100 ease-out hover:scale-110 h-20 active:scale-90', { 'scale-90': minusPressed }]" src="./assets/svg/minus.svg" alt="minus-image">
      </button>
      <div class="flex flex-col justify-center items-center bg-light-green w-50 h-50 rounded-4xl border-4 border-base">

        <div class="contenedor-patron w-full px-3">
          <input
            v-model="stitchGuide"
            @keyup.enter="$event.target.blur()"
            placeholder="ej: sc, inc"
            :class="['input-editable font-extrabold text-lg text-center cursor-pointer bg-transparent border-none outline-none w-full transition-all duration-200 hover:scale-110 hover:rounded-lg hover:px-2 focus:scale-110 focus:rounded-lg focus:px-2 border-2 ',
              stitchGuide ? 'text-base ' : 'text-base/50 ']"
          >
        </div>
        
        <p class="text-base font-extrabold text-[70px]">
          {{ count }}</p>
        <p class="text-base font-extrabold text-xl">{{count}} / {{target}}</p>
      </div>
      <button class="cursor-pointer z-10 -ml-7" @keyup.up="increment" @click="increment">
        <img :class="['transition-transform duration-100 ease-out hover:scale-110 h-20 active:scale-90', { 'scale-90': plusPressed }]" src="./assets/svg/plus.svg" alt="plus-image">
      </button>
      
    </main>
    
  </div>
</template>

<style scoped>
.input-editable::placeholder {
  opacity: 0.4;
}
</style>
