import Vue from 'vue'
import App from './App.vue'
import router from './router'

import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 带入axios
import axios from 'axios'
// 导入table插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本插件
import VueQuillEditor from 'vue-quill-editor'
// require styles导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    // 配置响应拦截器
axios.interceptors.response.use(function(res) {
        const data = res.data
        return data
    })
    // 配置请求拦截器
axios.interceptors.request.use(function(config) {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})

Vue.prototype.$http = axios
    // 将富文本编辑器注册为全局组件
Vue.use(VueQuillEditor)

Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false

// 时间过滤器
Vue.filter('dateFormat', function(dateStr, pattern = '') {
    //根据给定的时间字符串，得到特定的时间

    var dt = new Date(dateStr) //yyy---mm-dd
    var y = dt.getFullYear() //得到年份
    var m = (dt.getMonth() + 1 + '').padStart(2, '0') //得到月份

    var d = (dt.getDate() + '').padStart(2, '0') //得到日期
        // return y + '-' + m + '-' + d

    if (pattern.toLowerCase() === 'yyy-mm-dd') { return `${y}-${m}-${d}` } else {
        var hh = (dt.getHours() + '').padStart(2, '0') //得到时
        var mm = (dt.getMinutes() + '').padStart(2, '0') //得到分
        var ss = (dt.getSeconds() + '').padStart(2, '0') //得到秒
        return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
    }
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')