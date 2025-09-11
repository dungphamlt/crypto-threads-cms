"use client";

import type React from "react";
import { postService } from "@/services/postService";
import {
  type Post,
  type PostDetail,
  POST_STATUS,
  SubCategory,
  Category,
} from "@/types";
import { useState, useEffect, useCallback } from "react";
import CKEditorField from "@/components/editor";
import { toast } from "react-hot-toast";
import { categoryService } from "@/services/categoryService";
import { useQuery } from "@tanstack/react-query";
import {
  UploadCloud,
  AlignLeft,
  RefreshCw,
  SendHorizonal,
  Eye,
  X,
  Save,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
const TITLE_LIMIT = 120;
const DESC_LIMIT = 180;
const META_DESC_LIMIT = 160;

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  initialData?: PostDetail;
  onSuccess?: (post: PostDetail) => void;
}

export default function PostFormModal({
  isOpen,
  onClose,
  postId,
  initialData,
  onSuccess,
}: PostFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode] = useState(!!postId);
  const [tagInput, setTagInput] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [post, setPost] = useState<Post>({
    title: "",
    content: "",
    category: "",
    subCategory: "",
    tags: [],
    metaDescription: "",
    excerpt: "",
    coverUrl: undefined,
    status: POST_STATUS.PUBLISHED,
    slug: "",
    publishTime: "",
  });

  const formValidation = useCallback(() => {
    const errors: string[] = [];
    if (!post.title.trim()) errors.push("Title is required");
    if (!post.content.trim()) errors.push("Content is required");
    if (!post.category) errors.push("Category is required");
    if (!post.excerpt.trim()) errors.push("Short description is required");
    return { isValid: errors.length === 0, errors };
  }, [post]);

  const { isValid: canSubmit } = formValidation();

  const populateForm = (postData: PostDetail) => {
    setPost({
      title: postData.title,
      content: postData.content,
      category: postData.category.id || "",
      subCategory: postData.subCategory?.id || "",
      tags: postData.tags || [],
      metaDescription: postData.metaDescription,
      excerpt: postData.excerpt,
      coverUrl: postData.coverUrl,
      status: postData.status,
      slug: postData.slug,
      publishTime: postData.publishTime,
    });
  };

  const loadPostData = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const response = await postService.getPostDetail(id);
        if (response.success && response.data) {
          populateForm(response.data);
        } else {
          toast.error("Failed to load post data");
          onClose();
        }
      } catch (error) {
        console.error("Failed to load post:", error);
        toast.error("Failed to load post");
        onClose();
      } finally {
        setIsLoading(false);
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen && postId && !initialData) {
      loadPostData(postId);
    } else if (isOpen && initialData) {
      populateForm(initialData);
    }
  }, [isOpen, postId, initialData, loadPostData]);

  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategoryList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const { data: subCategoriesResponse, isLoading: subCategoriesLoading } =
    useQuery({
      queryKey: ["subCategories", post.category],
      queryFn: () => categoryService.getSubCategoryByCategoryId(post.category),
      enabled: !!post.category, // Only fetch when category is selected
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    });

  // Extract data from API responses
  const categories = categoriesResponse?.success
    ? categoriesResponse.data || []
    : [];
  const subCategories = subCategoriesResponse?.success
    ? subCategoriesResponse.data || []
    : [];

  const onChangeField = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setPost((prev) => {
        if (name === "category") {
          return { ...prev, [name]: value, subCategory: "" };
        }
        return { ...prev, [name]: value };
      });
    },
    []
  );

  const addTag = useCallback(() => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (
      trimmedTag &&
      !post.tags.includes(trimmedTag) &&
      post.tags.length < 10
    ) {
      setPost((prev) => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setTagInput("");
    }
  }, [tagInput, post.tags]);

  const handleTagInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag();
      }
    },
    [addTag]
  );

  const removeTag = useCallback((tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const resetForm = useCallback(() => {
    if (isEditMode && initialData) {
      populateForm(initialData);
    } else {
      setPost({
        title: "",
        content: "",
        category: "",
        subCategory: "",
        tags: [],
        metaDescription: "",
        excerpt: "",
        coverUrl: undefined,
        status: POST_STATUS.DRAFT,
        slug: "",
        publishTime: "",
      });
    }
    setTagInput("");
    setIsScheduleMode(false);
    setScheduleDate("");
    setScheduleTime("");
  }, [isEditMode, initialData]);

  const handleSubmit = async (action: "saveDraft" | "publish" | "schedule") => {
    if (!canSubmit || isSubmitting) return;

    if (action === "schedule") {
      if (!scheduleDate || !scheduleTime) {
        toast.error("Please select both date and time for scheduling");
        return;
      }

      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledDateTime <= new Date()) {
        toast.error("Scheduled time must be in the future");
        return;
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      `${
        action === "saveDraft"
          ? "Saving Draft"
          : action === "schedule"
          ? "Scheduling"
          : "Publishing"
      } ${isEditMode ? "changes" : "post"}...`
    );

    try {
      const submitData = {
        ...post,
        status:
          action === "publish"
            ? POST_STATUS.PUBLISHED
            : action === "schedule"
            ? POST_STATUS.SCHEDULE
            : POST_STATUS.DRAFT,
        ...(action === "schedule" && {
          scheduledAt: new Date(
            `${scheduleDate}T${scheduleTime}`
          ).toISOString(),
        }),
        publishTime:
          action === "schedule"
            ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
            : new Date().toISOString(),
      };

      console.log("Submitting data:", submitData);

      const response =
        isEditMode && postId
          ? await postService.updatePost(postId, submitData)
          : await postService.createPost(submitData);

      if (response.success && response.data?.id) {
        toast.success(
          `Post ${
            action === "saveDraft"
              ? "draft saved"
              : action === "schedule"
              ? `scheduled for ${new Date(
                  `${scheduleDate}T${scheduleTime}`
                ).toLocaleString()}`
              : "published"
          } successfully`,
          { id: toastId }
        );

        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      } else {
        toast.error(response?.error || `Failed to ${action} post`, {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        `An error occurred while ${
          action === "saveDraft"
            ? "saving draft"
            : action === "schedule"
            ? "scheduling"
            : "publishing"
        } the post`,
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    const hasChanges = post.title || post.content || post.excerpt;
    if (hasChanges && !isSubmitting) {
      if (
        confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [post, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

          {/* Modal content */}
          <div className="relative z-10 flex flex-col w-full max-w-6xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 bg-primary/10">
              <h2 className="text-xl font-semibold text-primary">
                {isEditMode ? "Edit Post" : "Create New Post"}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5 text-primary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <span className="ml-2 text-primary">Loading post...</span>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Title Field */}
                  <div className="border border-primary/15 rounded-lg p-4">
                    <input
                      name="title"
                      type="text"
                      placeholder="Enter your post title..."
                      value={post.title}
                      onChange={onChangeField}
                      maxLength={TITLE_LIMIT}
                      className="w-full text-2xl font-bold border-none outline-none placeholder:text-primary/40 focus:ring-0"
                    />
                    <div className="mt-1 text-right text-xs text-primary/50">
                      {post.title.length}/{TITLE_LIMIT}
                    </div>
                  </div>

                  {/* Content Editor */}
                  <div className="border border-primary/15 rounded-lg p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <AlignLeft className="h-4 w-4 text-primary/60" />
                      <span className="text-sm font-medium text-primary">
                        Content
                      </span>
                    </div>
                    <CKEditorField
                      editorData={post.content}
                      setEditorData={(html) =>
                        setPost((prev) => ({ ...prev, content: html }))
                      }
                    />
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Short Description */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Short Description *
                      </label>
                      <textarea
                        name="excerpt"
                        rows={3}
                        value={post.excerpt}
                        onChange={onChangeField}
                        maxLength={DESC_LIMIT}
                        placeholder="Summarize the main content..."
                        className="w-full resize-none rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                      <div className="mt-1 text-right text-xs text-primary/50">
                        {post.excerpt.length}/{DESC_LIMIT}
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Meta Description (SEO) *
                      </label>
                      <textarea
                        name="metaDescription"
                        rows={3}
                        value={post.metaDescription}
                        onChange={onChangeField}
                        maxLength={META_DESC_LIMIT}
                        placeholder="Description for search engines..."
                        className="w-full resize-none rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                      <div className="mt-1 text-right text-xs text-primary/50">
                        {post.metaDescription.length}/{META_DESC_LIMIT}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={post.category}
                        onChange={onChangeField}
                        disabled={categoriesLoading}
                        className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                      >
                        <option value="">
                          {categoriesLoading
                            ? "Loading categories..."
                            : "Select a category"}
                        </option>
                        {categories?.map((cat: Category) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.key}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Subcategory *
                      </label>
                      <select
                        name="subCategory"
                        value={post.subCategory}
                        onChange={onChangeField}
                        disabled={!post.category || subCategoriesLoading}
                        className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                      >
                        <option value="">
                          {!post.category
                            ? "Select category first"
                            : subCategoriesLoading
                            ? "Loading sub-categories..."
                            : "Select a sub-category"}
                        </option>
                        {subCategories?.map((subcat: SubCategory) => (
                          <option key={subcat.id} value={subcat.id}>
                            {subcat.key}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Tags (max 10)
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDown}
                          placeholder="Add tags (press Enter or comma to add)"
                          className="flex-1 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                          disabled={post.tags.length >= 10}
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          disabled={!tagInput.trim() || post.tags.length >= 10}
                          className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-primary/10 text-primary rounded-full"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-red-500 ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={post.slug}
                      onChange={onChangeField}
                      className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      <UploadCloud className="inline h-3.5 w-3.5 mr-1" />
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      name="coverUrl"
                      placeholder="https://example.com/image.jpg"
                      value={post.coverUrl || ""}
                      onChange={onChangeField}
                      className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                    {post.coverUrl && (
                      <div className="mt-3 border border-primary/15 rounded-lg p-2">
                        <Image
                          src={post.coverUrl || "/placeholder.svg"}
                          alt="Cover preview"
                          width={400}
                          height={300}
                          className="w-full max-h-96 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Publishing Options */}
                  <div className="flex gap-6 items-center">
                    <label className="flex items-center gap-2 text-sm text-primary">
                      <input
                        type="checkbox"
                        name="publishMode"
                        checked={isScheduleMode}
                        onChange={() => setIsScheduleMode((prev) => !prev)}
                        className="text-primary focus:ring-primary/20"
                      />
                      Schedule for Later
                    </label>

                    {isScheduleMode && (
                      <input
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="max-w-[300px] rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="bg-white border-t border-primary/10 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleSubmit("saveDraft")}
                    disabled={!canSubmit || isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-primary bg-white border border-primary/20 rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {isEditMode ? "Save Changes" : "Save Draft"}
                  </button>

                  {isScheduleMode ? (
                    <button
                      type="button"
                      onClick={() => handleSubmit("schedule")}
                      disabled={
                        !canSubmit ||
                        isSubmitting ||
                        !scheduleDate ||
                        !scheduleTime
                      }
                      className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock className="h-4 w-4" />
                      {isSubmitting ? "Scheduling..." : "Schedule Post"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmit("publish")}
                      disabled={!canSubmit || isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SendHorizonal className="h-4 w-4" />
                      {isSubmitting
                        ? "Publishing..."
                        : isEditMode
                        ? "Update & Publish"
                        : "Publish"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Modal - Keep existing preview code if needed */}
          {isPreviewOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setIsPreviewOpen(false)}
              />
              {/* Preview content... */}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
