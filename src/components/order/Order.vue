<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区域 -->
      <el-table :data="orderList" style="width: 100%" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="150"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="150">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="150"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <el-tooltip class="item" effect="dark" content="修改地址" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" circle @click="showBox"></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="物流状态" placement="top" :enterable="false">
            <el-button
              type="success"
              icon="el-icon-location-outline"
              circle
              @click="showProgressBox"
            ></el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>

      <!--分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 修改地址的对话框 -->
      <el-dialog title="修改地址" :visible.sync="addressVisible" width="30%" @close="closeDialog">
        <el-form
          :model="addressForm"
          :rules="addressFormrules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区/县：" prop="address1">
            <el-cascader
              v-model="addressForm.address1"
              :options="cityData"
              :props="{ expandTrigger: 'hover' }"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址：" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 展示物流信息对话框 -->
      <el-dialog title="物流信息" :visible.sync="progressVisible" width="30%">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer">
          <el-button @click="progressVisible = false">取 消</el-button>
          <el-button type="primary" @click="progressVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      // 获取订单参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单总条数
      total: 0,
      // 订单数据列表
      orderList: [],
      // 修改地址的对话框显示状态
      addressVisible: false,
      // 修改地址表单信息
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址表单的验证规则
      addressFormrules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 省市区文件
      cityData,
      // 物流信息对话框显示状态
      progressVisible: false,
      // 物流信息
      progressInfo: []
    }
  },
  methods: {
    // 获取订单列表数据
    async getOrdersList() {
      const res = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    // 监听每页多少条数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 监听当前时第几页
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrdersList()
    },
    // 点击按钮修改地址
    showBox() {
      this.addressVisible = true
    },
    // 关闭修改地址对话框事件
    closeDialog() {
      this.$refs.addressFormRef.resetFields()
    },
    // 点击按钮查看物流信息
    async showProgressBox() {
      const res = await this.$http.get('/kuaidi/' + 1106975712662)
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progressInfo = res.data
      this.progressVisible = true
    }
  },
  created() {
    this.getOrdersList()
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-cascader {
  width: 100%;
}
</style>