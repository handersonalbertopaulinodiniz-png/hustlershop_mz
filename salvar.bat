@echo off
echo ========================================
echo   HustlerShop - Salvar no GitHub
echo ========================================

REM Adiciona todas as mudanças
git add .

REM Cria um commit com a data e hora atual
set current_date=%date% %time%
git commit -m "Auto-save: %current_date%"

REM Sincroniza com o GitHub antes de enviar
echo Sincronizando com o servidor...
git pull origin main --rebase

REM Envia para o GitHub na branch main
echo Enviando para o GitHub...
git push origin main

echo ========================================
echo   Concluido! Pressione qualquer tecla.
echo ========================================
pause
