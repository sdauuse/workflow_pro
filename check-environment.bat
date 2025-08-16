@echo off
echo ===========================================
echo 项目管理系统 - 环境设置检查
echo ===========================================
echo.

echo 检查 Java...
java -version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Java 已安装
    java -version
) else (
    echo ✗ Java 未安装
    echo 请从以下地址下载并安装 Java 21:
    echo https://adoptium.net/temurin/releases/
    echo.
)

echo.
echo 检查 Maven...
mvn -version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Maven 已安装
    mvn -version
) else (
    echo ✗ Maven 未安装
    echo 请从以下地址下载并安装 Maven:
    echo https://maven.apache.org/download.cgi
    echo 记得将Maven的bin目录添加到系统PATH中
    echo.
)

echo.
echo 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Node.js 已安装
    node --version
    npm --version
) else (
    echo ✗ Node.js 未安装
    echo 请从以下地址下载并安装 Node.js:
    echo https://nodejs.org/
    echo.
)

echo.
echo 检查 MySQL...
mysql --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ MySQL 已安装
    mysql --version
) else (
    echo ✗ MySQL 未安装
    echo 请从以下地址下载并安装 MySQL:
    echo https://dev.mysql.com/downloads/mysql/
    echo.
)

echo.
echo ===========================================
echo 环境检查完成
echo ===========================================
echo.
echo 下一步操作:
echo 1. 安装所有缺失的工具
echo 2. 重启命令行窗口
echo 3. 运行数据库设置: setup-database.bat
echo 4. 启动后端: cd backend ^&^& mvn spring-boot:run
echo 5. 启动前端: cd frontend ^&^& npm start
echo.
pause
