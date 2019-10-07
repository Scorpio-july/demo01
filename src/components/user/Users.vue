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
        <!-- 操作栏 -->
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
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    @click="showEditDialog(scope.row.id)"
                  ></el-button>
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
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    @click="deleteUserById(scope.row.id)"
                  ></el-button>
                  <div class="grid-content bg-purple"></div>
                </el-col>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="light"
                content="分配角色"
                placement="right-start"
                :enterable="false"
              >
                <el-col :span="6">
                  <el-button type="warning" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
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
        :page-sizes="[2, 5, 10, 15]"
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
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addRuleForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="30%" @close="editCloseDialog">
      <!-- 用户信息输入框 -->
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUsereInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="40%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          修改角色
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="savaRoleInfo()">确 定</el-button>
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
        pagesize: 3
      },
      total: 0,
      // 用户列表
      userList: [],
      // 用户信息输入框显示状态
      dialogVisible: false,
      // 修改用户信息框的显示状态
      editDialogVisible: false,
      // 添加表单的用户信息
      addRuleForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 查询到的用户信息对象
      editForm: {},
      // 添加用户表单验证规则
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' }
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
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 修改用户信息表单验证规则
      editRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      //分配角色对话框显示状态
      setRoleDialogVisible: false,
      // 分配权限的角色
      userInfo: {},
      // 角色列表
      rolesList: {},
      // 下拉菜单选中的id值
      selectRoleId: ''
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
    // 添加用户对话框关闭后清空表单
    closeDialog() {
      this.$refs.addFormRef.resetFields()
    },
    // 修改用户信息对话框关闭后清空表单
    editCloseDialog() {
      this.$refs.editFormRef.resetFields()
    },
    // 表单提交
    addUser() {
      // 提交前的预验证
      this.$refs.addFormRef.validate(async val => {
        if (val) {
          const res = await this.$http.post('users', this.addRuleForm)
          if (res.meta.status !== 201) {
            return this.$message.error('用户添加失败')
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
    },
    // 展示编辑用户对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
      const res = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户失败')
      this.editForm = res.data
    },
    // 修改用户信息对话框提交按钮
    async editUsereInfo() {
      // 提交前的预验证
      this.$refs.editFormRef.validate(async val => {
        if (!val) return this.$message.error('修改用户信息失败')
        const res = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        this.$message.success('修改用户信息成功')
        // 隐藏对话框
        this.editDialogVisible = false
        //刷新用户列表
        this.getUserList()
      })
    },
    // 根据id删除用户信息
    deleteUserById(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await this.$http.delete('users/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除用户失败')
          }
          this.$message.success('删除用户成功')
          this.getUserList()
        })
        .catch(data => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      const res = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 分配用户角色
    async savaRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.warning('请选择要分配的角色')
      }
      const res = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRoleId
      })
      console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 分配角色框的关闭事件
    setRoleDialogClosed() {
      this.selectRoleId = ''
      this.userInfo = ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>