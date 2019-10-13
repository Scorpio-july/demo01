<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" stripe border>
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',index1 === 0 ? 'bdtop' : '','vcenter']"
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" width="50"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="small"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="small"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoleByid(scope.row.id)"
            >删除</el-button>
            <el-button
              size="small"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="SetRightDialogVisible" width="40%">
      <!-- 树形控件 -->
      <el-tree
        :data="rightList"
        :props="defaultProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%">
      <!-- 用户信息输入框 -->
      <el-form :model="addRolesForm" :rules="addRoles" ref="addFormRoles" label-width="70px">
        <el-form-item label="角色名:" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述:" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="30%">
      <!-- 用户信息输入框 -->
      <el-form :model="editRolesForm" :rules="editRoles" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名:" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述:" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表信息
      rolesList: [],
      //所有权限的数据
      rightList: [],
      //树形控件的属性绑定对象
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      //控制分配权限对话框的显示
      SetRightDialogVisible: false,
      //树形控件默认选中项的id值数组
      defKeys: [],
      // 添加角色对话框显示状态
      addDialogVisible: false,
      // 分配权限时的角色id
      roleId: '',
      // 添加角色的信息
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色的验证规则
      addRoles: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' }
        ]
      },
      // 修改角色对话框的显示状态
      editDialogVisible: false,
      // 修查询到的角色信息
      editRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色信息的验证规则
      editRoles: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取所有角色列表
    getRolesList: async function() {
      const res = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    //根据id删除权限
    removeRightById(role, rightId) {
      //弹框提示用户是否删除权限
      this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除权限失败')
          }
          this.$message.success('删除权限成功')
          //删除成功后把返回的数据直接传递给页面就可以避免关闭权限框
          role.children = res.data
        })
        .catch(data => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    //展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const res = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      //把获取到的数据保存到rightList中
      this.rightList = res.data
      // 调用递归获取id之前先清空数组
      this.defKeys = []
      //调用递归来获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.SetRightDialogVisible = true
    },
    //通过递归的形式，获取角色下所有的三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 判断当前node节点中是否是三级节点
      if (!node.children) {
        // 当确定是三级节点的时候就把id值给保存到数组中
        return arr.push(node.id)
      }
      //如果没有找到三级节点就循环遍历节点，来查找三级节点
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 给角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const strId = keys.join(',')
      const res = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: strId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.SetRightDialogVisible = false
    },
    // 添加新角色
    addRole() {
      // 提交前的预验证
      this.$refs.addFormRoles.validate(async val => {
        if (val) {
          const res = await this.$http.post('roles', {
            roleName: this.addRolesForm.roleName,
            roleDesc: this.addRolesForm.roleDesc
          })
          if (res.meta.status !== 201) {
            return this.$message.error('角色添加失败')
          }
          this.$message.success('角色添加成功')

          // 隐藏对话框
          this.addDialogVisible = false
          //刷新用户列表
          this.getRolesList()
        } else {
          this.$message.error('角色名填写有误')
          return false
        }
      })
    },
    // 展示修改角色的对话框
    async showEditDialog(id) {
      // 在展示对话框之前先清空修改角色的数据
      this.editRolesForm = {}
      this.editDialogVisible = true
      const res = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询角色失败')
      this.editRolesForm = res.data
    },
    // 修改角色
    editRole() {
      // 提交前的预验证
      this.$refs.editFormRef.validate(async val => {
        if (!val) return this.$message.error('修改用户信息失败')
        const res = await this.$http.put('roles/' + this.editRolesForm.roleId, {
          roleName: this.editRolesForm.roleName,
          roleDesc: this.editRolesForm.roleDesc
        })
        this.$message.success('修改角色信息成功')
        // 隐藏对话框
        this.editDialogVisible = false
        //刷新用户列表
        this.getRolesList()
      })
    },
    // 删除角色
    deleteRoleByid(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除角色失败')
          }
          this.$message.success('删除角色成功')
          this.getRolesList()
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
.el-tag {
  margin: 8px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>