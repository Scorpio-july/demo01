<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
          <!-- 选择商品的级联选择框 -->
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="small" :disabled="idBtnDisabled" @click="addCateData">添加参数</el-button>
          <!-- 动态参数的表格 -->
          <el-table :data="manyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand" width="50">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  autofocuse
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" width="50"></el-table-column>
            <!-- 参数展示列 -->
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialong(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="small"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="small" :disabled="idBtnDisabled" @click="addCateData">添加属性</el-button>
          <!-- 静态属性的表格 -->
          <el-table :data="onlyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand" width="50">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  autofocuse
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" width="50"></el-table-column>
            <!-- 参数展示列 -->
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialong(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="small"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addCateDialogVisible"
      width="40%"
      @close="addDialogClose"
    >
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addCateForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editCateDialogVisible"
      width="30%"
      @close="editDialogClose"
    >
      <el-form :model="editCateForm" :rules="editCateRules" ref="editCateRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editCateForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据
      cateList: [],
      // 指定级联选择器的配置向
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框选中的父级分类的id
      selectedCateKeys: [],
      // tab页签的数据
      activeName: 'many',
      // 动态参数的数据列表
      manyTableData: [],
      // 静态属性的数据列表
      onlyTableData: [],
      // 对话框的显示状态
      addCateDialogVisible: false,
      // 添加表单的数据列表
      addCateForm: {
        attr_name: ''
      },
      // 添加表单的验证规则
      addCateRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数',
            trigger: 'blur'
          },
          { min: 2, max: 9, message: '长度在 2 到 9 个字符', trigger: 'blur' }
        ]
      },
      // 修改表单对话框的显示状态
      editCateDialogVisible: false,
      // 修改表单的数据列表
      editCateForm: {
        attr_name: ''
      },
      // 修改表单的验证规则
      editCateRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数',
            trigger: 'blur'
          },
          { min: 2, max: 9, message: '长度在 2 到 9 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 控制添加按钮的禁用状态
    idBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 对话框标题的动态显示
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  methods: {
    // 获取所有商品分类列表
    async getCateList() {
      const res = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
    },
    // 级联选择框变化后就会触发这个函数
    handleChange() {
      this.getParamsData()
    },
    // tab页签点击事件触发的函数
    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数列表
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        // 当级联选择框内不是三级分类时，清空选择框，静态属性，动态参数
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const res = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      // 把分类参数的attr_vals变成数组
      res.data.forEach(item => {
        // 如果分类下没有参数的话会显示一个空的tag所有在这里进行一个三元判断
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为tag输入框和按钮添加值
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击按钮添加参数
    addCateData() {
      this.addCateDialogVisible = true
    },
    // 添加对话框的关闭事件
    addDialogClose() {
      this.$refs.addCateRef.resetFields()
    },
    // 点击按钮添加属性
    addParams() {
      this.$refs.addCateRef.validate(async val => {
        if (!val) {
          return this.$message.error('提交信息有误，请重新填写')
        }
        const res = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addCateForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.addCateDialogVisible = false
        this.getParamsData()
        this.$message.success('添加成功')
      })
    },
    // 修改对话框的关闭事件
    editDialogClose() {
      this.$refs.editCateRef.resetFields()
    },
    // 点击编辑按钮
    async showEditDialong(id) {
      const res = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 点击按钮编辑参数
    editParams() {
      this.$refs.editCateRef.validate(async val => {
        if (!val) {
          return this.$message.error('提交信息有误，请重新填写')
        }
        const res = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editCateForm.attr_id}`,
          {
            attr_name: this.editCateForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败')
        }
        this.editCateDialogVisible = false
        this.getParamsData()
        this.$message.success('编辑成功')
      })
    },
    // 删除事件
    removeParams(id) {
      //弹框提示用户是否删除参数
      this.$confirm('此操作将删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await this.$http.delete(
            `categories/${this.cateId}/attributes/${id}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除参数失败')
          }
          this.$message.success('删除参数成功')
          this.getParamsData()
        })
        .catch(data => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 文本框失去焦点或回车都会触发的事件
    async handleInputConfirm(data) {
      if (data.inputValue.trim().length === 0) {
        data.inputValue = ''
        data.inputVisible = false
        return
      }
      data.attr_vals.push(data.inputValue.trim())
      data.inputValue = ''
      this.savaAttrVals(data)
    },
    // 将对attr_vals的操作保存到数据库中
    async savaAttrVals(data) {
      const res = await this.$http.put(
        `categories/${this.cateId}/attributes/${data.attr_id}`,
        {
          attr_name: data.attr_name,
          attr_sel: data.attr_sel,
          attr_vals: data.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败！')
      }
      this.$message.success('修改分类成功！')
      data.inputVisible = false
    },
    // 切换输入框和按钮
    showInput(data) {
      data.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick的作用，就是当页面上的元素被重新渲染之后，才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除tag参数项
    handleClose(index, data) {
      data.attr_vals.splice(index, 1)
      this.savaAttrVals(data)
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 20px 0;
}
.el-tag {
  margin: 0 10px;
}
.button-new-tag {
  position: relative;
  top: -2px;
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  position: relative;
  top: -2px;
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>