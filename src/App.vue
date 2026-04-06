<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const handleError = () => {
  throw Error('项目报错了')
}
</script>

<template>
  <a-button @click="handleError">报错</a-button>
  <ConfigProvider :locale="zhCN">
    <router-view />
  </ConfigProvider>
</template>
