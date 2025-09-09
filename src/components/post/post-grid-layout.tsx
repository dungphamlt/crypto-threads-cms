"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Row,
  Col,
  Space,
  message,
  Pagination,
  Empty,
} from "antd";
import { PostDetail, postService } from "@/services/postService";
import PostCard from "@/components/post/post-card";

const { Search } = Input;
const { Option } = Select;

interface PostGridProps {
  searchParams?: {
    current?: number;
    pageSize?: number;
    title?: string;
    category?: string;
    status?: string;
  };
}

function PostGridLayout({ searchParams }: PostGridProps) {
  const [data, setData] = useState<PostDetail[]>([]);
  const [filteredData, setFilteredData] = useState<PostDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(searchParams?.title || "");
  const [filterCategory, setFilterCategory] = useState(
    searchParams?.category || ""
  );
  const [filterStatus, setFilterStatus] = useState(searchParams?.status || "");
  const [pagination, setPagination] = useState({
    current: searchParams?.current || 1,
    pageSize: searchParams?.pageSize || 12,
    total: 0,
  });

  // Fetch posts function
  const fetchPosts = async (page: number = 1, pageSize: number = 12) => {
    setLoading(true);
    try {
      const response = await postService.getPostList(page, pageSize);

      if (response.success && response.data) {
        setData(response.data);
        applyFilters(response.data);
      } else {
        message.error(response.error || "Failed to fetch posts");
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      message.error("Failed to fetch posts");
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filters
  const applyFilters = (posts: PostDetail[]) => {
    let filtered = [...posts];

    // Search filter
    if (searchText.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchText.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchText.toLowerCase()) ||
          post.metaDescription?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter((post) => post.category === filterCategory);
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((post) => post.status === filterStatus);
    }

    setFilteredData(filtered);
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
    }));
  };

  useEffect(() => {
    fetchPosts(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, filterCategory, filterStatus, data]);

  console.log("Posts data:", filteredData);

  // Handle search and filters
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    applyFilters(data);
  };

  const handleReset = () => {
    setSearchText("");
    setFilterCategory("");
    setFilterStatus("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    applyFilters(data);
  };

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || pagination.pageSize;
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: newPageSize,
    }));
  };

  // Post actions
  const handleEditPost = (postId: string) => {
    // Navigate to edit page
    window.location.href = `/posts/edit/${postId}`;
  };

  const handleDeletePost = (postId: string) => {
    // Implement delete functionality when API is ready
    console.log("Delete post:", postId);
    message.info("Delete functionality coming soon");
  };

  const handleSharePost = (postId: string) => {
    // Copy post URL to clipboard
    const url = `${window.location.origin}/posts/view/${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      message.success("Post URL copied to clipboard!");
    });
  };

  const handleReportPost = (postId: string) => {
    // Implement report functionality
    console.log("Report post:", postId);
    message.info("Report functionality coming soon");
  };

  // Get paginated data
  const getCurrentPageData = () => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search posts by title or content..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Filter by category"
              value={filterCategory}
              onChange={setFilterCategory}
              style={{ width: "100%" }}
              allowClear
            >
              <Option value="technology">Technology</Option>
              <Option value="crypto">Cryptocurrency</Option>
              <Option value="blockchain">Blockchain</Option>
              <Option value="finance">Finance</Option>
              <Option value="news">News</Option>
              <Option value="tutorial">Tutorial</Option>
              <Option value="analysis">Analysis</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Filter by status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: "100%" }}
              allowClear
            >
              <Option value="draft">Draft</Option>
              <Option value="published">Published</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                Apply Filters
              </Button>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </Col>
        </Row>
      </div>

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
