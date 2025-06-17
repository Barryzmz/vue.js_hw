import axios from 'axios'
import { ElLoading, ElMessage } from 'element-plus'

import { useUserInfoStore } from '@/stores/userInfo'

axios.defaults.baseURL = import.meta.env.VITE_API_PREFIX_PATH || ''
// console.log('axios.defaults.baseURL', axios.defaults.baseURL)

axios.interceptors.request.use(
  function (config) {
    if (import.meta.env.DEV) {
      console.log('axios.request', config)
    }

    ElLoading.service({ fullscreen: true, visible: true }).visible.value = true
    return config
  },
  function (error) {
    if (import.meta.env.DEV) {
      console.log('axios.request.error', error)
    }
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  function (response) {
    if (import.meta.env.DEV) {
      console.log('axios.response', response)
    }

    ElLoading.service({ fullscreen: true, visible: false }).visible.value = false

    if (response.data) {
      if (response.data.msg == 'notFound') {
        ElMessage({
          showClose: true,
          message: '暫無新點位需維修，請耐心等候',
          type: 'warning'
        })
      } else if (!response.data.isOk) {
        ElMessage({
          showClose: true,
          message: response.data.msg || 'something wrong',
          type: 'error'
        })
        throw new Error(response.data.msg)
      }
    }

    return response
  },
  async function (error) {
    if (import.meta.env.DEV) {
      console.log('axios.response.error', error)
    }

    let msg = 'something wrong'

    if (error.response.status === 401) {
      msg = 'Auth Error, Return to Login Page'
      const userInfoStore = useUserInfoStore()
      await userInfoStore.logout()
      userInfoStore.checkLoginStateAndRouting()
    } else if (error.response.data && error.response.data.msg) {
      msg = error.response.data.msg
    }

    ElMessage({
      showClose: true,
      message: msg,
      type: 'error'
    })

    ElLoading.service({ fullscreen: true, visible: false }).visible.value = false
    return Promise.reject(error)
  }
)
