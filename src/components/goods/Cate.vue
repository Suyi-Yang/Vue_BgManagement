<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- btn：添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类 列表 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :border="true"
        :show-row-hover="false"
        index-text="#"
        :show-index="true"
        :expand-type="false"
        :selection-type="false">
        <!-- 列：是否有效 -->
        <template v-slot:isDeleted="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:forestgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>     
        <!-- 列：排序 --> 
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 列：操作 -->
        <template v-slot:opt="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 对话框：添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', checkStrictly: 'true', value: 'cat_id', label: 'cat_name', children: 'children' }"
            @change="parentCateChange"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 对话框：修改分类 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>        
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: { // 查询条件
        type:3,
        pagenum:1,
        pagesize:5
      },
      cateList: [], // 商品分类的数据列表
      total: 0, // 总数据的条数
      columns: [ // 为table指定列的定义
        {
          label: '分类名称', // 标题
          prop: 'cat_name', // 该列绑定的数据属性
        },
        {
          label: '是否有效',
          type: 'template', // 表示将当前列定义为模板列
          template: 'isDeleted', // 表示使用的模板名称
        },
        {
          label: '排序',
          type: 'template', // 表示将当前列定义为模板列
          template: 'order', // 表示使用的模板名称
        },
        {
          label: '操作',
          type: 'template', // 表示将当前列定义为模板列
          template: 'opt', // 表示使用的模板名称
        },
      ],
      addCateDialogVisible: false, // 是否显示[添加分类]
      addCateForm: { // [添加分类]表单的数据对象
        cat_name: '',
        cat_pid: 0, // 父级分类的id (0为一级分类的父id)
        cat_level: 0 // 分类层级 (0/1/2表示一/二/三级分类)
      },
      addCateFormRules: { // [添加分类]表单的验证规则对象
        cat_name: [
          {required:true, message:'请输入分类名称', trigger: 'blur'}
        ]
      },
      parentCateList: [], // 父级分类的列表
      selectedKeys: [], // 选中的父级分类的id数组
      editCateDialogVisible: false,
      editCateForm: {
        cat_name:'',
        cat_id: ''
      },
      editCateFormRules: {
        cat_name: [
          {required:true, message:'请输入分类名称', trigger: 'blur'}
        ]
      },
    }
  },
  created(){
    this.getCateList()
  },
  methods: {
    async getCateList(){ // 获取商品分类数据
      const {data:res} = await this.$http.get('categories',{params:this.queryInfo})
      if(res.meta.status!==200) return this.$message.error('获取商品分类失败！')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize){ // 监听 每页显示的条数 变化
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage){ //监听 页码 变化
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog(){ // 显示[添加分类]
      this.getParentCateList() // 获取父级分类的数据列表
      this.addCateDialogVisible = true
    },
    async getParentCateList(){
      const {data:res} = await this.$http.get('categories',{
        params:{type:2} // 只用获取到二级分类
      })
      if(res.meta.status!==200) return this.$message.error('获取父级分类数据失败！')
      this.parentCateList = res.data
      // console.log(res.data);
    },
    parentCateChange(){ // 选择项变化时触发的函数
      // console.log(this.selectedKeys);
      // 若selectedKeys数组的length>0, 则表示该新增分类有父级分类
      if(this.selectedKeys.length>0){
        // 新增分类的父id 为selectedKeys数组的最后一项
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
        // 为[新增分类的等级(0/1/2)]赋值 (与selectedKeys的length相同)
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else{ // 若selectedKeys数组的length为0
        this.addCateForm.cat_pid = 0 //该分类 没有父级分类cat_pid=0
        this.addCateForm.cat_level = 0 //该分类 为一级分类cat_level=0
      }
    },
    addCateDialogClosed(){ // 监听对话框的关闭事件 重置表单数据
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    addCate(){ // 点击[确定] 添加分类
      this.$refs.addCateFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status!==201) return this.$message.error('添加分类失败！')
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    showEditCateDialog(cate){
      this.editCateForm.cat_name = cate.cat_name //显示当前name
      this.editCateForm.cat_id = cate.cat_id //存储当前id
      this.editCateDialogVisible = true
    },
    editCateDialogClosed(){
      this.$refs.editCateFormRef.resetFields()
    },
    editCate(){
      this.$refs.editCateFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {cat_name:this.editCateForm.cat_name})
        if(res.meta.status!==200) return this.$message.error('修改分类失败！')
        this.$message.success('修改分类成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    removeCateById(id){ // 根据id删除对应的分类信息
      // console.log(id);
      // 弹框询问用户是否删除数据
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data:res} = await this.$http.delete('categories/'+id)
          if(res.meta.status!==200) return this.$message.error('删除分类失败！')
          this.getCateList() // 刷新分类列表
          this.$message({ type: 'success', message: '删除分类成功!' });
        }).catch(() => {
          this.$message({ type: 'info', message: '已取消删除' });
        });
    },
  }
}
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>