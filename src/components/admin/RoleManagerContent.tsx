'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Shield,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Save,
  ChevronDown,
  ChevronRight,
  Palette,
  LayoutDashboard,
  X,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

const roleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  dashboard_redirect: z.string().optional(),
})

type RoleFormData = z.infer<typeof roleSchema>

interface PermissionCategory {
  name: string
  permissions: { key: string; label: string }[]
}

const permissionCategories: PermissionCategory[] = [
  {
    name: 'Commerce',
    permissions: [
      { key: 'view_products', label: 'View Products' },
      { key: 'edit_products', label: 'Edit Products' },
      { key: 'delete_products', label: 'Delete Products' },
      { key: 'view_orders', label: 'View Orders' },
      { key: 'edit_orders', label: 'Edit Orders' },
      { key: 'cancel_orders', label: 'Cancel Orders' },
      { key: 'manage_inventory', label: 'Manage Inventory' },
      { key: 'manage_categories', label: 'Manage Categories' },
    ],
  },
  {
    name: 'Customers',
    permissions: [
      { key: 'view_customers', label: 'View Customers' },
      { key: 'edit_customers', label: 'Edit Customers' },
      { key: 'issue_refunds', label: 'Issue Refunds' },
      { key: 'manage_reviews', label: 'Manage Reviews' },
      { key: 'view_customer_data', label: 'View Customer Data' },
    ],
  },
  {
    name: 'Marketing',
    permissions: [
      { key: 'view_campaigns', label: 'View Campaigns' },
      { key: 'create_campaigns', label: 'Create Campaigns' },
      { key: 'view_analytics', label: 'View Analytics' },
      { key: 'manage_discounts', label: 'Manage Discounts' },
      { key: 'manage_affiliates', label: 'Manage Affiliates' },
    ],
  },
  {
    name: 'Services',
    permissions: [
      { key: 'manage_bookings', label: 'Manage Bookings' },
      { key: 'manage_vendors', label: 'Manage Vendors' },
      { key: 'manage_services', label: 'Manage Services' },
      { key: 'view_calendar', label: 'View Calendar' },
    ],
  },
  {
    name: 'System',
    permissions: [
      { key: 'manage_staff', label: 'Manage Staff' },
      { key: 'manage_roles', label: 'Manage Roles' },
      { key: 'view_logs', label: 'View Logs' },
      { key: 'manage_api_keys', label: 'Manage API Keys' },
      { key: 'system_settings', label: 'System Settings' },
    ],
  },
  {
    name: 'Finance',
    permissions: [
      { key: 'view_payments', label: 'View Payments' },
      { key: 'issue_payouts', label: 'Issue Payouts' },
      { key: 'view_reports', label: 'View Reports' },
      { key: 'export_financials', label: 'Export Financials' },
    ],
  },
]

const colorOptions = [
  '#1641C4', '#C8191C', '#0B6B3A', '#9C4B10', '#0C1A36',
  '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B',
]

interface Role {
  id: string
  name: string
  description?: string
  color: string
  dashboard_redirect?: string
  permissions: Record<string, boolean>
  is_system: boolean
}

export default function RoleManagerContent() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Commerce'])
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      color: '#1641C4',
    },
  })

  const selectedColor = watch('color')

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    if (selectedRole) {
      setRolePermissions(selectedRole.permissions || {})
      reset({
        name: selectedRole.name,
        description: selectedRole.description || '',
        color: selectedRole.color,
        dashboard_redirect: selectedRole.dashboard_redirect || '',
      })
    }
  }, [selectedRole, reset])

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/roles')

      if (!response.ok) throw new Error('Failed to fetch roles')

      const data = await response.json()
      setRoles(data.roles || [])

      if (data.roles?.length && !selectedRole) {
        setSelectedRole(data.roles[0])
      }
    } catch (error) {
      toast.error('Failed to load roles')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isCreating) {
        const response = await fetch('/api/admin/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            permissions: rolePermissions,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create role')
        }

        const result = await response.json()
        toast.success('Role created successfully')
        setIsCreating(false)
        reset()
        setRolePermissions({})
        fetchRoles()
        setSelectedRole({ ...data, id: result.id, permissions: rolePermissions, is_system: false } as Role)
      } else if (selectedRole) {
        const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            permissions: rolePermissions,
          }),
        })

        if (!response.ok) throw new Error('Failed to update role')

        toast.success('Role updated successfully')
        fetchRoles()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save role')
      console.error(error)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete role')

      toast.success('Role deleted successfully')
      setSelectedRole(null)
      fetchRoles()
    } catch (error) {
      toast.error('Failed to delete role')
      console.error(error)
    }
  }

  const togglePermission = (key: string) => {
    setRolePermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    )
  }

  const selectAllInCategory = (category: PermissionCategory) => {
    const newPermissions = { ...rolePermissions }
    category.permissions.forEach((p) => {
      newPermissions[p.key] = true
    })
    setRolePermissions(newPermissions)
  }

  const deselectAllInCategory = (category: PermissionCategory) => {
    const newPermissions = { ...rolePermissions }
    category.permissions.forEach((p) => {
      newPermissions[p.key] = false
    })
    setRolePermissions(newPermissions)
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    setSelectedRole(null)
    reset({
      name: '',
      description: '',
      color: '#1641C4',
      dashboard_redirect: '',
    })
    setRolePermissions({})
  }

  const cancelCreate = () => {
    setIsCreating(false)
    if (roles.length) {
      setSelectedRole(roles[0])
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-syne font-700 text-3xl text-text-1">Role Manager</h1>
          <p className="font-manrope text-text-3 mt-1">Manage custom roles and permissions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-brand-border overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <h2 className="font-syne font-700 text-lg text-text-1">Roles</h2>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white rounded-lg font-syne font-700 text-xs hover:bg-text-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Role
              </button>
            </div>
            <div className="divide-y divide-brand-border">
              {isLoading ? (
                <div className="p-8 text-center font-manrope text-text-3">Loading roles...</div>
              ) : (
                roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setIsCreating(false)
                      setSelectedRole(role)
                    }}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-brand-offwhite/50 transition-colors text-left ${
                      selectedRole?.id === role.id ? 'bg-brand-offwhite' : ''
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <div className="flex-1">
                      <p className="font-syne font-700 text-sm text-text-1">{role.name}</p>
                      {role.description && (
                        <p className="font-manrope text-xs text-text-3 line-clamp-1">{role.description}</p>
                      )}
                    </div>
                    {role.is_system ? (
                      <Lock className="w-4 h-4 text-text-4" />
                    ) : (
                      <Unlock className="w-4 h-4 text-text-4" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg border border-brand-border">
            {(selectedRole || isCreating) ? (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-syne font-700 text-xl text-text-1">
                    {isCreating ? 'Create New Role' : selectedRole?.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    {isCreating ? (
                      <button
                        type="button"
                        onClick={cancelCreate}
                        className="px-4 py-2 font-syne font-700 text-sm text-text-3 hover:text-text-1 transition-colors"
                      >
                        Cancel
                      </button>
                    ) : selectedRole && !selectedRole.is_system ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(selectedRole.id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-brand-red hover:bg-brand-red/10 rounded-lg font-syne font-700 text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    ) : null}
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white rounded-lg font-syne font-700 text-sm hover:bg-text-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {isCreating ? 'Create Role' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">Role Name</label>
                    <input
                      {...register('name')}
                      disabled={selectedRole?.is_system}
                      className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50"
                      placeholder="e.g., Marketing Manager"
                    />
                    {errors.name && (
                      <p className="mt-1 font-manrope text-xs text-brand-red">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">Description</label>
                    <input
                      {...register('description')}
                      className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1 flex items-center gap-1.5">
                      <Palette className="w-4 h-4" />
                      Role Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setValue('color', color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            selectedColor === color ? 'border-text-1 scale-110' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {selectedColor === color && <Check className="w-4 h-4 text-white mx-auto" />}
                        </button>
                      ))}
                    </div>
                    {errors.color && (
                      <p className="mt-1 font-manrope text-xs text-brand-red">{errors.color.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1 flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard Redirect
                    </label>
                    <input
                      {...register('dashboard_redirect')}
                      className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      placeholder="/admin/dashboard"
                    />
                  </div>
                </div>

                <div className="border-t border-brand-border pt-6">
                  <h3 className="font-syne font-700 text-lg text-text-1 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-blue" />
                    Permissions
                  </h3>

                  <div className="space-y-2">
                    {permissionCategories.map((category) => (
                      <div key={category.name} className="border border-brand-border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.name)}
                          className="w-full flex items-center justify-between p-3 bg-brand-offwhite hover:bg-brand-border/30 transition-colors"
                        >
                          <span className="font-syne font-700 text-sm text-text-1">{category.name}</span>
                          {expandedCategories.includes(category.name) ? (
                            <ChevronDown className="w-4 h-4 text-text-3" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-text-3" />
                          )}
                        </button>

                        {expandedCategories.includes(category.name) && (
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-3">
                              <button
                                type="button"
                                onClick={() => selectAllInCategory(category)}
                                className="font-manrope text-xs text-brand-blue hover:underline"
                              >
                                Select All
                              </button>
                              <span className="text-text-4">|</span>
                              <button
                                type="button"
                                onClick={() => deselectAllInCategory(category)}
                                className="font-manrope text-xs text-text-3 hover:text-text-2"
                              >
                                Deselect All
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {category.permissions.map((permission) => (
                                <label
                                  key={permission.key}
                                  className="flex items-center gap-2 p-2 hover:bg-brand-offwhite rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!rolePermissions[permission.key]}
                                    onChange={() => togglePermission(permission.key)}
                                    className="w-4 h-4 text-brand-blue rounded border-brand-border focus:ring-brand-blue"
                                  />
                                  <span className="font-manrope text-sm text-text-2">{permission.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                <Shield className="w-16 h-16 text-text-4 mb-4" />
                <h3 className="font-syne font-700 text-lg text-text-1 mb-2">Select a Role</h3>
                <p className="font-manrope text-text-3 mb-4">Choose a role from the list to view or edit permissions</p>
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg font-syne font-700 text-sm hover:bg-text-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Role
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
