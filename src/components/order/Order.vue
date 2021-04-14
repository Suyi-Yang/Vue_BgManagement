<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索栏 -->
      <el-row>
        <el-col :span='8'>
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 列表区 -->
      <el-table :data="orderlist" style="width: 100%" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="300"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template v-slot="scope">
            <el-tag v-if="scope.row.pay_status==='0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180">
          <template v-slot="scope">
            {{scope.row.create_time*1000 | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template v-slot="scope">
            <!-- 操作按钮：查看/修改订单详情 -->
            <el-button size="mini" type="warning" icon="el-icon-s-order" @click="showOrderDialog(scope.row.order_id)"></el-button>
            <!-- 操作按钮：修改地址 -->
            <el-button size="mini" type="primary" icon="el-icon-location-outline" @click="showEditDialog"></el-button>
            <!-- 操作按钮：查看物流 -->
            <el-button size="mini" type="success" icon="el-icon-truck" @click="showProgressDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!-- 对话框：查看/修改订单详情 -->
      <el-dialog
        title="修改订单"
        :visible.sync="orderDialogVisible"
        width="50%">
        <el-form ref="orderFormRef" :model="orderForm" label-width="80px">
          <el-form-item label="订单编号">
            <el-input v-model="orderForm.order_number" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="下单时间">
            <el-input v-model="orderForm.create_time" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="订单价格">
            <el-input v-model="orderForm.order_price"></el-input>
          </el-form-item>
          <el-form-item label="支付状态"> <!-- '0'未付款 '1'已付款 -->
            <el-radio-group v-model="orderForm.pay_status">
              <el-radio :label="'0'">未付款</el-radio>
              <el-radio :label="'1'">已付款</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="支付方式"> <!-- '0'未支付 '1'支付宝 '2'微信 '3'银行卡 -->
            <el-radio-group v-model="orderForm.order_pay">
              <el-radio :label="'0'">未支付</el-radio>
              <el-radio :label="'1'">支付宝</el-radio>
              <el-radio :label="'2'">微信</el-radio>
              <el-radio :label="'3'">银行卡</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否发货"> <!-- '0'未发货 '1'已经发货 -->
            <el-radio-group v-model="orderForm.is_send">
              <el-radio :label="'否'">未发货</el-radio>
              <el-radio :label="'是'">已发货</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="orderDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="updateOrderInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 对话框：修改地址 -->
      <el-dialog
        title="修改地址"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="closeEditDialog">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <!-- <el-input v-model="editForm.address1"></el-input> -->
            <el-cascader
              v-model="editForm.address1"
              :options="cityData"
              :props="{ expandTrigger: 'hover' }">
            </el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="editForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 对话框：物流进度 -->
      <el-dialog
        title="物流进度"
        :visible.sync="prgDialogVisible"
        width="50%">
        <el-timeline :reverse="reverse">
          <el-timeline-item
            v-for="(prg, index) in prgInfo"
            :key="index"
            :timestamp="prg.time">
            {{prg.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderlist: [],
      editDialogVisible: false, //是否显示[修改地址]对话框
      editForm: { //[编辑地址]表单
        address1: [], //[省市区/县]
        address2: '', //[详细地址]
      },
      editFormRules: {
        address1: [{required:true, message:'请选择省市区/县', trigger:'blur'}],
        address2: [{required:true, message:'请填写详细地址', trigger:'blur'}]
      },
      cityData, //[省市区县]联动数据
      prgDialogVisible: false, //是否显示[物流进度]对话框
      prgInfo: [ //物流信息
        {
          "time": "2018-05-10 09:39:00",
          "ftime": "2018-05-10 09:39:00",
          "context": "已签收,感谢使用顺丰,期待再次为您服务",
          "location": ""
        },
        {
          "time": "2018-05-10 08:23:00",
          "ftime": "2018-05-10 08:23:00",
          "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
          "location": ""
        },
        {
          "time": "2018-05-10 07:32:00",
          "ftime": "2018-05-10 07:32:00",
          "context": "快件到达 [北京海淀育新小区营业点]",
          "location": ""
        },
        {
          "time": "2018-05-10 02:03:00",
          "ftime": "2018-05-10 02:03:00",
          "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
          "location": ""
        },
        {
          "time": "2018-05-09 23:05:00",
          "ftime": "2018-05-09 23:05:00",
          "context": "快件到达 [北京顺义集散中心]",
          "location": ""
        },
        {
          "time": "2018-05-09 21:21:00",
          "ftime": "2018-05-09 21:21:00",
          "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
          "location": ""
        },
        {
          "time": "2018-05-09 13:07:00",
          "ftime": "2018-05-09 13:07:00",
          "context": "顺丰速运 已收取快件",
          "location": ""
        },
        {
          "time": "2018-05-09 12:25:03",
          "ftime": "2018-05-09 12:25:03",
          "context": "卖家发货",
          "location": ""
        },
        {
          "time": "2018-05-09 12:22:24",
          "ftime": "2018-05-09 12:22:24",
          "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
          "location": ""
        },
        {
          "time": "2018-05-08 21:36:04",
          "ftime": "2018-05-08 21:36:04",
          "context": "商品已经下单",
          "location": ""
        }
      ],
      reverse: false, //是否[倒序]:true倒序 false正序
      orderDialogVisible: false, //是否显示[查看/修改订单详情]对话框
      orderForm: { //订单详情 表单
        order_id: 0,
        order_number: "", //订单编号
        create_time: 0, //下单时间
        // goods: [], //订单商品
        order_price: 0, //订单价格
        pay_status: "0", //支付状态：0未付款 1已付款
        order_pay: "0", //支付方式：0未支付 1支付宝 2微信 3银行卡
        is_send: "否", //是否发货：0未发货 1已经发货
      }
    }
  },
  created(){
    this.getOrderList()
  },
  methods: {
    async getOrderList(){
      const {data:res} = await this.$http.get('orders', {
        params: this.queryInfo
      })
      // console.log(res);
      if(res.meta.status!==200){
        return this.$message.error('获取订单列表失败！')
      }
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    showEditDialog(){ //显示[修改地址]对话框
      this.editDialogVisible = true
    },
    closeEditDialog(){
      this.$refs.editFormRef.resetFields()
    },
    async showProgressDialog(){ //[查询物流进度] ***测试单号有问题(查不到)
      // const {data:res} = await this.$http.get('/kuaidi/1106975712662')
      // // console.log(res);
      // if(res.meta.status!==200){
      //   return this.$message.error('查询物流进度失败！')
      // }
      // this.prgInfo = res.data //查询结果赋值
      // // console.log(this.prgInfo);

      this.prgDialogVisible = true //显示对话框
    },
    async showOrderDialog(id){
      this.orderForm.order_id = id //保存id到form中

      const {data:res} = await this.$http.get(`orders/${id}`)
      // console.log(res);
      if(res.meta.status!==200){
        return this.$message.error('获取订单详情失败！')
      }
      this.orderForm = res.data
      // console.log('show-form数据1',this.orderForm);

      this.orderDialogVisible = true
    },
    async updateOrderInfo(){
      // 1.收集表单数据
      // console.log('确认start-form数据',this.orderForm);
      // 2.发送请求
      const {data:res} = await this.$http.put(`orders/${this.orderForm.order_id}`,{
        is_send: this.orderForm.is_send, // ***更新无效
        order_pay: this.orderForm.order_pay,
        order_price: this.orderForm.order_price,
        pay_status: this.orderForm.pay_status, // ***更新无效
      })
      // console.log('发送请求后得到的结果：',res);
      // 3-1.处理结果：失败
      if(res.meta.status!==201){
        return this.$message.error('修改订单数据失败！')
      }
      // 3-2.处理结果：成功
      this.orderForm = res.data
      this.getOrderList()
      // 4.隐藏对话框
      this.orderDialogVisible = false
      // console.log('刷新后得到的结果：',this.orderForm);
    }
  },  
}
</script>

<style lang="less" scoped>
.el-cascader{width: 100%;}
.el-button--mini{
  font-size: 16px;
}
</style>