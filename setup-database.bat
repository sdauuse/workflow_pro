@echo off
echo 设置项目管理系统数据库...
echo.

REM 创建数据库
mysql -u root -p12356 -e "CREATE DATABASE IF NOT EXISTS project_management_system;"

REM 导入数据库架构和示例数据
mysql -u root -p12356 project_management_system < database\schema.sql

echo.
echo 数据库设置完成！
echo 数据库名: project_management_system
echo 用户名: root
echo 密码: 12356
echo.
echo 接下来运行：
echo 1. 启动后端: cd backend && mvn spring-boot:run
echo 2. 启动前端: cd frontend && npm install && npm start
echo.
pause
