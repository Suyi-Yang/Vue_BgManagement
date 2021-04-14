<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索 & 添加btn -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>          
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>          
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope"> <!-- v-slot:作用域插槽(slot-scope) -->
            <!-- scope.row：拿到当前行row的数据 -->
            <el-switch 
              v-model="scope.row.mg_state" 
              @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 对话框：添加用户 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 对话框：修改用户 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 对话框：分配角色 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    // 验证邮箱的自定义规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9])+(\.[a-zA-Z0-9])/
      if(regEmail.test(value)) return callback() // 验证通过
      callback(new Error('请输入合法的邮箱')) // 验证不通过
    }
    // 验证手机号的自定义规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
      if(regMobile.test(value)) return callback() // 验证通过
      callback(new Error('请输入合法的手机号')) // 验证不通过
    }
    return {
      queryInfo:{ // 获取用户列表的参数对象
        query: '', // 查询参数
        pagenum: 1, // 当前页码
        pagesize: 5 // 每页显示条数
      },
      userlist: [], //返回得到的用户列表
      total: 0, //返回得到的用户总数
      addDialogVisible: false, //是否显示[添加用户]对话框
      addForm: {}, //[添加用户]表单的数据
      addFormRules: { //[添加用户]表单的验证规则对象
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3~10个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6~15个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ],
      },
      editDialogVisible: false, //是否显示[修改用户]对话框
      editForm: {}, //[修改用户]查询到的用户信息对象
      editFormRules: { //[修改用户]表单的验证规则对象
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ],
      },
      setRoleDialogVisible: false, //是否显示[分配角色]对话框
      userInfo: {}, //当前[分配角色]对话框 对应的用户信息
      rolesList: [], //所有角色的数据列表
      selectedRoleId: '' //已选中的角色id值
    }
  },
  created(){
    this.getUserList()
    console.log('test');
  },
  methods: {
    async getUserList(){
      const {data:res} = await this.$http.get('users',{params:this.queryInfo})
      if(res.meta.status!==200) return this.$message.error('获取用户列表失败！')
      this.userlist = res.data.users
      this.total = res.data.total
      // console.log(res);
    },
    handleSizeChange(val) { // 监听[pagesize]改变的事件
      // console.log(`每页 ${val} 条`);
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    handleCurrentChange(val) { // 监听[页码值]改变的事件
      // console.log(`当前页: ${val}`);
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    async userStateChanged(userInfo){ // 监听[switch开关]状态的改变
      console.log(userInfo);
      const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if(res.meta.status!==200){
        userInfo.mg_state = !userInfo.mg_state //还原用户状态
        return this.$message.error("更新用户状态失败！")
      }
      this.$message.success("更新用户状态成功！")
    },
    addDialogClosed(){ // 监听[添加用户]对话框的关闭事件
      this.$refs.addFormRef.resetFields()
    },
    addUser(){ // 点击[确定] 添加新用户
      this.$refs.addFormRef.validate(async valid=>{
        // console.log(valid);
        // 未通过验证 则直接返回
        if(!valid) return 
        // 通过验证 则发起[添加用户的网络请求]
        const {data:res} = await this.$http.post('users',this.addForm)
        if(res.meta.status!==201){
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        this.addDialogVisible = false // 隐藏对话框
        this.getUserList() // 重新获取用户列表数据
      })
    },
    async showEditDialog(id){ // 显示[修改用户]对话框&当前用户信息
      const {data:res} = await this.$http.get('users/'+id)
      if(res.meta.status!==200) return this.$message.error('查询用户信息失败！')
      this.editForm = res.data
      this.editDialogVisible=true
    },
    editDialogClosed(){ // 监听[修改用户]对话框的关闭事件
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo(){ // 修改用户信息并提交
      this.$refs.editFormRef.validate(async valid=>{
        // console.log(valid);
        if(!valid) return
        // 发起修改用户信息的数据请求
        const {data:res} = await this.$http.put('users/'+this.editForm.id,{
          email:this.editForm.email,
          mobile:this.editForm.mobile
        })
        if(res.meta.status!==200) return this.$message.error('更新用户信息失败！')
        this.editDialogVisible = false // 关闭对话框
        this.getUserList() // 刷新数据列表
        this.$message.success('更新用户信息成功！') // 提示修改成功
      })
    },
    removeUserById(id){ // 根据id删除对应的用户信息
      // console.log(id);
      // 弹框询问用户是否删除数据
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data:res} = await this.$http.delete('users/'+id)
          if(res.meta.status!==200) return this.$message.error('删除用户失败！')
          this.getUserList() // 刷新用户列表
          this.$message({ type: 'success', message: '删除用户成功!' });
        }).catch(() => {
          this.$message({ type: 'info', message: '已取消删除' });          
        });
    },
    async setRole(userInfo){ // 显示[分配角色]对话框
      // console.log(userInfo);
      this.userInfo = userInfo
      const {data:res} = await this.$http.get('roles')
      if(res.meta.status!==200) return this.$message.error('获取角色列表失败！')
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    async saveRoleInfo(){ // 点击[确定] 分配新角色
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色！')
      }
      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
      if(res.meta.status!==200) return this.$message.error('更新角色失败！')
      this.getUserList() //刷新用户列表
      this.setRoleDialogVisible = false
      this.$message.success('更新角色成功！')
    },
    setRoleDialogClosed(){ // 监听[分配角色]对话框的关闭事件
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>