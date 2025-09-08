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
  Badge,
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
} from "@ant-design/icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { type PostDetail, postService } from "@/services/postService";
import { POST_STATUS } from "@/types";
import { toast } from "react-hot-toast";
import PostViewDetail from "@/components/post/post-view-detail";
import PostFormModal from "@/components/post/post-create";

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

  // Create Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch posts with React Query
  const fetchPosts = async (params: any) => {
    setLoading(true);
    try {
      const { current = 1, pageSize = 10, title, category, status } = params;

      const response = await postService.getPostList(current, pageSize);

      if (response.success && response.data) {
        let filteredPosts = [...response.data];

        // Apply filters
        if (title) {
          filteredPosts = filteredPosts.filter(
            (post) =>
              post.title.toLowerCase().includes(title.toLowerCase()) ||
              post.excerpt?.toLowerCase().includes(title.toLowerCase()) ||
              post.metaDescription?.toLowerCase().includes(title.toLowerCase())
          );
        }

        if (category) {
          filteredPosts = filteredPosts.filter(
            (post) => post.category === category
          );
        }

        if (status) {
          filteredPosts = filteredPosts.filter(
            (post) => post.status === status
          );
        }

        return {
          data: filteredPosts,
          success: true,
          total: filteredPosts.length,
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
    actionRef.current?.reload();
    queryClient.invalidateQueries({ queryKey: ["posts"] });

    // Close modals
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditPost(null);

    toast.success("Post updated successfully");
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
      search: false,
      render: (_, record) => (
        <div className="flex justify-center">
          <Image
            width={60}
            height={45}
            src={record.coverUrl}
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
      search: false,
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
            {record.creator?.email?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {record.creator?.email || "Unknown"}
            </div>
            <div className="text-xs text-gray-500">
              ID: {record.creator?.id?.slice(-8) || "N/A"}
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
      render: (category, record) => (
        <div className="space-y-1">
          <Tag color="blue" className="font-medium">
            {category}
          </Tag>
          {record.subCategory && (
            <Tag color="cyan" className="text-xs">
              {record.subCategory}
            </Tag>
          )}
        </div>
      ),
      valueEnum: {
        technology: { text: "Technology" },
        crypto: { text: "Cryptocurrency" },
        blockchain: { text: "Blockchain" },
        finance: { text: "Finance" },
        news: { text: "News" },
        tutorial: { text: "Tutorial" },
        analysis: { text: "Analysis" },
      },
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 150,
      search: false,
      render: (tags) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(tags) && tags.length > 0 ? (
            <>
              {tags.slice(0, 2).map((tag: string, index: number) => (
                <Tag key={index} color="purple" className="text-xs">
                  {tag}
                </Tag>
              ))}
              {tags.length > 2 && (
                <Tooltip title={tags.slice(2).join(", ")}>
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
      search: {
        transform: (value) => ({ status: value }),
      },
      valueType: "select",
      fieldProps: {
        options: [
          { label: "Draft", value: POST_STATUS.DRAFT },
          { label: "Published", value: POST_STATUS.PUBLISHED },
          { label: "Trash", value: POST_STATUS.TRASH },
          { label: "Scheduled", value: POST_STATUS.SCHEDULE },
        ],
      },
      render: (_, record) => {
        return <StatusBadge status={record.status} />;
      },
    },
    {
      title: "Stats",
      key: "stats",
      width: 100,
      search: false,
      render: (_, record) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center text-gray-600">
            <span>👁️ {record.views || 0}</span>
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
          {(record as any).publishedAt && (
            <div className="text-green-600 text-xs">
              Published:{" "}
              {new Date(
                String((record as any).publishedAt)
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
      search: false,
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
          search={{
            labelWidth: "auto",
            filterType: "light",
          }}
          options={{
            setting: {
              listsHeight: 400,
            },
            reload: true,
            density: true,
            fullScreen: true,
          }}
          // toolBarRender={() => [
          //   <Button
          //     key="refresh"
          //     icon={<SyncOutlined />}
          //     onClick={() => {
          //       actionRef.current?.reload();
          //       queryClient.invalidateQueries({ queryKey: ["posts"] });
          //       toast.success("Posts refreshed");
          //     }}
          //     className="hover:bg-gray-50"
          //   >
          //     Refresh
          //   </Button>,
          //   <Button
          //     key="add"
          //     type="primary"
          //     icon={<PlusOutlined />}
          //     onClick={() => setIsCreateModalOpen(true)}
          //     className="bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-sm"
          //   >
          //     Create Post
          //   </Button>,
          // ]}
          scroll={{ x: 1400 }}
          headerTitle={
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-gray-900">
                Posts Management
              </span>
              <Badge count={0} showZero={false} />
            </div>
          }
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
            onEdit={handleEdit}
            onDelete={handleDelete}
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
