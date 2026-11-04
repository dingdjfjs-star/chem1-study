@echo off
chcp 65001 >nul
title 高一化学必修一学习站
cd /d "%~dp0"
echo.
echo  正在启动 高一化学必修一学习站 ...
echo  （启动后请保持本窗口开着，关掉窗口网站就停了）
node server.js
pause
