<script setup lang="ts">
import { Sparkles } from '@lucide/vue'
</script>

<template>
  <section class="jingxuan-placeholder" aria-labelledby="jingxuan-title">
    <Sparkles :size="32" aria-hidden="true" />
    <div>
      <h1 id="jingxuan-title">精选</h1>
      <p>应用骨架已就绪，分类视频网格将在第 2 天接入真实 Feed 数据。</p>
    </div>
  </section>
</template>

<style scoped>
.jingxuan-placeholder {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  background: var(--color-surface-1);
  color: var(--color-accent-cyan);
}

h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: var(--font-size-xl);
}

p {
  margin: var(--space-2) 0 0;
  color: var(--color-text-secondary);
}
</style>
