import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct as updateProductAPI, 
  deleteProduct as deleteProductAPI 
} from '@/utils/api'

export const useProductStore = defineStore('product', () => {
  const products = ref([])

  // 获取所有商品
  const fetchProducts = async () => {
    try {
      const response = await getProducts()
      if (response.code === 200) {
        products.value = response.data
      }
      return response
    } catch (error) {
      throw error
    }
  }

  // 根据ID获取商品
  const fetchProductById = async (id) => {
    try {
      const response = await getProductById(id)
      return response
    } catch (error) {
      throw error
    }
  }

  // 添加商品
  const addProduct = async (productData) => {
    try {
      const response = await createProduct(productData)
      if (response.code === 201) {
        products.value.push(response.data)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  // 更新商品
  const updateProduct = async (id, productData) => {
    try {
      const response = await updateProductAPI(id, productData)
      if (response.code === 200) {
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index] = response.data
        }
      }
      return response
    } catch (error) {
      throw error
    }
  }

  // 删除商品
  const deleteProduct = async (id) => {
    try {
      const response = await deleteProductAPI(id)
      if (response.code === 200) {
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value.splice(index, 1)
        }
      }
      return response
    } catch (error) {
      throw error
    }
  }

  return {
    products,
    fetchProducts,
    fetchProductById,
    addProduct,
    updateProduct,
    deleteProduct
  }
})