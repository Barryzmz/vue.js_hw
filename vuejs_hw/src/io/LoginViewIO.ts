import axios from 'axios'

import '@/io'

export async function login(userId: string, password: string) {
  return await axios.post('/api/authorization/login', {
    userId: userId,
    password: password
  })
}

export async function logout() {
  return await axios.get('/api/authorization/logout')
}

export default {
  login,
  logout
}
