<template>
  <a-form
    ref="formRef"
    :model="loginFormData"
    :rules="formRules"
    layout="vertical"
    class="login-form"
  >
    <a-form-item name="username">
      <a-input v-model:value="loginFormData.username" placeholder="请输入账号" allow-clear />
    </a-form-item>
    <a-form-item name="password">
      <a-input-password
        v-model:value="loginFormData.password"
        placeholder="请输入密码"
        allow-clear
      />
    </a-form-item>
    <a-form-item>
      <div class="create-account">
        没有账号？<a-button type="link" style="padding: 0" @click="handleGoRegister">
          创建账号
        </a-button>
      </div>
    </a-form-item>
    <a-form-item>
      <a-button
        type="primary"
        size="large"
        block
        :loading="loginFormData.confirmLoading"
        @click="handleLogin"
      >
        登录
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue'

import { userLoginAPI } from '@/api/module/account'
import { setToken } from '@/utils/storage'

const router = useRouter()

const emit = defineEmits(['go-register'])

const loginFormData = reactive({
  username: '',
  password: '',
  confirmLoading: false,
})

const formRef = ref<FormInstance>()
const formRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 32, message: '账号长度应在4-32个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 32, message: '密码长度应在8-32个字符之间', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    // 验证通过后执行登录逻辑
    loginFormData.confirmLoading = true
    const res = await userLoginAPI({
      username: loginFormData.username,
      password: loginFormData.password,
    })
    setToken(res.token)
    router.push('/chat')
  } finally {
    loginFormData.confirmLoading = false
  }
}

const handleGoRegister = async () => {
  emit('go-register')
}
</script>

<style scoped lang="scss">
.login-form {
  margin-top: 40px;
  padding: 0 30px;

  :deep(.ant-form-item-label) {
    padding-bottom: 8px;

    label {
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }

  :deep(.ant-input),
  :deep(.ant-input-password) {
    height: 44px;
    border-radius: 8px;
    border-color: #e5e7eb;
    transition: all 0.3s ease;

    &:hover {
      border-color: #6366f1;
    }

    &:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }
  }

  :deep(.ant-input-password) {
    .ant-input {
      height: 42px;
    }
  }

  .create-account {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 14px;
    color: #6b7280;

    :deep(.ant-btn-link) {
      color: #6366f1;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover {
        color: #4f46e5;
      }
    }
  }

  :deep(.ant-btn-primary) {
    height: 48px;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }

    &:disabled {
      background: #e5e7eb;
      box-shadow: none;
    }
  }
}
</style>
