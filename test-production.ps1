# Script de Test Production VITRINE
# Teste l'application déployée sur GitHub Pages et Netlify

param(
    [string]$GitHubUsername = "Zine76",
    [string]$RepositoryName = "vitrine-av-uqam"
)

Write-Host "🧪 TEST PRODUCTION VITRINE" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# URLs de production
$githubPagesUrl = "https://$GitHubUsername.github.io/$RepositoryName/"
$netlifyUrl = "https://$RepositoryName.netlify.app/"

Write-Host "`n🌐 URLs de Production:" -ForegroundColor Green
Write-Host "GitHub Pages: $githubPagesUrl" -ForegroundColor Cyan
Write-Host "Netlify: $netlifyUrl" -ForegroundColor Cyan

# Ouvrir les URLs de production
Write-Host "`n🚀 Ouverture des applications de production..." -ForegroundColor Green

# GitHub Pages
Write-Host "📋 Ouverture GitHub Pages..." -ForegroundColor Yellow
Start-Process $githubPagesUrl
Start-Sleep -Seconds 3

# Netlify (si disponible)
Write-Host "📋 Ouverture Netlify..." -ForegroundColor Yellow
Start-Process $netlifyUrl
Start-Sleep -Seconds 3

# Ouvrir aussi les tests locaux pour comparaison
Write-Host "📋 Ouverture tests locaux pour comparaison..." -ForegroundColor Yellow
Start-Process "test-simple.html"
Start-Sleep -Seconds 2

Write-Host "`n✅ Applications ouvertes!" -ForegroundColor Green
Write-Host "📋 4 onglets ouverts dans votre navigateur" -ForegroundColor Cyan

# Instructions de test
Write-Host "`n📋 Instructions de Test Production:" -ForegroundColor Cyan
Write-Host "1. Comparez les performances local vs production" -ForegroundColor White
Write-Host "2. Testez la navigation et les interactions" -ForegroundColor White
Write-Host "3. Vérifiez le mode nuit/jour" -ForegroundColor White
Write-Host "4. Testez les palettes de problèmes" -ForegroundColor White
Write-Host "5. Vérifiez les bannières et escalades" -ForegroundColor White
Write-Host "6. Testez le responsive design" -ForegroundColor White

# Checklist de test
Write-Host "`n📋 Checklist de Test:" -ForegroundColor Cyan
Write-Host "□ Navigation fluide" -ForegroundColor White
Write-Host "□ Saisie salle fonctionne" -ForegroundColor White
Write-Host "□ Palettes problèmes réactives" -ForegroundColor White
Write-Host "□ Mode nuit/jour bascule" -ForegroundColor White
Write-Host "□ Bannières s'affichent correctement" -ForegroundColor White
Write-Host "□ Design responsive" -ForegroundColor White
Write-Host "□ Performance acceptable" -ForegroundColor White
Write-Host "□ Pas d'erreurs console" -ForegroundColor White

# Informations techniques
Write-Host "`n🔧 Informations Techniques:" -ForegroundColor Cyan
Write-Host "GitHub Pages: Déploiement statique" -ForegroundColor White
Write-Host "Netlify: CDN global + HTTPS" -ForegroundColor White
Write-Host "Cache: 1 an pour les assets" -ForegroundColor White
Write-Host "Compression: Gzip automatique" -ForegroundColor White

Write-Host "`n🏁 Test production terminé!" -ForegroundColor Green 