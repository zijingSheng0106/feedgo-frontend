<script setup lang="ts">
defineProps<{
  loading: boolean
  error?: string
  empty?: boolean
  emptyText?: string
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <section v-if="loading" class="state" aria-live="polite">
    <span class="spinner" aria-hidden="true" />
    <span>加载中…</span>
  </section>

  <section v-else-if="error" class="state error" role="alert">
    <p>{{ error }}</p>
    <button type="button" @click="$emit('retry')">重新加载</button>
  </section>

  <section v-else-if="empty" class="state">
    {{ emptyText ?? '暂时没有内容' }}
  </section>

  <slot v-else />
</template>

<style scoped>
.state {
  min-height: 160px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.error { color: #ffb4b4; }

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
