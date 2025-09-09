"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PostDetail, Category } from "@/types";
import { postService } from "@/services/postService";
import { categoryService } from "@/services/categoryService";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Calendar,
  UserIcon,
  Tag,
  Eye,
  Share2,
  Minimize,
  Maximize,
} from "lucide-react";
import Image from "next/image";

interface PostDetailModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
  // onEdit?: (postId: string) => void;
  // onDelete?: (postId: string) => void;
}

export default function PostDetailModal({
  postId,
  isOpen,
  onClose,
}: // onEdit,
// onDelete,
PostDetailModalProps) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullScreen] = useState(false);

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
    (cat: Category) => cat.id === post?.category
  );
  const categoryName = categoryData?.key || post?.category || "Unknown";

  useEffect(() => {
    const loadDetail = async () => {
      if (!isOpen || !postId) {
        setPost(null);
        return;
      }
      setIsLoading(true);
      try {
        const res = await postService.getPostDetail(postId);

        if (res.success && res.data) {
          setPost(res.data);
        } else {
          setPost(null);
        }
      } catch (e) {
        console.error("Load post detail failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [isOpen, postId]);

  // const handleEdit = () => {
  //   if (onEdit && postId) onEdit(postId);
  // };

  // const handleDelete = async () => {
  //   if (postId && confirm("Are you sure you want to delete this post?")) {
  //     onDelete?.(postId);
  //   }
  // };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      trash: "bg-red-100 text-red-800",
      schedule: "bg-blue-100 text-blue-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const LoadingSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden"
    >
      {/* Cover Image Skeleton */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="aspect-video w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse"
      />

      <div className="p-8">
        {/* Status Badge Skeleton */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded-full w-20 mb-4"
        />

        {/* Title Skeleton */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded w-3/4 mb-4"
        />

        {/* Meta Info Skeleton */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex gap-6 mb-6 pb-6 border-b border-gray-200"
        >
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded w-32"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded w-24"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded w-20"></div>
        </motion.div>

        {/* Content Skeleton */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="space-y-3"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
              className={`h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded ${
                i === 1
                  ? "w-5/6"
                  : i === 2
                  ? "w-4/5"
                  : i === 4
                  ? "w-3/4"
                  : "w-full"
              }`}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {isOpen && postId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
              mass: 0.8,
              duration: 0.5,
            }}
            layout
            className={
              `relative bg-white shadow-2xl overflow-hidden w-full border border-gray-200/50 ` +
              (isFullscreen
                ? "h-full m-0 max-w-none"
                : "max-w-5xl max-h-[90vh] m-4 rounded-2xl")
            }
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10"
            >
              <h2 className="font-semibold text-gray-900 text-lg">
                Post Details
              </h2>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFullScreen(!isFullscreen)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {isLoading ? (
                <LoadingSkeleton />
              ) : !post ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center text-gray-500"
                >
                  <div className="text-6xl mb-4">😔</div>
                  <p className="text-lg">Failed to load post.</p>
                </motion.div>
              ) : (
                <motion.article
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className={
                    `overflow-hidden ` +
                    (isFullscreen ? "container mx-auto" : "")
                  }
                >
                  {post.coverUrl && (
                    <motion.div
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="aspect-video w-full overflow-hidden"
                    >
                      <Image
                        src={post.coverUrl || "/placeholder.svg"}
                        alt={post.title}
                        width={800}
                        height={450}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}

                  <div className="p-8 space-y-6">
                    {/* Status Badge */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${getStatusBadge(
                          post.status
                        )}`}
                      >
                        {post.status.charAt(0).toUpperCase() +
                          post.status.slice(1)}
                      </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-4xl font-bold text-gray-900 text-balance leading-tight"
                    >
                      {post.title}
                    </motion.h1>

                    {/* Meta Information */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-100"
                    >
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          {post.creator?.email || "Unknown Author"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span>
                          {new Date(post.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {post.category && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <Tag className="w-4 h-4 text-purple-500" />
                          <span>{categoryName}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg ml-auto">
                        <Eye className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">
                          {post.views || 0} views
                        </span>
                      </div>
                    </motion.div>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg"
                      >
                        <h2 className="text-lg font-semibold text-blue-900 mb-3">
                          Summary
                        </h2>
                        <p className="text-blue-800 text-lg leading-relaxed">
                          {post.excerpt}
                        </p>
                      </motion.div>
                    )}

                    {/* Content */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="prose prose-lg max-w-none"
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: post.content || "" }}
                      />
                    </motion.div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <motion.span
                              key={index}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                delay: 0.8 + index * 0.1,
                                duration: 0.3,
                              }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 hover:from-blue-200 hover:to-purple-200 transition-all cursor-pointer shadow-sm"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* SEO Information */}
                    {post.metaDescription && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.4 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          SEO Description
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {post.metaDescription}
                        </p>
                      </motion.div>
                    )}

                    {/* Share Actions */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Share this post
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                          <Share2 className="w-5 h-5 mr-2" />
                          Share
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.article>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
