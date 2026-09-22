# Push local .env.local vars to Vercel project (production + preview).
# Usage: $env:VERCEL_TOKEN='...'; ./scripts/push-vercel-env.ps1
$ErrorActionPreference = 'Continue'
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
  $v = $line.Substring($i + 1).Trim()
  if ($skip -contains $k) { return }
  if ($overrides.ContainsKey($k)) { $v = $overrides[$k] }
  $vars[$k] = $v
}
foreach ($target in @('production','preview')) {
  foreach ($k in $vars.Keys) {
    npx -y vercel env rm $k $target --yes 2>$null | Out-Null
    $vars[$k] | npx -y vercel env add $k $target 2>&1 | Select-Object -Last 1
  }
}
Write-Output 'ENV SYNC DONE'
npx -y vercel env ls 2>&1 | Select-Object -First 25
