# Fast Vercel env upsert via REST API (non-interactive, idempotent).
# Secrets are read from .env.local — never echoed.
$ErrorActionPreference = 'Stop'
$token = $env:VERCEL_TOKEN
if (-not $token) { throw 'Set $env:VERCEL_TOKEN first' }
$projectId = 'prj_KGNr4efL8et8ithqD0eVIQSZSVig'
$teamId = 'team_rqpTlSuuVJE0OepvQVHOAJLr'
$headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }
$skip = @('PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE','DATABASE_URL','DIRECT_URL','VERCEL_OIDC_TOKEN')
$overrides = @{
  'NEXTAUTH_URL' = 'https://rosh-workflow.vercel.app'
  'NEXT_PUBLIC_SITE_URL' = 'https://rosh-workflow.vercel.app'
  'NEXT_PUBLIC_APP_URL' = 'https://rosh-workflow.vercel.app'
}
$vars = @{}
Get-Content '.env.local' | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#')) { return }
  $i = $line.IndexOf('=')
  if ($i -lt 1) { return }
  $k = $line.Substring(0, $i).Trim()
  $v = $line.Substring($i + 1).Trim().Trim('"')
  if ($skip -contains $k) { return }
  if ($overrides.ContainsKey($k)) { $v = $overrides[$k] }
  $vars[$k] = $v
}
function Get-EnvIdMap {
  $map = @{}
  $list = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$projectId/env?teamId=$teamId" -Headers $headers -TimeoutSec 30
  foreach ($e in $list.envs) {
    if (-not $map.ContainsKey($e.key)) { $map[$e.key] = @() }
    $map[$e.key] += $e.id
  }
  return $map
}
$map = Get-EnvIdMap
foreach ($k in $vars.Keys) {
  try {
    if ($map.ContainsKey($k)) {
      foreach ($id in $map[$k]) {
        try { Invoke-RestMethod -Method Delete -Uri "https://api.vercel.com/v9/projects/$projectId/env/$id`?teamId=$teamId" -Headers $headers -TimeoutSec 30 | Out-Null } catch {}
      }
    }
    $body = @{ key = $k; value = $vars[$k]; type = 'encrypted'; target = @('production','preview') } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "https://api.vercel.com/v10/projects/$projectId/env?teamId=$teamId" -Headers $headers -Body $body -TimeoutSec 30 | Out-Null
    Write-Output "synced $k"
  } catch {
    $m = ''
    try { $m = $_.ErrorDetails.Message } catch {}
    Write-Output "FAILED ${k}: $m"
  }
}
Write-Output 'ENV SYNC DONE'
