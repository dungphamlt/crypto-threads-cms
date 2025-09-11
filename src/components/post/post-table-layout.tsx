"use client";

import { useState, useRef } from "react";
import ProTable, {
  type ProColumns,
  type ActionType,
} from "@ant-design/pro-table";
import {
  Tag,
  Space,
  Button,
  Popconfirm,
  Avatar,
  Image,
  ConfigProvider,
  Tooltip,
} from "antd";
import enUS from "antd/locale/en_US";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined as DraftOutlined,
  DeleteOutlined as TrashOutlined,
  SearchOutlined,
  // FilterOutlined,
  ClearOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { type PostDetail, postService } from "@/services/postService";
import { categoryService } from "@/services/categoryService";
import { POST_STATUS, type SubCategory } from "@/types";
import { toast } from "react-hot-toast";
import PostViewDetail from "@/components/post/post-view-detail";
import PostFormModal from "@/components/post/post-create";
import { getSafeImageUrl } from "@/utils/imageUtils";

function PostTableLayout() {
  const actionRef = useRef<ActionType>(null);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // View Modal States
  const [viewPostId, setViewPostId] = useState<string>("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Edit Modal States
  const [editPost, setEditPost] = useState<PostDetail | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load categories and subcategories
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategoryList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = categoriesResponse?.success
    ? categoriesResponse.data || []
    : [];

  // Load subcategories
  const { data: subCategoriesResponse } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => categoryService.getSubCategoryList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const subCategories = subCategoriesResponse?.success
    ? subCategoriesResponse.data || []
    : [];

  // Build subcategory names map from queries
  const subCategoryNames: Record<string, string> = {};
  subCategories.forEach((query: SubCategory) => {
    subCategoryNames[query.id] = query.key;
  });

  // Create Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    title: "",
    category: "",
    subCategory: "",
    creator: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // Fetch posts with React Query
  const fetchPosts = async (params: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { current = 1, pageSize: newPageSize = 10 } = params as {
        current?: number;
        pageSize?: number;
      };

      const response = await postService.getPostList({
        page: current,
        pageSize: newPageSize,
        search: filters.title || undefined,
        category: filters.category || undefined,
        subCategory: filters.subCategory || undefined,
        creator: filters.creator || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      if (response.success && response.data?.data) {
        return {
          data: response.data.data,
          success: true,
          total: response.data.pagination.totalItems,
        };
      } else {
        toast.error(response.error || "Failed to fetch posts");
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to fetch posts");
      return {
        data: [],
        success: false,
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  // Handle delete post
  const handleDelete = async (id: string) => {
    const toastId = toast.loading("Deleting post...");
    try {
      const response = await postService.updatePostStatus(
        id,
        POST_STATUS.TRASH
      );
      if (response.success) {
        toast.success("Post moved to trash successfully", { id: toastId });
        actionRef.current?.reload();
        queryClient.invalidateQueries({ queryKey: ["posts"] });

        // Close modals if they're showing the deleted post
        if (viewPostId === id) {
          setViewPostId("");
          setIsViewModalOpen(false);
        }
        if (editPost?.id === id) {
          setEditPost(null);
          setIsEditModalOpen(false);
        }
      } else {
        toast.error(response.error || "Failed to delete post", { id: toastId });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post", { id: toastId });
    }
  };

  // Handle edit post
  const handleEdit = (post: PostDetail | string) => {
    if (typeof post === "string") {
      // If called with ID (from view modal), find the post
      // For now, we'll need to fetch the post data
      loadPostForEdit(post);
    } else {
      // If called with post object (from table)
      setEditPost(post);
      setIsEditModalOpen(true);

      // Close view modal if open
      if (isViewModalOpen) {
        setIsViewModalOpen(false);
      }
    }
  };

  const loadPostForEdit = async (id: string) => {
    try {
      const response = await postService.getPostDetail(id);
      if (response.success && response.data) {
        setEditPost(response.data);
        setIsEditModalOpen(true);
        setIsViewModalOpen(false);
      } else {
        toast.error("Failed to load post for editing");
      }
    } catch (error) {
      console.error("Failed to load post:", error);
      toast.error("Failed to load post");
    }
  };

  // Handle view post
  const handleView = (postId: string) => {
    setViewPostId(postId);
    setIsViewModalOpen(true);
  };

  // Handle post success (create/edit)
  const handlePostSuccess = (post: PostDetail) => {
    // Refresh the table
    console.log("Post updated successfully", post);
    actionRef.current?.reload();
    queryClient.invalidateQueries({ queryKey: ["posts"] });

    // Close modals
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditPost(null);

    toast.success("Post updated successfully");
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value,
      };

      // Clear subcategory when category changes
      if (key === "category") {
        newFilters.subCategory = "";
      }

      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      title: "",
      category: "",
      subCategory: "",
      creator: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    actionRef.current?.reload();
    toast.success("Search cleared");
  };

  // Apply filters
  const applyFilters = () => {
    actionRef.current?.reload();
    // toast.success("Search applied");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  // Enhanced Status Badge Component
  const StatusBadge = ({ status }: { status: string | undefined }) => {
    const normalizedStatus = String(status || "").toLowerCase();

    const statusConfig = {
      [POST_STATUS.PUBLISHED]: {
        color: "#52c41a",
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f",
        text: "Published",
        icon: <CheckCircleOutlined className="text-green-600" />,
      },
      [POST_STATUS.DRAFT]: {
        color: "#faad14",
        bgColor: "#fffbe6",
        borderColor: "#ffe58f",
        text: "Draft",
        icon: <DraftOutlined className="text-orange-600" />,
      },
      [POST_STATUS.TRASH]: {
        color: "#ff4d4f",
        bgColor: "#fff2f0",
        borderColor: "#ffccc7",
        text: "Trash",
        icon: <TrashOutlined className="text-red-600" />,
      },
      [POST_STATUS.SCHEDULE]: {
        color: "#1890ff",
        bgColor: "#f0f5ff",
        borderColor: "#adc6ff",
        text: "Scheduled",
        icon: <ClockCircleOutlined className="text-blue-600" />,
      },
    };

    const config = statusConfig[
      normalizedStatus as keyof typeof statusConfig
    ] || {
      color: "#d9d9d9",
      bgColor: "#fafafa",
      borderColor: "#d9d9d9",
      text: normalizedStatus || "Unknown",
      icon: null,
    };

    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
        style={{
          color: config.color,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        }}
      >
        {config.icon}
        <span className="capitalize">{config.text}</span>
      </div>
    );
  };

  // Define columns
  const columns: ProColumns<PostDetail>[] = [
    {
      title: "Cover",
      key: "cover",
      width: 100,
      render: (_, record) => (
        <div className="flex justify-center">
          <Image
            width={60}
            height={45}
            src={getSafeImageUrl(record.coverUrl, "small")}
            alt={record.title}
            className="rounded-lg object-cover shadow-sm"
            placeholder={
              <div className="w-15 h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-400">No Image</span>
              </div>
            }
          />
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (title, record) => (
        <div>
          <div
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors duration-200 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            onClick={() => handleView(record.id)}
          >
            {title}
          </div>
        </div>
      ),
    },
    {
      title: "Excerpt",
      dataIndex: "excerpt",
      key: "excerpt",
      width: 200,
      render: (excerpt) => (
        <div
          className="text-sm text-gray-600 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {excerpt || "No excerpt"}
        </div>
      ),
    },
    {
      title: "Meta Description",
      dataIndex: "metaDescription",
      key: "metaDescription",
      width: 200,
      render: (metaDescription) => (
        <div
          className="text-sm text-gray-500 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {metaDescription || "No meta description"}
        </div>
      ),
    },
    {
      title: "Author",
      dataIndex: ["creator", "email"],
      key: "author",
      width: 180,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Avatar
            size={32}
            className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold"
            icon={<UserOutlined />}
          >
            {String(record.creator?.email?.charAt(0) || "U").toUpperCase()}
          </Avatar>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {String(record.creator?.email || "Unknown")}
            </div>
            <div className="text-xs text-gray-500">
              ID: {String(record.creator?.id || "N/A").slice(-8)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category, record) => {
        // Helper function to get category name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getCategoryName = (cat: any): string => {
          if (!cat) return "Unknown";

          // If it's already a string, return as is
          if (typeof cat === "string") {
            const found = categories.find((c) => c.id === cat || c.key === cat);
            return found?.key || cat;
          }

          // If it's an object with key property
          if (typeof cat === "object" && cat.key) {
            return cat.key;
          }

          // If it's an object with id property
          if (typeof cat === "object" && cat.id) {
            const found = categories.find((c) => c.id === cat.id);
            return found?.key || cat.id;
          }

          return "Unknown";
        };

        // Helper function to get subcategory name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getSubCategoryName = (subCat: any): string => {
          if (!subCat) return "";

          // If it's already a string, return as is
          if (typeof subCat === "string") {
            return subCategoryNames[subCat] || subCat;
          }

          // If it's an object with key property
          if (typeof subCat === "object" && subCat.key) {
            return subCat.key;
          }

          // If it's an object with id property
          if (typeof subCat === "object" && subCat.id) {
            return subCategoryNames[subCat.id] || subCat.id;
          }

          return String(subCat);
        };

        return (
          <div className="space-y-1">
            <Tag color="blue" className="font-medium">
              {getCategoryName(category)}
            </Tag>
            {record.subCategory && (
              <Tag color="cyan" className="text-xs">
                {getSubCategoryName(record.subCategory)}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 150,
      render: (tags) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(tags) && tags.length > 0 ? (
            <>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {tags.slice(0, 2).map((tag: any, index: number) => (
                <Tag key={index} color="purple" className="text-xs">
                  {String(tag)}
                </Tag>
              ))}
              {tags.length > 2 && (
                <Tooltip
                  title={tags
                    .slice(2)
                    .map((t) => String(t))
                    .join(", ")}
                >
                  <Tag className="text-xs cursor-help">+{tags.length - 2}</Tag>
                </Tooltip>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">No tags</span>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (_, record) => {
        return <StatusBadge status={record.status} />;
      },
    },
    {
      title: "Stats",
      key: "stats",
      width: 100,
      render: (_, record) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center text-gray-600">
            <span>👁️ {String(record.views || 0)}</span>
          </div>
          <div className="text-gray-500">ID: {String(record.id).slice(-8)}</div>
        </div>
      ),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 120,
      sorter: true,
      render: (updatedAt, record) => (
        <div className="text-xs space-y-1">
          <div className="text-gray-600">
            <CalendarOutlined className="mr-1" />
            {updatedAt
              ? new Date(String(updatedAt)).toLocaleDateString()
              : "N/A"}
          </div>
          {(record as PostDetail & { publishedAt?: string }).publishedAt && (
            <div className="text-green-600 text-xs">
              Published:{" "}
              {new Date(
                String(
                  (record as PostDetail & { publishedAt?: string }).publishedAt
                )
              ).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" className="flex-nowrap">
          <Tooltip title="View Post">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
              className="hover:bg-blue-50 hover:text-blue-600"
            />
          </Tooltip>

          <Tooltip title="Edit Post">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="hover:bg-green-50 hover:text-green-600"
            />
          </Tooltip>

          <Popconfirm
            title="Delete Post"
            description="Are you sure you want to move this post to trash? This action can be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Move to Trash"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Move to Trash">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="hover:bg-red-50"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderFilterSection = () => {
    const hasActiveFilters =
      filters.title ||
      filters.category ||
      filters.subCategory ||
      filters.creator ||
      filters.status ||
      filters.startDate ||
      filters.endDate;

    return (
      <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 m-6 mb-4">
        <div className="px-6 py-4">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  value={filters.category || ""}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat: { id: string; key: string }) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.key}
                    </option>
                  ))}
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
                    onClick={() => handleFilterChange("category", "")}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <CloseOutlined />
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
                  value={filters.subCategory || ""}
                  onChange={(e) =>
                    handleFilterChange("subCategory", e.target.value)
                  }
                  disabled={!filters.category}
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white disabled:opacity-50"
                >
                  <option value="">
                    {!filters.category
                      ? "Select category first"
                      : "Select sub-category"}
                  </option>
                  {subCategories.map((subcat: SubCategory) => {
                    if (subcat.categoryId?.id !== filters.category) {
                      return null;
                    }
                    return (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.key}
                      </option>
                    );
                  })}
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
                    onClick={() => handleFilterChange("subCategory", "")}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <CloseOutlined />
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
                  value={filters.creator || ""}
                  onChange={(e) =>
                    handleFilterChange("creator", e.target.value)
                  }
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
                    onClick={() => handleFilterChange("creator", "")}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <CloseOutlined />
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
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
                />
                {filters.startDate && (
                  <button
                    onClick={() => handleFilterChange("startDate", "")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <CloseOutlined />
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
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
                />
                {filters.endDate && (
                  <button
                    onClick={() => handleFilterChange("endDate", "")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <CloseOutlined />
                  </button>
                )}
              </div>
            </div>
          </div>
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
                  placeholder="Search by title"
                  value={filters.title}
                  onChange={(e) => handleFilterChange("title", e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
                />
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                {filters.title && (
                  <button
                    onClick={() => handleFilterChange("title", "")}
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
                    value={filters.status || ""}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white"
                  >
                    <option value="">Select status</option>
                    <option value={POST_STATUS.DRAFT}>Draft</option>
                    <option value={POST_STATUS.PUBLISHED}>Published</option>
                    <option value={POST_STATUS.TRASH}>Trash</option>
                    <option value={POST_STATUS.SCHEDULE}>Scheduled</option>
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
                      onClick={() => handleFilterChange("status", "")}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <CloseOutlined />
                    </button>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-2 items-end">
                <button
                  onClick={applyFilters}
                  className="flex-1 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <SearchOutlined />
                  Search
                </button>
                <button
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="h-10 px-4 border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <ConfigProvider
      locale={enUS}
      theme={{
        token: {
          colorPrimary: "#1f4172",
          borderRadius: 8,
          colorBgContainer: "#ffffff",
        },
        components: {
          Table: {
            headerBg: "#fafafa",
            headerColor: "#262626",
            rowHoverBg: "#f5f5f5",
          },
        },
      }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {renderFilterSection()}

        <ProTable<PostDetail>
          columns={columns}
          actionRef={actionRef}
          request={fetchPosts}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} posts`,
            pageSizeOptions: ["10", "20", "50", "100"],
            size: "default",
          }}
          search={false}
          options={{
            setting: {
              listsHeight: 400,
            },
            reload: true,
            density: false,
            fullScreen: true,
          }}
          scroll={{ x: 1400 }}
          dateFormatter="string"
          size="middle"
          rowClassName="hover:shadow-sm transition-shadow duration-200"
        />

        {/* View Post Modal */}
        {!!viewPostId && (
          <PostViewDetail
            postId={viewPostId}
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setViewPostId("");
            }}
            // onEdit={handleEdit}
            // onDelete={handleDelete}
          />
        )}

        {/* Create Post Modal */}
        <PostFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handlePostSuccess}
        />

        {/* Edit Post Modal */}
        {editPost && (
          <PostFormModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditPost(null);
            }}
            postId={editPost.id}
            initialData={editPost}
            onSuccess={handlePostSuccess}
          />
        )}
      </div>
    </ConfigProvider>
  );
}

export default PostTableLayout;
