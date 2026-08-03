import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.message || '网络错误'
    return Promise.reject(new Error(message))
  }
)

// ==================== 用户相关接口 ====================

// 用户注册
export const register = (userData) => {
  return api.post('/test/register', userData)
}

// 用户登录
export const login = (credentials) => {
  return api.post('/test/login', credentials)
}

// 获取当前用户信息
export const getUserProfile = () => {
  return api.get('/test/user/profile')
}

// 更新用户信息
export const updateUserProfile = (userData) => {
  return api.put('/test/user/profile', userData)
}

// 上传头像
export const uploadAvatar = (formData) => {
  return api.post('/test/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ==================== 商品相关接口 ====================

// 获取商品列表
export const getProducts = () => {
  return api.get('/test/products')
}

// 获取单个商品
export const getProductById = (id) => {
  return api.get(`/test/products/${id}`)
}

// 创建商品
export const createProduct = (productData) => {
  return api.post('/test/products', productData)
}

// 更新商品
export const updateProduct = (id, productData) => {
  return api.put(`/test/products/${id}`, productData)
}

// 删除商品
export const deleteProduct = (id) => {
  return api.delete(`/test/products/${id}`)
}

// ==================== 客户相关接口 ====================

// 获取客户列表
export const getCustomers = (params) => {
  return api.get('/test/customers', { params })
}

// 获取单个客户
export const getCustomerById = (id) => {
  return api.get(`/test/customers/${id}`)
}

// 创建客户
export const createCustomer = (customerData) => {
  return api.post('/test/customers', customerData)
}

// 更新客户
export const updateCustomer = (id, customerData) => {
  return api.put(`/test/customers/${id}`, customerData)
}

// 删除客户
export const deleteCustomer = (id) => {
  return api.delete(`/test/customers/${id}`)
}

export default api
