"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import ProTable, {
  type ProColumns,
  type ActionType,
} from "@ant-design/pro-table";
import { Tag, Space, Button, Image, ConfigProvider, Tooltip } from "antd";
import enUS from "antd/locale/en_US";
import {
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined as DraftOutlined,
  DeleteOutlined as TrashOutlined,
  SearchOutlined,
  ClearOutlined,
  CloseOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type PostDetail, postService } from "@/services/postService";
import { categoryService } from "@/services/categoryService";
import { POST_STATUS, type SubCategory } from "@/types";
import { toast } from "react-hot-toast";
import PostViewDetail from "@/components/post/post-view-detail";
import PostFormModal from "@/components/post/post-create";
import DeletePostButton from "@/components/post/DeletePostButton";
import PostQuickEdit from "@/components/post/post-quick-edit";
import { getSafeImageUrl } from "@/utils/imageUtils";
import { useSearchParams } from "next/navigation";

function PostTableLayout() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const actionRef = useRef<ActionType>(null);
  const queryClient = useQueryClient();

  // View Modal States
  const [viewPostId, setViewPostId] = useState<string>("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Quick Edit State
  const [quickEditPostId, setQuickEditPostId] = useState<string | null>(null);
  // const [postsData, setPostsData] = useState<PostDetail[]>([]);

  // Edit Modal States
  const [editPost, setEditPost] = useState<PostDetail | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load categories and subcategories with optimized caching
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategoryList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  const categories = useMemo(
    () => (categoriesResponse?.success ? categoriesResponse.data || [] : []),
    [categoriesResponse]
  );

  // Load subcategories with optimized caching
  const { data: subCategoriesResponse } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => categoryService.getSubCategoryList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const subCategories = useMemo(
    () =>
      subCategoriesResponse?.success ? subCategoriesResponse.data || [] : [],
    [subCategoriesResponse]
  );

  // Build subcategory names map from queries - memoized
  const subCategoryNames = useMemo(() => {
    const names: Record<string, string> = {};
    subCategories.forEach((query: SubCategory) => {
      names[query.id] = query.key;
    });
    return names;
  }, [subCategories]);

  // Create Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    title: "",
    category: categoryParam || "",
    subCategory: "",
    creator: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // Loading state for posts
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const fetchPosts = useCallback(
    async (params: Record<string, unknown>) => {
      const { current = 1, pageSize: newPageSize = 10 } = params as {
        current?: number;
        pageSize?: number;
      };

      const currentPage = current as number;
      const currentPageSize = newPageSize as number;

      // Build query key for this specific request
      const queryKey = [
        "posts",
        currentPage,
        currentPageSize,
        filters.title,
        filters.category,
        filters.subCategory,
        filters.creator,
        filters.status,
        filters.startDate,
        filters.endDate,
      ];

      setIsLoadingPosts(true);

      try {
        const response = await queryClient.ensureQueryData({
          queryKey,
          queryFn: async () => {
            const result = await postService.getPostList({
              page: currentPage,
              pageSize: currentPageSize,
              search: filters.title || undefined,
              category: filters.category || undefined,
              subCategory: filters.subCategory || undefined,
              creator: filters.creator || undefined,
              status: filters.status || undefined,
              startDate: filters.startDate || undefined,
              endDate: filters.endDate || undefined,
            });

            if (!result.success) {
              throw new Error(result.error || "Failed to fetch posts");
            }

            return result;
          },
          staleTime: 2 * 60 * 1000, // 2 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
        });

        if (response?.success && response.data?.data) {
          // setPostsData(response.data.data);
          return {
            data: response.data.data,
            success: true,
            total: response.data.pagination.totalItems,
          };
        }

        return {
          data: [],
          success: false,
          total: 0,
        };
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        toast.error("Failed to fetch posts");
        return {
          data: [],
          success: false,
          total: 0,
        };
      } finally {
        setIsLoadingPosts(false);
      }
    },
    [queryClient, filters]
  );

  // Invalidate posts cache helper
  const invalidatePostsCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  }, [queryClient]);

  // Load post for edit - memoized
  const loadPostForEdit = useCallback(async (id: string) => {
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
  }, []);

  // Handle edit post - memoized
  const handleEdit = useCallback(
    (post: PostDetail | string) => {
      if (typeof post === "string") {
        // If called with ID (from view modal), find the post
        loadPostForEdit(post);
      } else {
        // If called with post object (from table)
        setEditPost(post);
        setIsEditModalOpen(true);
        setIsViewModalOpen(false); // Close view modal if open
      }
    },
    [loadPostForEdit]
  );

  // Handle view post
  const handleView = useCallback((postId: string) => {
    setViewPostId(postId);
    setIsViewModalOpen(true);
  }, []);

  // Handle delete success - invalidate cache
  const handleDeleteSuccess = useCallback(() => {
    invalidatePostsCache();
    actionRef.current?.reload();
  }, [invalidatePostsCache]);

  // Handle quick edit
  const handleQuickEdit = useCallback((postId: string) => {
    setQuickEditPostId(postId);
  }, []);

  // Handle quick edit success - invalidate cache
  const handleQuickEditSuccess = useCallback(
    (updatedPost: PostDetail) => {
      invalidatePostsCache();
      actionRef.current?.reload();
      setQuickEditPostId(null);
      toast.success("Post updated successfully");
      console.log("Post updated successfully", updatedPost);
    },
    [invalidatePostsCache]
  );

  const handleQuickEditCancel = useCallback(() => {
    setQuickEditPostId(null);
  }, []);

  // Handle post success (create/edit) - invalidate cache
  const handlePostSuccess = useCallback(() => {
    invalidatePostsCache();
    actionRef.current?.reload();

    // Close modals
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditPost(null);

    toast.success("Post updated successfully");
  }, [invalidatePostsCache]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: string) => {
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
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      title: "",
      category: "",
      subCategory: "",
      creator: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    invalidatePostsCache();
    // ProTable will automatically reset to first page when reload is called
    actionRef.current?.reload();
    toast.success("Search cleared");
  }, [invalidatePostsCache]);

  // Apply filters
  const applyFilters = useCallback(() => {
    invalidatePostsCache();
    // ProTable will automatically reset to first page when reload is called
    actionRef.current?.reload();
  }, [invalidatePostsCache]);

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
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
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
    // Title
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
    // Excerpt
    // {
    //   title: "Excerpt",
    //   dataIndex: "excerpt",
    //   key: "excerpt",
    //   width: 200,
    //   render: (excerpt) => (
    //     <div
    //       className="text-sm overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
    //       style={{
    //         display: "-webkit-box",
    //         WebkitLineClamp: 2,
    //         WebkitBoxOrient: "vertical",
    //         overflow: "hidden",
    //       }}
    //     >
    //       {excerpt || "No excerpt"}
    //     </div>
    //   ),
    // },
    // Meta Description
    {
      title: "Meta Description",
      dataIndex: "metaDescription",
      key: "metaDescription",
      width: 380,
      render: (metaDescription) => (
        <div
          className="text-sm overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
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
    // Author
    {
      title: "Author",
      dataIndex: ["creator"],
      key: "author",
      width: 180,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          {record.creator.avatarUrl ? (
            <Image
              width={32}
              height={32}
              src={getSafeImageUrl(record.creator.avatarUrl, "small")}
              alt={record.creator.email}
              className="rounded-full object-cover shadow-[0_0_3px_1px_rgba(0,0,0,0.2)]"
            />
          ) : (
            <div className="h-8 w-8 rounded-full object-cover ring-1 ring-primary/10 bg-primary flex items-center justify-center text-white">
              {record.creator.penName.charAt(0)}
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600">
              {String(record.creator?.penName || "Unknown")}
            </div>
          </div>
        </div>
      ),
    },
    // Category
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
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
            <Tag color="blue" className="font-medium text-xs">
              {getCategoryName(category).length > 10
                ? `${getCategoryName(category).slice(0, 10)}...`
                : getCategoryName(category)}
            </Tag>
            {record.subCategory && (
              <Tag color="cyan" className="text-xs">
                {getSubCategoryName(record.subCategory).length > 10
                  ? `${getSubCategoryName(record.subCategory).slice(0, 10)}...`
                  : getSubCategoryName(record.subCategory)}
              </Tag>
            )}
          </div>
        );
      },
    },
    // Tags
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
    // Status
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (_, record) => {
        return <StatusBadge status={record.status} />;
      },
    },
    // Stats
    {
      title: "Total Views",
      key: "views",
      width: 100,
      render: (_, record) => (
        <div className="text-xs space-y-1">
          <div className="flex justify-center items-center text-gray-600">
            <span>👁️ {String(record.views || 0)}</span>
          </div>
        </div>
      ),
    },
    // Updated
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
    // Seo score
    {
      title: "SEO Score",
      dataIndex: "seoScore",
      key: "seoScore",
      width: 120,
      render: (_, record) => (
        <div className="space-y-1 ml-2">
          <span
            className={`font-medium px-2 py-1 rounded-md ${
              record.seoPoint >= 80
                ? "bg-green-50 text-green-700"
                : record.seoPoint >= 50
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {record.seoPoint ?? "N/A"}
          </span>
        </div>
      ),
    },
    // Actions
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

          <Tooltip title="Quick Edit">
            <Button
              type="text"
              size="small"
              icon={<ThunderboltOutlined style={{ color: "blue" }} />}
              onClick={() => handleQuickEdit(record.id)}
              className="hover:bg-purple-50 hover:text-purple-600"
            />
          </Tooltip>

          <Tooltip title="Edit Post">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: "#faad14" }} />}
              onClick={() => handleEdit(record)}
              className="hover:bg-green-50 hover:text-green-600"
            />
          </Tooltip>

          <DeletePostButton
            postId={record.id}
            onSuccess={handleDeleteSuccess}
          />
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
      <div className="bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-200/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-5">
        {/* Increased padding for bigger frame */}
        <div className="px-8 py-8">
          {/* Filter Controls - fewer columns so each control is wider */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Select */}
            <div className="space-y-1">
              <div className="relative">
                <select
                  name="SelectCategory"
                  value={filters.category || ""}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full h-9 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white text-sm"
                >
                  <option value="">All category</option>
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
                    <CloseOutlined style={{ fontSize: 12 }} />
                  </button>
                )}
              </div>
            </div>
            {/* Sub-Category Select */}
            <div className="space-y-1">
              <div className="relative">
                <select
                  name="SelectSubCategory"
                  value={filters.subCategory || ""}
                  onChange={(e) =>
                    handleFilterChange("subCategory", e.target.value)
                  }
                  disabled={!filters.category}
                  className="w-full h-9 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white disabled:opacity-60 text-sm"
                >
                  <option value="">All sub-category</option>
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
                    <CloseOutlined style={{ fontSize: 12 }} />
                  </button>
                )}
              </div>
            </div>
            {/* Creator Select */}
            <div className="space-y-1">
              <div className="relative">
                <select
                  name="SelectCreator"
                  value={filters.creator || ""}
                  onChange={(e) =>
                    handleFilterChange("creator", e.target.value)
                  }
                  className="w-full h-9 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white text-sm"
                >
                  <option value="">All creator</option>
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
                    <CloseOutlined style={{ fontSize: 12 }} />
                  </button>
                )}
              </div>
            </div>

            {/* Status / Date group (we keep it in the same grid cell so layout remains neat) */}
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={filters.startDate}
                    placeholder="All date"
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="w-full h-9 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors text-sm"
                  />
                  {filters.startDate && (
                    <button
                      onClick={() => handleFilterChange("startDate", "")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <CloseOutlined style={{ fontSize: 12 }} />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    name="SelectStatusPosts"
                    value={filters.status || ""}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full h-9 px-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors appearance-none bg-white text-sm"
                  >
                    <option value="">Select status</option>
                    <option value={POST_STATUS.DRAFT}>Draft</option>
                    <option value={POST_STATUS.PUBLISHED}>Published</option>
                    <option value={POST_STATUS.TRASH}>Trash</option>
                    <option value={POST_STATUS.SCHEDULE}>Scheduled</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title"
                  value={filters.title}
                  onChange={(e) => handleFilterChange("title", e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-white h-10 pl-10 pr-4 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              {/* Action Buttons */}
              <div className="flex gap-3 items-end">
                <button
                  onClick={applyFilters}
                  className="flex-1 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2"
                >
                  <SearchOutlined />
                  Search
                </button>
                <button
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="h-10 px-4 bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-700 rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <ConfigProvider locale={enUS}>
      <div className="bg-transparent overflow-hidden">
        {renderFilterSection()}

        <ProTable<PostDetail>
          columns={columns}
          actionRef={actionRef}
          request={fetchPosts}
          rowKey="id"
          loading={isLoadingPosts}
          className="post-table-layout"
          style={{ minHeight: "60vh" }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} posts`,
            pageSizeOptions: ["10", "20", "50", "100"],
            size: "default",
            position: ["bottomCenter"],
          }}
          search={false}
          options={false}
          // increase vertical scroll so the table appears bigger
          scroll={{ x: 1400, y: 600 }}
          dateFormatter="string"
          size="middle"
          rowClassName={(record, index) => {
            // Ẩn row gốc khi đang quick edit
            if (quickEditPostId === record.id) {
              return "hidden";
            }
            const baseClass = "hover:shadow-sm transition-shadow duration-200";
            const oddRowClass =
              index !== undefined && index % 2 === 1 ? "bg-slate-50/50" : "";
            return `${baseClass} ${oddRowClass}`.trim();
          }}
          expandable={{
            expandedRowRender: (record) => {
              if (quickEditPostId === record.id) {
                return (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg my-2">
                    <PostQuickEdit
                      post={record}
                      onSuccess={handleQuickEditSuccess}
                      onCancel={handleQuickEditCancel}
                    />
                  </div>
                );
              }
              return null;
            },
            rowExpandable: (record) => quickEditPostId === record.id,
            expandedRowKeys: quickEditPostId ? [quickEditPostId] : [],
            onExpand: (expanded, record) => {
              if (!expanded && quickEditPostId === record.id) {
                setQuickEditPostId(null);
              }
            },
            expandRowByClick: false,
            indentSize: 0,
            // Ẩn icon expand
            showExpandColumn: false,
          }}
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
