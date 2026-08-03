<template>
  <div class="customers-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增客户
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="姓名或邮箱" 
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="活跃" value="active" />
            <el-option label="VIP" value="vip" />
            <el-option label="非活跃" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 客户列表 -->
      <el-table 
        :data="customerStore.customers" 
        v-loading="customerStore.loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID"  />
        <el-table-column label="姓名" >
          <template #default="{ row }">
            {{ row.firstName }}{{ row.lastName }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱"/>
        <el-table-column prop="phone" label="电话"  />
        <el-table-column label="地区" >
          <template #default="{ row }">
            {{ row.province || '-' }} {{ row.city || '' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalSpent" label="总消费">
          <template #default="{ row }">
            ¥{{ Number(row.totalSpent).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="customerStore.pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle"
      width="600px"
    >
      <el-form 
        ref="formRef"
        :model="formData" 
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓" prop="firstName">
              <el-input v-model="formData.firstName" placeholder="请输入姓" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名" prop="lastName">
              <el-input v-model="formData.lastName" placeholder="请输入名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入电话" />
        </el-form-item>
        
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入详细地址" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="省份" prop="province">
              <el-input v-model="formData.province" placeholder="请输入省份" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市" prop="city">
              <el-input v-model="formData.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮政编码" prop="postalCode">
              <el-input v-model="formData.postalCode" placeholder="请输入邮政编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="国家" prop="country">
              <el-input v-model="formData.country" placeholder="请输入国家" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">活跃</el-radio>
            <el-radio label="vip">VIP</el-radio>
            <el-radio label="inactive">非活跃</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="总消费" prop="totalSpent">
          <el-input-number 
            v-model="formData.totalSpent" 
            :min="0" 
            :precision="2"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="客户详情" width="600px">
      <el-descriptions :column="2" border v-if="viewData">
        <el-descriptions-item label="ID">{{ viewData.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ viewData.firstName }}{{ viewData.lastName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱" :span="2">{{ viewData.email }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ viewData.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(viewData.status)">
            {{ getStatusText(viewData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ viewData.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="地区">{{ viewData.province || '-' }} {{ viewData.city || '' }}</el-descriptions-item>
        <el-descriptions-item label="邮政编码">{{ viewData.postalCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="国家">{{ viewData.country || '-' }}</el-descriptions-item>
        <el-descriptions-item label="总消费">¥{{ Number(viewData.totalSpent).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ formatDate(viewData.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useCustomerStore } from '../stores/customer'

const customerStore = useCustomerStore()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 10
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitting = ref(false)

// 表单
const formRef = ref(null)
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  country: '中国',
  status: 'active',
  totalSpent: 0
})

const formRules = {
  firstName: [{ required: true, message: '请输入姓', trigger: 'blur' }],
  lastName: [{ required: true, message: '请输入名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 查看详情
const viewDialogVisible = ref(false)
const viewData = ref(null)

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    active: 'success',
    vip: 'warning',
    inactive: 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    active: '活跃',
    vip: 'VIP',
    inactive: '非活跃'
  }
  return texts[status] || status
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 加载客户列表
const loadCustomers = async () => {
  await customerStore.fetchCustomers({
    page: pagination.page,
    limit: pagination.limit,
    ...searchForm
  })
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadCustomers()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  pagination.page = 1
  loadCustomers()
}

// 分页变化
const handleSizeChange = (val) => {
  pagination.limit = val
  pagination.page = 1
  loadCustomers()
}

const handlePageChange = (val) => {
  pagination.page = val
  loadCustomers()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增客户'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑客户'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  viewData.value = row
  viewDialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await customerStore.removeCustomer(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      submitting.value = true
      
      if (isEdit.value) {
        await customerStore.editCustomer(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await customerStore.addCustomer(formData)
        ElMessage.success('创建成功')
      }
      
      dialogVisible.value = false
      loadCustomers()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: '中国',
    status: 'active',
    totalSpent: 0
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 初始化
onMounted(() => {
  loadCustomers()
})
</script>

<style scoped>
.customers-page {
  min-height: calc(100vh - 70px);
  background: transparent;
}

/* ========== 卡片样式 ========== */
.customers-page :deep(.el-card) {
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.1),
    inset 0 0 30px rgba(0, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.customers-page :deep(.el-card:hover) {
  border-color: rgba(0, 255, 255, 0.4);
  box-shadow: 
    0 0 40px rgba(0, 255, 255, 0.15),
    inset 0 0 40px rgba(0, 255, 255, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 20px;
  font-weight: 600;
  color: #00ffff;
  letter-spacing: 1px;
}

/* ========== 搜索表单 ========== */
.search-form {
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(0, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.search-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8);
}

.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select .el-input__wrapper) {
  background: rgba(0, 255, 255, 0.05) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
}

.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.08) !important;
}

.search-form :deep(.el-input__inner) {
  color: #ffffff !important;
}

.search-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

.search-form :deep(.el-icon) {
  color: rgba(0, 255, 255, 0.6) !important;
}

/* ========== 表格样式 ========== */
.customers-page :deep(.el-table) {
  background: transparent;
  color: #000000;
}

.customers-page :deep(.el-table th) {
  background: rgba(0, 255, 255, 0.08) !important;
  color: #000000 !important;
  font-weight: 600;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.customers-page :deep(.el-table td) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  color: #000000;
}

.customers-page :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(0, 255, 255, 0.02) !important;
}

.customers-page :deep(.el-table__body tr:hover > td) {
  background: rgba(0, 255, 255, 0.08) !important;
}

.customers-page :deep(.el-table__empty-text) {
  color: rgba(0, 0, 0, 0.5);
}

/* ========== 标签样式 ========== */
.customers-page :deep(.el-tag) {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  
  &.el-tag--success {
    background: rgba(103, 194, 58, 0.1);
    border-color: rgba(103, 194, 58, 0.3);
    color: #67c23a;
  }
  
  &.el-tag--warning {
    background: rgba(230, 162, 60, 0.1);
    border-color: rgba(230, 162, 60, 0.3);
    color: #e6a23c;
  }
  
  &.el-tag--info {
    background: rgba(144, 147, 153, 0.1);
    border-color: rgba(144, 147, 153, 0.3);
    color: #909399;
  }
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

/* 默认按钮 */
.el-button:not(.el-button--primary):not(.el-button--danger) {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  color: rgba(0, 255, 255, 0.8);
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: rgba(0, 255, 255, 0.4);
    color: #00ffff;
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

:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #00ffff;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

:deep(.el-radio__label) {
  color: rgba(255, 255, 255, 0.8);
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

/* ========== 描述列表样式 ========== */
:deep(.el-descriptions) {
  background: rgba(0, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

:deep(.el-descriptions__label) {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 255, 255, 0.05);
}

:deep(.el-descriptions__content) {
  color: rgba(255, 255, 255, 0.9);
}

/* ========== 分页样式 ========== */
:deep(.el-pagination) {
  margin-top: 25px;
}

:deep(.el-pagination button),
:deep(.el-pager li) {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: rgba(0, 255, 255, 0.4);
    color: #00ffff;
  }
  
  &.is-active {
    background: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.6);
    color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }
}

:deep(.el-pagination__total),
:deep(.el-pagination__jump) {
  color: rgba(255, 255, 255, 0.7);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .search-form :deep(.el-form--inline .el-form-item) {
    margin-right: 0;
    margin-bottom: 15px;
  }
}
</style>
