/**
 * Plugin Registry
 * Manages installed plugins (built-in, AI-generated, and manual).
 * Each plugin is self-contained with its own routes, components, events, and migrations.
 * Plugins cannot break core functionality (safe-delete validation enforces this).
 */

import { adminDb } from '@/lib/db'
import { setFeatureFlag } from '@/lib/feature-flags'
import type { FeatureFlagKey } from '@/lib/feature-flags'

export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  featureFlagKey: string
  entryPoint: string         // e.g., '@/plugins/my-plugin/index'
  adminRoutes?: string[]     // optional admin pages
  customerRoutes?: string[]  // optional customer-facing pages
  eventSubscriptions?: string[] // events this plugin listens to
  migrations?: string[]      // SQL migration files
  dependencies?: string[]    // other plugin IDs required
}

export interface InstalledPlugin {
  id: string
  manifest: PluginManifest
  isEnabled: boolean
  installedAt: string
  installedBy: string
  buildSource: 'builtin' | 'ai_generated' | 'manual'
}

/**
 * Register a plugin in the DB.
 */
export async function registerPlugin(
  manifest: PluginManifest,
  installedBy: string,
  buildSource: InstalledPlugin['buildSource'] = 'manual'
): Promise<void> {
  await adminDb.from('plugins').upsert({
    id: manifest.id,
    manifest,
    is_enabled: false, // always disabled until admin explicitly enables
    installed_at: new Date().toISOString(),
    installed_by: installedBy,
    build_source: buildSource,
  })
}

/**
 * Enable a plugin (creates feature flag if not exists).
 */
export async function enablePlugin(pluginId: string, adminId: string): Promise<void> {
  const { data } = await adminDb
    .from('plugins')
    .select('manifest')
    .eq('id', pluginId)
    .single()

  if (!data) throw new Error(`Plugin ${pluginId} not found`)

  const manifest = data.manifest as PluginManifest

  await adminDb.from('plugins').update({ is_enabled: true }).eq('id', pluginId)
  await setFeatureFlag(manifest.featureFlagKey as FeatureFlagKey, true, adminId)
}

/**
 * Disable a plugin.
 */
export async function disablePlugin(pluginId: string, adminId: string): Promise<void> {
  const { data } = await adminDb
    .from('plugins')
    .select('manifest')
    .eq('id', pluginId)
    .single()

  if (!data) throw new Error(`Plugin ${pluginId} not found`)

  const manifest = data.manifest as PluginManifest

  await adminDb.from('plugins').update({ is_enabled: false }).eq('id', pluginId)
  await setFeatureFlag(manifest.featureFlagKey as FeatureFlagKey, false, adminId)
}

/**
 * List all installed plugins.
 */
export async function listPlugins(): Promise<InstalledPlugin[]> {
  const { data } = await adminDb
    .from('plugins')
    .select('*')
    .order('installed_at', { ascending: false })

  return (data ?? []) as InstalledPlugin[]
}

/**
 * Uninstall a plugin (must pass safe-delete validation first).
 */
export async function uninstallPlugin(pluginId: string): Promise<void> {
  await disablePlugin(pluginId, 'system')
  await adminDb.from('plugins').delete().eq('id', pluginId)
}
