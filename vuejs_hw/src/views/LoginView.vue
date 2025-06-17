<template>
  <el-row justify="center" style="margin-top: 10%">
    <el-col :span="6"> </el-col>
    <el-col :span="12">
      <el-row justify="center">
        <el-text style="font-size: 60px; margin-bottom: 10%">Auto Repair VOR</el-text>
      </el-row>
      <el-row justify="center">
        <el-col :span="6">
          <el-input @keyup.enter="login" v-model="loginInfo.userId" placeholder="工號" />
        </el-col>
      </el-row>
      <el-row justify="center">
        <el-col :span="6">
          <el-input
            @keyup.enter="login"
            v-model="loginInfo.password"
            type="password"
            placeholder="密碼"
          />
        </el-col>
      </el-row>
      <el-row> </el-row>
      <el-row justify="center">
        <el-button
          @click="login"
          :disabled="!loginInfo.userId || !loginInfo.password"
          type="primary"
          >登入</el-button
        >
      </el-row>
    </el-col>
    <el-col :span="6"> </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

import { useUserInfoStore } from '@/stores/userInfo'
import LoginViewIO from '@/io/LoginViewIO'
import { ElMessage } from 'element-plus'

const userInfoStore = useUserInfoStore()
userInfoStore.checkLoginStateAndRouting('/label')

let loginInfo = reactive({
  userId: '',
  password: ''
})

async function login() {
  if (loginInfo.userId && loginInfo.password) {
    // if (!/^\d+$/.test(loginInfo.userId)) {
    //   ElMessage({
    //     showClose: true,
    //     message: '工號應為數字',
    //     type: 'error'
    //   })
    //   return
    // }
    loginInfo.userId = loginInfo.userId.toUpperCase()
    let userInfo = (await LoginViewIO.login(loginInfo.userId, loginInfo.password)).data

    if (userInfo && userInfo.isOk) {
      userInfoStore.setLoginUserInfo(userInfo.userName, userInfo.userId, userInfo.permissionList, userInfo.groupName)
      loginInfo.userId = ''
      loginInfo.password = ''
      userInfoStore.checkLoginStateAndRouting('/label')
    }
  }
}
</script>

<style scoped>
.el-row {
  margin: 5px;
}
</style>
