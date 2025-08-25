# PostgreSQL 本地开发环境安装指南

## Windows 安装 PostgreSQL

### 方法1: 官方安装程序（推荐）

1. **下载PostgreSQL**
   - 访问: https://www.postgresql.org/download/windows/
   - 下载最新版本的PostgreSQL安装程序

2. **安装步骤**
   ```
   - 运行下载的.exe文件
   - 选择安装目录 (默认: C:\Program Files\PostgreSQL\15)
   - 选择组件 (全部选择)
   - 选择数据目录 (默认: C:\Program Files\PostgreSQL\15\data)
   - 设置超级用户密码 (记住这个密码!)
   - 选择端口 (默认: 5432)
   - 选择区域设置 (默认)
   - 完成安装
   ```

3. **验证安装**
   ```cmd
   # 打开新的命令行窗口
   psql --version
   ```

### 方法2: 使用 Chocolatey

```powershell
# 安装 Chocolatey (如果还没有)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 PostgreSQL
choco install postgresql
```

### 方法3: 使用 Docker (轻量级)

```powershell
# 如果已安装Docker
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# 连接到PostgreSQL
docker exec -it postgres-dev psql -U postgres
```

## 配置开发环境

### 1. 启动PostgreSQL服务
```cmd
# Windows服务
net start postgresql-x64-15

# 或通过服务管理器启动
services.msc -> 找到PostgreSQL服务 -> 启动
```

### 2. 创建开发数据库
```cmd
# 使用psql连接
psql -U postgres

# 在psql中执行
CREATE DATABASE project_management_system;
\q
```

### 3. 运行数据库设置脚本
```cmd
cd d:\compiler\vscodeprojects\workflow_pro\database
.\setup-postgresql.bat
```

## 环境变量配置

添加PostgreSQL到系统PATH:
```
C:\Program Files\PostgreSQL\15\bin
```

## 默认连接信息

- **Host**: localhost
- **Port**: 5432
- **Database**: project_management_system
- **Username**: postgres
- **Password**: postgres (或您设置的密码)

## 应用程序配置

应用程序已配置为使用PostgreSQL作为默认数据库:

```properties
# 开发环境 (默认PostgreSQL)
mvn spring-boot:run

# 如果需要使用MySQL
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

## 故障排除

### PostgreSQL服务未启动
```cmd
# 启动服务
net start postgresql-x64-15

# 检查服务状态
sc query postgresql-x64-15
```

### 连接被拒绝
1. 检查pg_hba.conf文件
2. 确保PostgreSQL监听正确的地址和端口
3. 检查防火墙设置

### 密码认证失败
1. 重置postgres用户密码
2. 检查application.properties中的密码设置
