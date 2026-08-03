<template>
  <div class="products-container">
    <!-- 头部导航 -->
    <el-card class="header-card">
      <div class="header-content">
        <h1>电商管理系统</h1>
        <div class="user-info">
          <span>欢迎，{{ userStore.user?.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="content-card">
      <template #header>
        <div class="card-header">
          <h2>商品列表</h2>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品名称"
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="手机" value="手机" />
          <el-option label="电脑" value="电脑" />
          <el-option label="配件" value="配件" />
        </el-select>
      </div>

      <!-- 表格 -->
      <el-table
        :data="filteredProducts"
        stripe
        style="width: 100%; margin-top: 20px"
        max-height="500"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 统计信息 -->
      <div class="statistics">
        <el-statistic title="商品总数" :value="productStore.products.length" />
        <el-statistic title="库存总量" :value="totalStock" />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="productForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="手机" value="手机" />
            <el-option label="电脑" value="电脑" />
            <el-option label="配件" value="配件" />
          </el-select>
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="productForm.stock"
            :min="0"
            :step="10"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()

const searchKeyword = ref('')
const selectedCategory = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingProductId = ref(null)
const loading = ref(false)

const productFormRef = ref(null)

const productForm = reactive({
  name: '',
  price: 0,
  description: '',
  stock: 0,
  category: ''
})

const rules = reactive({
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在2-100个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ]
})

// 过滤后的商品列表
const filteredProducts = computed(() => {
  let result = productStore.products

  if (searchKeyword.value) {
    result = result.filter(p => 
      p.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  return result
})

// 总库存
const totalStock = computed(() => {
  return productStore.products.reduce((sum, p) => sum + p.stock, 0)
})

// 页面加载时获取商品数据
onMounted(async () => {
  await loadProducts()
})

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    await productStore.fetchProducts()
  } catch (error) {
    ElMessage.error('加载商品列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在computed中实现
}

// 新增商品
const handleAdd = () => {
  isEdit.value = false
  editingProductId.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  isEdit.value = true
  editingProductId.value = row.id || null
  Object.assign(productForm, row)
  dialogVisible.value = true
}

// 删除商品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (row.id) {
      await productStore.deleteProduct(row.id)
      ElMessage.success('删除成功')
      // 重新加载列表
      await loadProducts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!productFormRef.value) return
  
  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value && editingProductId.value !== null) {
          // 编辑
          await productStore.updateProduct(editingProductId.value, productForm)
          ElMessage.success('更新成功')
        } else {
          // 新增
          await productStore.addProduct({ ...productForm })
          ElMessage.success('添加成功')
        }
        
        dialogVisible.value = false
        // 重新加载列表
        await loadProducts()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

// 重置表单
const resetForm = () => {
  productForm.name = ''
  productForm.price = 0
  productForm.description = ''
  productForm.stock = 0
  productForm.category = ''
  productFormRef.value?.clearValidate()
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

</script>

<style scoped>
.products-container {
  min-height: calc(100vh - 70px);
  background: transparent;
}

/* ========== 卡片样式 ========== */
.header-card, .content-card {
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.1),
    inset 0 0 30px rgba(0, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.header-card:hover, .content-card:hover {
  border-color: rgba(0, 255, 255, 0.4);
  box-shadow: 
    0 0 40px rgba(0, 255, 255, 0.15),
    inset 0 0 40px rgba(0, 255, 255, 0.08);
}

.header-card {
  margin-bottom: 25px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #00ffff 0%, #00bfff 50%, #00ffff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleShine 3s linear infinite;
  letter-spacing: 2px;
}

@keyframes titleShine {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  letter-spacing: 1px;
}

/* ========== 内容卡片头部 ========== */
.content-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.15);
  padding: 20px 25px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #00ffff;
  letter-spacing: 1px;
}

/* ========== 搜索栏 ========== */
.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px 25px;
  background: rgba(0, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.search-bar :deep(.el-input__wrapper),
.search-bar :deep(.el-select .el-input__wrapper) {
  background: rgba(0, 255, 255, 0.05) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
}

.search-bar :deep(.el-input__wrapper:hover),
.search-bar :deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.08) !important;
}

.search-bar :deep(.el-input__inner) {
  color: #ffffff !important;
}

.search-bar :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

.search-bar :deep(.el-icon) {
  color: rgba(0, 255, 255, 0.6) !important;
}

/* ========== 表格样式 ========== */
.content-card :deep(.el-table) {
  background: transparent;
  color: #000000;
}

.content-card :deep(.el-table th) {
  background: rgba(0, 255, 255, 0.08) !important;
  color: #000000 !important;
  font-weight: 600;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.content-card :deep(.el-table td) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  color: #000000;
}

.content-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(0, 255, 255, 0.02) !important;
}

.content-card :deep(.el-table__body tr:hover > td) {
  background: rgba(0, 255, 255, 0.08) !important;
}

.content-card :deep(.el-table__empty-text) {
  color: rgba(0, 0, 0, 0.5);
}

/* ========== 按钮样式 ========== */
.sci-fi-button {
  position: relative;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 191, 255, 0.2));
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 8px;
  color: #00ffff;
  font-weight: 600;
  letter-spacing: 1px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 191, 255, 0.3));
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* 危险按钮 */
.el-button--danger {
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.2), rgba(255, 107, 129, 0.2));
  border: 1px solid rgba(255, 71, 87, 0.4);
  color: #ff4757;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 71, 87, 0.3), rgba(255, 107, 129, 0.3));
    border-color: rgba(255, 71, 87, 0.8);
    box-shadow: 0 0 20px rgba(255, 71, 87, 0.3);
  }
}

/* ========== 对话框样式 ========== */
:deep(.el-dialog) {
  background: rgba(10, 14, 39, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.2);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.15);
  padding: 20px 25px;
}

:deep(.el-dialog__title) {
  color: #00ffff;
  font-weight: 600;
  letter-spacing: 1px;
}

:deep(.el-dialog__close) {
  color: rgba(0, 255, 255, 0.6);
  
  &:hover {
    color: #00ffff;
  }
}

:deep(.el-dialog__body) {
  padding: 25px;
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-input__wrapper) {
  background: rgba(0, 255, 255, 0.05) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 255, 255, 0.4) !important;
    background: rgba(0, 255, 255, 0.08) !important;
  }
  
  &.is-focus {
    border-color: rgba(0, 255, 255, 0.6) !important;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2) !important;
  }
}

:deep(.el-input__inner) {
  color: #ffffff !important;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4) !important;
  }
}

:deep(.el-textarea__inner) {
  background: rgba(0, 255, 255, 0.05) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #ffffff !important;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4) !important;
  }
  
  &:focus {
    border-color: rgba(0, 255, 255, 0.6) !important;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2) !important;
  }
}

:deep(.el-select-dropdown) {
  background: rgba(10, 14, 39, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
}

:deep(.el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.8) !important;
  
  &:hover {
    background: rgba(0, 255, 255, 0.1) !important;
    color: #00ffff !important;
  }
  
  &.selected {
    color: #00ffff !important;
  }
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: rgba(0, 255, 255, 0.05);
  border-color: rgba(0, 255, 255, 0.2);
  color: rgba(0, 255, 255, 0.6);
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    color: #00ffff;
  }
}

:deep(.el-input-number__inner) {
  background: rgba(0, 255, 255, 0.05);
  border-color: rgba(0, 255, 255, 0.2);
  color: #ffffff;
}

/* ========== 统计信息 ========== */
.statistics {
  display: flex;
  gap: 40px;
  margin-top: 30px;
  padding: 25px;
  background: rgba(0, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.statistics :deep(.el-statistic__head) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  letter-spacing: 1px;
}

.statistics :deep(.el-statistic__content) {
  color: #00ffff;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }
  
  .statistics {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
