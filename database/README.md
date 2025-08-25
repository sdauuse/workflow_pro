# Database Structure - Workflow Pro

此项目支持两种数据库系统：**MySQL** 和 **PostgreSQL**。所有数据库相关文件已按数据库类型重新组织。

## 📁 文件结构

```
database/
├── mysql/                           # MySQL 相关文件
│   ├── schema.sql                   # MySQL 主要数据库架构
│   ├── test_data.sql               # MySQL 测试数据
│   ├── gantt_test_data.sql         # MySQL 甘特图测试数据
│   ├── add_estimation_migration.sql # MySQL 估算字段迁移
│   ├── milestone-migration.sql      # MySQL 里程碑迁移
│   ├── gantt_chart_migration.sql    # MySQL 甘特图迁移
│   ├── backend_compatibility_update.sql # MySQL 后端兼容性更新
│   ├── project-phases-schema.sql    # MySQL 项目阶段架构
│   ├── setup-mysql.sh             # MySQL 设置脚本 (Linux/Mac)
│   └── setup-mysql.bat            # MySQL 设置脚本 (Windows)
│
└── postgresql/                      # PostgreSQL 相关文件
    ├── schema.sql                   # PostgreSQL 主要数据库架构
    ├── test_data.sql               # PostgreSQL 测试数据
    ├── extended_test_data.sql      # PostgreSQL 扩展测试数据
    ├── gantt_test_data.sql         # PostgreSQL 甘特图测试数据
    ├── add_estimation_migration.sql # PostgreSQL 估算字段迁移
    ├── milestone-migration.sql      # PostgreSQL 里程碑迁移
    ├── gantt_chart_migration.sql    # PostgreSQL 甘特图迁移
    ├── backend_compatibility_update.sql # PostgreSQL 后端兼容性更新
    ├── project-phases-schema.sql    # PostgreSQL 项目阶段架构
    ├── setup-postgresql.sh         # PostgreSQL 设置脚本 (Linux/Mac)
    └── setup-postgresql.bat        # PostgreSQL 设置脚本 (Windows)
```

## 🚀 快速设置

### MySQL 设置

#### Windows:
```cmd
cd database\mysql
setup-mysql.bat
```

#### Linux/Mac:
```bash
cd database/mysql
chmod +x setup-mysql.sh
./setup-mysql.sh
```

### PostgreSQL 设置

#### Windows:
```cmd
cd database\postgresql
setup-postgresql.bat
```

#### Linux/Mac:
```bash
cd database/postgresql
chmod +x setup-postgresql.sh
./setup-postgresql.sh
```

## 📋 主要差异

### MySQL vs PostgreSQL 语法差异

| 功能 | MySQL | PostgreSQL |
|------|-------|------------|
| 自增主键 | `BIGINT AUTO_INCREMENT PRIMARY KEY` | `BIGSERIAL PRIMARY KEY` |
| 枚举类型 | `ENUM('value1', 'value2')` | 需要先创建: `CREATE TYPE type_name AS ENUM (...)` |
| 当前时间戳 | `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 使用触发器更新 |
| 字段注释 | `COMMENT 'description'` | `COMMENT ON COLUMN table.column IS 'description'` |
| 条件检查 | `IF EXISTS` 子句 | `DO $$ BEGIN ... EXCEPTION ... END $$` 块 |
| 日期函数 | `CURDATE()`, `DATE_ADD()` | `CURRENT_DATE`, `+ INTERVAL` |

### 核心表结构

两个数据库系统都包含以下核心表：

1. **teams** - 团队信息
2. **team_members** - 团队成员
3. **projects** - 项目信息
4. **key_milestones** - 关键里程碑
5. **project_phases** - 项目阶段（甘特图功能）
6. **risks_issues** - 风险和问题
7. **project_dependencies** - 项目依赖

## 🔧 配置信息

### 默认数据库配置

**数据库名称**: `project_management_system`
**用户名**: `workflow_user`
**密码**: `workflow_password`

### MySQL 连接
- **主机**: localhost
- **端口**: 3306
- **连接字符串**: `jdbc:mysql://localhost:3306/project_management_system`

### PostgreSQL 连接
- **主机**: localhost
- **端口**: 5432
- **连接字符串**: `postgresql://workflow_user:workflow_password@localhost:5432/project_management_system`

## 📚 使用说明

### 1. 新建数据库
使用对应的设置脚本一键创建完整的数据库结构和测试数据。

### 2. 迁移现有数据库
如果已有数据库，可以单独运行迁移脚本：
- `add_estimation_migration.sql` - 添加估算字段
- `milestone-migration.sql` - 里程碑表增强
- `gantt_chart_migration.sql` - 甘特图功能
- `backend_compatibility_update.sql` - 后端兼容性

### 3. 测试数据
- `test_data.sql` - 基础测试数据
- `gantt_test_data.sql` - 甘特图专用测试数据

## 🎯 甘特图功能

新的甘特图功能基于 `project_phases` 表，支持：

- ✅ 计划时间 vs 实际时间对比
- ✅ 项目阶段状态跟踪
- ✅ 进度百分比管理
- ✅ 超期检测
- ✅ 多种项目阶段：ESTIMATED, PLANNING, DEVELOPMENT, SIT, UAT, LIVE

## 🔄 版本控制

当对数据库结构进行更改时：

1. 在相应的数据库文件夹中更新文件
2. 确保 MySQL 和 PostgreSQL 版本保持功能一致
3. 更新此 README 文件

## 📞 支持

如果在设置过程中遇到问题：

1. 确保数据库服务正在运行
2. 检查连接参数是否正确
3. 确认用户权限是否足够
4. 查看错误日志获取详细信息

---

**注意**: 设置脚本会删除现有数据库和用户，请确保备份重要数据！
