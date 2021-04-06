<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
            @change="handleChange"
            clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 表格：动态参数 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 参数对应的可选值 [] -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 添加参数</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>  
          <!-- 表格：静态属性 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 参数对应的可选值 [] -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 添加属性</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>        
        </el-tab-pane>
      </el-tabs>
      <!-- 对话框：添加参数/属性 -->
      <el-dialog
        :title="'添加'+titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">        
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 对话框：修改参数/属性 -->
      <el-dialog
        :title="'修改'+titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">        
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      selectedKeys: [],
      activeName: 'many', //被激活的tab页
      manyTableData: [], //动态参数的数据
      onlyTableData: [], //静态属性的数据
      addDialogVisible: false,
      addForm: {
        attr_name: '',
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
      editDialogVisible: false,
      editForm: {
        attr_name: '',
        attr_id: ''
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
      inputVisible: false, //[newTag]文本框的显示隐藏
      inputValue: '', //[newTag]文本框的输入内容
    }
  },
  created(){
    this.getCateList()
  },
  methods: {
    async getCateList(){
      const {data:res} = await this.$http.get('categories')
      if(res.meta.status!==200) return this.$message.error('获取商品分类失败！')
      this.cateList = res.data
      // console.log(this.cateList);
    },
    handleChange(){ //[选择商品分类] 级联选择项改变时
      // console.log(this.selectedKeys);
      this.getParamsData()
    },
    handleTabClick(){ //tab页签改变时
      this.getParamsData()
    },
    async getParamsData(){ //获取 参数列表数据
      // console.log(this.selectedKeys);
      // [选择商品分类]为空或不是三级分类时 清空相关数据
      if(this.selectedKeys.length!==3){
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // [选择商品分类]是三级分类时
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params:{sel:this.activeName}})
      if(res.meta.status!==200) return this.$message.error('获取参数列表失败！')

      // console.log(res.data);
      res.data.forEach(item=>{
        // 处理attr_vals：字符串 => 数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 处理newTag->input：每行数据item分别指定自己的visible和value
        item.inputVisible = false //[newTag]文本框的显示隐藏
        item.inputValue = '' //[newTag]文本框的输入内容
      })

      if(this.activeName==='many'){
        this.manyTableData = res.data
      }else{
        this.onlyTableData = res.data
      }
    },
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    addParams(){ //点击[确定] 添加参数/属性
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        // console.log(res);
        if(res.meta.status!==201) return this.$message.error(`${this.activeName==='many'?'添加参数失败！':'添加属性失败！'}`)
        this.$message.success(`${this.activeName==='many'?'添加参数成功！':'添加属性成功！'}`)
        this.addDialogVisible=false
        this.getParamsData()
      })
    },
    async showEditDialog(id){ //显示[修改属性]对话框
      this.editForm.attr_id=id
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {params:{attr_sel: this.activeName}})
      if(res.meta.status!=200) return this.$message.error('获取参数信息失败！')
      this.editForm.attr_name=res.data.attr_name      
      this.editDialogVisible=true
    },
    editDialogClosed(){ //关闭[修改属性]对话框
      this.$refs.editFormRef.resetFields()
    },
    editParams(){ //修改参数/属性
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
          attr_name: this.editForm.attr_name,
          attr_sel:this.activeName
        })
        if(res.meta.status!==200) return this.$message.error(`${this.activeName==='many'?'修改参数失败！':'修改属性失败！'}`)
        this.$message.success(`${this.activeName==='many'?'修改参数成功！':'修改属性成功！'}`)
        this.getParamsData()
        this.editDialogVisible=false
      })
    },
    removeParams(id) {
      this.$confirm(`此操作将永久删除该${this.activeName==='many'?'参数':'属性'}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if(res.meta.status!==200) return this.$message.error('删除失败！')
        this.$message({ type: 'success', message: '删除成功！' });
        this.getParamsData()
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消删除' });          
      });
    },
    showInput(cate) {
      cate.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick：当页面上元素被重新渲染之后 才会指定回调函数中的代码
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 将[对attr_vals的操作结果] 保存到数据库中
    async saveAttrVals(cate){
      // 发起请求 保存这次操作 (1.7.5. 编辑提交参数)
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${cate.attr_id}`, {
        attr_name: cate.attr_name,
        attr_sel: cate.attr_sel,
        attr_vals: cate.attr_vals.join(','),
      })
      if(res.meta.status!==200){
        return this.$message.error('修改参数选项值失败！')
      }
      this.$message.success('修改参数选项值成功！')
    },
    handleInputConfirm(cate) {
      if(cate.inputValue.trim().length===0){
        cate.inputValue = ''
        cate.inputVisible = false
        return
      }
      // 没有return 则证明有输入内容 则进行以下处理
      cate.attr_vals.push(cate.inputValue)
      cate.inputValue = ''
      cate.inputVisible = false
      // 发起请求 保存这次操作
      this.saveAttrVals(cate)
    },    
    handleClose(i,cate){
      cate.attr_vals.splice(i, 1)
      this.saveAttrVals(cate)
    }
  },
  computed: {
    isBtnDisabled(){
      // 如果按钮需要被禁用 则返回true 否则返回false
      if(this.selectedKeys.length !== 3){
        return true
      }
      return false
    },
    cateId(){ //当前选中的三级分类的id
      if(this.selectedKeys.length===3){
        return this.selectedKeys[2]
      }
      return null
    },
    titleText(){ //动态计算 显示的弹框标题文本
      if(this.activeName==='many'){
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
  margin: 15px 0;
}
.el-tag, .input-new-tag, .button-new-tag{
  margin: 5px;
}
.input-new-tag{
  width: 90px;
}
</style>