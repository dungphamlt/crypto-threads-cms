"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  adminService,
  type AuthorCreateDto,
  type AuthorResponseDto,
  AdminRole,
} from "@/services/adminService";
import { postService } from "@/services/postService";
import { X, UserPlus, Plus, Trash2, Camera } from "lucide-react";
import Avatar from "@/assets/images/avatar.jpg";
import { toast } from "react-hot-toast";
import Image from "next/image";

type FormMode = "create" | "edit";

interface FormAddNewAuthorProps {
  open: boolean;
  mode?: FormMode;
  initialAuthor?: AuthorResponseDto | null;
  onClose: () => void;
  onSuccess: (author: AuthorResponseDto) => void;
  onError?: () => void;
}

type AuthorFormState = AuthorCreateDto & { password?: string };

interface SocialEntry {
  key: string;
  value: string;
}

const SOCIAL_TYPE_OPTIONS = [
  { value: "telegram", label: "Telegram" },
  { value: "x", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "other", label: "Other" },
];

const FormAddNewAuthor = ({
  open,
  mode = "create",
  initialAuthor,
  onClose,
  onSuccess,
  onError,
}: FormAddNewAuthorProps) => {
  const isEditMode = mode === "edit" && !!initialAuthor;

  const [author, setAuthor] = useState<AuthorFormState>({
    email: "",
    username: "",
    password: "",
    penName: "",
    socials: {},
    avatarUrl: "",
    description: "",
    designations: [],
    role: AdminRole.WRITER,
  });
  const [loading, setLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Local state for input fields
  const [socials, setSocials] = useState<SocialEntry[]>([
    { key: "telegram", value: "" },
  ]);
  const [designationInput, setDesignationInput] = useState("");

  // Reset form when opening
  useEffect(() => {
    if (!open) return;

    if (isEditMode && initialAuthor) {
      setAuthor(initialAuthor as AuthorCreateDto);

      const transformedSocials = Object.entries(
        initialAuthor.socials || {}
      ).map(([key, value]) => ({ key, value }));

      setSocials(
        transformedSocials.length > 0
          ? transformedSocials
          : [{ key: "telegram", value: "" }]
      );
      setDesignationInput("");
    } else {
      setAuthor({
        email: "",
        username: "",
        password: "",
        penName: "",
        socials: {},
        avatarUrl: "",
        description: "",
        designations: [],
        role: AdminRole.WRITER,
      });
      setSocials([{ key: "telegram", value: "" }]);
      setDesignationInput("");
    }
  }, [open, isEditMode, initialAuthor]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setAuthor((f: AuthorCreateDto) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle social links management
  const addSocial = () => {
    setSocials([...socials, { key: "telegram", value: "" }]);
  };

  const removeSocial = (index: number) => {
    if (socials.length > 1) {
      setSocials(socials.filter((_, i) => i !== index));
    }
  };

  const updateSocial = (
    index: number,
    field: "key" | "value",
    newValue: string
  ) => {
    const updated = socials.map((item, i) =>
      i === index ? { ...item, [field]: newValue } : item
    );
    setSocials(updated);
  };

  // Handle adding designations
  const addDesignation = () => {
    const trimmedDesignation = designationInput.trim();
    if (
      trimmedDesignation &&
      !author.designations.includes(trimmedDesignation)
    ) {
      setAuthor((prev) => ({
        ...prev,
        designations: [...prev.designations, trimmedDesignation],
      }));
      setDesignationInput("");
    }
  };

  const removeDesignation = (designationToRemove: string) => {
    setAuthor((prev) => ({
      ...prev,
      designations: prev.designations.filter(
        (designation) => designation !== designationToRemove
      ),
    }));
  };

  const handleDesignationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDesignation();
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setIsUploadingAvatar(true);
    const toastId = toast.loading("Uploading avatar...");

    try {
      const response = await postService.uploadImage(file, "avatars");

      if (response.success && response.data) {
        const imageUrl = response.data.secureUrl || response.data.url;
        setAuthor((prev) => ({ ...prev, avatarUrl: imageUrl }));
        toast.success("Avatar uploaded successfully", { id: toastId });
      } else {
        toast.error(response.error || "Failed to upload avatar", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload avatar", { id: toastId });
    } finally {
      setIsUploadingAvatar(false);
    }
  }, []);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert socials array to object format
      const socialsObject = socials.reduce((acc, { key, value }) => {
        if (key && value.trim()) {
          acc[key] = value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const submitData: AuthorFormState = {
        ...author,
        socials: socialsObject,
      };

      if (isEditMode) {
        const res = await adminService.updateAuthor(
          submitData as AuthorResponseDto
        );

        if (res.success) {
          toast.success("Author updated successfully!");
          onSuccess(res.data as unknown as AuthorResponseDto);
        } else {
          toast.error(res.message || "Failed to update author");
        }
      } else {
        if (!submitData.password || submitData.password.trim().length < 6) {
          toast.error("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }

        const res = await adminService.createAuthor(
          submitData as AuthorCreateDto
        );
        if (res.success) {
          toast.success("New author added successfully!");
          onSuccess(res.data as unknown as AuthorResponseDto);
        } else {
          toast.error(res.message || "Failed to create new author");
        }
      }
    } catch (err) {
      console.error("Error saving author:", err);
      toast.error("An error occurred while saving the author");
      if (onError) onError();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto border border-gray-100"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              {isEditMode ? "Edit Author" : "Add New Author"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-center py-4">
                  <label
                    htmlFor="avatar-upload"
                    className="relative inline-flex items-center justify-center cursor-pointer group"
                  >
                    {/* Circular avatar with white border */}
                    <div className="relative w-36 h-36">
                      <div className="absolute inset-0 rounded-md ring-4 ring-white overflow-hidden flex items-center justify-center">
                        {author.avatarUrl &&
                        author.avatarUrl.startsWith("http") ? (
                          <Image
                            src={author.avatarUrl || Avatar.src}
                            alt="Avatar preview"
                            width={144}
                            height={144}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center text-gray-400">
                            <Image
                              src={Avatar.src}
                              alt="Avatar"
                              width={144}
                              height={144}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Camera icon button in bottom-right corner */}
                      <div
                        className={`absolute bottom-0 right-0 rounded-full p-2.5 transition-all ${
                          isUploadingAvatar
                            ? "bg-purple-400 cursor-not-allowed"
                            : "bg-gray-800 hover:bg-purple-600 cursor-pointer group-hover:scale-110"
                        }`}
                      >
                        {isUploadingAvatar ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        ) : (
                          <Camera className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>

                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Upload info and remove button */}
                <div className="flex flex-col items-center gap-3">
                  {author.avatarUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setAuthor((prev) => ({ ...prev, avatarUrl: "" }))
                      }
                      disabled={isUploadingAvatar}
                      className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Remove Avatar
                    </button>
                  )}
                </div>
              </div>

              {/* Email & Username Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Email *
                  </label>
                  <input
                    className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter email address"
                    type="email"
                    name="email"
                    value={author.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    disabled={isEditMode}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Username *
                  </label>
                  <input
                    className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter username"
                    name="username"
                    value={author.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {!isEditMode && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Password *
                  </label>
                  <input
                    className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                    placeholder="Enter password"
                    type="password"
                    name="password"
                    value={author.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}

              {/* Pen Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Pen Name
                </label>
                <input
                  className="w-full text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm"
                  placeholder="Professional writing name"
                  name="penName"
                  value={author.penName}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Description
                </label>
                <textarea
                  className="w-full h-auto text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/70 backdrop-blur-sm resize-none"
                  placeholder="Tell us about this author..."
                  name="description"
                  rows={5}
                  value={author.description}
                  onChange={handleChange}
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Professional background and expertise</span>
                  <span>{author.description.length}/500</span>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Social Links
                  </label>
                  <button
                    type="button"
                    onClick={addSocial}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Social
                  </button>
                </div>

                <div className="space-y-3">
                  {socials.map((socialEntry, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-1/3">
                        <select
                          value={socialEntry.key}
                          onChange={(e) =>
                            updateSocial(index, "key", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-lg text-black border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none bg-white"
                        >
                          {SOCIAL_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1">
                        <input
                          type="url"
                          placeholder="Enter URL..."
                          value={socialEntry.value}
                          onChange={(e) =>
                            updateSocial(index, "value", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-lg text-black border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 outline-none placeholder:text-gray-400"
                        />
                      </div>

                      {socials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSocial(index)}
                          className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Social"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Designations */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Designations
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={designationInput}
                    onChange={(e) => setDesignationInput(e.target.value)}
                    onKeyDown={handleDesignationKeyDown}
                    placeholder="e.g., Senior Writer, Tech Analyst"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addDesignation}
                    disabled={!designationInput.trim()}
                    className="px-4 py-3 text-sm bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                  >
                    Add
                  </button>
                </div>

                {author.designations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {author.designations.map((designation, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200"
                      >
                        {designation}
                        <button
                          type="button"
                          onClick={() => removeDesignation(designation)}
                          className="hover:text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  className="px-6 py-3 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    loading ||
                    !author.username ||
                    !author.email ||
                    (!isEditMode && !author.password) ||
                    !author.penName
                  }
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isEditMode ? "Save Changes" : "Create Author"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormAddNewAuthor;
