import { ref, computed } from 'vue'
import router from '@/router'
import { defineStore } from 'pinia'

import LoginViewIO from '@/io/LoginViewIO'

export const useUserInfoStore = defineStore('userInfo', () => {
  let _idleLimitSec = 0

  const _userName = ref(sessionStorage.getItem('userName') || '')
  const userName = computed(() => _userName)

  const _userId = ref(sessionStorage.getItem('userId') || '')
  const userId = computed(() => _userId)

  const _permissionList = ref(JSON.stringify(sessionStorage.getItem('permissionList')) || null)
  const permissionList = computed(() => _permissionList)

  const _groupName = ref(sessionStorage.getItem('groupName') || '')
  const groupName = computed(() => _groupName)

  const isLogin = computed(() => (_userId.value ? true : false))

  // 設定登入資訊
  const setLoginUserInfo = (userName_para: string, userId_para: string, permissionList_para: [], groupName_para: string) => {
    sessionStorage.setItem('userName', userName_para)
    sessionStorage.setItem('userId', userId_para)
    sessionStorage.setItem('permissionList', JSON.stringify(permissionList_para))
    sessionStorage.setItem('groupName', groupName_para)
    _userName.value = userName_para
    _userId.value = userId_para
    _permissionList.value = JSON.stringify(permissionList_para)
    _groupName.value = groupName_para
    resetCurrentIdleSec()
  }

  // 登出
  const logout = async () => {
    await LoginViewIO.logout()

    sessionStorage.removeItem('userName')
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem('maxIdleTime')
    sessionStorage.removeItem('permissionList')
    sessionStorage.removeItem('groupName')
    _userName.value = ''
    _userId.value = ''
    _permissionList.value = ''
    _groupName.value = ''
  }

  // 檢查登入狀態並轉導至對應的頁面
  const checkLoginStateAndRouting = (path: string = '') => {
    if (isLogin.value) {
      if (location.pathname === '/login') {
        router.replace('/label')
      }

      if (path) {
        router.replace(path)
      }
    } else {
      router.replace('/login')
    }
  }

  // 重置最大閒置時機避免登出
  const resetCurrentIdleSec = () => {
    if (isLogin.value) {
      sessionStorage.setItem('maxIdleTime', (Date.now() + _idleLimitSec * 1000).toString())
    }
  }

  // 設定自動登出前的閒置時間
  const setIdleLogout = (idleLimitSec: number) => {
    _idleLimitSec = idleLimitSec

    if (_idleLimitSec) {
      resetCurrentIdleSec()

      // 定期檢查是否已經超時
      setInterval(async () => {
        // console.log(
        //   `isLogin.value:${isLogin.value}, Date.now():${Date.now()}, maxIdleTime:${parseInt(
        //     sessionStorage.getItem('maxIdleTime') ?? '0'
        //   )}`
        // )
        // 如果有登入且當下閒置的秒數大於等於設定的上限就登出
        if (
          (isLogin.value || !location.pathname.includes('/login')) &&
          Date.now() >= parseInt(sessionStorage.getItem('maxIdleTime') ?? '0')
        ) {
          // console.log(`Idle timeout do logout`)
          await logout()
          checkLoginStateAndRouting()
        }
      }, 1000)
    }
  }

  // 當頁面上有點擊事件時，重置最大閒置時機避免登出
  window.addEventListener('click', resetCurrentIdleSec)

  return {
    permissionList,
    groupName,
    userName,
    userId,
    isLogin,
    setLoginUserInfo,
    logout,
    checkLoginStateAndRouting,
    setIdleLogout
  }
})
