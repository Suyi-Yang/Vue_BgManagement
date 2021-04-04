<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 按钮[添加角色] -->
      <el-row>
        <el-col
          ><el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          ></el-col
        >
      </el-row>
      <!-- 权限列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row 
              :class="['bdbottom', i1 === 0 ? 'bdtop':'', 'vcenter']" 
              v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 & 三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '':'bdtop', 'vcenter']"
                  v-for="(item2,i2) in item1.children" :key="item2.id">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag 
                      type="warning" 
                      v-for="(item3) in item2.children" 
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>        
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleInfo(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 对话框：添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 对话框：编辑角色 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 对话框：分配权限 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        :props="treeProps"
        ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [], //所有角色列表数据
      // 添加角色
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在2~10个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在2~10个字符', trigger: 'blur' },
        ],
      },
      // 编辑角色
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在2~10个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在2~10个字符', trigger: 'blur' },
        ],
      },
      // 分配权限
      setRightDialogVisible: false,
      rightsList: [], //所有权限的数据
      treeProps: { //树形控件的属性绑定对象
        label: 'authName',
        children: 'children',
      },
      defKeys: [], //默认选中的节点id值的数组
      roleId: '' //当前即将分配权限的角色id
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() { // 获取所有角色列表      
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表失败！')
      this.rolesList = res.data
      // console.log(res.data);
    },
    addDialogClosed() { // 重置[添加角色]表单
      this.$refs.addFormRef.resetFields()
    },
    addRole() { // [添加角色]
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201)
          return this.$message.error('添加角色失败！')
        this.$message.success('添加角色成功！')
        this.addDialogVisible = false
        this.getRolesList() //刷新角色列表
      })
    },
    async showEditRoleInfo(id) { // 显示[编辑角色] 获取当前角色信息
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200)
        return this.$message.error('获取角色信息失败！')
      this.editForm = res.data
    },
    editDialogClosed() { // 重置[编辑角色]表单      
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo() { // 提交 修改的角色信息
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc,
        })
        if (res.meta.status !== 200)
          return this.$message.error('修改角色信息失败！')
        this.editForm = res.data        
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('修改角色信息成功！')
      })
    },
    removeRoleById(id){ // 根据id删除对应的角色信息
      // console.log(id);
      // 弹框询问用户是否删除数据
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data:res} = await this.$http.delete('roles/'+id)
          if(res.meta.status!==200) return this.$message.error('删除角色失败！')
          this.getRolesList() // 刷新用户列表
          this.$message({ type: 'success', message: '删除角色成功!' });
        }).catch(() => {
          this.$message({ type: 'info', message: '已取消删除' });          
        });
    },
    removeRightById(role, rightId){ // 根据id删除对应的权限
      // 弹框询问用户是否删除数据
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {          
          const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
          if(res.meta.status!==200) return this.$message.error('删除权限失败！')
          this.$message({ type: 'success', message: '删除权限成功!' });
          // this.getRolesList() // 刷新用户列表
          role.children = res.data //重新获取当前role的children 避免刷新整个列表
        }).catch(() => {
          this.$message({ type: 'info', message: '已取消删除' });          
        });
    },
    async showSetRightDialog(role){ // 显示[分配权限] 并显示对应权限
      this.roleId = role.id
      const {data:res} = await this.$http.get('rights/tree')
      if(res.meta.status!==200) return this.$message.error('获取权限数据失败！')
      this.rightsList = res.data //把获取到的权限数据保存到data中
      // console.log(this.rightsList);      
      this.getLeafKeys(role,this.defKeys) // 递归获取三级节点的id
      this.setRightDialogVisible=true;
    },
    // 递归 获取角色下所有三级权限的id 保存到defKeys数组中
    getLeafKeys(node,arr){
      // 若当前node节点不包含children属性 则其为三级节点 添加到数组中
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        return this.getLeafKeys(item,arr)
      });
    },
    setRightDialogClosed(){ // 监听[分配权限]对话框的关闭事件
      this.defKeys = [] //重置默认勾选的items
    },
    async allotRights(){ // 点击[确定] 为角色分配权限
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids:idStr})
      if(res.meta.status!==200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible=false
    }
  },
}
</script>

<style lang="less" scoped>
.el-tag{margin: 7px;}
.bdtop{border-top: 1px solid #eee;}
.bdbottom{border-bottom: 1px solid #eee;}
.vcenter{display: flex; align-items: center;}
</style>