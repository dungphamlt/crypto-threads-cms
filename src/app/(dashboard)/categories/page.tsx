"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const mockCategories = [
  {
    id: 1,
    name: "Insights",
    slug: "insights",
    description: "Phân tích thị trường và báo cáo chuyên sâu",
    postCount: 116,
    color: "bg-blue-500",
    isActive: true,
    createdAt: "2024-01-15",
    subcategories: [
      { name: "Market Analysis", slug: "market-analysis", postCount: 25 },
      { name: "Industry Reports", slug: "industry-reports", postCount: 18 },
      { name: "Economic Trends", slug: "economic-trends", postCount: 32 },
      {
        name: "Investment Insights",
        slug: "investment-insights",
        postCount: 41,
      },
    ],
  },
  {
    id: 2,
    name: "Learn",
    slug: "learn",
    description: "Kiến thức cơ bản và nâng cao về trading",
    postCount: 104,
    color: "bg-green-500",
    isActive: true,
    createdAt: "2024-01-10",
    subcategories: [
      { name: "Trading Basics", slug: "trading-basics", postCount: 35 },
      { name: "Technical Analysis", slug: "technical-analysis", postCount: 28 },
      { name: "Risk Management", slug: "risk-management", postCount: 22 },
      { name: "Portfolio Strategy", slug: "portfolio-strategy", postCount: 19 },
    ],
  },
  {
    id: 3,
    name: "Trading",
    slug: "trading",
    description: "Các loại hình giao dịch và thị trường",
    postCount: 151,
    color: "bg-purple-500",
    isActive: true,
    createdAt: "2024-01-08",
    subcategories: [
      { name: "Forex", slug: "forex", postCount: 45 },
      { name: "Stocks", slug: "stocks", postCount: 38 },
      { name: "Crypto", slug: "crypto", postCount: 52 },
      { name: "Commodities", slug: "commodities", postCount: 16 },
    ],
  },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredCategories = mockCategories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some((sub) =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && category.isActive) ||
      (filterStatus === "inactive" && !category.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {mockCategories.length} danh mục
          </p>
        </div>
        <Link href="/categories/create">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Tạo danh mục mới
          </button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Lọc:{" "}
              {filterStatus === "all"
                ? "Tất cả"
                : filterStatus === "active"
                ? "Hoạt động"
                : "Không hoạt động"}
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setShowFilterDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg"
                >
                  Tất cả
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("active");
                    setShowFilterDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                >
                  Hoạt động
                </button>
                <button
                  onClick={() => {
                    setFilterStatus("inactive");
                    setShowFilterDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 last:rounded-b-lg"
                >
                  Không hoạt động
                </button>
              </div>
            )}
          </div>

          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-r-lg border-l border-gray-300 transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="p-6 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${category.color}`} />
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                  <div className="relative">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Danh mục con:
                  </h4>
                  <div className="space-y-1">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/categories/${category.slug}/${sub.slug}`}
                        className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 transition-colors p-2 rounded hover:bg-gray-50"
                      >
                        <span className="flex items-center gap-2">
                          <ChevronRight className="h-3 w-3" />
                          {sub.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {sub.postCount}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {category.postCount} bài viết
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.isActive ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${category.color}`} />
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {category.postCount} bài viết
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.isActive ? "Hoạt động" : "Tạm dừng"}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/categories/${category.slug}/${sub.slug}`}
                      className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 transition-colors p-2 rounded hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3" />
                        {sub.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {sub.postCount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy danh mục nào phù hợp</p>
        </div>
      )}
    </div>
  );
}
