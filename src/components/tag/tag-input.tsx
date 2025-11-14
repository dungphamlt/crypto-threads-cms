"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Search } from "lucide-react";
import { tagService } from "@/services/tagService";
import { Tag } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  maxTags = 10,
  placeholder = "Add tags (press Enter or comma to add)",
}) => {
  const [tagInput, setTagInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch popular tags (tags with highest count)
  const {
    data: popularTagsResponse,
    isLoading: isLoadingPopularTags,
    error: popularTagsError,
  } = useQuery({
    queryKey: ["popularTags"],
    queryFn: async () => {
      const response = await tagService.getTagList({
        page: 1,
        limit: 10,
        sortBy: "count",
        sortOrder: "desc",
      });
      console.log("Popular tags response:", response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch tags based on search query
  const { data: searchTagsResponse, isLoading: isSearching } = useQuery({
    queryKey: ["searchTags", searchQuery],
    queryFn: () =>
      tagService.getTagList({
        page: 1,
        limit: 20,
        search: searchQuery,
      }),
    enabled: searchQuery.length > 0,
    staleTime: 1 * 60 * 1000,
  });

  const popularTags = popularTagsResponse?.success
    ? popularTagsResponse.data?.data || []
    : [];

  const searchTags = searchTagsResponse?.success
    ? searchTagsResponse.data?.data || []
    : [];

  // Debug logs
  useEffect(() => {
    if (popularTagsError) {
      console.error("Error fetching popular tags:", popularTagsError);
    }
    if (popularTagsResponse) {
      console.log("Popular tags response:", popularTagsResponse);
    }
  }, [popularTagsError, popularTagsResponse]);

  // Filter out already selected tags
  const availablePopularTags = popularTags.filter(
    (tag) => !tags.includes(tag.name.toLowerCase())
  );
  const availableSearchTags = searchTags.filter(
    (tag) => !tags.includes(tag.name.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    setSearchQuery(value.trim());
    setShowSuggestions(true);
  };

  const addTag = useCallback(
    (tagName: string) => {
      const trimmedTag = tagName.trim().toLowerCase();
      if (
        trimmedTag &&
        !tags.includes(trimmedTag) &&
        tags.length < maxTags
      ) {
        onTagsChange([...tags, trimmedTag]);
        setTagInput("");
        setSearchQuery("");
        setShowSuggestions(false);
      }
    },
    [tags, maxTags, onTagsChange]
  );

  const handleTagInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (tagInput.trim()) {
          addTag(tagInput);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [tagInput, addTag]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onTagsChange(tags.filter((tag) => tag !== tagToRemove));
    },
    [tags, onTagsChange]
  );

  const handleTagClick = (tag: Tag) => {
    addTag(tag.name);
  };

  const displaySuggestions =
    showSuggestions &&
    (searchQuery.length > 0
      ? availableSearchTags.length > 0 || !isSearching
      : availablePopularTags.length > 0 || isLoadingPopularTags);

  return (
    <div className="space-y-3">
      <div className="relative flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={tagInput}
            onChange={handleInputChange}
            onKeyDown={handleTagInputKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            disabled={tags.length >= maxTags}
          />
          {tagInput && (
            <button
              type="button"
              onClick={() => {
                setTagInput("");
                setSearchQuery("");
                setShowSuggestions(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/60"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Suggestions Dropdown */}
          {displaySuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-primary/20 rounded-lg shadow-lg max-h-64 overflow-y-auto"
            >
              {searchQuery.length === 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-primary/60 px-2 py-1">
                    Popular Tags
                  </div>
                  {isLoadingPopularTags ? (
                    <div className="px-3 py-2 text-sm text-primary/60">
                      Loading popular tags...
                    </div>
                  ) : popularTagsError ? (
                    <div className="px-3 py-2 text-sm text-red-500">
                      Failed to load popular tags
                    </div>
                  ) : availablePopularTags.length > 0 ? (
                    <div className="space-y-1">
                      {availablePopularTags.slice(0, 10).map((tag) => (
                        <button
                          key={tag._id}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-md flex items-center justify-between"
                        >
                          <span>{tag.name}</span>
                          {tag.count !== undefined && tag.count > 0 && (
                            <span className="text-xs text-primary/40">
                              {tag.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-sm text-primary/60">
                      No popular tags available
                    </div>
                  )}
                </div>
              )}

              {searchQuery.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-primary/60 px-2 py-1 flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Search Results
                  </div>
                  {isSearching ? (
                    <div className="px-3 py-2 text-sm text-primary/60">
                      Searching...
                    </div>
                  ) : availableSearchTags.length > 0 ? (
                    <div className="space-y-1">
                      {availableSearchTags.map((tag) => (
                        <button
                          key={tag._id}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-md flex items-center justify-between"
                        >
                          <span>{tag.name}</span>
                          {tag.count !== undefined && tag.count > 0 && (
                            <span className="text-xs text-primary/40">
                              {tag.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-sm text-primary/60">
                      No tags found. Press Enter to add &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            if (tagInput.trim()) {
              addTag(tagInput);
            }
          }}
          disabled={!tagInput.trim() || tags.length >= maxTags}
          className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {/* Selected Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
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
  );
};

export default TagInput;

