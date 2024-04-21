param(
  [int]$id
)
Write-Host "Running x script!"
Write-Host "add/commit/push tweet: #$id"
Invoke-Expression "git add ../."
Invoke-Expression 'git commit -m "add tweet #$id"'
Invoke-Expression "git push"