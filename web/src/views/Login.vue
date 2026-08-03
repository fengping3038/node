<template>
  <div class="login-container">
    <!-- 动态背景粒子效果 -->
    <div class="particles">
      <div class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
    </div>
    
    <!-- 网格背景 -->
    <div class="grid-background"></div>
    
    <div class="login-wrapper">
      <div class="login-card">
        <!-- 科技感标题 -->
        <div class="card-header">
          <div class="logo-icon">
            <el-icon :size="48"><Monitor /></el-icon>
          </div>
          <h2 class="title">电商管理系统</h2>
          <p class="subtitle">欢迎回来，请登录您的账号</p>
          <div class="glow-line"></div>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          class="sci-fi-form"
        >
          <el-form-item prop="username">
            <div class="input-group">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                clearable
                class="sci-fi-input"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-group">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                class="sci-fi-input"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              :loading="loading"
              class="sci-fi-button"
              @click="handleLogin"
            >
              <span class="button-text">登 录</span>
              <div class="button-glow"></div>
            </el-button>
          </el-form-item>

          <div class="footer-links">
            <span>还没有账号？</span>
            <el-link class="sci-fi-link" @click="goToRegister">立即注册</el-link>
          </div>
        </el-form>
        
        <!-- 装饰性角落 -->
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Monitor } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
})

// 生成粒子样式
const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 10 + 10
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 调用API登录
        await userStore.login(loginForm)
        
        ElMessage.success('登录成功')
        router.push('/products')
      } catch (error) {
        ElMessage.error(error.message || '登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
/* ========== 容器与背景 ========== */
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1235 100%);
  overflow: hidden;
}

/* 网格背景 */
.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* 粒子效果 */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.particle {
  position: absolute;
  bottom: -10px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: float-up linear infinite;
  opacity: 0;
}

@keyframes float-up {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

/* ========== 卡片容器 ========== */
.login-wrapper {
  position: relative;
  z-index: 10;
}

.login-card {
  position: relative;
  width: 480px;
  padding: 50px 40px;
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 
    0 0 40px rgba(0, 255, 255, 0.1),
    inset 0 0 40px rgba(0, 255, 255, 0.05);
  animation: cardFloat 6s ease-in-out infinite;
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 装饰性角落 */
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid rgba(0, 255, 255, 0.6);
}

.corner-tl {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 20px;
}

.corner-tr {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 20px;
}

.corner-bl {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 20px;
}

.corner-br {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 20px;
}

/* ========== 头部区域 ========== */
.card-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.05));
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  color: #00ffff;
  animation: logoPulse 3s ease-in-out infinite;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
}

@keyframes logoPulse {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
    transform: scale(1.05);
  }
}

.title {
  margin: 0 0 10px 0;
  font-size: 32px;
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

.subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  letter-spacing: 1px;
}

.glow-line {
  width: 100px;
  height: 2px;
  margin: 20px auto 0;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

@keyframes lineGlow {
  0%, 100% { opacity: 0.5; width: 100px; }
  50% { opacity: 1; width: 150px; }
}

/* ========== 表单样式 ========== */
.sci-fi-form {
  :deep(.el-form-item) {
    margin-bottom: 25px;
  }
  
  :deep(.el-form-item__error) {
    color: #ff4757;
    text-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
  }
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: rgba(0, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0 15px;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  background: rgba(0, 255, 255, 0.05);
}

.input-icon {
  color: rgba(0, 255, 255, 0.6);
  font-size: 18px;
  margin-right: 10px;
  flex-shrink: 0;
}

.sci-fi-input {
  flex: 1;
  
  :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0;
  }
  
  :deep(.el-input__inner) {
    color: #ffffff;
    font-size: 15px;
    letter-spacing: 1px;
    background: transparent !important;
    height: 45px;
    line-height: 45px;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  :deep(.el-input__suffix) {
    .el-icon {
      color: rgba(0, 255, 255, 0.6);
    }
  }
}

/* ========== 按钮样式 ========== */
.sci-fi-button {
  position: relative;
  width: 100%;
  height: 50px;
  margin-top: 10px;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 191, 255, 0.2));
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 10px;
  color: #00ffff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 3px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 191, 255, 0.3));
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 
      0 0 30px rgba(0, 255, 255, 0.4),
      inset 0 0 20px rgba(0, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .button-text {
    position: relative;
    z-index: 2;
  }
  
  .button-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover .button-glow {
    left: 100%;
  }
}

/* ========== 底部链接 ========== */
.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 25px;
}

.footer-links span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.sci-fi-link {
  color: #00ffff !important;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    color: #00bfff !important;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    padding: 40px 30px;
  }
  
  .title {
    font-size: 26px;
  }
}
</style>
