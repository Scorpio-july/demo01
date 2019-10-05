<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" round @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#7ed6df"
              inactive-color="#ff7979"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-row :gutter="0">
              <el-tooltip
                class="item"
                effect="light"
                content="修改用户名"
                placement="left-start"
                :enterable="false"
              >
                <el-col :span="6">
                  <el-button type="primary" icon="el-icon-edit"></el-button>
                  <div class="grid-content bg-purple"></div>
                </el-col>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="light"
                content="删除用户"
                placement="top"
                :enterable="false"
              >
                <el-col :span="6">
                  <el-button type="danger" icon="el-icon-delete"></el-button>
                  <div class="grid-content bg-purple"></div>
                </el-col>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="light"
                content="修改状态"
                placement="right-start"
                :enterable="false"
              >
                <el-col :span="6">
                  <el-button type="warning" icon="el-icon-setting"></el-button>
                  <div class="grid-content bg-purple"></div>
                </el-col>
              </el-tooltip>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[2, 4, 6, 8]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="30%" @close="closeDialog">
      <!-- 用户信息输入框 -->
      <el-form :model="addRuleForm" :rules="addRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addRuleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addRuleForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addRuleForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="addRuleForm.phone"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 手机号的验证规则
    var checkPhone = (rule, value, callback) => {
      // 验证手机号的正则
      let reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (reg.test(value)) {
        // 当数据合法是的回调函数
        return callback()
      }
      // 数据不合法时的回调函数
      callback(new Error('手机号输入不正确'))
    }
    return {
      // 分页参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      total: 0,
      // 用户列表
      userList: [],
      // 用户信息输入框显示状态
      dialogVisible: false,
      // 添加表单的用户信息
      addRuleForm: {
        username: '',
        password: '',
        email: '',
        phone: ''
      },
      // 表单验证规则
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户数据列表
    getUserList: async function() {
      const res = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听状态值的变化
    async userStateChange(userInfo) {
      const res = await this.$http.put(
        'users/' + userInfo.id + '/state/' + userInfo.mg_state
      )
      console.log(res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功')
    },
    // 表单关闭后清空表单
    closeDialog() {
      this.$refs.addFormRef.resetFields()
    },
    // 表单提交
    addUser() {
      // 提交前的预验证
      this.$refs.addFormRef.validate(async val => {
        if (val) {
          const res = await this.$http.post('users', this.addRuleForm)
          if (res.meta.status !==201) {
            return this.$message.error("用户添加失败")
          }
          this.$message.success('用户添加成功')
          // 隐藏对话框
          this.dialogVisible = false
          //刷新用户列表
          this.getUserList()
        } else {
          this.$message.error('用户信息填写有误')
          return false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>