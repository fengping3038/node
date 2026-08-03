import { defineStore } from 'pinia'
import { ref } from 'vue'
import { register as registerAPI, login as loginAPI } from '@/utils/api'

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 恢复用户信息
  const savedUser = localStorage.getItem('userInfo')
  const user = ref(savedUser ? JSON.parse(savedUser) : null)
  const token = ref(localStorage.getItem('token') || '')

  // 用户注册
  const register = async (userData) => {
    try {
      const response = await registerAPI(userData)
      
      // 检查注册是否成功
      if (response.code === 201) {
        return response
      } else {
        throw new Error(response.message || '注册失败')
      }
    } catch (error) {
      // 如果error已经是Error对象，直接抛出
      if (error instanceof Error) {
        throw error
      }
      // 否则创建新的Error对象
      throw new Error(error.message || '注册失败，请重试')
    }
  }

  // 用户登录
  const login = async (credentials) => {
    try {
      const response = await loginAPI(credentials)
      
      // 检查登录是否成功
      if (response.code === 200 && response.data) {
        setUser(response.data.user, response.data.token)
        return response
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      // 如果error已经是Error对象，直接抛出
      if (error instanceof Error) {
        throw error
      }
      // 否则创建新的Error对象
      throw new Error(error.message || '登录失败，请重试')
    }
  }

  const setUser = (userData, userToken) => {
    user.value = userData
    token.value = userToken
    localStorage.setItem('token', userToken)
    localStorage.setItem('userInfo', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    user,
    token,
    register,
    login,
    setUser,
    logout
  }
})