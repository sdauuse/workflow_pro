# 快速解决404错误指南

## 🚨 当前问题
- API端点 `http://localhost:8080/api/teams` 和 `http://localhost:8080/api/team-members` 返回404
- Team和Lead选择框显示ID而不是名称

## ✅ 已修复的代码
1. **后端API路径统一** - 所有Controller现在使用 `/api/*` 前缀
2. **实体关系优化** - Team和Lead改为EAGER加载
3. **前端Select组件增强** - 添加搜索功能和过滤
4. **丰富测试数据** - 9个团队，30个成员，6个项目

## 🔧 立即解决方案

### 方案1: 安装Maven并启动后端

```bash
# 1. 下载并安装Maven 3.6+
# https://maven.apache.org/download.cgi

# 2. 启动后端
cd d:\compiler\vscodeprojects\workflow_pro\backend
mvn spring-boot:run

# 3. 验证API
# 浏览器访问: http://localhost:8080/api/teams
```

### 方案2: 使用IDE运行后端

1. **IntelliJ IDEA**:
   - 打开 `d:\compiler\vscodeprojects\workflow_pro\backend`
   - 找到 `ProjectManagementApplication.java`
   - 右键 → Run

2. **Eclipse**:
   - Import → Existing Maven Projects
   - 选择backend文件夹
   - 运行主类

3. **VS Code**:
   - 安装Java Extension Pack
   - 打开backend文件夹
   - Ctrl+Shift+P → "Java: Run"

### 方案3: 使用Docker (推荐)

```bash
# 在项目根目录创建 docker-compose.yml
cd d:\compiler\vscodeprojects\workflow_pro

# 启动完整服务栈
docker-compose up -d
```

## 📊 测试数据概览

启动后您将看到:

### 团队 (9个)
- SAGE Team
- Data Analytics  
- Cloud Infrastructure
- Frontend Development
- Backend Development
- DevOps & Infrastructure
- Quality Assurance
- Product Management
- Security Team

### 项目 (6个)
- SAGE TWD Implementation (AMBER)
- Customer Portal Redesign (GREEN)
- API Gateway Implementation (AMBER) 
- Data Lake Migration (RED)
- Mobile App Development (GREEN)
- DevOps Pipeline Automation (AMBER)

### 成员 (30个)
每个团队3-4个成员，包含不同角色(Lead, Developer, Analyst等)

## 🎯 验证步骤

1. **后端启动成功**:
   ```
   http://localhost:8080/api/teams
   http://localhost:8080/api/team-members  
   http://localhost:8080/api/projects
   ```

2. **前端功能测试**:
   - 创建项目 → Team下拉显示团队名称
   - 编辑项目 → 正确预填充数据
   - Teams页面 → 显示所有团队信息

3. **数据完整性**:
   - 项目列表显示正确的Team & Lead信息
   - 编辑表单显示名称而不是ID

## 🆘 如果仍有问题

### 检查后端日志
```bash
# 查看Spring Boot启动日志
# 确认:
# 1. 数据库连接成功
# 2. 所有Controller注册成功  
# 3. 端口8080可用
```

### 检查数据库连接
```sql
-- 确认数据存在
SELECT COUNT(*) FROM teams;
SELECT COUNT(*) FROM team_members;
SELECT COUNT(*) FROM projects;
```

### 检查网络
```bash
# 确认端口可访问
curl http://localhost:8080/api/teams
curl http://localhost:8080/api/team-members
```

## 📝 预期结果

修复后的界面将显示:
- Team选择框: "Frontend Development", "Backend Development" 等
- Lead选择框: "Sophie Turner (Frontend Lead)", "Robert Miller (Backend Lead)" 等
- 项目列表Team & Lead列: 显示团队名称和负责人姓名

**不再显示**: "1", "4", "11" 等ID数字
