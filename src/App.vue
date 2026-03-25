<script setup>
import { ref } from 'vue';

  const count = ref(0)
  const target = ref(10)
  const stitchGuide = ref('sc, inc')

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


</script>

<template>
  <div class="grid grid-rows-[40px_1fr] h-full">
    <header class="bg-base text-light-green h-10">
      <p class="font-bold text-xl">Frog Counter</p>
    </header>
    <main class="flex justify-center items-center">
      <button @click="decrement">
        <img class="transition-transform duration-100 ease-out hover:scale-110 active:scale-90" src="./assets/svg/minus.svg" alt="minus-image">
      </button>
      <div class="flex flex-col justify-center items-center bg-light-green w-50 h-50 rounded-4xl border-4 border-base">
        <p class="text-base font-extrabold text-xl">{{ stitchGuide }}</p>
        <p class="text-base font-extrabold text-[70px]">
          {{ count }}</p>
        <p class="text-base font-extrabold text-xl">{{count}} / {{target}}</p>
      </div>
      <button @click="increment">
        <img class="transition-transform duration-100 ease-out hover:scale-110 active:scale-90" src="./assets/svg/plus.svg" alt="plus-image">
      </button>
      
    </main>
    
  </div>
</template>
