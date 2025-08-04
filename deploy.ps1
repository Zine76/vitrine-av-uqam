# Script de Déploiement VITRINE
# Automatise le déploiement sur GitHub Pages

param(
    [string]$RepositoryName = "vitrine-av-uqam",
    [string]$GitHubUsername = "VOTRE_USERNAME",
    [string]$CommitMessage = "Update VITRINE - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host "🚀 DÉPLOIEMENT VITRINE" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
$currentDir = Get-Location
Write-Host "📁 Répertoire actuel: $currentDir" -ForegroundColor Yellow

# Vérifier que Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git détecté: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git non trouvé. Veuillez installer Git." -ForegroundColor Red
    exit 1
}

# Vérifier l'état du repository
Write-Host "`n🔍 Vérification du repository..." -ForegroundColor Green

if (Test-Path ".git") {
    Write-Host "✅ Repository Git existant" -ForegroundColor Green
    
    # Vérifier le remote
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "✅ Remote configuré: $remote" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Aucun remote configuré" -ForegroundColor Yellow
        $setupRemote = Read-Host "Voulez-vous configurer le remote GitHub? (y/n)"
        if ($setupRemote -eq "y") {
            $remoteUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"
            git remote add origin $remoteUrl
            Write-Host "✅ Remote ajouté: $remoteUrl" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ Pas de repository Git" -ForegroundColor Red
    $initRepo = Read-Host "Voulez-vous initialiser un repository Git? (y/n)"
    if ($initRepo -eq "y") {
        git init
        Write-Host "✅ Repository Git initialisé" -ForegroundColor Green
    } else {
        Write-Host "❌ Impossible de continuer sans repository Git" -ForegroundColor Red
        exit 1
    }
}

# Vérifier les fichiers à déployer
Write-Host "`n📋 Vérification des fichiers..." -ForegroundColor Green
$requiredFiles = @(
    "index.html",
    "test-simple.html",
    "test-banners.html",
    "css/main.css",
    "css/banners.css",
    "css/components.css",
    "js/config.js",
    "js/utils.js",
    "js/api-client.js",
    "js/banner-manager.js",
    "js/ticket-manager.js",
    "js/room-manager.js",
    "js/escalation-engine.js",
    "js/ui-controller.js",
    "js/app.js",
    "images/Vitrine.png",
    "images/SEA2.png",
    "images/SI.png",
    "images/SIM.png"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n⚠️ Fichiers manquants détectés:" -ForegroundColor Yellow
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Yellow
    }
    $continue = Read-Host "Voulez-vous continuer quand même? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Ajouter tous les fichiers
Write-Host "`n📤 Ajout des fichiers..." -ForegroundColor Green
git add .

# Vérifier s'il y a des changements
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Changements détectés:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor Gray
    
    # Commit
    Write-Host "`n💾 Création du commit..." -ForegroundColor Green
    git commit -m $CommitMessage
    
    # Push
    Write-Host "`n🚀 Push vers GitHub..." -ForegroundColor Green
    git push origin main
    
    Write-Host "`n✅ Déploiement terminé!" -ForegroundColor Green
    Write-Host "🌐 URL: https://$GitHubUsername.github.io/$RepositoryName/" -ForegroundColor Cyan
    Write-Host "⏱️ Déploiement en cours (2-3 minutes)..." -ForegroundColor Yellow
    
} else {
    Write-Host "`nℹ️ Aucun changement détecté" -ForegroundColor Blue
    Write-Host "🌐 URL actuelle: https://$GitHubUsername.github.io/$RepositoryName/" -ForegroundColor Cyan
}

# Instructions finales
Write-Host "`n📋 Instructions:" -ForegroundColor Cyan
Write-Host "1. Vérifiez que GitHub Pages est activé dans les settings du repository" -ForegroundColor White
Write-Host "2. Attendez 2-3 minutes pour le déploiement" -ForegroundColor White
Write-Host "3. Testez l'URL de production" -ForegroundColor White
Write-Host "4. Consultez les logs de déploiement sur GitHub" -ForegroundColor White

Write-Host "`n🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "- Tester l'application en production" -ForegroundColor White
Write-Host "- Configurer un domaine personnalisé si nécessaire" -ForegroundColor White
Write-Host "- Mettre en place des tests automatisés" -ForegroundColor White

Write-Host "`n🏁 Script terminé!" -ForegroundColor Green 