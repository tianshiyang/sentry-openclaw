<template>
  <a-form
    ref="formRef"
    :model="registerFormData"
    :rules="formRules"
    layout="vertical"
    class="register-form"
  >
    <a-form-item name="username">
      <a-input
        v-model:value="registerFormData.username"
        placeholder="请输入用户名（4-32位，支持英文、数字）"
        allow-clear
      />
    </a-form-item>
    <a-form-item name="email">
      <a-auto-complete
        v-model:value="registerFormData.email"
        placeholder="请输入邮箱"
        :options="options"
        @search="handleSearch"
      >
        <template #option="{ value: val }">
          {{ val.split('@')[0] }} @
          <span style="font-weight: bold">{{ val.split('@')[1] }}</span>
        </template>
      </a-auto-complete>
    </a-form-item>
    <a-form-item name="password">
      <a-input-password
        v-model:value="registerFormData.password"
        placeholder="请输入密码（8-32位，支持英文、数字）"
        allow-clear
      />
    </a-form-item>
    <a-form-item name="confirmPassword">
      <a-input-password
        v-model:value="registerFormData.confirmPassword"
        placeholder="请再次输入密码"
        allow-clear
      />
    </a-form-item>
    <a-form-item name="avatar_url">
      <div class="avatar-upload">
        <a-upload
          v-model:file-list="fileList"
          :before-upload="beforeUpload"
          :custom-request="handleUpload"
          :show-upload-list="false"
          accept="image/*"
        >
          <div class="avatar-upload-area">
            <img
              v-if="registerFormData.avatar_url"
              :src="registerFormData.avatar_url"
              alt="avatar"
              class="avatar-preview"
            />
            <div v-else class="avatar-placeholder">
              <plus-outlined class="upload-text" />
              <span class="upload-text">点击上传头像</span>
            </div>
            <div v-if="uploading" class="upload-mask">
              <a-spin />
            </div>
          </div>
        </a-upload>
      </div>
    </a-form-item>
    <a-form-item>
      <div class="back-login">
        已有账号？<a-button type="link" style="padding: 0" @click="handleGoLogin">
          返回登录
        </a-button>
      </div>
    </a-form-item>
    <a-form-item>
      <a-button
        type="primary"
        size="large"
        block
        :loading="registerFormData.confirmLoading"
        @click="handleRegister"
      >
        注册
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
import type { FormInstance, UploadProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { uploadToCOS } from '@/utils/cos'
import { userRegisterAPI } from '@/api/module/account'
import { setToken } from '@/utils/storage'
import { PlusOutlined } from '@ant-design/icons-vue'

const emit = defineEmits(['go-login'])

const router = useRouter()

const registerFormData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  avatar_url: '',
  confirmLoading: false,
})

const formRef = ref<FormInstance>()
const fileList = ref([])
const uploading = ref(false)

const options = ref<{ value: string }[]>([])
const handleSearch = (val: string) => {
  let res: { value: string }[]
  if (!val || val.indexOf('@') >= 0) {
    res = []
  } else {
    res = ['gmail.com', '163.com', 'qq.com'].map(domain => ({ value: `${val}@${domain}` }))
  }
  options.value = res
}

// 自定义验证规则：用户名（4-32位，支持英文、数字）
const validateUsername = (_rule: unknown, value: string) => {
  if (!value) {
    return Promise.reject('请输入用户名')
  }
  if (value.length < 4 || value.length > 32) {
    return Promise.reject('用户名长度应在4-32个字符之间')
  }
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return Promise.reject('用户名只能包含英文和数字')
  }
  return Promise.resolve()
}

// 自定义验证规则：密码（8-32位，支持英文、数字）
const validatePassword = (_rule: unknown, value: string) => {
  if (!value) {
    return Promise.reject('请输入密码')
  }
  if (value.length < 8 || value.length > 32) {
    return Promise.reject('密码长度应在8-32个字符之间')
  }
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return Promise.reject('密码只能包含英文和数字')
  }
  return Promise.resolve()
}

// 确认密码验证
const validateConfirmPassword = (_rule: unknown, value: string) => {
  if (!value) {
    return Promise.reject('请再次输入密码')
  }
  if (value !== registerFormData.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 邮箱验证
const validateEmail = (_rule: unknown, value: string) => {
  if (!value) {
    return Promise.reject('请输入邮箱')
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return Promise.reject('请输入有效的邮箱地址')
  }
  return Promise.resolve()
}

// 头像验证
const validateAvatar = (_rule: unknown, value: string) => {
  if (!value) {
    return Promise.reject('请上传头像')
  }
  return Promise.resolve()
}

const formRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  avatar_url: [{ validator: validateAvatar, trigger: 'change' }],
}

// 上传前验证
const beforeUpload: UploadProps['beforeUpload'] = file => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件！')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

// 自定义上传到腾讯云 COS
const handleUpload: UploadProps['customRequest'] = async options => {
  const { file, onError } = options
  const fileObj = file as File

  if (!fileObj) {
    message.error('请选择文件')
    onError?.(new Error('请选择文件'))
    return
  }

  uploading.value = true

  try {
    const result = await uploadToCOS({
      file: fileObj,
      prefix: 'avatars/',
    })

    // 上传成功，更新头像地址
    registerFormData.avatar_url = result.url
    message.success('头像上传成功！')

    // 触发表单验证，确保 avatar_url 字段被验证
    formRef.value?.validateFields(['avatar_url'])
  } finally {
    uploading.value = false
  }
}

const handleRegister = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    // 验证通过后执行注册逻辑
    registerFormData.confirmLoading = true

    const res = await userRegisterAPI({
      username: registerFormData.username,
      email: registerFormData.email,
      password: registerFormData.password,
      avatar_url: registerFormData.avatar_url,
    })

    setToken(res.token)
    message.success('注册成功！')
    router.push('/chat')
  } finally {
    registerFormData.confirmLoading = false
  }
}

const handleGoLogin = () => {
  emit('go-login')
}
</script>

<style scoped lang="scss">
.register-form {
  margin-top: 40px;
  padding: 0 30px;

  // 输入框聚焦样式
  :deep(.ant-input-affix-wrapper),
  :deep(.ant-input),
  :deep(.ant-select .ant-select-selector) {
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      border-color: #1890ff;
    }

    &:focus,
    &.ant-input-affix-wrapper-focused,
    &.ant-select-focused {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
    }
  }

  // 输入框密码眼睛图标
  :deep(.ant-input-password-icon) {
    color: #8c8c8c;
    transition: color 0.3s;

    &:hover {
      color: #1890ff;
    }
  }

  :deep(.ant-form-item-label) {
    padding-bottom: 8px;

    label {
      font-weight: 500;
      color: #262626;
      font-size: 14px;
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 20px;
  }

  // 验证成功状态
  :deep(.ant-form-item-has-success) {
    .ant-input-affix-wrapper,
    .ant-input {
      border-color: #52c41a;
    }
  }

  // 验证错误状态
  :deep(.ant-form-item-has-error) {
    .ant-input-affix-wrapper,
    .ant-input {
      border-color: #ff4d4f;
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
    }
  }

  .back-login {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 14px;
    color: #8c8c8c;

    a {
      color: #1890ff;
      transition: color 0.3s;

      &:hover {
        color: #40a9ff;
      }
    }
  }

  .avatar-upload {
    display: flex;
    justify-content: center;

    .avatar-upload-area {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(135deg, #f0f2f5 0%, #e8eaed 100%);

      // 精致边框效果
      &::before {
        content: '';
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        border: 2px dashed #d9d9d9;
        transition: all 0.3s;
        z-index: 1;
        pointer-events: none;
      }

      &:hover {
        transform: scale(1.03);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

        &::before {
          border-color: #1890ff;
        }
      }

      .avatar-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);

        .upload-icon {
          font-size: 28px;
          color: #8c8c8c;
          transition: all 0.3s;
        }

        .upload-text {
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      &:hover .avatar-placeholder .upload-icon {
        color: #1890ff;
      }

      .upload-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          rgba(24, 144, 255, 0.85) 0%,
          rgba(64, 169, 255, 0.85) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        opacity: 0;
        transition: opacity 0.3s;

        .anticon {
          color: #fff;
          font-size: 24px;
        }
      }

      &:hover .upload-mask {
        opacity: 1;
      }
    }
  }

  // 注册按钮
  :deep(.ant-btn-primary) {
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%);
      box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
    }

    &[disabled] {
      background: #f5f5f5;
      box-shadow: none;
      color: #bfbfbf;
    }
  }
}
</style>
