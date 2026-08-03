import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Product {
  id?: number
  name: string
  price: number
  description: string
  stock: number
  category: string
  image?: string
}

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 7999,
      description: '苹果最新旗舰手机，搭载A17 Pro芯片',
      stock: 100,
      category: '手机',
      image: 'https://via.placeholder.com/200'
    },
    {
      id: 2,
      name: 'MacBook Pro 14',
      price: 14999,
      description: '专业级笔记本电脑，M3 Pro芯片',
      stock: 50,
      category: '电脑',
      image: 'https://via.placeholder.com/200'
    },
    {
      id: 3,
      name: 'AirPods Pro 2',
      price: 1899,
      description: '主动降噪无线耳机',
      stock: 200,
      category: '配件',
      image: 'https://via.placeholder.com/200'
    }
  ])

  const addProduct = (product: Product) => {
    const newId = Math.max(...products.value.map(p => p.id || 0)) + 1
    product.id = newId
    products.value.push(product)
  }

  const updateProduct = (id: number, updatedProduct: Product) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value[index] = { ...updatedProduct, id }
    }
  }

  const deleteProduct = (id: number) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value.splice(index, 1)
    }
  }

  const getProductById = (id: number) => {
    return products.value.find(p => p.id === id)
  }

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById
  }
})
