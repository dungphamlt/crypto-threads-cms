"use client";

import {
  Bookmark,
  Eye,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Flag,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { PostDetail } from "@/services/postService";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";
import Image from "next/image";
import { Category } from "@/types";

export interface PostCardProps {
  post: PostDetail;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

export default function PostCard({
  post,
  onEdit,
  onDelete,
  onShare,
  onReport,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load category data
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategoryList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = categoriesResponse?.success
    ? categoriesResponse.data || []
    : [];
  const categoryData = categories.find(
    (cat: Category) => cat.id === post.category
  );
  const categoryName = categoryData?.key || post.category || "Unknown";

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
      return `${diffInHours} giờ trước`;
    } else if (diffInHours < 24 * 30) {
      const days = Math.floor(diffInHours / 24);
      return `${days} ngày trước`;
    } else {
      const months = Math.floor(diffInHours / (24 * 30));
      return `${months} tháng trước`;
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

  return (
    <article className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <Image
            src="/diverse-avatars.png"
            alt="Ảnh đại diện"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-primary/10"
          />
          <div>
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <span className="font-semibold text-primary">Admin</span>
              <span className="text-primary/50">tại</span>
              <span className="text-primary/80">{categoryName}</span>
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
                {onEdit && (
                  <button
                    onClick={() => handleActionClick(() => onEdit(post.id))}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={() => handleActionClick(() => onShare(post.id))}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Chia sẻ
                  </button>
                )}
                <button
                  onClick={() => handleActionClick(() => setIsSaved(!isSaved))}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Bookmark
                    className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                  />
                  {isSaved ? "Bỏ lưu" : "Lưu bài viết"}
                </button>
                <div className="border-t border-gray-100 my-1" />
                {onReport && (
                  <button
                    onClick={() => handleActionClick(() => onReport(post.id))}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Báo cáo
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => handleActionClick(() => onDelete(post.id))}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa bài viết
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="px-4">
        <h2 className="mb-1 text-lg font-semibold leading-snug text-primary">
          {post.title}
        </h2>
        <p className="mb-3 text-[15px] leading-6 text-primary/80">
          {post.metaDescription || post.excerpt || "Không có mô tả"}
          <button type="button" className="ml-1 text-primary hover:underline">
            xem thêm
          </button>
        </p>
      </div>

      {/* Media */}
      {post.coverUrl && (
        <div className="mt-1">
          <Image
            src={post.coverUrl || "/placeholder.svg"}
            alt="Ảnh nội dung bài viết"
            width={400}
            height={300}
            className="h-auto w-full object-cover"
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
    </article>
  );
}
