import Vue from 'vue'
import App from './App.vue' //根组件
import router from './router' //路由
import './plugins/element.js' //Element-UI
import './assets/fonts/iconfont.css' //导入字体图标
import './assets/css/global.css' //引入全局样式表
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 导入 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入 富文本编辑器 对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//配置请求的根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
// 通过 axios 请求拦截器添加 token，保证拥有获取数据的权限
axios.interceptors.request.use(config=>{
  //console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须 return config
  return config
})
Vue.prototype.$http=axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 将 富文本编辑器 注册为全局可用的组件
Vue.use(VueQuillEditor)

// 自定义格式化时间的全局过滤器
Vue.filter('dateFormat', function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth()+1+'').padStart(2,'0')
  const d = (dt.getMonth()+'').padStart(2,'0')
  const hh = (dt.getMonth()+'').padStart(2,'0')
  const mm = (dt.getMonth()+'').padStart(2,'0')
  const ss = (dt.getMonth()+'').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
