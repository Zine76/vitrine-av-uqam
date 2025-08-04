# Script de Déploiement Rapide VITRINE pour Cursor
# Déploie automatiquement sur GitHub Pages et Netlify

param(
    [string]$Message = "Update VITRINE",
    [string]$GitHubUsername = "VOTRE_USERNAME",
    [string]$RepositoryName = "vitrine-av-uqam"
)

Write-Host "🚀 DÉPLOIEMENT RAPIDE VITRINE" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
$currentDir = Get-Location
Write-Host "📁 Répertoire: $currentDir" -ForegroundColor Yellow

# Vérifier Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git non trouvé" -ForegroundColor Red
    exit 1
}

# Vérifier les changements
Write-Host "`n🔍 Vérification des changements..." -ForegroundColor Green
$status = git status --porcelain

if ($status) {
    Write-Host "📝 Changements détectés:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor Gray
    
    # Ajouter tous les fichiers
    Write-Host "`n📤 Ajout des fichiers..." -ForegroundColor Green
    git add .
    
    # Commit
    Write-Host "💾 Commit..." -ForegroundColor Green
    git commit -m $Message
    
    # Push
    Write-Host "🚀 Push vers GitHub..." -ForegroundColor Green
    git push origin main
    
    Write-Host "`n✅ DÉPLOIEMENT TERMINÉ!" -ForegroundColor Green
    Write-Host "🌐 GitHub Pages: https://$GitHubUsername.github.io/$RepositoryName/" -ForegroundColor Cyan
    Write-Host "🌐 Netlify: https://$RepositoryName.netlify.app/" -ForegroundColor Cyan
    Write-Host "⏱️ Déploiement en cours (1-3 minutes)..." -ForegroundColor Yellow
    
} else {
    Write-Host "`nℹ️ Aucun changement détecté" -ForegroundColor Blue
    Write-Host "🌐 GitHub Pages: https://$GitHubUsername.github.io/$RepositoryName/" -ForegroundColor Cyan
    Write-Host "🌐 Netlify: https://$RepositoryName.netlify.app/" -ForegroundColor Cyan
}

# Instructions
Write-Host "`n📋 Instructions:" -ForegroundColor Cyan
Write-Host "1. Vérifiez GitHub Pages dans les settings" -ForegroundColor White
Write-Host "2. Vérifiez Netlify dans le dashboard" -ForegroundColor White
Write-Host "3. Testez les URLs de production" -ForegroundColor White

Write-Host "`n🏁 Script terminé!" -ForegroundColor Green 