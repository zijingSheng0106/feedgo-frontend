<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const categories = ['全部', '公开课', '游戏', '二次元', '音乐', '影视', '美食', '知识', '生活 Vlog', '体育', '旅行', '亲子', '动物', '汽车', '美妆穿搭']
const route = useRoute()
const router = useRouter()
const categoryScroller = ref<HTMLDivElement | null>(null)
const selectedCategory = computed(() => {
  const value = route.query.category
  return typeof value === 'string' && categories.includes(value) ? value : '全部'
})

function selectCategory(category: string) {
  void router.replace({ query: { ...route.query, category: category === '全部' ? undefined : category } })
}

function scrollCategories(direction: number) {
  categoryScroller.value?.scrollBy({ left: direction * 280, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
</script>

<template>
  <section class="curated-page" aria-labelledby="curated-title">
    <div class="category-bar">
      <button class="category-arrow" type="button" aria-label="向左滚动分类" @click="scrollCategories(-1)">
        <ChevronLeft :size="18" aria-hidden="true" />
      </button>
      <div ref="categoryScroller" class="category-list" role="group" aria-label="视频分类">
        <button v-for="category in categories" :key="category" type="button" class="category-button"
          :class="{ selected: selectedCategory === category }" :aria-pressed="selectedCategory === category"
          @click="selectCategory(category)">{{ category }}</button>
      </div>
      <button class="category-arrow" type="button" aria-label="向右滚动分类" @click="scrollCategories(1)">
        <ChevronRight :size="18" aria-hidden="true" />
      </button>
    </div>
    <header class="section-heading">
      <div>
        <h1 id="curated-title">{{ selectedCategory === '全部' ? '发现精彩' : selectedCategory }}</h1>
        <p>探索你感兴趣的内容</p>
      </div>
      <span class="section-label">精选视频</span>
    </header>
    <!-- 布局占位：此阶段不请求接口，不伪造视频或跳转链接。 -->
    <div class="video-grid" aria-hidden="true">
      <article v-for="index in 12" :key="index" class="video-skeleton">
        <div class="skeleton-cover skeleton-block" />
        <div class="skeleton-title skeleton-block" />
        <div class="skeleton-title short skeleton-block" />
        <div class="skeleton-meta">
          <span class="skeleton-avatar skeleton-block" />
          <span class="skeleton-author skeleton-block" />
          <span class="skeleton-count skeleton-block" />
        </div>
      </article>
    </div>
    <p class="preview-note">内容展示区暂未接入视频数据</p>
  </section>
</template>

<style scoped>
.curated-page { min-width: 0; padding-bottom: var(--space-8); }
.category-bar { position: sticky; top: 0; z-index: var(--z-sticky); display: flex; align-items: center; gap: var(--space-2); padding: var(--space-4) 0; background: var(--color-bg); border-bottom: 1px solid var(--color-border); }
.category-list { display: flex; gap: var(--space-2); min-width: 0; overflow-x: auto; scrollbar-width: none; }
.category-list::-webkit-scrollbar { display: none; }
.category-button { flex: 0 0 auto; padding: 8px 16px; border: 1px solid transparent; border-radius: var(--radius-md); background: transparent; color: var(--color-text-secondary); white-space: nowrap; font-size: var(--font-size-sm); transition: background var(--duration-fast), color var(--duration-fast); }
.category-button:hover { background: var(--color-surface-2); color: var(--color-text-strong); }
.category-button.selected { background: var(--color-text-strong); color: var(--color-bg); font-weight: 600; }
.category-arrow { flex: 0 0 32px; width: 32px; height: 36px; display: grid; place-items: center; padding: 0; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); color: var(--color-text-secondary); }
.section-heading { display: flex; justify-content: space-between; align-items: center; margin: var(--space-6) 0 var(--space-5); }
h1 { margin: 0; font-size: var(--font-size-lg); font-weight: 650; }
.section-heading p { margin: var(--space-1) 0 0; color: var(--color-text-tertiary); font-size: var(--font-size-sm); }
.section-label { color: var(--color-text-tertiary); font-size: var(--font-size-xs); }
.video-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px 20px; }
.video-skeleton { min-width: 0; }
.skeleton-block { background: var(--color-surface-2); border-radius: var(--radius-sm); }
.skeleton-cover { aspect-ratio: 16 / 10; border-radius: var(--radius-lg); border: 1px solid var(--color-border); background: linear-gradient(145deg, var(--color-surface-2), var(--color-surface-1)); }
.skeleton-title { height: 14px; width: 88%; margin-top: 14px; }
.skeleton-title.short { width: 58%; height: 12px; margin-top: 9px; }
.skeleton-meta { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
.skeleton-avatar { width: 22px; height: 22px; border-radius: 50%; }
.skeleton-author { width: 30%; height: 10px; }
.skeleton-count { width: 18%; height: 10px; margin-left: auto; }
.preview-note { margin: var(--space-8) 0 0; text-align: center; color: var(--color-text-tertiary); font-size: var(--font-size-xs); }
@media (min-width: 1400px) { .video-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (min-width: 1800px) { .video-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
</style>
