<template>
  <div v-if="isReady">
    <div v-if="advertorial" class="mt-4 bg-light">
      <div class="card p-2 ">
        <!-- 你既有的貼文內容 -->
        <div class="text-start my-3">
          <h2 class="mb-1">{{ advertorial?.title }}</h2>
        </div>
        <div class="d-flex align-items-center">
          <img :src="advertorial?.avatar" alt="個人照片" class="rounded-circle me-3"
            style="width:50px; height:50px; object-fit:cover;" />
          <div class="text-start">
            <h5 class="mb-1">{{ advertorial?.accountId }}</h5>
            <p class="mb-0 text-muted">{{ advertorial?.name }}</p>
          </div>
        </div>
        <div>
          <p class="mt-3 text-start">{{ advertorial?.content }}</p>
        </div>
        <div v-if="advertorial.partners && advertorial.partners?.length" class="mb-4">
          <div class="text-start">
            <strong>合作夥伴：</strong>
          </div>
          <div class="flex-wrap mt-2">
            <div v-for="other in advertorial.partners" :key="other.id" class="d-flex align-items-start me-4 mb-2">
              <el-avatar :src="other.avatar" size="default" shape="square" fit="cover" />
              <span class="ms-2">{{ other.name }}</span>
            </div>
          </div>
        </div>
        <div class="d-flex align-items-center mx-2">
          <!-- 愛心按鈕：stop 阻止事件冒泡，prevent 防止 link 預設行為 -->
          <div class="d-flex align-items-center me-4" style="cursor: pointer;"
            @click.stop.prevent="toggleLike(advertorial)">
            <i :class="['bi', advertorial.liked ? 'bi-heart-fill text-danger' : 'bi-heart']"></i>
            <span class="ms-1">{{ advertorial.likeCount }}</span>
          </div>
          <!-- 留言按鈕 -->
          <div class="d-flex align-items-center me-4" style="cursor: pointer;">
            <i class="bi bi-chat-square"></i>
            <span class="ms-1">{{ advertorial.commentCount }}</span>
          </div>
          <!-- 收藏按鈕 -->
          <div class="d-flex align-items-center" style="cursor: pointer;">
            <i class="bi bi-bookmark"></i>
          </div>
        </div>
      </div>

      <!-- 使用 CommentSection 組件 -->
      <CommentSection :id="id" />
      
    </div>
    <div v-else>
      <h1 class="mt-5 text-white">找不到業配文，有緣再相見</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard, ElAvatar } from 'element-plus'
import type { Advertorial, Comment } from '@/types/advertorial'
import baseApi from '@/service/api'
import CommentSection from '@/components/CommentSection.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})
// console.log('收到的 id22：', id)
const isAtTop = ref(false)
// const props = defineProps<{ id: number }>()
const circleUrl = ref(
  'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
)
const advertorial = ref<Advertorial | null>(null);
const error = ref<string | null>(null)
const isReady = ref(false)

function toggleLike(advertorial: Advertorial) {
  if (advertorial.liked) {
    advertorial.likeCount--
  } else {
    advertorial.likeCount++
  }
  advertorial.liked = !advertorial.liked
}

// 移除了留言相關的變數和函數，因為這些會由 CommentSection 組件處理
async function getAdvertorialDeal(id) {
  try {
    const res = (await baseApi.get(`/advertorial/${id}`))
    advertorial.value = res.data.data
  } catch (e: any) {
    error.value = e.message
  }
}

onMounted(async () => {
  await getAdvertorialDeal(props.id);
  isReady.value = true
})
</script>

<style scoped>
</style>