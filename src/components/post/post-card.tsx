"use client";

import {
  Eye,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Share2,
  UserIcon,
  Tag,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { postService, type PostDetail } from "@/services/postService";
import Image from "next/image";
import Logo from "@/assets/images/logo.png";
import DeletePostButton from "./DeletePostButton";

export interface PostCardProps {
  initialPost: PostDetail;
  onEdit?: (post: PostDetail) => void;
  onShare?: (postId: string) => void;
  onView?: (postId: string) => void;
}

export default function PostCard({
  initialPost,
  onEdit,
  onShare,
  onView,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [post, setPost] = useState<PostDetail>(initialPost);

  const fetchPost = async () => {
    const response = await postService.getPostDetail(initialPost?.id);
    if (response.success && response.data) {
      setPost(response.data);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-green-600";
      case "draft":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const handleActionClick = (action: () => void) => {
    action();
    setShowPopup(false);
  };

  const handleDeleteSuccess = () => {
    fetchPost();
    setShowPopup(false);
  };

  return (
    <div
      key={post.id}
      className="overflow-hidden flex flex-col rounded-2xl border border-primary/10 bg-white shadow-sm"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          {post.creator.avatarUrl ? (
            <Image
              src={post.creator.avatarUrl || "/diverse-avatars.png"}
              alt="Ảnh đại diện"
              width={40}
              height={40}
              className="h-12 w-12 rounded-full object-cover ring-1 ring-primary/10 shadow-sm"
            />
          ) : (
            <div className="h-12 w-12 rounded-full object-cover ring-1 ring-primary/10 bg-primary flex items-center justify-center text-white">
              {post.creator.penName
                ? post.creator.penName.charAt(0)
                : post.creator.email.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="font-semibold flex items-center gap-2 text-primary bg-gray-100 px-2 py-1 rounded-md">
                <UserIcon className="w-4 h-4" />
                {post.creator.penName}
              </div>
              <div className="text-blue-600 text-sm py-1 px-2 rounded-md bg-blue-100 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {post.category.key}
              </div>
              {post.subCategory && (
                <div className="text-purple-600 text-sm py-1 px-2 rounded-md bg-purple-100 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {post.subCategory.key}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-primary/50">
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                  post.status
                )}`}
              >
                {post.status}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setShowPopup(!showPopup)}
            className="rounded-full p-2 text-primary/60 transition-colors hover:bg-secondary hover:text-primary"
            aria-label="Tùy chọn bài viết"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showPopup && (
            <div
              ref={popupRef}
              className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
            >
              <div className="py-1">
                {onView && (
                  <button
                    onClick={() => handleActionClick(() => onView(post.id))}
                    className="flex w-full items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View detail
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => handleActionClick(() => onEdit(post))}
                    className="flex w-full items-center px-4 py-2 text-sm text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={() => handleActionClick(() => onShare(post.id))}
                    className="flex w-full items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-100 transition-colors"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </button>
                )}
                <DeletePostButton
                  postId={post.id}
                  title="Move to Trash"
                  className="w-full px-4 py-2 justify-start"
                  onSuccess={handleDeleteSuccess}
                  disabled={post.status === "trash"}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="px-4 flex-1">
        <h2 className="mb-1 text-md font-semibold leading-snug text-black">
          {post.title}
        </h2>
        <p className="mb-3 text-sm leading-6 text-gray-600">
          {post.metaDescription || post.excerpt || "Không có mô tả"}
        </p>
      </div>

      {/* Media */}
      {post.coverUrl && (
        <div className="mt-1">
          <Image
            src={post.coverUrl.startsWith("http") ? post.coverUrl : Logo}
            alt="Ảnh nội dung bài viết"
            width={400}
            height={300}
            className="h-[300px] w-full object-cover"
          />
        </div>
      )}

      {/* Footer with reactions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-primary/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-1 text-sm transition-colors ${
              isLiked ? "text-red-500" : "text-primary/60 hover:text-primary"
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>0</span>
          </button>

          <button className="flex items-center gap-1 text-sm text-primary/60 hover:text-primary transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span>0</span>
          </button>

          <div className="flex items-center gap-1 text-sm text-primary/60">
            <Eye className="h-4 w-4" />
            <span>0</span>
          </div>
        </div>

        <div className="text-xs text-primary/50">ID: {post.id}</div>
      </div>
    </div>
  );
}
