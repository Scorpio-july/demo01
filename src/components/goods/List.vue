<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getgoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getgoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" round @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodsList" style="width: 100%" stripe border>
        <!-- 索引列 -->
        <el-table-column type="index" width="50"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="90px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="160px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[50, 100, 150, 200]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询商品列表参数对象
      queryInfo: {
        pagenum: 1,
        pagesize: 50,
        query: ''
      },
      // 商品总条数
      total: 0,
      // 商品总列表
      goodsList: []
    }
  },
  created() {
    this.getgoodsList()
  },
  methods: {
    // 获取商品列表
    async getgoodsList() {
      const res = await this.$http.get('goods', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表')
      }
      this.total = res.data.total
      this.goodsList = res.data.goods
    },
    // 监听分页页码大小变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getgoodsList()
    },
    // 监听分页页码变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getgoodsList()
    },
    // 根据id删除对应的商品
    removeById(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const res = await this.$http.delete('goods/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除商品失败')
          }
          this.$message.success('删除商品成功')
          this.getgoodsList()
        })
        .catch(data => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 跳转到添加商品页面
    goAddPage() {
      this.$router.push('goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
</style>