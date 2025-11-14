"use client";

import React, { useState, useEffect } from "react";
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Tag } from "@/types";
import { tagService, TagListResponse } from "@/services/tagService";
import toast from "react-hot-toast";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import TagQuickEdit from "./tag-quick-edit";
import DeleteTagModal from "./delete-tag-modal";

interface TagTableProps {
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  onBulkDelete: (tagIds: string[]) => void;
  refreshTrigger?: number;
}

const TagTable: React.FC<TagTableProps> = ({
  onEdit,
  onDelete,
  onBulkDelete,
  refreshTrigger,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [bulkAction, setBulkAction] = useState<string>("");
  const [quickEditTagId, setQuickEditTagId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; tagId: string; tagName: string }>({
    isOpen: false,
    tagId: "",
    tagName: "",
  });
  const [bulkDeleteModal, setBulkDeleteModal] = useState<{ isOpen: boolean; tagIds: string[] }>({
    isOpen: false,
    tagIds: [],
  });

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await tagService.getTagList({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
      });

      console.log("res", response.data)

      if (response.success && response.data) {
        setTags(response.data.data || []);
        setPagination({
          page: response.data.pagination.currentPage,
          limit: response.data.pagination.pageSize,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages,
        });
      } else {
        toast.error("Failed to load tags");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    setSelectedTags(new Set());
    setQuickEditTagId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, searchQuery, sortBy, sortOrder, refreshTrigger]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedTags(new Set());
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSelectTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    // Kiểm tra xem tất cả tags trong trang hiện tại có được chọn không
    const currentPageTagIds = tags.map((tag) => tag._id);
    const allCurrentPageSelected = currentPageTagIds.length > 0 && currentPageTagIds.every((id) =>
      selectedTags.has(id)
    );

    if (allCurrentPageSelected) {
      // Bỏ chọn tất cả tags trong trang hiện tại
      setSelectedTags((prev) => {
        const newSet = new Set(prev);
        currentPageTagIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    } else {
      // Chọn tất cả tags trong trang hiện tại
      setSelectedTags((prev) => {
        const newSet = new Set(prev);
        currentPageTagIds.forEach((id) => newSet.add(id));
        return newSet;
      });
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction) {
      toast.error("Please select a bulk action");
      return;
    }

    if (selectedTags.size === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    if (bulkAction === "delete") {
      setBulkDeleteModal({
        isOpen: true,
        tagIds: Array.from(selectedTags),
      });
    }
  };

  const handleBulkDeleteSuccess = async () => {
    try {
      const response = await tagService.deleteTags(bulkDeleteModal.tagIds);
      if (response.success) {
        toast.success(`${bulkDeleteModal.tagIds.length} tag(s) deleted successfully`);
        setSelectedTags(new Set());
        setBulkAction("");
        fetchTags();
        onBulkDelete(bulkDeleteModal.tagIds);
        setBulkDeleteModal({ isOpen: false, tagIds: [] });
      } else {
        toast.error("Failed to delete tags");
      }
    } catch (error) {
      console.error("Error deleting tags:", error);
      toast.error("Failed to delete tags");
    }
  };

  const handleDelete = (tagId: string, tagName: string) => {
    setDeleteModal({
      isOpen: true,
      tagId,
      tagName,
    });
  };

  const handleDeleteSuccess = async () => {
    await onDelete(deleteModal.tagId);
    fetchTags();
    setDeleteModal({ isOpen: false, tagId: "", tagName: "" });
  };

  const handleQuickEdit = (tagId: string) => {
    setQuickEditTagId(tagId);
  };

  const handleQuickEditSuccess = (updatedTag: Tag) => {
    setQuickEditTagId(null);
    fetchTags();
    onEdit(updatedTag);
  };

  const handleQuickEditCancel = () => {
    setQuickEditTagId(null);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return (
        <span className="inline-block ml-1 text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </span>
      );
    }
    return (
      <span className="inline-block ml-1">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <ConfigProvider locale={enUS}>
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search Tags
            </button>
          </form>
        </div>

        {/* Bulk Actions */}
        {selectedTags.size > 0 && (
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Bulk actions</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
            <span className="text-sm text-gray-600">
              {selectedTags.size} item(s) selected
            </span>
          </div>
        )}

        {/* Pagination Info */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {pagination.totalItems} item(s) • Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
              disabled={pagination.page === 1 || loading}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
              }
              disabled={pagination.page === 1 || loading}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages, prev.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.totalPages }))
              }
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      tags.length > 0 &&
                      tags.every((tag) => selectedTags.has(tag._id))
                    }
                    onChange={handleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 w-48"
                  onClick={() => handleSort("name")}
                >
                  Name <SortIcon column="name" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 w-64"
                  onClick={() => handleSort("description")}
                >
                  Description <SortIcon column="description" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 w-56"
                  onClick={() => handleSort("slug")}
                >
                  Slug <SortIcon column="slug" />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("count")}
                >
                  Count <SortIcon column="count" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No tags found
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <React.Fragment key={tag._id}>
                    {quickEditTagId === tag._id ? (
                      <TagQuickEdit
                        tag={tag}
                        onSuccess={handleQuickEditSuccess}
                        onCancel={handleQuickEditCancel}
                      />
                    ) : (
                      <tr
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedTags.has(tag._id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectTag(tag._id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] break-words whitespace-normal">
                          {tag.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[260px] break-words whitespace-normal">
                          {tag.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[220px] break-words whitespace-normal">
                          {tag.slug}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {tag.count ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickEdit(tag._id);
                              }}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Quick Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(tag._id, tag.name);
                              }}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Tag Modal (Single & Bulk) */}
        <DeleteTagModal
          tagName={deleteModal.tagName}
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, tagId: "", tagName: "" })}
          onSuccess={handleDeleteSuccess}
        />

        <DeleteTagModal
          count={bulkDeleteModal.tagIds.length}
          isOpen={bulkDeleteModal.isOpen}
          onClose={() => setBulkDeleteModal({ isOpen: false, tagIds: [] })}
          onSuccess={handleBulkDeleteSuccess}
        />
      </div>
    </ConfigProvider>
  );
};

export default TagTable;

