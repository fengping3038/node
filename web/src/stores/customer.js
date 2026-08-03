import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '../utils/api'

export const useCustomerStore = defineStore('customer', () => {
  // 状态
  const customers = ref([])
  const currentCustomer = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0
  })

  // 计算属性
  const customerCount = computed(() => pagination.value.total)

  // 操作
  const fetchCustomers = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await getCustomers({
        page: params.page || pagination.value.page,
        limit: params.limit || pagination.value.limit,
        status: params.status,
        keyword: params.keyword
      })
      
      if (response.code === 200) {
        customers.value = response.data.list
        pagination.value = {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total
        }
      } else {
        error.value = response.message
      }
    } catch (err) {
      error.value = err.message
      console.error('获取客户列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCustomerById = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await getCustomerById(id)
      
      if (response.code === 200) {
        currentCustomer.value = response.data
      } else {
        error.value = response.message
      }
    } catch (err) {
      error.value = err.message
      console.error('获取客户详情失败:', err)
    } finally {
      loading.value = false
    }
  }

  const addCustomer = async (customerData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await createCustomer(customerData)
      
      if (response.code === 201) {
        // 重新获取列表以更新数据
        await fetchCustomers()
        return response.data
      } else {
        error.value = response.message
        throw new Error(response.message)
      }
    } catch (err) {
      error.value = err.message
      console.error('创建客户失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const editCustomer = async (id, customerData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await updateCustomer(id, customerData)
      
      if (response.code === 200) {
        // 更新列表中的对应项
        const index = customers.value.findIndex(c => c.id === id)
        if (index !== -1) {
          customers.value[index] = response.data
        }
        return response.data
      } else {
        error.value = response.message
        throw new Error(response.message)
      }
    } catch (err) {
      error.value = err.message
      console.error('更新客户失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeCustomer = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await deleteCustomer(id)
      
      if (response.code === 200) {
        // 从列表中移除
        customers.value = customers.value.filter(c => c.id !== id)
        pagination.value.total -= 1
      } else {
        error.value = response.message
        throw new Error(response.message)
      }
    } catch (err) {
      error.value = err.message
      console.error('删除客户失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearCurrentCustomer = () => {
    currentCustomer.value = null
  }

  return {
    // 状态
    customers,
    currentCustomer,
    loading,
    error,
    pagination,
    
    // 计算属性
    customerCount,
    
    // 操作
    fetchCustomers,
    fetchCustomerById,
    addCustomer,
    editCustomer,
    removeCustomer,
    clearCurrentCustomer
  }
})
