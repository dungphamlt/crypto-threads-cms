"use client";

import { useState, useEffect } from "react";
import { TagTable } from "@/components/tag";
import { Tag } from "@/types";
import { tagService } from "@/services/tagService";
import toast from "react-hot-toast";

function TagsManagement() {
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form state for inline form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-generate slug from name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    if (name && !slug) {
      setSlug(generateSlug(name));
    }
  }, [name, slug]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setLoading(true);
    try {
      const response = await tagService.createTag({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });

      if (response.success && response.data) {
        toast.success("Tag created successfully");
        setName("");
        setSlug("");
        setDescription("");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(response.error || "Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTag = (tag: Tag) => {
    console.log("editingTag", editingTag);
    setEditingTag(tag);
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const response = await tagService.deleteTag(tagId);
      console.log("respo del", response);
      if (response.success) {
        toast.success("Tag deleted successfully");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error("Failed to delete tag");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  const handleBulkDelete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Tags Management</h1>
          <p className="text-gray-600">Organize and manage your content tags</p>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Add New Tag Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Tag
            </h2>
            <form onSubmit={handleCreateTag} className="space-y-4">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="tag-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="tag-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(generateSlug(e.target.value));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tag name"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The name is how it appears on your site.
                </p>
              </div>

              {/* Slug Field */}
              <div>
                <label
                  htmlFor="tag-slug"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Slug
                </label>
                <input
                  type="text"
                  id="tag-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tag slug"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The &quot;slug&quot; is the URL-friendly version of the name.
                  It is usually all lowercase and contains only letters,
                  numbers, and hyphens.
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label
                  htmlFor="tag-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="tag-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tag description (optional)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The description is not prominent by default; however, some
                  themes may show it.
                </p>
              </div>

              {/* Add New Tag Button */}
              <button
                type="submit"
                disabled={loading || !name.trim() || !slug.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add New Tag"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Tags Table */}
        <div className="lg:col-span-2">
          <TagTable
            onEdit={handleEditTag}
            onDelete={handleDeleteTag}
            onBulkDelete={handleBulkDelete}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </div>
  );
}

export default TagsManagement;
