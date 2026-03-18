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

  const frogIt = () => {
    if (count.value > 0) {
      count.value--
    }
  }

  const reset = () => {
    count.value = 0
  }


</script>

<template>
  <div>
    <p>Row: {{ count }} / {{ target }}</p>

    
    <input class="w-full border-1" v-model="stitchGuide" placeholder="Ej: 1sc, 1inc" />

    <button class="btn btn-primary m-1" @click="frogIt">Frog It! (-1)</button>
    <button class="btn btn-primary m-1" @click="increment">Next (+1)</button>
    <button class="btn btn-primary m-1" @click="reset">Reset all</button>
    
  </div>
</template>
