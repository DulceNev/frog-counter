<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Settings2, SquarePen, CircleQuestionMark, RefreshCcwDot, Info, Minus, Pin, PinOff, X } from '@lucide/vue';
import gifStandby from './assets/gifs/standby.gif';
import gifHappy from './assets/gifs/happy.gif';
import gifSad from './assets/gifs/sad.gif';
import cartoonJumpSound from './assets/audio/cartoon-jump.mp3';
import bongSound from './assets/audio/bong.mp3';
import sparkleSound from './assets/audio/sparkle.mp3';
import locales from './locales';

const playSound = (src) => { new Audio(src).play() }

const count = ref(0)
const target = ref(10)
const stitchGuide = ref('sc, inc')

const plusPressed = ref(false)
const minusPressed = ref(false)

const frogState = ref('standby')
let frogTimer = null

const showModal = ref(false)
const showHelpModal = ref(false)
const showResetConfirm = ref(false)
const showInfoModal = ref(false)
const showSettingsModal = ref(false)
const alwaysOnTop = ref(false)
const windowSizePreset = ref('small')
const tempStitchGuide = ref('')
const tempTarget = ref(10)
const currentLanguage = ref('es')
const backgroundOpacity = ref(88)
const confettiPieces = ref([])
let confettiTimer = null

const messages = computed(() => locales[currentLanguage.value] ?? locales.en)
const t = (key, params = {}) => {
  const template = messages.value[key] ?? locales.en[key] ?? key
  return Object.entries(params).reduce((result, [paramKey, value]) => {
    return result.replace(`{${paramKey}}`, String(value))
  }, template)
}

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

const launchConfetti = () => {
  if (confettiTimer) clearTimeout(confettiTimer)

  const colors = ['#4684A9', '#8EC8BC', '#C1E1C9', '#FFAEC9', '#E87198']
  confettiPieces.value = Array.from({ length: 30 }, (_, index) => {
    const fromLeft = index % 2 === 0
    return {
      id: `${Date.now()}-${index}`,
      left: fromLeft ? `${4 + Math.random() * 18}%` : `${78 + Math.random() * 18}%`,
      bottom: `${2 + Math.random() * 10}%`,
      x: fromLeft ? `${90 + Math.random() * 120}px` : `${-90 - Math.random() * 120}px`,
      y: `${-260 - Math.random() * 280}px`,
      delay: `${Math.random() * 0.12}s`,
      duration: `${1.1 + Math.random() * 0.65}s`,
      rotate: `${-300 + Math.random() * 600}deg`,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? '9999px' : '0.35rem',
      size: `${8 + Math.random() * 8}px`,
    }
  })

  confettiTimer = setTimeout(() => {
    confettiPieces.value = []
    confettiTimer = null
  }, 2200)
}

const increment = () => {
  if (count.value < target.value) {
    count.value++
    setFrogState('happy')
    if (count.value === target.value) {
      playSound(sparkleSound)
      launchConfetti()
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
  if (showModal.value || showHelpModal.value || showResetConfirm.value || showInfoModal.value || showSettingsModal.value) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    increment();
    animateButton('plus');
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    decrement();
    animateButton('minus');
  } else if (event.key === 'r' || event.key === 'R') {
    showResetConfirm.value = true;
  }
}

const toggleAlwaysOnTop = async () => {
  if (!window.windowControls?.toggleAlwaysOnTop) return
  alwaysOnTop.value = await window.windowControls.toggleAlwaysOnTop()
}

const minimizeWindow = () => {
  window.windowControls?.minimize?.()
}

const setWindowSizePreset = async (preset) => {
  if (!window.windowControls?.setSizePreset) return
  windowSizePreset.value = await window.windowControls.setSizePreset(preset)
}

const closeWindow = () => {
  window.windowControls?.close?.()
}

const setLanguage = (language) => {
  if (!locales[language]) return
  currentLanguage.value = language
  window.localStorage.setItem('frog-language', language)
}

const setBackgroundTransparency = (value) => {
  backgroundOpacity.value = Number(value)
  document.documentElement.style.setProperty('--app-bg-alpha', String(backgroundOpacity.value / 100))
  window.localStorage.setItem('frog-background-opacity', String(backgroundOpacity.value))
}

const getDefaultLanguage = () => {
  const systemLanguage = window.navigator.language?.split('-')[0]?.toLowerCase()
  return locales[systemLanguage] ? systemLanguage : 'en'
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);

  const savedLanguage = window.localStorage.getItem('frog-language')
  const savedOpacity = Number(window.localStorage.getItem('frog-background-opacity'))

  if (savedLanguage && locales[savedLanguage]) {
    currentLanguage.value = savedLanguage
  } else {
    currentLanguage.value = getDefaultLanguage()
  }

  if (!Number.isNaN(savedOpacity) && savedOpacity >= 20 && savedOpacity <= 100) {
    backgroundOpacity.value = savedOpacity
  }

  document.documentElement.style.setProperty('--app-bg-alpha', String(backgroundOpacity.value / 100))

  if (window.windowControls?.getAlwaysOnTop) {
    alwaysOnTop.value = await window.windowControls.getAlwaysOnTop()
  }
  if (window.windowControls?.getSizePreset) {
    windowSizePreset.value = await window.windowControls.getSizePreset()
  }
});

onUnmounted(() => {
  if (frogTimer) clearTimeout(frogTimer)
  if (confettiTimer) clearTimeout(confettiTimer);
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="grid grid-rows-[40px_1fr] h-full relative">
    <div class="confetti-layer" aria-hidden="true">
      <span
        v-for="piece in confettiPieces"
        :key="piece.id"
        class="confetti-piece"
        :style="{
          left: piece.left,
          bottom: piece.bottom,
          '--confetti-color': piece.color,
          '--confetti-delay': piece.delay,
          '--confetti-duration': piece.duration,
          '--confetti-x': piece.x,
          '--confetti-y': piece.y,
          '--confetti-rotate': piece.rotate,
          '--confetti-radius': piece.shape,
          '--confetti-size': piece.size,
        }"
      />
    </div>

    <header class="bg-base text-light-green h-10 flex items-center justify-between px-3">
      <p class="font-bold text-xl">{{ t('appName') }}</p>
      <div class="flex gap-1 items-center">
        <div class="flex items-center gap-1 rounded-full bg-[#ffffff1a] px-1 py-1">
          <button
            v-for="preset in ['small', 'medium', 'large']"
            :key="preset"
            @click="setWindowSizePreset(preset)"
            :class="[
              'size-preset-button',
              windowSizePreset === preset ? 'bg-light-green text-base' : 'text-light-green hover:text-white'
            ]"
            :title="preset === 'small' ? t('sizeSmall') : preset === 'medium' ? t('sizeMedium') : t('sizeLarge')"
          >
            {{ preset === 'small' ? 'S' : preset === 'medium' ? 'M' : 'L' }}
          </button>
        </div>

        <button
          @click="toggleAlwaysOnTop"
          :class="['window-button', alwaysOnTop ? 'bg-light-green text-base rounded-full p-1' : '']"
          :title="alwaysOnTop ? t('pinOn') : t('pinOff')"
        >
          <Pin v-if="alwaysOnTop" class="w-4 h-4" />
          <PinOff v-else class="w-4 h-4" />
        </button>

        <button
          @click="minimizeWindow"
          class="window-button"
          :title="t('minimize')"
        >
          <Minus class="w-4 h-4" />
        </button>

        <button
          @click="closeWindow"
          class="window-button"
          :title="t('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </header>

    <main class="flex flex-col justify-center items-center">
      <button
        @click="openModal"
        class="cursor-pointer text-base transition-transform duration-100 hover:scale-110 active:scale-90 absolute top-13 right-3 "
        :title="t('editPattern')"
      >
        <SquarePen class="w-6"/>
      </button>
      
      <div class="flex justify-center items-center">
        <button class="cursor-pointer z-10 -mr-7" @click="decrement" @focus="$event.target.blur()">
          <img :class="['transition-transform duration-100 ease-out hover:scale-110 h-18 active:scale-90', { 'scale-90': minusPressed }]" src="./assets/svg/minus.svg" alt="minus-image">
        </button>
        <div class="flex flex-col justify-center items-center bg-light-green w-40 h-40 rounded-4xl border-3 border-base">
          <div class="contenedor-patron w-full flex flex-col justify-center items-center">
            <p :class="['font-extrabold text-md text-center w-full truncate', stitchGuide ? 'text-base' : 'text-base/50']">
              {{ stitchGuide || 'sc, inc' }}
            </p>
            <p class="text-base font-extrabold text-6xl">
              {{ count }}
            </p>
            <p class="text-base font-extrabold text-md">{{ count }} / {{ target }}</p>
          </div>
        </div>
        <button class="cursor-pointer z-10 -ml-7 " @click="increment" @focus="$event.target.blur()">
          <img :class="['transition-transform duration-100 ease-out hover:scale-110 h-18 active:scale-90', { 'scale-90': plusPressed }]" src="./assets/svg/plus.svg" alt="plus-image">
        </button>
      </div>

      <img :src="frogSrc" :alt="`gif-${frogState}`" class="h-20 absolute top-43 ">
      <progress class="progress border-3 mt-5 mb-2 p-1 border-base w-56 h-6 rounded-full bg-green" :value="count" :max="target"></progress>

      <div class="flex gap-2">
        <button @click="showSettingsModal = true" class="cursor-pointer text-dark-pinky transition-transform duration-100 hover:scale-110 active:scale-90 bg-pinky rounded-full p-0.5 border-2 border-dark-pinky" :title="t('settings')">
          <Settings2 class="w-5 h-5"/>
        </button>

        <button @click="showHelpModal = true" class="cursor-pointer text-dark-pinky transition-transform duration-100 hover:scale-110 active:scale-90 bg-pinky rounded-full p-0.5 border-2 border-dark-pinky" :title="t('help')">
          <CircleQuestionMark class="w-5 h-4"/>
        </button>

        <button @click="showResetConfirm = true" class="cursor-pointer text-dark-pinky transition-transform duration-100 hover:scale-110 active:scale-90 bg-pinky rounded-full p-0.5 border-2 border-dark-pinky" :title="t('reset')">
          <RefreshCcwDot class="w-5 h-5"/>
        </button>

        <button @click="showInfoModal = true" class="cursor-pointer text-dark-pinky transition-transform duration-100 hover:scale-110 active:scale-90 bg-pinky rounded-full p-0.5 border-2 border-dark-pinky" :title="t('info')">
          <Info class="w-5 h-4"/>
        </button>
      </div>
    </main>

    <Transition name="modal">
      <div v-if="showSettingsModal" class="fixed inset-0 flex items-center justify-center z-50" @click.self="showSettingsModal = false">
        <div class="bg-[#deffe9e1] border-4 border-base rounded-2xl p-6 w-80 shadow-xl flex flex-col gap-4">
          <p class="font-extrabold text-xl text-base text-center">{{ t('settingsTitle') }}</p>

          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm text-base">{{ t('languageLabel') }}</label>
            <div class="flex gap-2">
              <button @click="setLanguage('es')" :class="['settings-chip', currentLanguage === 'es' ? 'settings-chip-active' : '']">
                {{ t('languageEs') }}
              </button>
              <button @click="setLanguage('en')" :class="['settings-chip', currentLanguage === 'en' ? 'settings-chip-active' : '']">
                {{ t('languageEn') }}
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm text-base">{{ t('transparencyLabel') }}</label>
            <input
              :value="backgroundOpacity"
              type="range"
              min="20"
              max="100"
              class="range range-sm range-primary"
              @input="setBackgroundTransparency($event.target.value)"
            >
            <p class="text-sm font-semibold text-base/80">{{ t('transparencyValue', { value: backgroundOpacity }) }}</p>
          </div>

          <button
            @click="showSettingsModal = false"
            class="cursor-pointer font-bold px-4 py-1 rounded-lg bg-base text-light-green hover:opacity-90 transition-opacity duration-100"
          >{{ t('closeAction') }}</button>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showInfoModal" class="fixed inset-0 flex items-center justify-center z-50" @click.self="showInfoModal = false">
        <div class="bg-light-green border-4 border-base rounded-2xl w-72 p-3 shadow-xl flex flex-col gap-4">
          <p class="font-extrabold text-base text-center text-base">{{ t('whyFrog') }}</p>
          <p class="text-sm text-center text-base font-semibold">{{ t('frogExplanation') }}</p>
          <button
            @click="showInfoModal = false"
            class="cursor-pointer font-bold px-4 py-1 rounded-lg bg-base text-light-green hover:opacity-90 transition-opacity duration-100"
          >{{ t('closeAction') }}</button>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showResetConfirm" class="fixed inset-0 flex items-center justify-center z-50" @click.self="showResetConfirm = false">
        <div class="bg-light-green border-4 border-base rounded-2xl w-64 p-5 shadow-xl flex flex-col gap-4">
          <p class="font-extrabold text-base text-center text-base">{{ t('resetTitle') }}</p>
          <p class="text-sm text-center text-base font-semibold">{{ t('resetDescription') }}</p>
          <div class="flex gap-3 justify-center">
            <button
              @click="showResetConfirm = false"
              class="cursor-pointer font-bold px-4 py-1 rounded-lg border-2 border-base text-base hover:bg-[#C1E1C9] transition-colors duration-100"
            >{{ t('cancel') }}</button>
            <button
              @click="reset(); showResetConfirm = false"
              class="cursor-pointer font-bold px-4 py-1 rounded-lg bg-base text-light-green hover:opacity-90 transition-opacity duration-100"
            >{{ t('reset') }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showHelpModal" class="fixed inset-0 flex items-center justify-center z-50" @click.self="showHelpModal = false">
        <div class="bg-light-green border-4 border-base rounded-2xl w-72 p-2 shadow-xl flex flex-col gap-3">
          <p class="font-extrabold text-lg text-base text-center">{{ t('helpTitle') }}</p>

          <ul class="flex flex-col gap-2 text-sm text-base font-semibold">
            <li class="flex gap-2 items-start"><span>{{ t('helpEdit') }}</span></li>
            <li class="flex gap-2 items-start"><span>{{ t('helpCount') }}</span></li>
            <li class="flex gap-2 items-start"><span>{{ t('helpReset') }}</span></li>
            <li class="flex gap-2 items-start"><span>{{ t('helpProgress') }}</span></li>
          </ul>

          <button
            @click="showHelpModal = false"
            class="cursor-pointer font-bold px-4 py-1 rounded-lg bg-base text-light-green hover:opacity-90 transition-opacity duration-100 mt-1"
          >{{ t('understood') }}</button>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50" @click.self="closeModal">
        <div class="bg-[#deffe9e1] border-4 border-base rounded-2xl p-6 w-72 shadow-xl flex flex-col gap-4">
          <p class="font-extrabold text-xl text-base text-center">{{ t('editRound') }}</p>

          <div class="flex flex-col gap-1">
            <label class="font-bold text-sm text-base">{{ t('patternLabel') }}</label>
            <input
              v-model="tempStitchGuide"
              :placeholder="t('patternPlaceholder')"
              class="font-semibold text-base bg-light-green border-2 border-base rounded-lg px-3 py-1 outline-none focus:border-green w-full"
            >
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-bold text-sm text-base">{{ t('targetLabel') }}</label>
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
            >{{ t('cancel') }}</button>
            <button
              @click="saveModal"
              class="cursor-pointer font-bold px-4 py-1 rounded-lg bg-base text-light-green hover:opacity-90 transition-opacity duration-100"
            >{{ t('save') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.confetti-layer {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 40;
}

.confetti-piece {
  position: absolute;
  width: var(--confetti-size);
  height: calc(var(--confetti-size) * 1.6);
  border-radius: var(--confetti-radius);
  background: var(--confetti-color);
  opacity: 0;
  animation: confetti-fall var(--confetti-duration) ease-out var(--confetti-delay) forwards;
}

.window-button {
  cursor: pointer;
  color: inherit;
  transition: transform 100ms ease, color 100ms ease;
}

.window-button:hover {
  transform: scale(1.1);
  color: white;
}

.window-button:active {
  transform: scale(0.9);
}

.size-preset-button {
  cursor: pointer;
  border-radius: 9999px;
  min-width: 1.7rem;
  padding: 0.1rem 0.4rem;
  font-size: 0.7rem;
  font-weight: 800;
  transition: transform 100ms ease, color 100ms ease, background-color 100ms ease;
}

.size-preset-button:hover {
  transform: scale(1.06);
}

.size-preset-button:active {
  transform: scale(0.94);
}

.settings-chip {
  cursor: pointer;
  border-radius: 9999px;
  border: 2px solid #4684A9;
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #4684A9;
  transition: transform 100ms ease, background-color 100ms ease, color 100ms ease;
}

.settings-chip:hover {
  transform: scale(1.03);
}

.settings-chip-active {
  background: #4684A9;
  color: #C1E1C9;
}

progress {
  appearance: none;
}

progress::-webkit-progress-bar {
  background-color: #8EC8BC;
  border-radius: 9999px;
}

progress::-webkit-progress-value {
  background-color: #C1E1C9;
  border-radius: 9999px;
}

progress::-moz-progress-bar {
  background-color: #C1E1C9;
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

@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotate(0deg) scale(0.9);
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--confetti-x), var(--confetti-y), 0) rotate(var(--confetti-rotate)) scale(1);
  }
}
</style>
