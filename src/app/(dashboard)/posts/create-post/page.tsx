"use client";

import type React from "react";
import { postService } from "@/services/postService";
import { type Post, POST_STATUS, SubCategory, Category } from "@/types";
import { useState, useEffect, useCallback, useRef } from "react";
import CKEditorField from "@/components/editor";
import SEOFormSection from "@/components/post/SEOFormSection";
import { toast } from "react-hot-toast";
import { categoryService } from "@/services/categoryService";
import { useQuery } from "@tanstack/react-query";
import {
  UploadCloud,
  RefreshCw,
  SendHorizonal,
  ArrowLeft,
  Save,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TagInput from "@/components/tag/tag-input";

const TITLE_LIMIT = 160;
const DESC_LIMIT = 380;

export default function CreatePostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [tagInput, setTagInput] = useState<string>("");
  const [keyPhraseInput, setKeyPhraseInput] = useState<string>("");
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("title");

  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
    keyPhrases: [],
    publishTime: "",
    isHotTopic: false,
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

  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategoryList(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: subCategoriesResponse, isLoading: subCategoriesLoading } =
    useQuery({
      queryKey: ["subCategories", post.category],
      queryFn: () => categoryService.getSubCategoryByCategoryId(post.category),
      enabled: !!post.category,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    });

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

  // const addTag = useCallback(() => {
  //   const trimmedTag = tagInput.trim().toLowerCase();
  //   if (
  //     trimmedTag &&
  //     !post.tags.includes(trimmedTag) &&
  //     post.tags.length < 10
  //   ) {
  //     setPost((prev) => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
  //     setTagInput("");
  //   }
  // }, [tagInput, post.tags]);

  // const handleTagInputKeyDown = useCallback(
  //   (e: React.KeyboardEvent<HTMLInputElement>) => {
  //     if (e.key === "Enter" || e.key === ",") {
  //       e.preventDefault();
  //       addTag();
  //     }
  //   },
  //   [addTag]
  // );

  // const removeTag = useCallback((tagToRemove: string) => {
  //   setPost((prev) => ({
  //     ...prev,
  //     tags: prev.tags.filter((tag) => tag !== tagToRemove),
  //   }));
  // }, []);

  const addKeyPhrase = useCallback(() => {
    const trimmedKeyPhrase = keyPhraseInput.trim().toLowerCase();
    if (
      trimmedKeyPhrase &&
      !post.keyPhrases.includes(trimmedKeyPhrase) &&
      post.keyPhrases.length < 10
    ) {
      setPost((prev) => ({
        ...prev,
        keyPhrases: [...prev.keyPhrases, trimmedKeyPhrase],
      }));
      setKeyPhraseInput("");
    }
  }, [keyPhraseInput, post.keyPhrases]);

  const handleKeyPhraseInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addKeyPhrase();
      }
    },
    [addKeyPhrase]
  );

  const removeKeyPhrase = useCallback((keyPhraseToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      keyPhrases: prev.keyPhrases.filter(
        (keyPhrase) => keyPhrase !== keyPhraseToRemove
      ),
    }));
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setIsUploadingCover(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const response = await postService.uploadImage(file, "posts");

      if (response.success && response.data) {
        const imageUrl = response.data.secureUrl || response.data.url;
        setPost((prev) => ({ ...prev, coverUrl: imageUrl }));
        toast.success("Image uploaded successfully", { id: toastId });
      } else {
        toast.error(response.error || "Failed to upload image", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setIsUploadingCover(false);
    }
  }, []);

  const handleCoverImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleTagsChange = useCallback((newTags: string[]) => {
    setPost((prev) => ({ ...prev, tags: newTags }));
  }, []);

  const resetForm = useCallback(() => {
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
      keyPhrases: [],
      publishTime: "",
      isHotTopic: false,
    });
    // setTagInput("");
    setKeyPhraseInput("");
    setIsScheduleMode(false);
    setScheduleDate("");
    setScheduleTime("");
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Try to get element from ref first, then fallback to getElementById
      const element =
        sectionRefs.current[sectionId] || document.getElementById(sectionId);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });

        // Update active section after scroll
        setTimeout(() => {
          setActiveSection(sectionId);
        }, 300);
      } else {
        console.warn(
          `Section ${sectionId} not found. Available refs:`,
          Object.keys(sectionRefs.current)
        );
      }
    });
  }, []);

  // Detect active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "title",
        "content",
        "short-description",
        "category",
        "seo",
        "publishing-options",
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = sectionRefs.current[section];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      } post...`
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
        isHotTopic: post.isHotTopic || false, // Explicitly include hotTop
      };

      const response = await postService.createPost(submitData);

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

        router.push("/posts/all-posts");
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link
            href="/posts/all-posts"
            className="hover:scale-110 transition-all duration-300"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        </div>
      </div>
      <div className="flex gap-4">
        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Title Field */}
            <div
              id="title"
              ref={(el) => {
                sectionRefs.current["title"] = el;
              }}
              className="border border-primary/15 rounded-lg p-4 scroll-mt-32"
            >
              <input
                name="title"
                type="text"
                placeholder="Enter your post title..."
                value={post.title}
                onChange={onChangeField}
                maxLength={TITLE_LIMIT}
                className="w-full text-2xl font-bold border-none outline-none placeholder:text-primary/40 focus:ring-0"
              />
            </div>

            {/* Content Editor */}
            <div
              id="content"
              ref={(el) => {
                sectionRefs.current["content"] = el;
              }}
              className="border border-primary/15 rounded-lg p-4 scroll-mt-32"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg font-semibold text-primary">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Short Description */}
              <div
                id="short-description"
                ref={(el) => {
                  sectionRefs.current["short-description"] = el;
                }}
                className="col-span-3 scroll-mt-32"
              >
                <label className="block text-sm font-medium text-primary">
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
              {/* Category */}
              <div
                id="category"
                ref={(el) => {
                  sectionRefs.current["category"] = el;
                }}
                className="scroll-mt-32"
              >
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
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Tags (max 10)
                </label>
                <TagInput
                  tags={post.tags}
                  onTagsChange={handleTagsChange}
                  maxTags={10}
                  placeholder="Add tags (press Enter or comma to add)"
                />
              </div>
            </div>
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                <UploadCloud className="inline h-3.5 w-3.5 mr-1" />
                Cover Image
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="cover-upload"
                    className={`flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                      isUploadingCover
                        ? "border-primary/30 bg-primary/5 cursor-not-allowed"
                        : "border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {isUploadingCover ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                        <span className="text-sm text-primary">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-5 w-5 text-primary" />
                        <span className="text-sm text-primary">
                          Click to upload or drag and drop
                        </span>
                      </>
                    )}
                  </label>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    disabled={isUploadingCover}
                    className="hidden"
                  />
                  {post.coverUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setPost((prev) => ({
                          ...prev,
                          coverUrl: undefined,
                        }))
                      }
                      disabled={isUploadingCover}
                      className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {post.coverUrl && post.coverUrl.startsWith("http") && (
                  <div className="border border-primary/15 rounded-lg p-2 flex items-center justify-center">
                    <Image
                      src={post.coverUrl}
                      alt="Cover preview"
                      width={400}
                      height={300}
                      className="w-1/3 rounded object-contain object-center"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-primary/60">
                Supported formats: JPG, PNG, GIF (Max 10MB)
              </p>
            </div>

            {/* Hot Top Option */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-primary">
                <input
                  type="checkbox"
                  name="hotTop"
                  checked={post.isHotTopic || false}
                  onChange={(e) =>
                    setPost((prev) => ({ ...prev, isHotTopic: e.target.checked }))
                  }
                  className="text-primary focus:ring-primary/20"
                />
                Hot Topic
              </label>
              <p className="mt-1 text-xs text-primary/60">
                Mark as Hot Topic
              </p>
            </div>

            {/* SEO Section */}
            <SEOFormSection
              post={post}
              onChangeField={onChangeField}
              keyPhraseInput={keyPhraseInput}
              setKeyPhraseInput={setKeyPhraseInput}
              handleKeyPhraseInputKeyDown={handleKeyPhraseInputKeyDown}
              addKeyPhrase={addKeyPhrase}
              removeKeyPhrase={removeKeyPhrase}
              sectionRef={(el) => {
                sectionRefs.current["seo"] = el;
              }}
            />

            {/* Publishing Options */}
            <div
              id="publishing-options"
              ref={(el) => {
                sectionRefs.current["publishing-options"] = el;
              }}
              className="flex gap-6 items-center scroll-mt-32"
            >
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

          {/* Footer Actions */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
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
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit("saveDraft")}
                  disabled={!canSubmit || isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-primary bg-white border border-primary/20 rounded-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
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
                    {isSubmitting ? "Publishing..." : "Publish"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* menu button điều hướng các phần trong bài post */}
        <div className=" flex-shrink-0">
          <div className="sticky top-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 space-y-6">
              <h2 className="text-lg font-semibold text-primary">Navigation</h2>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("title");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                    activeSection === "title"
                      ? "bg-primary text-white border border-primary"
                      : "text-primary border border-primary/20 hover:bg-primary/5"
                  }`}
                >
                  Title
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("content");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                    activeSection === "content"
                      ? "bg-primary text-white border border-primary"
                      : "text-primary border border-primary/20 hover:bg-primary/5"
                  }`}
                >
                  Content
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("short-description");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                    activeSection === "short-description"
                      ? "bg-primary text-white border border-primary"
                      : "text-primary border border-primary/20 hover:bg-primary/5"
                  }`}
                >
                  Short Description
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("category");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                    activeSection === "category"
                      ? "bg-primary text-white border border-primary"
                      : "text-primary border border-primary/20 hover:bg-primary/5"
                  }`}
                >
                  Category
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("seo");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                    activeSection === "seo"
                      ? "bg-primary text-white border border-primary"
                      : "text-primary border border-primary/20 hover:bg-primary/5"
                  }`}
                >
                  SEO
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("publishing-options");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                    activeSection === "publishing-options"
                      ? "bg-primary text-white border border-primary"
                      : "text-primary border border-primary/20 hover:bg-primary/5"
                  }`}
                >
                  Publishing Options
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
