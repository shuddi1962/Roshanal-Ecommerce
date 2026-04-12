"use client";

import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Clock,
} from "lucide-react";

export default function AdminDashboardContent() {
  const stats = [
    {
      title: "Total Revenue",
      value: "₦12.5M",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      title: "Total Orders",
      value: "2,847",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Active Customers",
      value: "8,432",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      title: "Products Sold",
      value: "1,247",
      change: "+5.1%",
      trend: "up",
      icon: Package,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "order",
      title: "New order received",
      description: "Order #RSH-2026-001234 - ₦450,000",
      time: "2 minutes ago",
      status: "success",
      icon: ShoppingCart,
    },
    {
      id: 2,
      type: "alert",
      title: "Low stock alert",
      description: "Hikvision DS-2CD2143G2-I (3 remaining)",
      time: "15 minutes ago",
      status: "warning",
      icon: AlertTriangle,
    },
    {
      id: 3,
      type: "customer",
      title: "New customer registered",
      description: "TechCorp Solutions joined the platform",
      time: "1 hour ago",
      status: "info",
      icon: Users,
    },
    {
      id: 4,
      type: "payment",
      title: "Payment processed",
      description: "₦2.3M payment from Flutterwave",
      time: "2 hours ago",
      status: "success",
      icon: CheckCircle,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-emerald-600 bg-emerald-50";
      case "warning":
        return "text-amber-600 bg-amber-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-600 mt-2">Welcome back, Super Admin. Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-slate-500">Last updated</div>
            <div className="text-sm font-medium text-slate-900">2 minutes ago</div>
          </div>
          <button className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Activities Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left">
              <Package className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Add New Product</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left">
              <Users className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">View Customers</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Generate Report</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(activity.status)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Performance Overview</h3>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg">7D</button>
            <button className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">30D</button>
            <button className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">90D</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900">98.5%</p>
            <p className="text-sm text-slate-600">Uptime</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900">2.4s</p>
            <p className="text-sm text-slate-600">Avg Response Time</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <PieChart className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900">4.7/5</p>
            <p className="text-sm text-slate-600">Customer Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}
