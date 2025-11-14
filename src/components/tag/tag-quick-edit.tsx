"use client";

import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { Tag } from "@/types";
import { tagService } from "@/services/tagService";
import toast from "react-hot-toast";

interface TagQuickEditProps {
  tag: Tag;
  onSuccess: (tag: Tag) => void;
  onCancel: () => void;
}

const TagQuickEdit: React.FC<TagQuickEditProps> = ({
  tag,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(tag.name);
  const [slug, setSlug] = useState(tag.slug);
  const [description, setDescription] = useState(tag.description || "");

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
    setName(tag.name);
    setSlug(tag.slug);
    setDescription(tag.description || "");
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await tagService.updateTag(tag._id, {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });

      if (response.success && response.data) {
        toast.success("Tag updated successfully");
        onSuccess(response.data);
      } else {
        toast.error(response.error || "Failed to update tag");
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error("Failed to update tag");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(tag.name);
    setSlug(tag.slug);
    setDescription(tag.description || "");
    onCancel();
  };

  return (
    <tr className="bg-gray-50 border border-gray-200">
      <td colSpan={6} className="px-4 py-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            QUICK EDIT
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(generateSlug(e.target.value));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tag name"
                  required
                />
              </div>

              {/* Slug Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tag slug"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !name.trim() || !slug.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Update
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </td>
    </tr>
  );
};

export default TagQuickEdit;

