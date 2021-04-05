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
          <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加参数</el-button>
          <!-- 表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template>
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加属性</el-button>  
          <!-- 表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template>
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>        
        </el-tab-pane>
      </el-tabs>
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
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params:{sel:this.activeName}})
      if(res.meta.status!==200) return this.$message.error('获取参数列表失败！')
      // console.log(res.data);
      if(this.activeName==='many'){
        this.manyTableData = res.data
      }else{
        this.onlyTableData = res.data
      }
    },
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
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
  margin: 15px 0;
}
</style>