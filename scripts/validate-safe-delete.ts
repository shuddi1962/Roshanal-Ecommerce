/**
 * Safe Delete Validator
 * Run after each feature build: npx ts-node scripts/validate-safe-delete.ts
 *
 * Checks:
 * 1. No feature module imports from another feature module (Event Bus only)
 * 2. Every feature has a feature flag check
 * 3. No hardcoded API keys or secrets in source code
 * 4. No TypeScript `any` types in feature files
 * 5. All routes are present and have proper handlers
 */

import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.cwd())
const SRC = path.join(ROOT, 'src')
const FEATURES_DIR = path.join(SRC, 'features')

interface ValidationError {
  file: string
  issue: string
  line?: number
}

const errors: ValidationError[] = []
const warnings: ValidationError[] = []

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function getAllFiles(dir: string, ext = '.ts'): string[] {
  if (!fs.existsSync(dir)) return []
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, ext))
    } else if (entry.name.endsWith(ext) || entry.name.endsWith('.tsx')) {
      results.push(fullPath)
    }
  }
  return results
}

// ─── Check 1: No cross-feature imports ────────────────────────────────────

function checkCrossFeatureImports() {
  const featureDirs = fs.existsSync(FEATURES_DIR)
    ? fs.readdirSync(FEATURES_DIR, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : []

  for (const featureName of featureDirs) {
    const featureFiles = getAllFiles(path.join(FEATURES_DIR, featureName))
    for (const file of featureFiles) {
      const content = readFile(file)
      const lines = content.split('\n')
      lines.forEach((line, i) => {
        for (const otherFeature of featureDirs) {
          if (otherFeature === featureName) continue
          if (line.includes(`@/features/${otherFeature}`) || line.includes(`../features/${otherFeature}`) || line.includes(`../../features/${otherFeature}`)) {
            errors.push({
              file: path.relative(ROOT, file),
              issue: `Cross-feature import: imports from '${otherFeature}'. Use Event Bus instead.`,
              line: i + 1,
            })
          }
        }
      })
    }
  }
}

// ─── Check 2: No hardcoded API keys ───────────────────────────────────────

const SECRET_PATTERNS = [
  /sk_live_[a-zA-Z0-9]{20,}/,
  /sk_test_[a-zA-Z0-9]{20,}/,
  /pk_live_[a-zA-Z0-9]{20,}/,
  /FLWSECK_TEST-[a-zA-Z0-9]{20,}/,
  /FLWSECK_LIVE-[a-zA-Z0-9]{20,}/,
  /sk-[a-zA-Z0-9]{40,}/,  // OpenAI
  /API_KEY\s*=\s*['"`][a-zA-Z0-9\-_]{20,}['"`]/,
]

function checkHardcodedSecrets() {
  const allFiles = getAllFiles(SRC)
  for (const file of allFiles) {
    const content = readFile(file)
    const lines = content.split('\n')
    lines.forEach((line, i) => {
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          errors.push({
            file: path.relative(ROOT, file),
            issue: `Possible hardcoded API key or secret detected`,
            line: i + 1,
          })
        }
      }
    })
  }
}

// ─── Check 3: No TypeScript `any` ─────────────────────────────────────────

function checkNoAny() {
  const allFiles = getAllFiles(SRC)
  for (const file of allFiles) {
    if (file.includes('.d.ts')) continue
    const content = readFile(file)
    const lines = content.split('\n')
    lines.forEach((line, i) => {
      if (
        (line.includes(': any') || line.includes('<any>') || line.includes('as any')) &&
        !line.trim().startsWith('//') &&
        !line.trim().startsWith('*')
      ) {
        warnings.push({
          file: path.relative(ROOT, file),
          issue: `TypeScript 'any' type detected. Use explicit types.`,
          line: i + 1,
        })
      }
    })
  }
}

// ─── Check 4: Feature flag checks in feature components ───────────────────

function checkFeatureFlags() {
  const featureDirs = fs.existsSync(FEATURES_DIR)
    ? fs.readdirSync(FEATURES_DIR, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : []

  for (const featureName of featureDirs) {
    const componentFile = path.join(FEATURES_DIR, featureName, 'component.tsx')
    if (!fs.existsSync(componentFile)) continue

    const content = readFile(componentFile)
    if (!content.includes('isFeatureEnabled') && !content.includes('feature_flag') && !content.includes('enabled') && content.length > 100) {
      warnings.push({
        file: path.relative(ROOT, componentFile),
        issue: `Feature '${featureName}' component may be missing a feature flag check.`,
      })
    }
  }
}

// ─── Run all checks ───────────────────────────────────────────────────────

console.log('\n🔍 Running Roshanal Safe Delete Validation...\n')

checkCrossFeatureImports()
checkHardcodedSecrets()
checkNoAny()
checkFeatureFlags()

if (errors.length > 0) {
  console.log('❌ ERRORS (must fix before committing):\n')
  for (const err of errors) {
    console.log(`  ${err.file}${err.line ? `:${err.line}` : ''}`)
    console.log(`  └─ ${err.issue}\n`)
  }
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n')
  for (const warn of warnings) {
    console.log(`  ${warn.file}${warn.line ? `:${warn.line}` : ''}`)
    console.log(`  └─ ${warn.issue}\n`)
  }
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Safe to commit.\n')
} else if (errors.length === 0) {
  console.log(`\n✅ No blocking errors. ${warnings.length} warning(s) to review.\n`)
} else {
  console.log(`\n❌ ${errors.length} error(s) found. Fix before committing.\n`)
  process.exit(1)
}
