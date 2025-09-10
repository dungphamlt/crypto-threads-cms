"use client";

import { useState, useEffect } from "react";
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

function PostGridLayout() {
  const [filteredData, setFilteredData] = useState<PostDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [filterCreator, setFilterCreator] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  // Fetch posts function
  const fetchPosts = async (page = 1, pageSize = 12) => {
    setLoading(true);
    try {
      const response = await postService.getPostList({
        page,
        pageSize,
        search: searchText || undefined,
        category: filterCategory || undefined,
        subCategory: filterSubCategory || undefined,
        creator: filterCreator || undefined,
        status: filterStatus || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      });

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
          // Ensure category is a string
          category:
            typeof post.category === "object"
              ? post.category?.id || post.category?.key || "Unknown"
              : String(post.category || "Unknown"),
          // Ensure subCategory is a string
          subCategory:
            typeof post.subCategory === "object"
              ? post.subCategory?.id || post.subCategory?.key || ""
              : String(post.subCategory || ""),
          // Ensure tags are strings
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
  };

  useEffect(() => {
    fetchPosts(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search and filters
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchPosts(1, pagination.pageSize);
  };

  const handleReset = () => {
    setSearchText("");
    setFilterCategory("");
    setFilterSubCategory("");
    setFilterCreator("");
    setFilterStatus("");
    setFilterStartDate("");
    setFilterEndDate("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchPosts(1, pagination.pageSize);
  };

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || pagination.pageSize;
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: newPageSize,
    }));
    fetchPosts(page, newPageSize);
  };

  // Post actions
  const handleEditPost = (postId: string) => {
    // Navigate to edit page
    window.location.href = `/posts/edit/${postId}`;
  };

  const handleDeletePost = (postId: string) => {
    // Implement delete functionality when API is ready
    console.log("Delete post:", postId);
    toast("Delete functionality coming soon");
  };

  const handleSharePost = (postId: string) => {
    // Copy post URL to clipboard
    const url = `${window.location.origin}/posts/view/${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Post URL copied to clipboard!");
    });
  };

  const handleReportPost = (postId: string) => {
    // Implement report functionality
    console.log("Report post:", postId);
    toast("Report functionality coming soon");
  };

  // Get paginated data
  const getCurrentPageData = () => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  const renderFilterSection = () => {
    const hasActiveFilters =
      searchText ||
      filterCategory ||
      filterSubCategory ||
      filterCreator ||
      filterStatus ||
      filterStartDate ||
      filterEndDate;

    return (
      <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 m-6 mb-4">
        <div className="px-6 py-4">
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
                  value={filterCategory || ""}
                  onChange={(e) => setFilterCategory(e.target.value)}
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
                {filterCategory && (
                  <button
                    onClick={() => setFilterCategory("")}
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
                  value={filterSubCategory || ""}
                  onChange={(e) => setFilterSubCategory(e.target.value)}
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
                {filterSubCategory && (
                  <button
                    onClick={() => setFilterSubCategory("")}
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
                  value={filterCreator || ""}
                  onChange={(e) => setFilterCreator(e.target.value)}
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
                {filterCreator && (
                  <button
                    onClick={() => setFilterCreator("")}
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
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
                />
                {filterStartDate && (
                  <button
                    onClick={() => setFilterStartDate("")}
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
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
                />
                {filterEndDate && (
                  <button
                    onClick={() => setFilterEndDate("")}
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
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
                />
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
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
                    value={filterStatus || ""}
                    onChange={(e) => setFilterStatus(e.target.value)}
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
                  {filterStatus && (
                    <button
                      onClick={() => setFilterStatus("")}
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
      <div className="min-h-[400px]">
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
                post={post}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onShare={handleSharePost}
                onReport={handleReportPost}
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
            pageSizeOptions={["12", "24", "36", "48"]}
          />
        </div>
      )}
    </div>
  );
}

export default PostGridLayout;
