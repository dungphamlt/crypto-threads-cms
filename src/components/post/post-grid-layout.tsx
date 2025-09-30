"use client";

import { useState, useEffect, useCallback } from "react";
import { Pagination, Empty } from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { type PostDetail, postService } from "@/services/postService";
import PostCard from "@/components/post/post-card";
import toast from "react-hot-toast";
import PostViewDetail from "./post-view-detail";
import PostFormModal from "./post-create";

// Filter state interface
interface FilterState {
  searchText: string;
  category: string;
  subCategory: string;
  creator: string;
  status: string;
  startDate: string;
  endDate: string;
}

function PostGridLayout() {
  const [filteredData, setFilteredData] = useState<PostDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchText: "",
    category: "",
    subCategory: "",
    creator: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
    total: 0,
  });
  const [viewPostId, setViewPostId] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPost, setEditPost] = useState<PostDetail | null>(null);

  // Fetch posts function with optimized filters
  const fetchPosts = useCallback(
    async (page = 1, pageSize = 6) => {
      setLoading(true);
      try {
        // Build query params object, only including non-empty values
        const queryParams = {
          page,
          pageSize,
          ...Object.fromEntries(
            Object.entries(filters)
              .map(([key, value]) => [
                key === "searchText" ? "search" : key,
                value || undefined,
              ])
              .filter(([, value]) => value !== undefined)
          ),
        };

        const response = await postService.getPostList(queryParams);

        if (response.success && response.data?.data) {
          setPagination((prev) => ({
            ...prev,
            total: response.data?.pagination.totalItems ?? 0,
          }));
          // Ensure all data is properly formatted
          const posts = response.data.data ?? [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedPosts = posts.map((post: any) => ({
            ...post,
            tags: Array.isArray(post.tags)
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                post.tags.map((tag: any) => String(tag))
              : [],
          }));
          setFilteredData(formattedPosts);
        } else {
          toast.error(response.error || "Failed to fetch posts");
          setFilteredData([]);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        toast.error("Failed to fetch posts");
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchPosts(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPosts]);

  // Optimized filter handlers
  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleSearch = useCallback(() => {
    fetchPosts(1, pagination.pageSize);
  }, [fetchPosts, pagination.pageSize]);

  const handleReset = useCallback(() => {
    setFilters({
      searchText: "",
      category: "",
      subCategory: "",
      creator: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  // Handle pagination change
  const handlePaginationChange = useCallback(
    (page: number, pageSize?: number) => {
      const newPageSize = pageSize || pagination.pageSize;
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: newPageSize,
      }));
    },
    [pagination.pageSize]
  );

  const handleEditPost = useCallback((post: PostDetail) => {
    // Navigate to edit page
    setEditPost(post);
    setIsEditModalOpen(true);
  }, []);

  const handleSharePost = useCallback((postId: string) => {
    // Copy post URL to clipboard
    const url = `${window.location.origin}/posts/view/${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Post URL copied to clipboard!");
    });
  }, []);

  const handleViewPost = useCallback((postId: string) => {
    setViewPostId(postId);
    setIsViewModalOpen(true);
  }, []);

  // Get paginated data
  const getCurrentPageData = () => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  const renderFilterSection = () => {
    const hasActiveFilters = Object.values(filters).some(
      (value) => value !== ""
    );

    return (
      <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 mb-4">
        <div className="py-4 px-6">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Category Select */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                </span>
                Category
              </label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter("category", e.target.value)}
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white"
                >
                  <option value="">Select category</option>
                  <option value="technology">Technology</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="finance">Finance</option>
                  <option value="news">News</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="analysis">Analysis</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {filters.category && (
                  <button
                    onClick={() => updateFilter("category", "")}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <ClearOutlined />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Category Select */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="w-3 h-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                </span>
                Sub-Category
              </label>
              <div className="relative">
                <select
                  value={filters.subCategory}
                  onChange={(e) => updateFilter("subCategory", e.target.value)}
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white"
                >
                  <option value="">Select sub-category</option>
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="defi">DeFi</option>
                  <option value="nft">NFT</option>
                  <option value="trading">Trading</option>
                  <option value="mining">Mining</option>
                  <option value="security">Security</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {filters.subCategory && (
                  <button
                    onClick={() => updateFilter("subCategory", "")}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <ClearOutlined />
                  </button>
                )}
              </div>
            </div>

            {/* Creator Select */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <UserOutlined className="text-slate-400" />
                Creator
              </label>
              <div className="relative">
                <select
                  value={filters.creator}
                  onChange={(e) => updateFilter("creator", e.target.value)}
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white"
                >
                  <option value="">Select creator</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="author">Author</option>
                  <option value="guest">Guest Writer</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {filters.creator && (
                  <button
                    onClick={() => updateFilter("creator", "")}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <ClearOutlined />
                  </button>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarOutlined className="text-slate-400" />
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter("startDate", e.target.value)}
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
                />
                {filters.startDate && (
                  <button
                    onClick={() => updateFilter("startDate", "")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <ClearOutlined />
                  </button>
                )}
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarOutlined className="text-slate-400" />
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilter("endDate", e.target.value)}
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
                />
                {filters.endDate && (
                  <button
                    onClick={() => updateFilter("endDate", "")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <ClearOutlined />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <SearchOutlined className="text-slate-400" />
                Search Content
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, excerpt, or meta description..."
                  value={filters.searchText}
                  onChange={(e) => updateFilter("searchText", e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
                />
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                {filters.searchText && (
                  <button
                    onClick={() => updateFilter("searchText", "")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <ClearOutlined />
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Select */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircleOutlined className="text-green-500 text-xs" />
                  Status
                </label>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter("status", e.target.value)}
                    className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white"
                  >
                    <option value="">Select status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {filters.status && (
                    <button
                      onClick={() => updateFilter("status", "")}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <ClearOutlined />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 items-end justify-end">
                <button
                  onClick={handleSearch}
                  className="h-10 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <SearchOutlined />
                  Search
                </button>
                <button
                  onClick={handleReset}
                  disabled={!hasActiveFilters}
                  className="h-10 px-6 border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ClearOutlined />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderFilterSection()}

      {/* Posts Grid */}
      <div className="min-h-[400px] pt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-64 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <Empty description="No posts found" className="py-16" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getCurrentPageData().map((post) => (
              <PostCard
                key={post.id}
                initialPost={post}
                onEdit={handleEditPost}
                onShare={handleSharePost}
                onView={handleViewPost}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex justify-center pt-6">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} posts`
            }
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
            pageSizeOptions={["6", "9", "12", "15"]}
          />
        </div>
      )}
      {/* View Post Modal */}
      <PostViewDetail
        postId={viewPostId}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewPostId("");
        }}
      />

      {/* Create Post Modal */}
      <PostFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={editPost}
        postId={editPost?.id}
        onSuccess={() => {
          setIsEditModalOpen(false);
          fetchPosts(1, pagination.pageSize);
        }}
      />
    </div>
  );
}

export default PostGridLayout;
