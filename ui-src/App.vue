<script lang="ts" setup>
import { useFigma } from './composables/figma';
import PluginHeader from './components/PluginHeader.vue';

const { postMessage } = useFigma();
</script>

<template>
  <main>
    <PluginHeader />
    <h5>Actions</h5>
    <button class="button-primary" @click="postMessage({ type: 'create-shapes', count: 5 })">
      Create shapes
    </button>
  </main>
</template>

<style>
</style>