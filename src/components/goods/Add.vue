<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 顶部提示信息 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>      
      <!-- form -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <!-- Tabs栏 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <!-- 表单填写区域 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="{ expandTrigger: 'hover',label:'cat_name',value:'cat_id',children:'children' }"
                @change="handleChange"
                clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cbox" v-for="(cbox,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item) in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture-card"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 组件 -->
            <quill-editor v-model="addForm.goods_introduce"/>
            <!-- 添加商品 按钮 -->
            <el-button type="primary" class="btnAdd" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 对话框：图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0', //当前所在步骤
      addForm: {
        goods_name: 'new good',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [], //图片列表(数组)
        goods_introduce: '', //[商品内容] 商品详情描述
        attrs: [],
      },
      addFormRules: {
        goods_name: [{required:true,message:'请输入商品名称',trigger:'blur'}],
        goods_price: [{required:true,message:'请输入商品价格',trigger:'blur'}],
        goods_weight: [{required:true,message:'请输入商品重量',trigger:'blur'}],
        goods_number: [{required:true,message:'请输入商品数量',trigger:'blur'}],
        goods_cat: [{required:true,message:'请选择商品分类',trigger:'blur'}],
      },
      catelist: [], //商品分类列表
      manyTableData: [], //动态参数 列表数据
      onlyTableData: [], //静态属性 列表数据
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload', //上传图片的URL地址      
      headerObj: { //设置图片上传的请求头部(对象)
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '', //预览图片 地址
      previewVisible: false, //预览图片 对话框(默认不显示)      
    }
  },
  created(){
    this.getCateList()
  },
  methods: {
    async getCateList(){ //获取商品分类列表
      const {data:res} = await this.$http.get('categories')
      if(res.meta.status!==200){
        return this.$message.error('获取商品分类数据失败！')
      }
      this.catelist = res.data
    },
    handleChange(value) { //[商品分类]级联选择器选中项变化时触发
      // console.log(value); //value = this.addForm.goods_cat
      // console.log(this.addForm.goods_cat);
      // 只允许选中三级商品分类
      if(value.length!==3){
        this.addForm.goods_cat=[]
      }
    },
    beforeTabLeave(activeName, oldActiveName){ //切换标签之前的钩子
      // console.log(activeName,oldActiveName); // 1 0
      if(oldActiveName==='0' && (this.addForm.goods_cat.length!==3 || this.addForm.goods_name==='' || this.addForm.goods_price==='' || this.addForm.goods_weight==='' || this.addForm.goods_number==='')){
        this.$message.error('请完成必填项！')
        return false //若[返回false]或者[返回Promise且被reject] 则阻止切换
      }      
    },
    async tabClicked(){
      // console.log(this.activeIndex);
      if(this.activeIndex==='1'){ //[商品参数] 动态参数
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})
        if(res.meta.status!==200) {
          return this.$message.error('获取动态参数列表失败！')
        }        
        // console.log(res.data)
        res.data.forEach(item=>{ // 参数列表:字符串->数组
          item.attr_vals = item.attr_vals.length===0 ? []:item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex==='2'){ //[商品属性] 静态属性
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})
        if(res.meta.status!==200){
          return this.$message.error('获取静态属性失败！')
        }
        // console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    handleRemove(file) { //移除图片时
      // console.log(file)
      // 1.获取[将要删除的图片]的[临时路径]
      const filePath = file.response.data.tmp_path
      // 2.在pics数组中 找到该图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic===filePath)
      // 3.删除pics数组中 对应的该图片
      this.addForm.pics.splice(i,1)
      // console.log(this.addForm)
    },
    handlePreview(file) { //预览图片时
      // console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    handleSuccess(response){ //文件上传成功时的钩子
      // console.log('response:',response);
      // 1.拼接得到一个图片信息对象
      const picInfo = {pic: response.data.tmp_path}
      // 2.将单个图片信息对象 push到pics数组中
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm.pics);
    },
    addGood(){ //添加商品      
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) {
          return this.$message.error('必填项不能为空！')
        }
        // 执行[添加商品]的业务逻辑
        // 1. lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        // console.log('form1',form); //数组
        form.goods_cat = form.goods_cat.join(',')
        // console.log('form2',form); //字符串

        // 2-1. 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 2-2. 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        // 2-3. 将[动态参数&静态属性]保存在form的attrs中
        form.attrs = this.addForm.attrs
        // console.log('addForm:',this.addForm);
        // console.log('form:',form);

        // 3. 发起请求 添加商品 (商品的名称 必须是唯一的)
        const {data:res} = await this.$http.post('goods', form)
        // console.log(res);
        if(res.meta.status!==201){
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods') //返回[商品列表]页面
      })
    }
  },
  computed: {
    cateId(){
      if(this.addForm.goods_cat.length===3){
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox{
  margin: 0 10px !important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>