<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索 & 添加btn -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>          
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>          
        </el-col>
      </el-row>
      <!-- 商品列表 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="105px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="105px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template v-slot="scope">
            <!-- 使用自定义格式化时间的全局过滤器 dateFormat -->
            {{scope.row.add_time*1000 | dateFormat}} 
          </template>
        </el-table-column>        
        <el-table-column label="操作" width="120px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGood(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '', //查询文本
        pagenum: 1, //页码
        pagesize: 10, //每页条数
      },
      goodslist: [], //商品列表
      total: 0, //商品总数
      addDialogVisible: false, //是否显示[添加商品]对话框
    }
  },
  created(){
    this.getGoodsList()
  },
  methods: {
    async getGoodsList(){ //获取[商品列表]
      const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
      if(res.meta.status!==200) return this.$message.error('获取商品列表失败！')
      // console.log(res.data)
      // this.$message.success('获取商品列表成功！')
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    showEditDialog(id){ //修改[商品]
      console.log(id);
    },
    removeGood(id){ //删除[商品]
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data:res} = await this.$http.delete(`goods/${id}`)
          if(res.meta.status!==200) return this.$message.error('删除商品失败！')          
          this.$message({type: 'success',message: '删除商品成功！'})
          this.getGoodsList()
        }).catch(() => {
          this.$message({type: 'info',message: '已取消删除'});          
        });
    },
    handleSizeChange(newSize){ //每页条数改变时
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage){ //页码改变时
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    goAddPage(){ //跳转到[添加商品]页面
      this.$router.push('/goods/add')
    },
  }
}
</script>

<style lang="less" scoped>

</style>