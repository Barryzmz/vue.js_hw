<template>
  <RouterView />
</template>

<script lang="ts" setup>
import { RouterView } from 'vue-router'

import { useUserInfoStore } from '@/stores/userInfo'

const userInfoStore = useUserInfoStore()
// 設定無操作幾秒自動登出
userInfoStore.setIdleLogout(15 * 60)
userInfoStore.checkLoginStateAndRouting()

console.log('PACKAGE_VERSION:', import.meta.env.PACKAGE_VERSION)
</script>
