<template>
  <!-- 留言列表容器 -->
  <div class="px-2 mt-3 pb-3 bg-light">
    <!-- <div
      class="pt-3 pb-2 px-2 sticky-top"
      style="top: 3.5rem; background-color: white; border-bottom: 1px solid #dee2e6;"
    >
      <h4>廣告資訊</h4>
    </div> -->
    <el-card v-for="(comment, idx) in comments" :key="idx" class="comment-card"
      :body-style="{ padding: '0.5rem 1rem' }">
      <div class="d-flex align-items-center">
        <div class="">
          <el-avatar :src="comment.avatarUrl || circleUrl" size="default" class="mx-2" shape="circle" fit="cover" />
        </div>
        <div class="text-start">
          <strong class="d-block">{{ comment.author }}</strong>
        </div>
      </div>
      <div class="text-start mt-2 px-2">
        <p>{{ comment.content }}</p>
      </div>
      <div class="text-start mt-3 px-2">
        <small>{{ comment.date }}</small>
      </div>
    </el-card>
  </div>
  <div
    class="py-3 px-2 sticky-bottom"
    style="background-color: white; border-top: 1px solid #dee2e6; z-index: 1000; width: 100%; bottom: 0;"
  >
    <!-- 未展開時的簡單輸入框 -->
    <div v-if="!isCommentExpanded" @click="expandComment" class="d-flex align-items-center simple-comment-box">
      <div class="">
        <el-avatar :src="lon || circleUrl" size="default" class="mx-2" shape="circle" fit="cover" />
      </div>
      <div class="fake-input flex-grow-1 d-flex align-items-center ">
        點擊這裡輸入留言...
      </div>
    </div>
    <div v-else>
      <div class="expand-toggle-btn" @click="toggleExpandMode">
        <i :class="[isFullExpand ? 'el-icon-arrow-down' : 'el-icon-arrow-up']"></i>
      </div>
      <div class="d-flex align-items-center">
        <div class="d-flex align-items-center">
          <div class="">
            <el-avatar :src="lon || circleUrl" size="default" class="mx-2" shape="circle" fit="cover" />
          </div>
          <div class="text-start">
            <strong class="d-block">測試</strong>
          </div>
        </div>
      </div>
      <div class="d-flex mt-2">
        <el-input
          v-model="newComment"
          placeholder="輸入留言..."
          class="comment-input"
          type="textarea"
          :rows="isFullExpand ? 50 : 5"
          resize="none"
          maxlength="200"
          show-word-limit
        />
      </div>
      <div class="d-flex mt-2 justify-content-end">
        <div class="d-flex justify-content-center mt-2">
          <el-button type="primary" size="large" @click="submitComment" :disabled="!newComment.trim()">
            送出
          </el-button>
          <el-button type="plain" size="large" @click="cancelComment" >
            取消
          </el-button>
        </div>
      </div>
    </div>
    
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElCard, ElAvatar } from 'element-plus'
import type { Advertorial, Comment } from '@/types/advertorial'
import lon from '@/assets/image/user/家倫.jpg'
import baseApi from '@/service/api'
const isCommentExpanded = ref(false)
const commentInputRef = ref(null)
const isFullExpand = ref(false)
function toggleExpandMode() {
  isFullExpand.value = !isFullExpand.value
}
// 展開留言輸入框
function expandComment() {
  isCommentExpanded.value = true
  nextTick(() => {
    // 聚焦輸入框
    if (commentInputRef.value) {
      commentInputRef.value.focus()
    }
  })
}
function cancelComment() {
  newComment.value = ''; // 清空輸入內容
  isCommentExpanded.value = false; // 收起輸入區
}
// 提交留言並收合輸入框
async function submitAndCollapse() {
  await submitComment()
  // 如果提交成功且輸入框已清空，則收合輸入框
  if (!newComment.value) {
    isCommentExpanded.value = false
  }
}

// 檢查是否應該收合輸入框
function checkAndCollapseComment() {
  // 延遲執行，避免與點擊事件衝突
  setTimeout(() => {
    // 如果輸入框為空，則收合
    if (!newComment.value.trim()) {
      isCommentExpanded.value = false
    }
  }, 200)
}

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
const comments = ref<Comment[]>([]);
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

const emit = defineEmits(['submitComment'])
async function submitComment() {
  if (!newComment.value.trim()) return;
  
  try {
    // 假設您有一個 API 可以提交留言
    await baseApi.post(`/advertorial_comment/${props.id}`, {
      content: newComment.value,
      author: '測試', // 可以替換為登入用戶名稱
      date: new Date().toLocaleString()
    });
    
    // 重新獲取留言數據
    await getAdvertorialComment(props.id);
    
    // 清空輸入框
    newComment.value = '';
    
    // 通知父組件留言已提交
    emit('submitComment');
  } catch (e: any) {
    error.value = e.message;
    console.error('提交留言失敗:', e);
  }
}
// 本地暫存新留言文字
const newComment = ref('')

// 當父組件傳入的 comments 改變時，若有需要可以做進一步處理
// watch(() => props.comments, (newVal) => {
//   // e.g. 滾動到最新一筆、重置表單之類
// })
async function getAdvertorialDeal(id) {
  try {
    const res = (await baseApi.get(`/advertorial/${id}`))
    advertorial.value = res.data.data
  } catch (e: any) {
    error.value = e.message
  }
}

async function getAdvertorialComment(id) {
  try {
    const res = (await baseApi.get(`/advertorial_comment/${id}`))
    comments.value = res.data.data
  } catch (e: any) {
    error.value = e.message
  }
}

onMounted(async () => {
  await getAdvertorialDeal(props.id);
  await getAdvertorialComment(props.id);
  isReady.value = true
})
</script>
<style scoped>
.comment-card {
  margin-bottom: 5px;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 0px ;
}

.comment-input {
  flex-grow: 1;
  margin-right: 10px;
  border-radius: 20px;
}
.comment-card {
  margin-bottom: 5px;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 0px;
}

.comment-input {
  flex-grow: 1;
  margin-right: 10px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

/* 展開按鈕樣式 */
.expand-toggle-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.expand-toggle-btn:hover {
  background-color: #e0e0e0;
}

.expand-toggle-btn i {
  font-size: 16px;
  color: #606266;
}

/* 確保過渡效果平滑 */
.el-textarea {
  transition: all 0.3s ease;
}

</style>
