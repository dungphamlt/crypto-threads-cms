"use client";

import { useState } from "react";
import { Edit2, Link2, X, Save, Plus, Trash2, Key } from "lucide-react";
import { Admin, adminService, Author } from "@/services/adminService";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";
import TelegramIcon from "@/assets/icon/telegram.svg";
import XIcon from "@/assets/icon/x.svg";
import FacebookIcon from "@/assets/icon/facebook.svg";
import InstagramIcon from "@/assets/icon/instagram.svg";

const SOCIAL_TYPE_OPTIONS = [
  {
    value: "telegram",
    label: "Telegram",
    icon: <Image src={TelegramIcon} alt="Telegram" width={40} height={40} />,
  },
  {
    value: "x",
    label: "X (Twitter)",
    icon: <Image src={XIcon} alt="X" width={40} height={40} />,
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: <Image src={FacebookIcon} alt="Facebook" width={40} height={40} />,
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: <Image src={InstagramIcon} alt="Instagram" width={40} height={40} />,
  },
  { value: "other", label: "Other", icon: <Link2 className="w-4 h-4" /> },
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Author>>({});
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [designations, setDesignations] = useState<string[]>([]);
  const [designationInput, setDesignationInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const {
    data: profileData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => adminService.getProfile(),
  });

  const profile = profileData?.data as Admin;

  const handleEdit = () => {
    setEditedProfile({
      username: profile?.username || "",
      penName: profile?.penName || "",
      email: profile?.email || "",
      avatarUrl: profile?.avatarUrl || "",
      description: profile?.description || "",
      designations: profile?.designations || [],
    });

    // Initialize socials from profile data
    try {
      let parsedSocials: Record<string, string> = {};

      if (profile?.socials) {
        if (Array.isArray(profile.socials)) {
          // Convert array of objects to Record
          parsedSocials = profile.socials.reduce((acc, social) => {
            const key = Object.keys(social)[0];
            const value = Object.values(social)[0];
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, string>);
        } else if (typeof profile.socials === "object") {
          // Already an object
          parsedSocials = profile.socials as Record<string, string>;
        }
      }

      setSocials(parsedSocials);
    } catch (error) {
      console.error("Error parsing socials:", error);
      setSocials({});
    }

    // Initialize designations
    setDesignations(profile?.designations || []);
    setDesignationInput("");

    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Clean up socials object (remove empty values)
      const cleanedSocials = Object.entries(socials)
        .filter(([key, value]) => key && value.trim())
        .reduce((acc, [key, value]) => {
          acc[key] = value.trim();
          return acc;
        }, {} as Record<string, string>);

      const updateData = {
        ...editedProfile,
        socials: cleanedSocials,
        designations: designations,
      };

      const response = await adminService.updateAuthor(
        updateData as unknown as Author
      );
      if (response.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        refetch();
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
    setSocials({});
    setDesignations([]);
    setDesignationInput("");
  };

  // Social management functions
  const addSocial = () => {
    // Find an available platform that's not already used
    const availablePlatform = SOCIAL_TYPE_OPTIONS.find(
      (option) => !socials.hasOwnProperty(option.value)
    );

    if (availablePlatform) {
      setSocials({ ...socials, [availablePlatform.value]: "" });
    } else {
      // If all platforms are used, add a numbered version
      const baseKey = SOCIAL_TYPE_OPTIONS[0].value;
      let counter = 1;
      let newKey = `${baseKey}_${counter}`;

      while (socials.hasOwnProperty(newKey)) {
        counter++;
        newKey = `${baseKey}_${counter}`;
      }

      setSocials({ ...socials, [newKey]: "" });
    }
  };

  const removeSocial = (key: string) => {
    const updated = { ...socials };
    delete updated[key];
    setSocials(updated);
  };

  const updateSocial = (key: string, newValue: string) => {
    setSocials({ ...socials, [key]: newValue });
  };

  // Designation management functions
  const addDesignation = () => {
    const trimmedDesignation = designationInput.trim();
    if (trimmedDesignation && !designations.includes(trimmedDesignation)) {
      setDesignations([...designations, trimmedDesignation]);
      setDesignationInput("");
    }
  };

  const removeDesignation = (designationToRemove: string) => {
    setDesignations(
      designations.filter((designation) => designation !== designationToRemove)
    );
  };

  const handleDesignationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDesignation();
    }
  };

  // Password update functions
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await adminService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        toast.success("Password updated successfully!");
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred while updating password");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const getInitials = (name?: string) => {
    const displayName = name || profile?.username || profile?.email || "U";
    return displayName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.username || profile?.email;

  const getSocialIcon = (platform: string) => {
    const option = SOCIAL_TYPE_OPTIONS.find((opt) => opt.value === platform);
    return option?.icon || <Link2 className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Key className="h-4 w-4" />
                Update Password
              </button>
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex space-x-6">
          <div className="mt-2 h-28 w-28 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg ring-4 ring-blue-100">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
                width={100}
                height={100}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              getInitials(displayName)
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="text-md items-center flex gap-2 text-gray-900">
              <label htmlFor="username" className=" text-gray-700 block">
                Username:
              </label>

              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={editedProfile.username || ""}
                  onChange={handleChange}
                  className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter username"
                />
              ) : (
                displayName
              )}
            </div>
            <div className="text-md flex items-center gap-2  text-gray-900">
              <label htmlFor="penName" className="  text-gray-700 block">
                Pen Name:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="penName"
                  value={editedProfile.penName || ""}
                  onChange={handleChange}
                  className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter pen name"
                />
              ) : (
                profile?.penName
              )}
            </div>

            <div className="flex gap-2 text-md items-center text-gray-900">
              <label htmlFor="email" className="  text-gray-700 block">
                Email:
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedProfile.email || ""}
                  onChange={handleChange}
                  className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter email"
                />
              ) : (
                <span>{profile?.email}</span>
              )}
            </div>

            <div className="flex gap-2 text-md items-center text-gray-900">
              <label htmlFor="role" className="  text-gray-700 block">
                Role:
              </label>
              <span className="capitalize">{profile?.role}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {isEditing ? (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={editedProfile.description || ""}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        ) : (
          profile?.description && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">About</h4>
              <p className="text-gray-600 leading-relaxed">
                {profile.description}
              </p>
            </div>
          )
        )}

        {/* Avatar URL */}
        {isEditing && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              name="avatarUrl"
              value={editedProfile.avatarUrl || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/avatar.jpg"
            />
            {editedProfile.avatarUrl && (
              <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Image
                  src={editedProfile.avatarUrl}
                  alt="Avatar preview"
                  width={100}
                  height={100}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-sm text-gray-600">Avatar preview</span>
              </div>
            )}
          </div>
        )}
        {/* Social Links Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Social Links</h4>
            {isEditing && (
              <button
                onClick={addSocial}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Social
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              {Object.entries(socials).map(([key, value]) => (
                <div
                  key={key}
                  className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-1/3">
                    <select
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const updated = { ...socials };
                        delete updated[key];
                        updated[newKey] = value;
                        setSocials(updated);
                      }}
                      className="w-full px-4 py-3 rounded-lg text-black border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none bg-white"
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
                      value={value}
                      onChange={(e) => updateSocial(key, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-black border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSocial(key)}
                    className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Social"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {profile?.socials &&
              (Array.isArray(profile.socials)
                ? profile.socials.length > 0
                : Object.keys(profile.socials).length > 0) ? (
                Array.isArray(profile.socials) ? (
                  // Handle array format
                  profile.socials.map(
                    (social: Record<string, string>, index) => {
                      let key, value;
                      if (social.key && social.value) {
                        key = social.key;
                        value = social.value;
                      } else {
                        key = Object.keys(social)[0];
                        value = Object.values(social)[0];
                      }
                      return (
                        <a
                          key={index}
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                        >
                          {getSocialIcon(key)}
                          <span className="font-medium">{key}:</span>
                          <span className="ml-1">{value}</span>
                        </a>
                      );
                    }
                  )
                ) : (
                  // Handle object format
                  <div className="flex items-center gap-4">
                    {Object.entries(
                      profile.socials as Record<string, string>
                    ).map(([key, value]) => (
                      <a
                        key={key}
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      >
                        {getSocialIcon(key)}
                      </a>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-gray-500 text-sm">
                  No social links added yet.
                </p>
              )}
            </div>
          )}
        </div>
        {/* Designations */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Designations</h4>
            {isEditing && (
              <button
                onClick={addDesignation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Designation
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={designationInput}
                  onChange={(e) => setDesignationInput(e.target.value)}
                  onKeyDown={handleDesignationKeyDown}
                  placeholder="e.g., Senior Writer, Tech Analyst"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={addDesignation}
                  disabled={!designationInput.trim()}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  Add
                </button>
              </div>

              {designations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {designations.map((designation, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200"
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
          ) : (
            <div className="space-y-2">
              {profile?.designations &&
              Array.isArray(profile.designations) &&
              profile.designations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.designations.map((designation, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                    >
                      {designation}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No designations added yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
