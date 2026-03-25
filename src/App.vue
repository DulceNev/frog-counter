<script setup>
import { ref } from 'vue';

  const count = ref(0)
  const target = ref(10)
  const stitchGuide = ref('')

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
  <div class="grid grid-rows-[40px_1fr]">
    <header class="bg-base text-light-green h-10">
      <p class="font-bold text-xl">Frog Counter</p>
    </header>
    <main class="flex justify-center items-center">
      <p class="text-base">{{ count }}</p>
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
      <button @click="reset">Reset</button>
    </main>
    
  </div>
</template>
