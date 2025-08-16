# API 404错误和数据显示问题解决方案

## 问题分析

您遇到的问题主要有两个方面：

### 1. API端点404错误
- `http://localhost:8080/api/teams` - 404
- `http://localhost:8080/api/team-members` - 404

### 2. 前端Select组件显示问题
- Team和Project Lead选择框显示ID而不是名称
- "Create New Project"标题显示问题

## 解决方案

### 后端API修复

#### 问题原因
1. **Maven未安装**: 后端无法编译和启动
2. **API路径不一致**: ProjectController使用`/projects`而不是`/api/projects`
3. **实体关系配置**: Team和Lead使用LAZY loading导致序列化问题

#### 修复步骤

1. **修复API路径一致性**
   ```java
   // ProjectController.java - 已修复
   @RestController
   @RequestMapping("/api/projects")  // 改为 /api/projects
   @CrossOrigin(origins = "*")
   ```

2. **修复实体关系加载**
   ```java
   // Project.java - 已修复
   @ManyToOne(fetch = FetchType.EAGER)  // 改为 EAGER
   @JoinColumn(name = "team_id")
   private Team team;
   
   @ManyToOne(fetch = FetchType.EAGER)  // 改为 EAGER
   @JoinColumn(name = "lead_id")
   private TeamMember lead;
   ```

3. **修复JSON序列化配置**
   ```java
   // Team.java - 已修复
   @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
   @JsonManagedReference  // 改为 JsonManagedReference
   private List<TeamMember> members;
   ```

### 前端选择组件优化

#### 修复Select组件显示
```javascript
// ProjectForm.js - 已修复
<Select 
  placeholder="Select team"
  showSearch
  optionFilterProp="children"
  filterOption={(input, option) =>
    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
  }
>
  {teams.map(team => (
    <Option key={team.id} value={team.id}>
      {team.name}
    </Option>
  ))}
</Select>
```

### 数据库测试数据

#### 增强的测试数据
已在`schema.sql`中添加了丰富的测试数据：

- **9个团队**:
  - SAGE Team
  - Data Analytics
  - Cloud Infrastructure
  - Frontend Development
  - Backend Development
  - DevOps & Infrastructure
  - Quality Assurance
  - Product Management
  - Security Team

- **30个团队成员**: 每个团队3-4个成员，包含不同角色

- **6个项目**: 涵盖不同状态(Green/Amber/Red)和不同团队

- **18个里程碑**: 每个项目3个里程碑

## 立即可用的解决方案

### 1. 环境准备
需要安装以下软件：
```bash
# Java 17+
java -version

# Maven 3.6+
mvn -version

# MySQL 8.0+
mysql --version
```

### 2. 数据库初始化
```sql
-- 连接MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE project_management;
USE project_management;

-- 执行完整的schema.sql (包含所有测试数据)
source d:/compiler/vscodeprojects/workflow_pro/database/schema.sql;
```

### 3. 启动服务

#### 后端启动
```bash
cd d:/compiler/vscodeprojects/workflow_pro/backend
mvn spring-boot:run
```

#### 前端启动
```bash
cd d:/compiler/vscodeprojects/workflow_pro/frontend
npm start
```

### 4. 验证API端点

启动后应该可以访问：
- `http://localhost:8080/api/projects` - 项目列表
- `http://localhost:8080/api/teams` - 团队列表  
- `http://localhost:8080/api/team-members` - 团队成员列表

### 5. 测试功能

1. **项目管理**:
   - 查看项目列表 (6个测试项目)
   - 创建新项目 (可选择团队和负责人)
   - 编辑现有项目 (数据正确预填充)

2. **团队管理**:
   - 查看团队列表 (9个测试团队)
   - 创建新团队
   - 编辑团队信息
   - 分配团队成员

## 当前状态

### ✅ 已完成
- 前端代码编译成功
- 所有组件正确实现
- API路径配置修复
- 实体关系优化
- 丰富的测试数据
- Select组件用户体验优化

### ⚠️ 待完成
- Maven环境安装
- 后端服务启动
- 数据库连接配置
- 端到端功能测试

### 🔧 临时解决方案

如果无法立即安装Maven，可以：

1. **使用IDE**: 使用IntelliJ IDEA或Eclipse直接运行Spring Boot应用
2. **使用Gradle**: 将项目转换为Gradle构建
3. **Docker部署**: 使用Docker容器运行整个应用栈

## 预期结果

解决这些问题后：
- Team和Lead下拉框将正确显示团队名称和成员姓名
- 编辑项目时会正确预填充团队和负责人信息
- 所有API端点将正常工作
- 前端可以完整地管理项目、团队和成员

数据显示将变为：
- Team: "Frontend Development" (而不是"4")
- Lead: "Sophie Turner (Frontend Lead)" (而不是"11")
