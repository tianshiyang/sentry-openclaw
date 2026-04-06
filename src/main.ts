import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router/index'
import '@/styles/global.scss'
import '@/assets/iconfont/iconfont.css'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import * as Sentry from '@sentry/vue'

const app = createApp(App)
app.use(VueVirtualScroller)

app.use(Antd)
app.use(createPinia())
app.use(router)


Sentry.init({
  app,
  dsn: 'https://7f5597883a4537f6adbfe3cc4a6eaa95@o4511171649929216.ingest.us.sentry.io/4511172643127296',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

app.mount('#app')
