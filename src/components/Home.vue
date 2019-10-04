<template>
  <el-container class="home_container">
    <!-- 页面头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>街边小卖部后台管理系统</span>
      </div>

      <el-button type="success" @click="logout">退出登录</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边导航区域 -->
      <el-aside width="200px">
        <!-- 侧边栏菜单项 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i class="el-icon-location"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item index="subItem.id + ''" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容区域 -->
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: []
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    logout: function() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    getMenuList: async function() {
      const res = await this.$http.get('menus')
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  padding-left: 0;
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
      color: #fff;
      font-size: 20px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #ecf0f1;
}
</style>
