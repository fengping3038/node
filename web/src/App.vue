<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { computed, ref, reactive } from 'vue'
import { ElMenu, ElMenuItem, ElContainer, ElHeader, ElMain, ElDropdown, ElDropdownMenu, ElDropdownItem, ElAvatar, ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import { ArrowDown, Monitor, User, Lock, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateUserProfile, uploadAvatar } from '@/utils/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 判断是否已登录
const isLoggedIn = computed(() => !!localStorage.getItem('token'))

// 当前激活的菜单项
const activeMenu = computed(() => {
  if (route.path.startsWith('/products')) return '/products'
  if (route.path.startsWith('/customers')) return '/customers'
  return ''
})

// 导航到指定页面
const handleNavigate = (path) => {
  router.push(path)
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// ========== 个人信息对话框 ==========
const profileDialogVisible = ref(false)
const profileFormRef = ref(null)
const submitting = ref(false)

// 头像上传
const avatarFile = ref(null)
const avatarPreview = ref(userStore.user?.avatar || '')

const handleAvatarChange = (file) => {
  avatarFile.value = file.raw
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 表单数据
const profileForm = reactive({
  username: userStore.user?.username || '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
  ],
  oldPassword: [
    { validator: validateOldPassword, trigger: 'blur' }
  ],
  newPassword: [
    { validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 验证旧密码（如果需要修改密码则必填）
function validateOldPassword(rule, value, callback) {
  if (profileForm.newPassword && !value) {
    callback(new Error('修改密码需要输入当前密码'))
  } else {
    callback()
  }
}

// 验证新密码
function validateNewPassword(rule, value, callback) {
  if (value && value.length < 6) {
    callback(new Error('新密码长度至少6位'))
  } else {
    callback()
  }
}

// 验证确认密码
function validateConfirmPassword(rule, value, callback) {
  if (value !== profileForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 打开个人信息对话框
const openProfileDialog = () => {
  // 重置表单
  profileForm.username = userStore.user?.username || ''
  profileForm.oldPassword = ''
  profileForm.newPassword = ''
  profileForm.confirmPassword = ''
  avatarPreview.value = userStore.user?.avatar || ''
  avatarFile.value = null
  
  profileDialogVisible.value = true
}

// 提交个人信息
const handleSubmitProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      submitting.value = true
      
      // 准备更新数据
      const updateData = {
        username: profileForm.username
      }
      
      // 如果有新密码，则一起更新
      if (profileForm.newPassword) {
        updateData.oldPassword = profileForm.oldPassword
        updateData.newPassword = profileForm.newPassword
      }
      
      // 如果有新头像，先上传头像
      if (avatarFile.value) {
        const formData = new FormData()
        formData.append('avatar', avatarFile.value)
        
        try {
          const uploadRes = await uploadAvatar(formData)
          
          if (uploadRes.code === 200) {
            updateData.avatar = uploadRes.data.avatar
          }
        } catch (error) {
          console.error('头像上传失败:', error)
          // 头像上传失败不影响其他信息更新
        }
      }
      
      // 调用API更新用户信息
      const response = await updateUserProfile(updateData)
      
      if (response.code === 200) {
        // 更新本地store
        const updatedUser = {
          ...userStore.user,
          ...response.data
        }
        userStore.setUser(updatedUser, userStore.token)
        
        ElMessage.success('个人信息更新成功')
        profileDialogVisible.value = false
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (error) {
      ElMessage.error(error.message || '更新失败，请重试')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<template>
  <div class="app-container">
    <!-- 未登录状态：直接显示路由视图 -->
    <RouterView v-if="!isLoggedIn" />
    
    <!-- 已登录状态：带导航栏的布局 -->
    <ElContainer v-else class="sci-fi-layout">
      <ElHeader class="sci-fi-header">
        <div class="header-content">
          <div class="logo-section">
            <el-icon :size="32" class="logo-icon"><Monitor /></el-icon>
            <h1 class="logo-text">电商管理系统</h1>
          </div>
          
          <ElMenu 
            :default-active="activeMenu" 
            mode="horizontal"
            @select="handleNavigate"
            class="sci-fi-menu"
          >
            <ElMenuItem index="/products">商品管理</ElMenuItem>
            <ElMenuItem index="/customers">客户管理</ElMenuItem>
          </ElMenu>
          
          <ElDropdown class="user-dropdown-wrapper">
            <span class="user-dropdown">
              <ElAvatar 
                :size="36" 
                :src="userStore.user?.avatar || ''"
                class="user-avatar"
              >
                {{ userStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
              </ElAvatar>
              <span class="username">{{ userStore.user?.username || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <ElDropdownMenu class="sci-fi-dropdown">
                <ElDropdownItem @click="openProfileDialog">
                  <el-icon><User /></el-icon>
                  个人信息
                </ElDropdownItem>
                <ElDropdownItem divided @click="handleLogout">
                  <el-icon><Lock /></el-icon>
                  退出登录
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
        
        <!-- 装饰性线条 -->
        <div class="header-glow-line"></div>
      </ElHeader>
      
      <ElMain class="sci-fi-main">
        <RouterView />
      </ElMain>
    </ElContainer>
    
    <!-- 个人信息对话框 -->
    <ElDialog
      v-model="profileDialogVisible"
      title="个人信息"
      width="600px"
      class="profile-dialog"
    >
      <ElForm
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="100px"
        class="profile-form"
      >
        <!-- 头像上传 -->
        <ElFormItem label="头像">
          <div class="avatar-upload">
            <ElAvatar :size="100" :src="avatarPreview" class="avatar-preview">
              {{ profileForm.username?.charAt(0)?.toUpperCase() || 'U' }}
            </ElAvatar>
            <ElUpload
              :show-file-list="false"
              :before-upload="() => false"
              :on-change="handleAvatarChange"
              accept="image/*"
            >
              <ElButton type="primary" size="small">
                <el-icon><Upload /></el-icon>
                更换头像
              </ElButton>
            </ElUpload>
          </div>
        </ElFormItem>
        
        <!-- 用户名 -->
        <ElFormItem label="用户名" prop="username">
          <ElInput v-model="profileForm.username" placeholder="请输入用户名" />
        </ElFormItem>
        
        <!-- 分隔线 -->
        <ElFormItem>
          <div class="section-divider">
            <span>修改密码（可选）</span>
          </div>
        </ElFormItem>
        
        <!-- 旧密码 -->
        <ElFormItem label="当前密码" prop="oldPassword">
          <ElInput 
            v-model="profileForm.oldPassword" 
            type="password" 
            placeholder="输入当前密码以修改密码"
            show-password
          />
        </ElFormItem>
        
        <!-- 新密码 -->
        <ElFormItem label="新密码" prop="newPassword">
          <ElInput 
            v-model="profileForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password
          />
        </ElFormItem>
        
        <!-- 确认新密码 -->
        <ElFormItem label="确认密码" prop="confirmPassword">
          <ElInput 
            v-model="profileForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </ElFormItem>
      </ElForm>
      
      <template #footer>
        <ElButton @click="profileDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmitProfile" :loading="submitting">
          保存
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1235 100%);
}

/* ========== 科幻风格布局 ========== */
.sci-fi-layout {
  min-height: 100vh;
  background: transparent;
}

/* ========== 头部样式 ========== */
.sci-fi-header {
  position: relative;
  background: rgba(10, 14, 39, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  padding: 0 30px;
  height: 70px;
  display: flex;
  align-items: center;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 30px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.logo-icon {
  color: #00ffff;
  animation: logoPulse 3s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% { 
    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
  }
  50% { 
    filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.8));
  }
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #00ffff 0%, #00bfff 50%, #00ffff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleShine 3s linear infinite;
  letter-spacing: 2px;
  margin: 0;
}

@keyframes titleShine {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

/* ========== 菜单样式 ========== */
.sci-fi-menu {
  flex: 1;
  background: transparent !important;
  border-bottom: none !important;
}

.sci-fi-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.7) !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.3s ease;
  font-size: 15px;
  letter-spacing: 1px;
}

.sci-fi-menu :deep(.el-menu-item:hover) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.05) !important;
  border-bottom-color: rgba(0, 255, 255, 0.6) !important;
}

.sci-fi-menu :deep(.el-menu-item.is-active) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.08) !important;
  border-bottom-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

/* ========== 用户下拉菜单 ========== */
.user-dropdown-wrapper {
  flex-shrink: 0;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 255, 255, 0.2);
  background: rgba(0, 255, 255, 0.03);
}

.user-dropdown:hover {
  border-color: rgba(0, 255, 255, 0.6);
  background: rgba(0, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.user-avatar {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 191, 255, 0.2));
  border: 2px solid rgba(0, 255, 255, 0.4);
  color: #00ffff;
  font-weight: 600;
}

.username {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
}

.user-dropdown .el-icon {
  color: rgba(0, 255, 255, 0.6);
}

/* 下拉菜单样式 */
.sci-fi-dropdown {
  background: rgba(10, 14, 39, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
}

.sci-fi-dropdown :deep(.el-dropdown-menu__item) {
  color: rgba(255, 255, 255, 0.8) !important;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sci-fi-dropdown :deep(.el-dropdown-menu__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

.sci-fi-dropdown :deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}

/* ========== 发光线条 ========== */
.header-glow-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  opacity: 0.5;
  animation: lineGlow 2s ease-in-out infinite;
}

@keyframes lineGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* ========== 主内容区 ========== */
.sci-fi-main {
  background: transparent;
  padding: 30px;
  min-height: calc(100vh - 70px);
}

/* ========== 个人信息对话框样式 ========== */
.profile-dialog :deep(.el-dialog) {
  background: rgba(10, 14, 39, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.2);
}

.profile-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.15);
  padding: 20px 25px;
}

.profile-dialog :deep(.el-dialog__title) {
  color: #00ffff;
  font-weight: 600;
  letter-spacing: 1px;
}

.profile-dialog :deep(.el-dialog__close) {
  color: rgba(0, 255, 255, 0.6);
  
  &:hover {
    color: #00ffff;
  }
}

.profile-dialog :deep(.el-dialog__body) {
  padding: 25px;
}

.profile-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* 头像上传区域 */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-preview {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 191, 255, 0.2));
  border: 2px solid rgba(0, 255, 255, 0.4);
  color: #00ffff;
  font-weight: 600;
  font-size: 36px;
}

/* 分隔线 */
.section-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-divider span {
  background: rgba(10, 14, 39, 0.95);
  padding: 0 15px;
  color: rgba(0, 255, 255, 0.8);
  font-size: 14px;
  letter-spacing: 1px;
}

/* 输入框样式 */
.profile-form :deep(.el-input__wrapper) {
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

.profile-form :deep(.el-input__inner) {
  color: #ffffff !important;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4) !important;
  }
}

/* 按钮样式 */
.profile-dialog :deep(.el-button--primary) {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 191, 255, 0.2));
  border: 1px solid rgba(0, 255, 255, 0.4);
  color: #00ffff;
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 191, 255, 0.3));
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .sci-fi-header {
    padding: 0 15px;
    height: 60px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .sci-fi-main {
    padding: 15px;
  }
  
  .username {
    display: none;
  }
  
  .avatar-upload {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
