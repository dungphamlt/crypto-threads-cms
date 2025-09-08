"use client";

import { useState, useEffect } from "react";
import { Grid, List, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Subcategory {
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

interface CategoryData {
  name: string;
  description: string;
  subcategories: Subcategory[];
}

export default function CategoryPage() {
  const params = useParams();
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch(`/api/categories/${params.category}`);
        const result = await response.json();
        if (result.success) {
          setCategoryData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [params.category]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <p className="text-gray-500">Không tìm thấy danh mục</p>
      </div>
    );
  }

  const filteredSubcategories = categoryData.subcategories.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {categoryData.name}
        </h1>
        <p className="text-gray-600">{categoryData.description}</p>
        <div className="mt-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {categoryData.subcategories.length} danh mục con
          </span>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục con..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
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

      {/* Subcategories Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubcategories.map((subcategory) => (
            <Link
              key={subcategory.slug}
              href={`/categories/${params.category}/${subcategory.slug}`}
            >
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">{subcategory.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">
                    {subcategory.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {subcategory.postCount} bài viết
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubcategories.map((subcategory) => (
            <Link
              key={subcategory.slug}
              href={`/categories/${params.category}/${subcategory.slug}`}
            >
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {subcategory.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {subcategory.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {subcategory.postCount} bài viết
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredSubcategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Không tìm thấy danh mục con nào phù hợp
          </p>
        </div>
      )}
    </div>
  );
}
