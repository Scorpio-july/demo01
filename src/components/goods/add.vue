<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert title="添加商品信息" type="warning" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="320" :active="activeIndex - 0" finish-status="success" :align-center="true">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 标签页区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          tabPosition="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tableClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item"
                  v-for="(item,index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action是图片要上传的地址 -->
            <!-- :on-preview="handlePreview" 处理上传图片的预览效果 -->
            <!-- :on-remove="handleRemove" 处理上传图片的删除功能-->
            <!-- list-type：渲染图片的方式 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--  富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" @click="addCate">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片对话框 -->
    <el-dialog title="预览图片" :visible.sync="imgDialogVisible" width="30%">
      <img :src="PreviewPath" alt class="Preview" />
    </el-dialog>
  </div>
</template>

<script>
// 引入lodash插件
import _ from 'lodash'

export default {
  data() {
    return {
      // 步骤条的进度索引
      activeIndex: '0',
      // 添加表单的数据列表
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选中的商品分类
        goods_cat: [],
        // 上传图片的路径
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 商品参数的数组
        attrs: []
      },
      // 添加表单的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 25, message: '长度在 2 到 25 个字符', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格' },
          { type: 'number', message: '商品价格必须为数字值' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { type: 'number', message: '商品重量必须为数字值', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { type: 'number', message: '商品数量必须为数字值', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器选中分类的id
      cateId: '',
      // 指定级联选择器的配置向
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品参数的数据列表
      manyTableData: [],
      // 商品属性的数据列表
      onlyTableData: [],
      // 上传图片的接口地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片的请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片路径
      PreviewPath: '',
      // 预览图片对话框的显示状态
      imgDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类
    async getCateList() {
      const res = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 级联选择器选中项发生变化时触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        // 当级联选择框内不是三级分类时，清空选择框，静态属性，动态参数
        this.addForm.goods_cat = []
        return
      }
      this.manyId = this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
    },
    // 标签页发生切换时触发函数
    beforeTabLeave(activeName, oldActiveName) {
      // 即将进入的标签的名字activeName
      // 即将离开的标签的名字oldActiveName
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 点击标签时触发函数
    async tableClicked() {
      // 访问参数面板
      if (this.activeIndex === '1') {
        const res = await this.$http.get(
          `categories/${this.shopId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('商品参数获取失败')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      }

      // 访问属性面板
      if (this.activeIndex === '2') {
        const res = await this.$http.get(
          `categories/${this.shopId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('商品属性获取失败')
        }
        this.onlyTableData = res.data
      }
    },
    // 处理上传图片的预览效果
    handlePreview(file) {
      this.PreviewPath = file.response.data.url
      this.imgDialogVisible = true
    },
    // 处理上传图片的删除功能
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(item => item.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功时的事件
    handleSuccess(response) {
      if (response.meta.status !== 200) {
        return this.$message.error('图片上传失败')
      }
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 点击按钮添加商品
    addCate() {
      this.$refs.addFormRef.validate(async val => {
        if (!val) {
          return this.$message.error('请填写必要的表单项！')
        }
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        const res = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })
    }
  },

  computed: {
    // 监听分类id
    shopId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 250px;
}
.el-checkbox {
  margin: 0 15px 0 0 !important;
}
.Preview {
  width: 100%;
}
.el-button {
  margin-top: 20px;
}
.quill-editor {
  margin-top: 20px;
}
</style>