<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加用户按钮 -->
      <el-row :gutter="20" class="addBtn">
        <el-col :span="4">
          <el-button type="primary" round @click="showAddCateChange">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        class="treetable"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="small" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="small" v-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag size="small" v-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="queryCateById(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addCateDialogVisible"
      width="40%"
      @close="addCateDialogClose"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="95px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parenteCateChanged"
            :clearable="true"
            change-on-select="true"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->

    <el-dialog
      title="编辑用户"
      :visible.sync="editCateDialogVisible"
      width="40%"
      @close="editCateDialogClose"
    >
      <!-- 编辑分类的表单 -->
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="95px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editorCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品父类的数据列表
      cateList: [],
      // 商品分类查询条件
      queryInfo: {
        pagenum: 1,
        pagesize: 5,
        type: 3
      },
      // 商品分类总条数
      total: 0,
      columns: [
        {
          label: '商品分类',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示状态
      addCateDialogVisible: false,
      // 添加分类的表单对象
      addCateForm: {
        // 将要添加分类的名字
        cat_name: '',
        // 分类的等级，默认添加的是一级分类
        cat_level: 0,
        // 父级分类的id
        cat_pid: 0
      },
      // 添加分类表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置向
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制编辑分类表单对话框的显示状态
      editCateDialogVisible: false,
      // 编辑分类的表单数据
      editCateForm: {
        cat_name: '',
        id: ''
      },
      // 添加分类表单的验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const res = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类对话框
    showAddCateChange() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据
    async getParentCateList() {
      const res = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 当级联选择器选中项发生变化时触发函数
    parenteCateChanged() {
      // 如果selectedKeys的长度为0则说明他没有父级分类
      if (this.selectedKeys.length !== 0) {
        //
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async val => {
        if (!val) {
          return this.$message.error('提交信息有误，请重新填写')
        }
        const res = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.addCateDialogVisible = false
        this.getCateList()
        this.$message.success('添加成功')
      })
    },
    // 添加分类对话框的关闭事件
    addCateDialogClose() {
      this.addCateForm.cat_name = ''
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击编辑按钮，根据id查询分类
    async queryCateById(id) {
      this.editCateForm.id = id
      // 获取父级分类的数据
      this.getParentCateList()
      const res = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品失败')
      }
      this.editCateForm.cat_id = res.data.cat_id
      this.editCateForm.cat_pid = res.data.cat_pid
      // 回显数据
      this.editCateForm.cat_name = res.data.cat_name
      // 展示编辑对话框
      this.editCateDialogVisible = true
    },
    //
    // 编辑商品分类
    editorCate() {
      this.$refs.editCateFormRef.validate(async val => {
        if (!val) {
          return this.$message.error('提交信息有误，请重新填写')
        }

        const res = await this.$http.put('categories/' + this.editCateForm.id, {
          cat_name: this.editCateForm.cat_name
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败')
        }

        this.editCateDialogVisible = false
        this.getCateList()
        this.$message.success('编辑成功')
      })
    },
    // 编辑分类对话框关闭事件
    editCateDialogClose() {
      this.editCateForm.cat_name = ''
      this.selectedKeys = []
    },
    // 删除分类
    deleteCate(id) {
      //弹框提示用户是否删除权限
      this.$confirm('此操作将删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await this.$http.delete('categories/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除分类失败')
          }
          this.$message.success('删除分类成功')
          this.getCateList()
        })
        .catch(data => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
.addBtn {
  margin-bottom: 20px;
}
.treetable {
  font-size: 14px;
}
.el-cascader {
  width: 100%;
}
.el-cascader-panel ul {
  height: 100px;
}
</style>