"use client";
import AdminShell from "@/components/admin/admin-shell";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";

import {
  Star, ThumbsUp, Trash2, CheckCircle2, XCircle,
  MessageSquare, Search, Image as ImageIcon, Flag,
  Download, Printer
} from "lucide-react";

interface Review {
  id: number;
  product: string;
  product_id: number;
  customer: string;
  customer_id: number;
  email: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: "pending" | "approved" | "flagged" | "rejected";
  helpful: number;
  images: number;
  verified: boolean;
  staff_reply: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  flagged: "bg-red-100 text-red-700",
  rejected: "bg-gray-100 text-gray-600",
};

const seedReviews: Review[] = [
  { id: 1, product: "Hikvision 4CH DVR Kit", product_id: 1, customer: "Chidi Okafor", customer_id: 1, email: "chidi@email.com", rating: 5, title: "Excellent quality!", comment: "Very clear picture quality, easy to install. Highly recommended for home security.", date: "2024-03-15", status: "approved", helpful: 12, images: 2, verified: true, staff_reply: null, created_at: "2024-03-15" },
  { id: 2, product: "Yamaha 40HP Outboard", product_id: 2, customer: "Emeka Nwosu", customer_id: 2, email: "emeka@email.com", rating: 4, title: "Good engine", comment: "Reliable performance. Been using it for 3 months now with no issues.", date: "2024-03-14", status: "approved", helpful: 8, images: 0, verified: true, staff_reply: null, created_at: "2024-03-14" },
  { id: 3, product: "Fire Extinguisher 9kg", product_id: 3, customer: "Amina Bello", customer_id: 3, email: "amina@email.com", rating: 2, title: "Arrived damaged", comment: "The extinguisher had a dent on arrival. Packaging was poor.", date: "2024-03-13", status: "pending", helpful: 3, images: 1, verified: false, staff_reply: null, created_at: "2024-03-13" },
  { id: 4, product: "Access Control System", product_id: 4, customer: "Tunde Adebayo", customer_id: 4, email: "tunde@email.com", rating: 5, title: "Professional grade", comment: "Works perfectly for our office building. Support team helped with setup.", date: "2024-03-12", status: "approved", helpful: 15, images: 3, verified: true, staff_reply: null, created_at: "2024-03-12" },
  { id: 5, product: "Life Jacket Adult", product_id: 5, customer: "Grace Eze", customer_id: 5, email: "grace@email.com", rating: 1, title: "Wrong size", comment: "Ordered XL but received M. Very disappointed.", date: "2024-03-11", status: "flagged", helpful: 1, images: 0, verified: true, staff_reply: null, created_at: "2024-03-11" },
  { id: 6, product: "Kitchen Hood 90cm", product_id: 6, customer: "Ibrahim Musa", customer_id: 6, email: "ibrahim@email.com", rating: 3, title: "Decent but noisy", comment: "Extraction works well but the motor is quite loud on high speed.", date: "2024-03-10", status: "pending", helpful: 5, images: 0, verified: false, staff_reply: null, created_at: "2024-03-10" },
];

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const { data, error } = await insforge.from("product_reviews").select("*").order("created_at", { ascending: false });
      
      if (error || !data || data.length === 0) {
        await insforge.from("product_reviews").upsert(seedReviews);
        setReviews(seedReviews);
      } else {
        setReviews(data);
      }
    } catch (e) {
      setReviews(seedReviews);
    }
    setLoading(false);
  }

  async function handleAction(id: number, action: string) {
    let status: Review["status"] | null = null;
    if (action === "approve") status = "approved";
    else if (action === "reject") status = "rejected";
    else if (action === "flag") status = "flagged";

    if (status) {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      await insforge.from("product_reviews").update({ status }).eq("id", id);
    } else if (action === "delete") {
      if (confirm("Delete this review?")) {
        setReviews(prev => prev.filter(r => r.id !== id));
        await insforge.from("product_reviews").delete().eq("id", id);
      }
    } else if (action === "reply") {
      setReplyModal(id);
      const review = reviews.find(r => r.id === id);
      setReplyText(review?.staff_reply || "");
    }
  }

  async function saveReply() {
    if (!replyModal) return;
    await insforge.from("product_reviews").update({ staff_reply: replyText }).eq("id", replyModal);
    setReviews(prev => prev.map(r => r.id === replyModal ? { ...r, staff_reply: replyText } : r));
    setReplyModal(null);
    setReplyText("");
  }

  function exportReviews() {
    const csv = [
      ["ID", "Product", "Customer", "Email", "Rating", "Status", "Date", "Comment"].join(","),
      ...reviews.map(r => [
        r.id, `"${r.product}"`, `"${r.customer}"`, `"${r.email}"`, r.rating, r.status, r.date, `"${r.comment.replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviews-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printReviews() {
    const printContent = window.open("", "_blank");
    printContent?.document.write(`
      <html><head><title>Reviews Export</title>
      <style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head>
      <body><h1>Product Reviews</h1>
      <table><thead><tr><th>ID</th><th>Product</th><th>Customer</th><th>Rating</th><th>Status</th><th>Comment</th></tr></thead>
      <tbody>${reviews.map(r => `<tr><td>${r.id}</td><td>${r.product}</td><td>${r.customer}</td><td>${r.rating}/5</td><td>${r.status}</td><td>${r.comment}</td></tr>`).join("")}</tbody>
      </table></body></html>
    `);
    printContent?.document.close();
    printContent?.print();
  }

  const filtered = reviews.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.product.toLowerCase().includes(search.toLowerCase()) && !r.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "0";
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    pct: reviews.length ? Math.round((reviews.filter((rev) => rev.rating === r).length / reviews.length) * 100) : 0,
  }));

  return (
    <AdminShell title="Reviews & Ratings" subtitle="Manage product reviews and customer feedback">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-text-4 mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-text-1">{demoReviews.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-text-4 mb-1">Average Rating</p>
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-bold text-text-1">{avgRating}</p>
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-text-4 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{demoReviews.filter((r) => r.status === "pending").length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-text-4 mb-1">With Photos</p>
            <p className="text-2xl font-bold text-blue">{demoReviews.filter((r) => r.images > 0).length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-text-4 mb-1">Flagged</p>
            <p className="text-2xl font-bold text-red">{demoReviews.filter((r) => r.status === "flagged").length}</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-sm mb-3">Rating Distribution</h3>
          <div className="space-y-2">
            {ratingDist.map((r) => (
              <div key={r.stars} className="flex items-center gap-3">
                <span className="text-sm w-16 text-text-3">{r.stars} stars</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="text-sm text-text-4 w-16 text-right">{r.count} ({r.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            </div>
            {["all", "pending", "approved", "flagged"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors capitalize ${
                  filter === f ? "bg-blue text-white border-blue" : "bg-white border-gray-200 text-text-3 hover:border-blue"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportReviews} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={printReviews} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {filtered.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-text-1">{review.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[review.status]}`}>
                      {review.status}
                    </span>
                    {review.verified && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue/10 text-blue font-medium">Verified</span>
                    )}
                  </div>
                  <p className="text-xs text-text-4">
                    by <span className="font-medium text-text-2">{review.customer}</span> on{" "}
                    <span className="font-medium">{review.product}</span> · {review.date}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-text-3 mb-3">{review.comment}</p>
              {review.staff_reply && (
                <div className="bg-blue-50 border-l-2 border-blue p-3 rounded-r-lg mb-3">
                  <p className="text-xs font-medium text-blue mb-1">Staff Reply</p>
                  <p className="text-sm text-text-3">{review.staff_reply}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-text-4">
                  <span className="flex items-center gap-1"><ThumbsUp size={12} /> {review.helpful} helpful</span>
                  {review.images > 0 && <span className="flex items-center gap-1"><ImageIcon size={12} /> {review.images} photos</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAction(review.id, "approve")} className="p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </button>
                  <button onClick={() => handleAction(review.id, "reject")} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                    <XCircle size={16} className="text-red" />
                  </button>
                  <button onClick={() => handleAction(review.id, "flag")} className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors" title="Flag">
                    <Flag size={16} className="text-yellow-600" />
                  </button>
                  <button onClick={() => handleAction(review.id, "reply")} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Reply">
                    <MessageSquare size={16} className="text-blue" />
                  </button>
                  <button onClick={() => handleAction(review.id, "delete")} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} className="text-text-4" />
                  </button>
                </div>
              </div>
            </div>
           ))}
         </div>
       </div>

       {/* Reply Modal */}
       {replyModal && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setReplyModal(null)}>
           <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
             <h3 className="font-semibold text-lg mb-4">Reply to Review</h3>
             <textarea
               className="w-full h-32 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue"
               value={replyText}
               onChange={e => setReplyText(e.target.value)}
               placeholder="Write your public reply to this review..."
             />
             <div className="flex justify-end gap-2 mt-4">
               <button onClick={() => setReplyModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
               <button onClick={saveReply} className="px-4 py-2 text-sm bg-blue text-white rounded-lg">Save Reply</button>
             </div>
           </div>
         </div>
       )}

     </AdminShell>
   );
 }
