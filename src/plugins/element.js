import Vue from 'vue'
import { Button,Form,FormItem,Input,Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 将[弹框提示-组件]挂载为Vue原型对象上的属性
Vue.prototype.$message=Message