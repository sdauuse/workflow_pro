# 本地开发环境安装指南

您的系统当前缺少一些必要的开发工具。以下是完整的安装指南：

## 1. 安装 Java 21

### 方法1: Oracle JDK (推荐)
1. 访问 https://www.oracle.com/java/technologies/downloads/
2. 下载 Java 21 for Windows x64
3. 运行安装程序
4. 设置环境变量:
   - `JAVA_HOME` = `C:\Program Files\Java\jdk-21`
   - 添加到 `PATH`: `%JAVA_HOME%\bin`

### 方法2: OpenJDK
1. 访问 https://adoptium.net/
2. 下载 Temurin 21 (LTS)
3. 安装并配置环境变量

### 方法3: 使用 Chocolatey
```powershell
# 安装Java 21
choco install openjdk
```

## 2. 安装 Maven

### 方法1: 官方下载
1. 访问 https://maven.apache.org/download.cgi
2. 下载 Binary zip archive
3. 解压到 `C:\Program Files\Apache\maven`
4. 设置环境变量:
   - `MAVEN_HOME` = `C:\Program Files\Apache\maven`
   - 添加到 `PATH`: `%MAVEN_HOME%\bin`

### 方法2: 使用 Chocolatey
```powershell
choco install maven
```

## 3. 安装 PostgreSQL

### 官方安装程序
1. 访问 https://www.postgresql.org/download/windows/
2. 下载最新版本 (推荐 15 或 16)
3. 运行安装程序:
   - 设置超级用户 (postgres) 密码
   - 端口保持默认 5432
   - 安装所有组件
4. 安装完成后，PostgreSQL会自动启动

### 使用 Chocolatey
```powershell
choco install postgresql
```

## 4. 验证安装

### 检查Java
```cmd
java -version
javac -version
```

### 检查Maven
```cmd
mvn -version
```

### 检查PostgreSQL
```cmd
psql --version
```

## 5. 快速开始 (如果暂时无法安装)

如果您暂时无法安装这些工具，可以使用以下替代方案：

### 使用 Docker 运行完整环境
```powershell
# 在项目根目录创建 docker-compose.yml
# 运行整个开发环境
docker-compose up
```

### 使用便携版工具
1. **Portable JDK**: 下载便携版Java，无需安装
2. **Maven包装器**: 使用项目中的 mvnw.cmd (如果有)
3. **H2数据库**: 使用内存数据库进行开发测试

## 6. 设置数据库

### PostgreSQL安装后的配置
```cmd
# 启动PostgreSQL服务
net start postgresql-x64-15

# 创建项目数据库
cd d:\compiler\vscodeprojects\workflow_pro\database
setup-postgresql.bat
```

### 使用H2进行快速测试
如果暂时不想安装PostgreSQL，可以使用H2内存数据库：
```cmd
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

## 7. 启动应用程序

### 完整安装后
```cmd
# 启动后端 (PostgreSQL)
cd backend
mvn spring-boot:run

# 启动前端
cd frontend
npm start
```

### 使用替代数据库
```cmd
# 使用H2测试
mvn spring-boot:run -Dspring-boot.run.profiles=h2

# 使用MySQL (如果已有)
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

## 8. 访问应用程序

- **前端**: http://localhost:3000
- **后端API**: http://localhost:8080
- **Swagger文档**: http://localhost:8080/swagger-ui.html
- **H2控制台** (如果使用H2): http://localhost:8080/h2-console

## 故障排除

### Java相关
- 确保JAVA_HOME指向正确的JDK目录
- 检查PATH环境变量
- 重启命令行窗口

### Maven相关
- 确保MAVEN_HOME设置正确
- 检查网络连接 (Maven需要下载依赖)
- 清理本地仓库: `mvn clean`

### PostgreSQL相关
- 检查服务是否启动: `services.msc`
- 验证端口5432未被占用
- 检查防火墙设置

## 建议的开发流程

1. **第一次运行**: 使用H2进行快速测试
2. **开发阶段**: 安装PostgreSQL进行完整测试
3. **生产部署**: 使用production配置

这样可以确保在任何环境下都能快速开始开发！
