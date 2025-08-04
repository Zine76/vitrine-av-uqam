# Script de Test Local VITRINE pour Cursor
# Lance tous les fichiers de test localement

Write-Host "🧪 TEST LOCAL VITRINE" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
$currentDir = Get-Location
Write-Host "📁 Répertoire: $currentDir" -ForegroundColor Yellow

# Vérifier l'existence des fichiers de test
$testFiles = @(
    "test-simple.html",
    "test-banners.html", 
    "test-integration.html",
    "index.html"
)

Write-Host "`n🔍 Vérification des fichiers de test..." -ForegroundColor Green
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

# Lancer les tests
Write-Host "`n🚀 Lancement des tests locaux..." -ForegroundColor Green

# Test Simple (principal)
Write-Host "📋 Test Simple..." -ForegroundColor Yellow
Start-Process "test-simple.html"
Start-Sleep -Seconds 2

# Test Bannières
Write-Host "📋 Test Bannières..." -ForegroundColor Yellow
Start-Process "test-banners.html"
Start-Sleep -Seconds 2

# Test Intégration
Write-Host "📋 Test Intégration..." -ForegroundColor Yellow
Start-Process "test-integration.html"
Start-Sleep -Seconds 2

# Application Complète
Write-Host "📋 Application Complète..." -ForegroundColor Yellow
Start-Process "index.html"

Write-Host "`n✅ Tests locaux lancés!" -ForegroundColor Green
Write-Host "📋 4 onglets ouverts dans votre navigateur" -ForegroundColor Cyan

# Instructions de test
Write-Host "`n📋 Instructions de test:" -ForegroundColor Cyan
Write-Host "1. Testez la navigation dans chaque onglet" -ForegroundColor White
Write-Host "2. Vérifiez le mode nuit/jour" -ForegroundColor White
Write-Host "3. Testez les palettes de problèmes" -ForegroundColor White
Write-Host "4. Vérifiez les bannières" -ForegroundColor White
Write-Host "5. Testez le responsive design" -ForegroundColor White

# URLs de production pour comparaison
Write-Host "`n🌐 URLs de production:" -ForegroundColor Cyan
Write-Host "GitHub Pages: https://VOTRE_USERNAME.github.io/vitrine-av-uqam/" -ForegroundColor White
Write-Host "Netlify: https://vitrine-av-uqam.netlify.app/" -ForegroundColor White

Write-Host "`n🏁 Tests terminés!" -ForegroundColor Green 