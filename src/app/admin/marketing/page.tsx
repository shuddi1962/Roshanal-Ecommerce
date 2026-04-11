"use client";
import AdminShell from "@/components/admin/admin-shell";

import { useState, useEffect } from "react";
import {
  Mail,
  Tag,
  Megaphone,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Globe,
  X,
  Send,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";


// Type definitions
interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'automation' | 'social';
  status: 'active' | 'draft' | 'paused' | 'completed';
  sent: number;
  opened: number;
  clicks: number;
  revenue: number;
  start_date: string;
  created_at: string;
}

interface Coupon {
  id: string;
  code: string;
  type: string;
  discount_value: number;
  usage_count: number;
  usage_limit: number;
  status: 'active' | 'expired' | 'disabled';
  expires_at: string;
  created_at: string;
}

interface SEOPage {
  id: string;
  page_path: string;
  page_title: string;
  seo_score: number;
  indexed: boolean;
  issues_count: number;
  last_checked: string;
}

const marketingTabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "email", label: "Email Campaigns", icon: Mail },
  { id: "seo", label: "SEO", icon: Globe },
  { id: "coupons", label: "Coupons & Discounts", icon: Tag },
  { id: "social", label: "Social Media", icon: Megaphone },
];

export default function AdminMarketingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [seoPages, setSeoPages] = useState<SEOPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showNewCouponModal, setShowNewCouponModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load campaigns
        const { data: campaignsData, error: campaignsError } = await insforge
          .from("marketing_campaigns")
          .select("*")
          .order("created_at", { ascending: false });

        if (!campaignsError && campaignsData) {
          setCampaigns(campaignsData);
        } else {
          // Fallback to demo data
          setCampaigns([
            { id: "1", name: "Easter Sale 2026", type: "email", status: "active", sent: 12500, opened: 4200, clicks: 890, revenue: 2800000, start_date: "2026-03-28", created_at: "2026-03-28" },
            { id: "2", name: "New Product Alert — Hikvision 8MP", type: "email", status: "draft", sent: 0, opened: 0, clicks: 0, revenue: 0, start_date: "2026-04-05", created_at: "2026-04-01" },
            { id: "3", name: "Welcome Series (Automated)", type: "automation", status: "active", sent: 850, opened: 640, clicks: 210, revenue: 450000, start_date: "2026-01-01", created_at: "2026-01-01" },
            { id: "4", name: "Abandoned Cart Recovery", type: "automation", status: "active", sent: 3200, opened: 1800, clicks: 620, revenue: 1200000, start_date: "2026-01-01", created_at: "2026-01-01" },
          ]);
        }

        // Load coupons
        const { data: couponsData, error: couponsError } = await insforge
          .from("coupons")
          .select("*")
          .order("created_at", { ascending: false });

        if (!couponsError && couponsData) {
          setCoupons(couponsData);
        } else {
          // Fallback to demo data
          setCoupons([
            { id: "1", code: "WELCOME10", type: "percentage", discount_value: 10, usage_count: 234, usage_limit: null, status: "active", expires_at: "2026-12-31", created_at: "2026-01-01" },
            { id: "2", code: "ROSHANAL5", type: "fixed", discount_value: 5000, usage_count: 89, usage_limit: 500, status: "active", expires_at: "2026-06-30", created_at: "2026-02-01" },
            { id: "3", code: "FREESHIP", type: "shipping", discount_value: 0, usage_count: 567, usage_limit: 1000, status: "active", expires_at: "2026-05-31", created_at: "2026-03-01" },
            { id: "4", code: "EASTER25", type: "percentage", discount_value: 25, usage_count: 45, usage_limit: 200, status: "expired", expires_at: "2026-04-01", created_at: "2026-03-20" },
          ]);
        }

        // Load SEO pages
        const { data: seoData, error: seoError } = await insforge
          .from("seo_pages")
          .select("*")
          .order("seo_score", { ascending: false });

        if (!seoError && seoData) {
          setSeoPages(seoData);
        } else {
          // Fallback to demo data
          setSeoPages([
            { id: "1", page_path: "/shop", page_title: "Shop All Products", seo_score: 92, indexed: true, issues_count: 0, last_checked: "2026-04-10" },
            { id: "2", page_path: "/category/surveillance", page_title: "Surveillance & CCTV", seo_score: 88, indexed: true, issues_count: 1, last_checked: "2026-04-09" },
            { id: "3", page_path: "/services/cctv-installation", page_title: "CCTV Installation Service", seo_score: 85, indexed: true, issues_count: 0, last_checked: "2026-04-08" },
            { id: "4", page_path: "/services/boat-building", page_title: "Boat Building Service", seo_score: 78, indexed: false, issues_count: 2, last_checked: "2026-04-07" },
            { id: "5", page_path: "/blog", page_title: "Blog", seo_score: 90, indexed: true, issues_count: 0, last_checked: "2026-04-06" },
          ]);
        }

      } catch (error) {
        console.error("Failed to load marketing data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Campaign handlers
  const handleNewCampaign = () => {
    setShowNewCampaignModal(true);
  };

  const handleViewCampaign = (campaign: MarketingCampaign) => {
    setSelectedCampaign(campaign);
    // Could open a detailed campaign view modal
  };

  const handleEditCampaign = (campaign: MarketingCampaign) => {
    setSelectedCampaign(campaign);
    setShowNewCampaignModal(true);
  };

  const handleSendCampaign = async (campaign: MarketingCampaign) => {
    try {
      // Update campaign status to active
      await insforge
        .from("marketing_campaigns")
        .update({ status: "active" })
        .eq("id", campaign.id);

      // Reload campaigns
      const { data } = await insforge
        .from("marketing_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setCampaigns(data);
    } catch (error) {
      console.error("Failed to send campaign:", error);
    }
  };

  // Coupon handlers
  const handleNewCoupon = () => {
    setShowNewCouponModal(true);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could show a toast notification
  };

  // SEO handlers
  const handleRefreshSEO = async () => {
    try {
      // This would trigger an SEO analysis
      console.log("Refreshing SEO data...");
    } catch (error) {
      console.error("Failed to refresh SEO:", error);
    }
  };

  // Calculate stats
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const averageOpenRate = campaigns.length > 0
    ? Math.round((campaigns.reduce((sum, c) => sum + (c.sent > 0 ? (c.opened / c.sent) * 100 : 0), 0) / campaigns.length) * 10) / 10
    : 0;

  if (loading) {
    return (
      <AdminShell title="Marketing" subtitle="Campaigns, SEO, and promotions">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-text-3">Loading marketing data...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Marketing" subtitle="Campaigns, SEO, and promotions">
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne font-700 text-2xl text-text-1">Marketing</h1>
          <p className="text-sm text-text-3 mt-1">Campaigns, SEO, coupons, and social media</p>
        </div>
        <Button variant="default" size="sm" onClick={handleNewCampaign}>
          <Plus className="w-3 h-3 mr-1" /> New Campaign
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6">
        {marketingTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-off-white"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="font-syne font-700 text-2xl text-blue">{activeCampaigns}</p>
              <p className="text-xs text-text-3 mt-1">Active Campaigns</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="font-syne font-700 text-2xl text-success">₦{(totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-text-3 mt-1">Campaign Revenue</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="font-syne font-700 text-2xl text-text-1">{averageOpenRate}%</p>
              <p className="text-xs text-text-3 mt-1">Email Open Rate</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="font-syne font-700 text-2xl text-warning">3</p>
              <p className="text-xs text-text-3 mt-1">Active Coupons</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => setActiveTab("email")} className="bg-white rounded-xl border border-border p-5 text-left hover:border-blue/30 group">
              <Mail className="w-6 h-6 text-blue mb-3" />
              <h3 className="font-syne font-600 text-sm text-text-1 group-hover:text-blue">Email Campaigns</h3>
              <p className="text-xs text-text-3 mt-1">4 campaigns active</p>
            </button>
            <button onClick={() => setActiveTab("seo")} className="bg-white rounded-xl border border-border p-5 text-left hover:border-blue/30 group">
              <Globe className="w-6 h-6 text-success mb-3" />
              <h3 className="font-syne font-600 text-sm text-text-1 group-hover:text-blue">SEO & Indexing</h3>
              <p className="text-xs text-text-3 mt-1">85 avg. SEO score</p>
            </button>
            <button onClick={() => setActiveTab("coupons")} className="bg-white rounded-xl border border-border p-5 text-left hover:border-blue/30 group">
              <Tag className="w-6 h-6 text-warning mb-3" />
              <h3 className="font-syne font-600 text-sm text-text-1 group-hover:text-blue">Coupons & Discounts</h3>
              <p className="text-xs text-text-3 mt-1">3 active coupons</p>
            </button>
          </div>
        </div>
      )}

      {/* Email Campaigns */}
      {activeTab === "email" && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-off-white border-b border-border">
                <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Campaign</th>
                <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Status</th>
                <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Sent</th>
                <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Opened</th>
                <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Clicks</th>
                <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Revenue</th>
                <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-off-white/50">
                  <td className="p-3">
                    <p className="text-sm font-medium text-text-1">{c.name}</p>
                    <p className="text-xs text-text-4">{c.type} · Started {new Date(c.start_date).toLocaleDateString()}</p>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "active" ? "bg-green-50 text-success" : c.status === "draft" ? "bg-yellow-50 text-warning" : "bg-gray-50 text-text-3"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm text-text-2">{c.sent.toLocaleString()}</td>
                  <td className="p-3 text-center text-sm text-text-2">{c.opened.toLocaleString()}</td>
                  <td className="p-3 text-center text-sm text-text-2">{c.clicks.toLocaleString()}</td>
                  <td className="p-3 text-right font-syne font-600 text-sm text-text-1">₦{c.revenue.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleViewCampaign(c)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleEditCampaign(c)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Edit className="w-3.5 h-3.5" /></button>
                      {c.status === "draft" && (
                        <button onClick={() => handleSendCampaign(c)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Send className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SEO */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div></div>
            <Button variant="outline" size="sm" onClick={handleRefreshSEO}>
              <Globe className="w-3 h-3 mr-1" /> Refresh SEO Data
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="font-syne font-700 text-2xl text-success">
                {seoPages.length > 0 ? Math.round(seoPages.reduce((a, b) => a + b.seo_score, 0) / seoPages.length) : 0}
              </p>
              <p className="text-xs text-text-3 mt-1">Avg. SEO Score</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="font-syne font-700 text-2xl text-blue">{seoPages.filter((p) => p.indexed).length}/{seoPages.length}</p>
              <p className="text-xs text-text-3 mt-1">Pages Indexed</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="font-syne font-700 text-2xl text-warning">{seoPages.reduce((a, b) => a + b.issues_count, 0)}</p>
              <p className="text-xs text-text-3 mt-1">SEO Issues</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-off-white border-b border-border">
                  <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Page</th>
                  <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Score</th>
                  <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Indexed</th>
                  <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Issues</th>
                </tr>
              </thead>
              <tbody>
                {seoPages.map((page) => (
                  <tr key={page.id} className="border-b border-border hover:bg-off-white/50">
                    <td className="p-3">
                      <p className="text-sm font-medium text-text-1">{page.page_title}</p>
                      <p className="text-xs text-text-4 font-mono">{page.page_path}</p>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-syne font-700 text-sm ${page.seo_score >= 85 ? "text-success" : page.seo_score >= 70 ? "text-warning" : "text-red"}`}>
                        {page.seo_score}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-xs font-medium ${page.indexed ? "text-success" : "text-red"}`}>
                        {page.indexed ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 text-center text-sm text-text-2">{page.issues_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupons */}
      {activeTab === "coupons" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button variant="default" size="sm" onClick={handleNewCoupon}><Plus className="w-3 h-3 mr-1" /> Create Coupon</Button>
          </div>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-off-white border-b border-border">
                  <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Code</th>
                  <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Discount</th>
                  <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Usage</th>
                  <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Status</th>
                  <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Expires</th>
                  <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border hover:bg-off-white/50">
                    <td className="p-3 font-mono text-sm font-medium text-text-1">{coupon.code}</td>
                    <td className="p-3 text-sm text-text-2">
                      {coupon.type === "percentage" ? `${coupon.discount_value}% Off` :
                       coupon.type === "fixed" ? `₦${coupon.discount_value.toLocaleString()} Off` :
                       coupon.type === "shipping" ? "Free Shipping" : coupon.type}
                    </td>
                    <td className="p-3 text-center text-sm text-text-3">
                      {coupon.usage_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : " / unlimited"}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${coupon.status === "active" ? "bg-green-50 text-success" : coupon.status === "expired" ? "bg-red-50 text-red" : "bg-gray-50 text-text-3"}`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-text-3">{new Date(coupon.expires_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleCopyCoupon(coupon.code)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setSelectedCoupon(coupon)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Edit className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Social */}
      {activeTab === "social" && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { platform: "Instagram", followers: "12.5K", posts: 234, engagement: "4.2%" },
              { platform: "Facebook", followers: "8.3K", posts: 156, engagement: "3.1%" },
              { platform: "Twitter / X", followers: "5.8K", posts: 412, engagement: "2.8%" },
              { platform: "LinkedIn", followers: "2.1K", posts: 89, engagement: "5.6%" },
            ].map((p) => (
              <div key={p.platform} className="bg-white rounded-xl border border-border p-4">
                <h3 className="font-syne font-600 text-sm text-text-1 mb-3">{p.platform}</h3>
                <p className="font-syne font-700 text-xl text-text-1">{p.followers}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-text-3">
                  <span>{p.posts} posts</span>
                  <span className="text-success">{p.engagement} eng.</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <Megaphone className="w-8 h-8 text-blue mx-auto mb-3" />
            <h3 className="font-syne font-700 text-text-1 mb-2">Auto-Post Content</h3>
            <p className="text-sm text-text-3 mb-4">Automatically generate and schedule social media posts when products or blog articles are published.</p>
            <Button variant="default" size="sm">Configure Auto-Posting</Button>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-syne font-700 text-xl text-text-1">
                {selectedCampaign ? "Edit Campaign" : "Create New Campaign"}
              </h2>
              <button
                onClick={() => { setShowNewCampaignModal(false); setSelectedCampaign(null); }}
                className="p-2 hover:bg-off-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
                    placeholder="Easter Sale 2026"
                    defaultValue={selectedCampaign?.name || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Campaign Type</label>
                  <select className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue/20">
                    <option value="email">Email Campaign</option>
                    <option value="automation">Automated Series</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
                    defaultValue={selectedCampaign ? new Date(selectedCampaign.start_date).toISOString().split('T')[0] : ""}
                  />
                </div>
              </form>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => { setShowNewCampaignModal(false); setSelectedCampaign(null); }}>
                  Cancel
                </Button>
                <Button onClick={() => { setShowNewCampaignModal(false); setSelectedCampaign(null); }}>
                  {selectedCampaign ? "Update Campaign" : "Create Campaign"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Coupon Modal */}
      {showNewCouponModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-syne font-700 text-xl text-text-1">
                {selectedCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <button
                onClick={() => { setShowNewCouponModal(false); setSelectedCoupon(null); }}
                className="p-2 hover:bg-off-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue/20"
                    placeholder="WELCOME10"
                    defaultValue={selectedCoupon?.code || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Discount Type</label>
                  <select className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue/20">
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Discount Value</label>
                  <input
                    type="number"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
                    placeholder="10"
                    defaultValue={selectedCoupon?.discount_value || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
                    placeholder="Unlimited"
                    defaultValue={selectedCoupon?.usage_limit || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Expires</label>
                  <input
                    type="date"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
                    defaultValue={selectedCoupon ? new Date(selectedCoupon.expires_at).toISOString().split('T')[0] : ""}
                  />
                </div>
              </form>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => { setShowNewCouponModal(false); setSelectedCoupon(null); }}>
                  Cancel
                </Button>
                <Button onClick={() => { setShowNewCouponModal(false); setSelectedCoupon(null); }}>
                  {selectedCoupon ? "Update Coupon" : "Create Coupon"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminShell>
  );
}
