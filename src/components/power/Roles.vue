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
          <el-button type="primary">主要按钮</el-button>
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
            <el-button size="small" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="small" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              size="small"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog"
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
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="SetRightDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表信息
      rolesList: [],
      // 所有权限的数据
      rightList: [],
      // 树形控件的属性绑定对象
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 控制分配权限对话框的显示
      SetRightDialogVisible: false
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    getRolesList: async function() {
      const res = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    // 根据id删除权限
    removeRightById(role, rightId) {
      // 弹框提示用户是否删除权限
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
          // 删除成功后把返回的数据直接传递给页面就可以避免关闭权限框
          role.children = res.data
        })
        .catch(data => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 展示分配权限对话框
    async showSetRightDialog() {
      const res = await this.$http.get('rights/tree')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      // 把获取到的数据保存到rightList中
      this.rightList = res.data
      this.SetRightDialogVisible = true
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