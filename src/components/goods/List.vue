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
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGood(scope.row.goods_id)"></el-button>
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
    <!-- 对话框：编辑商品 -->
    <el-dialog
      title="编辑商品"
      :visible.sync="editDialogVisible"
      width="70%"
      @close="editClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品参数" prop="attrs">
          <el-form-item v-for="(item) in editForm.attrs" :key="item.attr_id" class="goodAttrs">
            <el-input placeholder="请输入内容" v-model="item.attr_value">
              <template slot="prepend">{{item.attr_name}}</template>
            </el-input>
          </el-form-item>
        </el-form-item>
        <el-form-item label="商品图片" prop="pics">
          <el-upload
            class="upload-demo"
            :action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            list-type="picture-card"
            :headers="headerObj"
            :on-success="handleSuccess"
            :file-list="fileList">
            <i slot="default" class="el-icon-plus"></i>
          </el-upload>                
        </el-form-item>
        <el-form-item label="商品介绍" prop="goods_introduce">
          <!-- <el-input v-model="editForm.goods_introduce"></el-input> -->
          <!-- 富文本编辑器 组件 -->
          <quill-editor v-model="editForm.goods_introduce"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 对话框：图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" width="100%">
    </el-dialog>
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
      editDialogVisible: false, //是否显示[编辑商品]对话框
      editForm: { //[编辑商品]表单数据
        goods_id: '',
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        attrs: [],
      },
      editFormRules: {
        goods_name: [{required:true,message:'请输入商品名称',trigger:'blur'}],
        goods_price: [{required:true,message:'请输入商品价格',trigger:'blur'}],
        goods_number: [{required:true,message:'请输入商品数量',trigger:'blur'}],
        goods_weight: [{required:true,message:'请输入商品重量',trigger:'blur'}],
      },
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload', //上传图片的URL地址      
      headerObj: { //设置图片上传的请求头部(对象)
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '', //预览图片 地址
      previewVisible: false, //预览图片 对话框(默认不显示)      
      fileList: [],
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
    async editGood(id){ //打开[编辑商品]
      this.editDialogVisible = true
      const {data:res} = await this.$http.get(`goods/${id}`)
      if(res.meta.status!==200){
        return this.$message.error('获取商品数据失败！')
      }
      this.editForm = res.data

      // 处理 商品图片
      this.editForm.pics.forEach((pic,i) => {
        const picFile = {
          name: pic.goods_id+`-${i}`,
          url: pic.pics_sma_url,
        }
        this.fileList.push(picFile)
      })
    },
    editClose(){
      this.fileList = [] //清空图片列表
    },
    handleRemove(file) { //移除图片时
      // 1.获取[将要删除的图片]的[临时路径]
      // const filePath = file.response.data.tmp_path
      const filePath = file.url
      // 2.在pics数组中 找到该图片对应的索引值
      // const i = this.editForm.pics.findIndex(x => x.pic===filePath)
      const i = this.editForm.pics.findIndex(x => x.pics_sma_url===filePath)
      // 3.删除pics数组中 对应的该图片
      this.editForm.pics.splice(i,1)
    },
    handlePreview(file) { //预览图片时
      this.previewPath = file.url
      this.previewVisible = true
    },
    handleSuccess(response){ //文件上传成功时的钩子
      // 1.拼接得到一个图片信息对象
      const picInfo = {pic: response.data.tmp_path}
      // 2.将单个图片信息对象 push到pics数组中
      this.editForm.pics.push(picInfo)
    },
    editGoodSubmit(){ //提交[修改商品]
      // 1.验证表单数据
      this.$refs.editFormRef.validate(async valid => {
        if(!valid){
          return this.$message.error('必填项不能为空！')
        }
        // 2.验证通过后 发送请求
        const {data:res} = await this.$http.put(`goods/${this.editForm.goods_id}`, this.editForm)
        // console.log(res);
        if(res.meta.status!==200){
          return this.$message.error('修改商品数据失败！')
        }
        // 3.修改成功：收尾处理
        this.$message.success('修改商品数据成功！')
        this.getGoodsList() //刷新商品列表
        this.editDialogVisible = false //隐藏对话框
      })
    }
  }
}
</script>

<style lang="less" scoped>
.goodAttrs{
  margin-top: 5px;
}
</style>