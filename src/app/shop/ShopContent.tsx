"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Check,
} from "lucide-react";
import ProductCard from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import {
  categories,
  brands,
  products,
} from "@/lib/demo-data";

interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  rating: number | null;
  availability: string;
  location: string;
  colors: string[];
  customAttributes: Record<string, string[]>;
}

interface SortOption {
  label: string;
  value: string;
  icon: React.ElementType;
}

const sortOptions: SortOption[] = [
  { label: "Featured", value: "featured", icon: Grid3X3 },
  { label: "Newest", value: "newest", icon: SortDesc },
  { label: "Price: Low to High", value: "price-asc", icon: SortAsc },
  { label: "Price: High to Low", value: "price-desc", icon: SortDesc },
  { label: "Top Rated", value: "rating", icon: Check },
  { label: "Best Selling", value: "bestselling", icon: Grid3X3 },
];

const viewOptions = [
  { label: "Grid", value: "grid", icon: Grid3X3 },
  { label: "List", value: "list", icon: List },
];

export default function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    categories: searchParams.get("categories")?.split(",") || [],
    brands: searchParams.get("brands")?.split(",") || [],
    priceRange: [0, 1000000],
    rating: null,
    availability: "all",
    location: "all",
    colors: [],
    customAttributes: {},
  });

  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [viewMode, setViewMode] = useState(searchParams.get("view") || "grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.categories.length > 0) params.set("categories", filters.categories.join(","));
    if (filters.brands.length > 0) params.set("brands", filters.brands.join(","));
    if (sortBy !== "featured") params.set("sort", sortBy);
    if (viewMode !== "grid") params.set("view", viewMode);
    if (searchQuery) params.set("q", searchQuery);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/shop${newUrl}`, { scroll: false });
  }, [filters, sortBy, viewMode, searchQuery, router]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.name.toLowerCase().includes(query);
        const matchesCategory = product.category.name.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesCategory) return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category.slug)) {
        return false;
      }

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand.slug)) {
        return false;
      }

      // Price range
      const price = product.salePrice || product.regularPrice;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Availability
      if (filters.availability === "in-stock" && !product.inStock) return false;
      if (filters.availability === "out-of-stock" && product.inStock) return false;

      return true;
    });

    // Sort products
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-asc":
        filtered.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
        break;
      case "price-desc":
        filtered.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "bestselling":
        filtered.sort((a, b) => b.salesCount - a.salesCount);
        break;
      default:
        // Featured - keep original order
        break;
    }

    return filtered;
  }, [products, filters, sortBy, searchQuery]);

  const handleCategoryToggle = (categorySlug: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categorySlug)
        ? prev.categories.filter(c => c !== categorySlug)
        : [...prev.categories, categorySlug]
    }));
  };

  const handleBrandToggle = (brandSlug: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brandSlug)
        ? prev.brands.filter(b => b !== brandSlug)
        : [...prev.brands, brandSlug]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: [0, 1000000],
      rating: null,
      availability: "all",
      location: "all",
      colors: [],
      customAttributes: {},
    });
    setSearchQuery("");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) count++;
    if (filters.rating) count++;
    if (filters.availability !== "all") count++;
    if (filters.location !== "all") count++;
    if (filters.colors.length > 0) count++;
    if (searchQuery) count++;
    return count;
  }, [filters, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shop All Products</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredProducts.length} products found
                {activeFiltersCount > 0 && ` (${activeFiltersCount} filters applied)`}
              </p>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`w-72 bg-white rounded-lg border border-gray-200 p-6 h-fit ${
            showFilters ? 'fixed inset-y-0 left-0 z-50 overflow-y-auto' : 'hidden lg:block'
          }`}>
            {/* Mobile Close Button */}
            {showFilters && (
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Clear All */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-gray-900">Active Filters</span>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category.slug)}
                      onChange={() => handleCategoryToggle(category.slug)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">({category.productCount})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Brands</h3>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand.slug)}
                      onChange={() => handleBrandToggle(brand.slug)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{brand.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0] || ""}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [Number(e.target.value) || 0, prev.priceRange[1]]
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1] === 1000000 ? "" : filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], Number(e.target.value) || 1000000]
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All Products" },
                  { value: "in-stock", label: "In Stock" },
                  { value: "out-of-stock", label: "Out of Stock" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={filters.availability === option.value}
                      onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location/Branch Stock */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Location Stock</h3>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All Locations" },
                  { value: "phc", label: "Port Harcourt" },
                  { value: "lagos", label: "Lagos" },
                  { value: "bayelsa", label: "Bayelsa" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="location"
                      value={option.value}
                      checked={filters.location === option.value}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Filters ({activeFiltersCount})
                  </button>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1">
                  {viewOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setViewMode(option.value)}
                        className={`p-2 rounded-lg border transition-colors ${
                          viewMode === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {filters.categories.map((categorySlug) => {
                      const category = categories.find(c => c.slug === categorySlug);
                      return category ? (
                        <span
                          key={categorySlug}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {category.name}
                          <button
                            onClick={() => handleCategoryToggle(categorySlug)}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                    {filters.brands.map((brandSlug) => {
                      const brand = brands.find(b => b.slug === brandSlug);
                      return brand ? (
                        <span
                          key={brandSlug}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {brand.name}
                          <button
                            onClick={() => handleBrandToggle(brandSlug)}
                            className="hover:bg-green-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={viewMode === 'list' ? 'horizontal' : 'classic'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Load More (placeholder for pagination) */}
            {filteredProducts.length >= 20 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}