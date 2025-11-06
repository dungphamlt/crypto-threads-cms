"use client";

import { useState, useCallback } from "react";
import { Eye, Search } from "lucide-react";
import type { Post } from "@/types";

const TITLE_LIMIT = 160;
const META_DESC_LIMIT = 300;

interface SEOFormSectionProps {
  post: Post;
  onChangeField: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  keyPhraseInput: string;
  setKeyPhraseInput: (value: string) => void;
  handleKeyPhraseInputKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => void;
  addKeyPhrase: () => void;
  removeKeyPhrase: (keyPhrase: string) => void;
  sectionRef: (el: HTMLDivElement | null) => void;
}

export default function SEOFormSection({
  post,
  onChangeField,
  keyPhraseInput,
  setKeyPhraseInput,
  handleKeyPhraseInputKeyDown,
  addKeyPhrase,
  removeKeyPhrase,
  sectionRef,
}: SEOFormSectionProps) {
  const [showSEOPreview, setShowSEOPreview] = useState(false);

  const calculateSEOScore = useCallback(() => {
    let score = 0;
    const checks: { name: string; passed: boolean; weight: number }[] = [];

    // Title checks (30 points)
    if (post.title.trim()) {
      score += 10;
      checks.push({ name: "Title exists", passed: true, weight: 10 });
      if (post.title.length >= 30 && post.title.length <= 60) {
        score += 10;
        checks.push({
          name: "Title length optimal (30-60)",
          passed: true,
          weight: 10,
        });
      } else {
        checks.push({
          name: "Title length optimal (30-60)",
          passed: false,
          weight: 10,
        });
      }
      if (post.title.length <= TITLE_LIMIT) {
        score += 10;
        checks.push({ name: "Title within limit", passed: true, weight: 10 });
      } else {
        checks.push({ name: "Title within limit", passed: false, weight: 10 });
      }
    } else {
      checks.push({ name: "Title exists", passed: false, weight: 10 });
      checks.push({
        name: "Title length optimal (30-60)",
        passed: false,
        weight: 10,
      });
      checks.push({ name: "Title within limit", passed: false, weight: 10 });
    }

    // Meta Description checks (25 points)
    if (post.metaDescription.trim()) {
      score += 10;
      checks.push({
        name: "Meta description exists",
        passed: true,
        weight: 10,
      });
      if (
        post.metaDescription.length >= 120 &&
        post.metaDescription.length <= 160
      ) {
        score += 15;
        checks.push({
          name: "Meta description length optimal (120-160)",
          passed: true,
          weight: 15,
        });
      } else {
        checks.push({
          name: "Meta description length optimal (120-160)",
          passed: false,
          weight: 15,
        });
      }
    } else {
      checks.push({
        name: "Meta description exists",
        passed: false,
        weight: 10,
      });
      checks.push({
        name: "Meta description length optimal (120-160)",
        passed: false,
        weight: 15,
      });
    }

    // Slug checks (15 points)
    if (post.slug && post.slug.trim()) {
      score += 10;
      checks.push({ name: "Slug exists", passed: true, weight: 10 });
      if (/^[a-z0-9-]+$/.test(post.slug)) {
        score += 5;
        checks.push({ name: "Slug format valid", passed: true, weight: 5 });
      } else {
        checks.push({ name: "Slug format valid", passed: false, weight: 5 });
      }
    } else {
      checks.push({ name: "Slug exists", passed: false, weight: 10 });
      checks.push({ name: "Slug format valid", passed: false, weight: 5 });
    }

    // Content checks (15 points)
    if (post.content.trim()) {
      score += 10;
      checks.push({ name: "Content exists", passed: true, weight: 10 });
      const contentLength = post.content.replace(/<[^>]*>/g, "").length;
      if (contentLength >= 300) {
        score += 5;
        checks.push({
          name: "Content length sufficient (300+ chars)",
          passed: true,
          weight: 5,
        });
      } else {
        checks.push({
          name: "Content length sufficient (300+ chars)",
          passed: false,
          weight: 5,
        });
      }
    } else {
      checks.push({ name: "Content exists", passed: false, weight: 10 });
      checks.push({
        name: "Content length sufficient (300+ chars)",
        passed: false,
        weight: 5,
      });
    }

    // Excerpt checks (10 points)
    if (post.excerpt.trim()) {
      score += 10;
      checks.push({ name: "Excerpt exists", passed: true, weight: 10 });
    } else {
      checks.push({ name: "Excerpt exists", passed: false, weight: 10 });
    }

    // Tags and Key Phrases (5 points)
    if (post.tags.length > 0) {
      score += 3;
      checks.push({ name: "Tags added", passed: true, weight: 3 });
    } else {
      checks.push({ name: "Tags added", passed: false, weight: 3 });
    }
    if (post.keyPhrases.length > 0) {
      score += 2;
      checks.push({ name: "Key phrases added", passed: true, weight: 2 });
    } else {
      checks.push({ name: "Key phrases added", passed: false, weight: 2 });
    }

    return { score, checks, percentage: Math.round((score / 100) * 100) };
  }, [post]);

  const seoScore = calculateSEOScore();

  return (
    <div
      id="seo"
      ref={sectionRef}
      className="border border-primary/15 rounded-lg p-4 scroll-mt-32"
    >
      <div className="flex items-center justify-between mb-4">
        <label className="block text-lg font-semibold text-primary">SEO</label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Meta Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-primary mb-2">
            Meta Description *
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
        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={post.slug}
            onChange={onChangeField}
            placeholder="example: post-slug... (without spaces or special characters)"
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>
        {/* Key Phrases */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Key Phrases (max 10)
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={keyPhraseInput}
                onChange={(e) => setKeyPhraseInput(e.target.value)}
                onKeyDown={handleKeyPhraseInputKeyDown}
                placeholder="Add key phrases (press Enter or comma to add)"
                className="flex-1 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                disabled={post.keyPhrases.length >= 10}
              />
              <button
                type="button"
                onClick={addKeyPhrase}
                disabled={
                  !keyPhraseInput.trim() || post.keyPhrases.length >= 10
                }
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {post.keyPhrases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.keyPhrases.map((keyPhrase, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                  >
                    {keyPhrase}
                    <button
                      type="button"
                      onClick={() => removeKeyPhrase(keyPhrase)}
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
      </div>
      <div className="flex items-center gap-3 py-4">
        {/* SEO Score */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${
                seoScore.percentage >= 80
                  ? "bg-green-500"
                  : seoScore.percentage >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-xs font-semibold text-gray-700">
              SEO Score: {seoScore.percentage}%
            </span>
          </div>
        </div>
        {/* Preview Button */}
        <button
          type="button"
          onClick={() => setShowSEOPreview(!showSEOPreview)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-all"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>
      {/* SEO Preview */}
      {showSEOPreview && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Result
            </label>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-2">
              <div className="h-5 w-5 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Search className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">
                      CryptoThreads
                    </div>
                    <div className="text-xs text-gray-500">
                      cryptothreads.blog
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
                <div className="text-lg text-blue-600 font-normal leading-tight mb-1 line-clamp-2">
                  {post.title || "| Crypto Threads"}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                  {post.metaDescription ||
                    "Please provide a meta description by editing the snippet below. If you don't, Google will try to find a relevant part of your post to show in the search results."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Score Details */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-blue-900">
            SEO Analysis
          </span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${
              seoScore.percentage >= 80
                ? "bg-green-100 text-green-800"
                : seoScore.percentage >= 50
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {seoScore.score}/100
          </span>
        </div>
        <div className="space-y-1.5">
          {seoScore.checks.map((check, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                {check.passed ? (
                  <svg
                    className="h-3 w-3 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-3 w-3 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span
                  className={check.passed ? "text-gray-700" : "text-gray-500"}
                >
                  {check.name}
                </span>
              </div>
              <span className="text-gray-500">{check.weight} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
