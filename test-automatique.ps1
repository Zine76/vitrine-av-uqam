# Script de Test Automatique VITRINE
# Lance tous les fichiers de test pour validation

Write-Host "🧪 TEST AUTOMATIQUE VITRINE" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
$currentDir = Get-Location
Write-Host "📁 Répertoire actuel: $currentDir" -ForegroundColor Yellow

# Vérifier l'existence des fichiers
$files = @(
    "test-simple.html",
    "test-banners.html", 
    "test-integration.html",
    "index.html"
)

Write-Host "`n🔍 Vérification des fichiers..." -ForegroundColor Green
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

# Vérifier les dossiers
$folders = @("css", "js", "images")
Write-Host "`n📂 Vérification des dossiers..." -ForegroundColor Green
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        $count = (Get-ChildItem $folder -File).Count
        Write-Host "✅ $folder ($count fichiers)" -ForegroundColor Green
    } else {
        Write-Host "❌ $folder" -ForegroundColor Red
    }
}

# Vérifier les images
Write-Host "`n🖼️ Vérification des images..." -ForegroundColor Green
$images = @("Vitrine.png", "SEA2.png", "SI.png", "SIM.png")
foreach ($image in $images) {
    $path = "images/$image"
    if (Test-Path $path) {
        $size = (Get-Item $path).Length / 1KB
        Write-Host "✅ $image (${size:N0} KB)" -ForegroundColor Green
    } else {
        Write-Host "❌ $image" -ForegroundColor Red
    }
}

# Vérifier les CSS
Write-Host "`n🎨 Vérification des CSS..." -ForegroundColor Green
$cssFiles = @("main.css", "banners.css", "components.css")
foreach ($css in $cssFiles) {
    $path = "css/$css"
    if (Test-Path $path) {
        $lines = (Get-Content $path).Count
        Write-Host "✅ $css ($lines lignes)" -ForegroundColor Green
    } else {
        Write-Host "❌ $css" -ForegroundColor Red
    }
}

# Vérifier les JS
Write-Host "`n⚡ Vérification des JavaScript..." -ForegroundColor Green
$jsFiles = @("config.js", "utils.js", "api-client.js", "banner-manager.js", "ticket-manager.js", "room-manager.js", "escalation-engine.js", "ui-controller.js", "app.js")
foreach ($js in $jsFiles) {
    $path = "js/$js"
    if (Test-Path $path) {
        $lines = (Get-Content $path).Count
        Write-Host "✅ $js ($lines lignes)" -ForegroundColor Green
    } else {
        Write-Host "❌ $js" -ForegroundColor Red
    }
}

Write-Host "`n🚀 Lancement des tests..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Lancer les tests dans l'ordre recommandé
$testOrder = @(
    @{Name="Test Simple"; File="test-simple.html"; Description="Interface de base avec CSS et JS minimal"},
    @{Name="Test Bannières"; File="test-banners.html"; Description="Bannières SEA, SI, SIM, tickets"},
    @{Name="Test Intégration"; File="test-integration.html"; Description="Test complet de tous les composants"},
    @{Name="Application Complète"; File="index.html"; Description="Application finale (nécessite backend)"}
)

foreach ($test in $testOrder) {
    Write-Host "`n📋 $($test.Name)" -ForegroundColor Yellow
    Write-Host "   $($test.Description)" -ForegroundColor Gray
    Write-Host "   Fichier: $($test.File)" -ForegroundColor Gray
    
    if (Test-Path $test.File) {
        Write-Host "   🚀 Lancement..." -ForegroundColor Green
        Start-Process $test.File
        Start-Sleep -Seconds 2
    } else {
        Write-Host "   ❌ Fichier non trouvé!" -ForegroundColor Red
    }
}

Write-Host "`n✅ Tests lancés avec succès!" -ForegroundColor Green
Write-Host "`n📋 Instructions de test:" -ForegroundColor Cyan
Write-Host "1. Testez chaque onglet ouvert dans votre navigateur" -ForegroundColor White
Write-Host "2. Vérifiez la navigation, le mode nuit, les palettes" -ForegroundColor White
Write-Host "3. Testez les bannières et les interactions" -ForegroundColor White
Write-Host "4. Consultez le GUIDE_TEST_COMPLET.md pour les détails" -ForegroundColor White

Write-Host "`n🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "- Valider que l'interface fonctionne correctement" -ForegroundColor White
Write-Host "- Tester avec le backend Go (port 7070)" -ForegroundColor White
Write-Host "- Connecter les modules JavaScript" -ForegroundColor White

Write-Host "`n🏁 Test automatique terminé!" -ForegroundColor Green 