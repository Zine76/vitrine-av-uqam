# Script pour pousser VITRINE vers GitHub
# Utilise l'API GitHub pour créer le repository et pousser le code

param(
    [string]$RepositoryName = "vitrine-av-uqam",
    [string]$Description = "Application VITRINE - Diagnostic audiovisuel UQAM"
)

Write-Host "🚀 PUSH VERS GITHUB - VITRINE" -ForegroundColor Cyan
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

# Vérifier le statut Git
Write-Host "`n🔍 Vérification du statut Git..." -ForegroundColor Green
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Changements non commités détectés:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor Gray
    Write-Host "❌ Veuillez commiter les changements avant de continuer" -ForegroundColor Red
    exit 1
}

# Vérifier si le remote existe déjà
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "✅ Remote GitHub déjà configuré: $remote" -ForegroundColor Green
} else {
    Write-Host "⚠️ Aucun remote configuré" -ForegroundColor Yellow
    Write-Host "📋 Instructions manuelles:" -ForegroundColor Cyan
    Write-Host "1. Allez sur https://github.com/new" -ForegroundColor White
    Write-Host "2. Nom du repository: $RepositoryName" -ForegroundColor White
    Write-Host "3. Description: $Description" -ForegroundColor White
    Write-Host "4. Choisir Public ou Private" -ForegroundColor White
    Write-Host "5. NE PAS cocher 'Add a README file'" -ForegroundColor White
    Write-Host "6. Cliquer 'Create repository'" -ForegroundColor White
    Write-Host "7. Copier l'URL du repository" -ForegroundColor White
    
    $remoteUrl = Read-Host "`nEntrez l'URL du repository GitHub (ex: https://github.com/VOTRE_USERNAME/vitrine-av-uqam.git)"
    
    if ($remoteUrl) {
        git remote add origin $remoteUrl
        Write-Host "✅ Remote ajouté: $remoteUrl" -ForegroundColor Green
    } else {
        Write-Host "❌ URL non fournie" -ForegroundColor Red
        exit 1
    }
}

# Push vers GitHub
Write-Host "`n🚀 Push vers GitHub..." -ForegroundColor Green
try {
    git push -u origin main
    Write-Host "✅ Push réussi!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    Write-Host "💡 Vérifiez que:" -ForegroundColor Yellow
    Write-Host "   - Le repository existe sur GitHub" -ForegroundColor White
    Write-Host "   - Vous êtes authentifié" -ForegroundColor White
    Write-Host "   - L'URL du remote est correcte" -ForegroundColor White
    exit 1
}

# Afficher les URLs
$remote = git remote get-url origin
if ($remote -match "github\.com/([^/]+)/([^/]+)") {
    $username = $matches[1]
    $repo = $matches[2] -replace "\.git$", ""
    
    Write-Host "`n✅ DÉPLOIEMENT RÉUSSI!" -ForegroundColor Green
    Write-Host "🌐 Repository: https://github.com/$username/$repo" -ForegroundColor Cyan
    Write-Host "🌐 GitHub Pages: https://$username.github.io/$repo/" -ForegroundColor Cyan
    
    Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Aller sur https://github.com/$username/$repo/settings/pages" -ForegroundColor White
    Write-Host "2. Source: Deploy from a branch" -ForegroundColor White
    Write-Host "3. Branch: main" -ForegroundColor White
    Write-Host "4. Folder: / (root)" -ForegroundColor White
    Write-Host "5. Save" -ForegroundColor White
    Write-Host "6. Attendre 2-3 minutes pour le déploiement" -ForegroundColor White
} else {
    Write-Host "`n✅ Push réussi!" -ForegroundColor Green
    Write-Host "🌐 Vérifiez votre repository GitHub" -ForegroundColor Cyan
}

Write-Host "`nScript termine!" -ForegroundColor Green 