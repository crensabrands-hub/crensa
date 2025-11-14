"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
 XMarkIcon,
 ExclamationTriangleIcon,
 CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Video, VideoMetadata } from "@/types";

interface VideoEditModalProps {
 video: Video | null;
 isOpen: boolean;
 onClose: () => void;
 onSave: (video: Video) => void;
}

const VIDEO_CATEGORIES = [
 "Entertainment",
 "Education",
 "Comedy",
 "Music",
 "Dance",
 "Lifestyle",
 "Technology",
 "Sports",
 "Art",
 "Other",
];

export default function VideoEditModal({
 video,
 isOpen,
 onClose,
 onSave,
}: VideoEditModalProps) {
 const [formData, setFormData] = useState<VideoMetadata>({
 title: "",
 description: "",
 category: "",
 tags: [],
 creditCost: 1,
 coinPrice: 20,
 aspectRatio: "16:9",
 });
 const [tagInput, setTagInput] = useState("");
 const [isLoading, setSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);
 const [retryCount, setRetryCount] = useState(0);

 useEffect(() => {
 if (video && isOpen) {
 setFormData({
 title: video.title,
 description: video.description || "",
 category: video.category,
 tags: [...video.tags],
 creditCost: video.creditCost,
 coinPrice: video.coinPrice || 20,
 aspectRatio: video.aspectRatio || "16:9",
 });
 setTagInput("");
 setError(null);
 setSuccess(false);
 setRetryCount(0);
 }
 }, [video, isOpen]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!video) return;

 if (!formData.title.trim()) {
 setError("Title is required");
 return;
 }

 if (!formData.category) {
 setError("Category is required");
 return;
 }

 if (formData.creditCost < 1 || formData.creditCost > 100) {
 setError("Credit cost must be between 1 and 100");
 return;
 }

 if (formData.tags.length > 10) {
 setError("Cannot have more than 10 tags");
 return;
 }

 setSaving(true);
 setError(null);

 try {

 const requestData = {
 title: formData.title.trim(),
 description: formData.description.trim() || null,
 category: formData.category,
 tags: formData.tags,
 creditCost: formData.creditCost,
 };

 const response = await fetch(`/api/videos/${video.id}`, {
 method: "PATCH",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify(requestData),
 });

 let responseData;
 try {
 const responseText = await response.text();
 if (!responseText.trim()) {
 throw new Error("Empty response from server");
 }
 responseData = JSON.parse(responseText);
 } catch (parseError) {
 console.error("Failed to parse response:", parseError);
 throw new Error(
 "Invalid response format from server. Please try again."
 );
 }

 if (!response.ok) {

 if (response.status === 401) {
 throw new Error("You need to be logged in to update videos");
 } else if (response.status === 403) {
 throw new Error("You can only update your own videos");
 } else if (response.status === 404) {
 throw new Error("Video not found");
 } else if (response.status === 400) {

 if (responseData.details && Array.isArray(responseData.details)) {
 throw new Error(responseData.details.join(", "));
 } else {
 throw new Error(responseData.error || "Invalid data provided");
 }
 } else {
 throw new Error(responseData.error || "Failed to update video");
 }
 }

 if (!responseData.success || !responseData.video) {
 throw new Error("Invalid response structure from server");
 }

 const updatedVideo = responseData.video;

 setSuccess(true);
 onSave(updatedVideo);

 setTimeout(() => {
 onClose();
 }, 1500);
 } catch (error) {
 console.error("Video update error:", error);

 if (error instanceof Error) {
 if (error.message.includes("fetch")) {
 setError(
 "Network error. Please check your connection and try again."
 );
 } else if (error.message.includes("JSON")) {
 setError("Server response error. Please try again.");
 } else {
 setError(error.message);
 }
 } else {
 setError("An unexpected error occurred. Please try again.");
 }
 } finally {
 setSaving(false);
 }
 };

 const handleRetry = () => {
 setError(null);
 setRetryCount((prev) => prev + 1);
 handleSubmit(new Event("submit") as any);
 };

 const addTag = () => {
 const tag = tagInput.trim();
 if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
 setFormData((prev) => ({
 ...prev,
 tags: [...prev.tags, tag],
 }));
 setTagInput("");
 }
 };

 const removeTag = (tagToRemove: string) => {
 setFormData((prev) => ({
 ...prev,
 tags: prev.tags.filter((tag) => tag !== tagToRemove),
 }));
 };

 const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
 if (e.key === "Enter") {
 e.preventDefault();
 addTag();
 }
 };

 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 overflow-y-auto">
 <div className="flex min-h-screen items-center justify-center p-4">
 {}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black bg-opacity-50"
 onClick={onClose}
 />

 {}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
 >
 {}
 <div className="flex items-center justify-between p-6 border-b border-gray-200">
 <h2 className="text-xl font-semibold text-gray-900">
 Edit Video
 </h2>
 <button
 onClick={onClose}
 className="text-gray-400 hover:text-gray-600 transition-colors"
 >
 <XMarkIcon className="w-6 h-6" />
 </button>
 </div>

 {}
 <AnimatePresence>
 {success && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="mx-6 mt-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
 >
 <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
 <p className="text-green-700">Video updated successfully!</p>
 </motion.div>
 )}
 </AnimatePresence>

 {}
 <AnimatePresence>
 {error && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
 >
 <div className="flex items-start gap-3">
 <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
 <div className="flex-1">
 <p className="text-red-700 mb-2">{error}</p>
 {retryCount < 3 && (
 <button
 type="button"
 onClick={handleRetry}
 disabled={isLoading}
 className="text-sm text-red-600 hover:text-red-800 underline disabled:opacity-50"
 >
 Try again
 </button>
 )}
 {retryCount >= 3 && (
 <p className="text-sm text-red-600">
 If the problem persists, please refresh the page and
 try again.
 </p>
 )}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {}
 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 {}
 {video && (
 <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 width={80}
 height={48}
 className="w-20 h-12 object-cover rounded"
 />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-900 truncate">
 {video.title}
 </p>
 <p className="text-xs text-gray-500">
 {video.viewCount} views •{" "}
 {Math.floor(video.duration / 60)}:
 {(video.duration % 60).toString().padStart(2, "0")}
 </p>
 </div>
 </div>
 )}

 {}
 <div>
 <label
 htmlFor="edit-title"
 className="block text-sm font-medium text-gray-700 mb-2"
 >
 Title *
 </label>
 <input
 id="edit-title"
 type="text"
 value={formData.title}
 onChange={(e) =>
 setFormData((prev) => ({ ...prev, title: e.target.value }))
 }
 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 placeholder="Enter video title"
 maxLength={255}
 required
 />
 </div>

 {}
 <div>
 <label
 htmlFor="edit-description"
 className="block text-sm font-medium text-gray-700 mb-2"
 >
 Description
 </label>
 <textarea
 id="edit-description"
 value={formData.description}
 onChange={(e) =>
 setFormData((prev) => ({
 ...prev,
 description: e.target.value,
 }))
 }
 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 placeholder="Describe your video..."
 rows={4}
 maxLength={1000}
 />
 </div>

 {}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label
 htmlFor="edit-category"
 className="block text-sm font-medium text-gray-700 mb-2"
 >
 Category *
 </label>
 <select
 id="edit-category"
 value={formData.category}
 onChange={(e) =>
 setFormData((prev) => ({
 ...prev,
 category: e.target.value,
 }))
 }
 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 required
 >
 <option value="">Select category</option>
 {VIDEO_CATEGORIES.map((category) => (
 <option key={category} value={category}>
 {category}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label
 htmlFor="edit-credit-cost"
 className="block text-sm font-medium text-gray-700 mb-2"
 >
 Credit Cost *
 </label>
 <input
 id="edit-credit-cost"
 type="number"
 min="1"
 max="100"
 value={formData.creditCost}
 onChange={(e) =>
 setFormData((prev) => ({
 ...prev,
 creditCost: Math.max(1, parseInt(e.target.value) || 1),
 }))
 }
 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 required
 />
 <p className="text-xs text-gray-500 mt-1">
 Credits viewers pay to watch this video
 </p>
 </div>
 </div>

 {}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Tags (Optional)
 </label>
 <div className="space-y-3">
 <div className="flex gap-2">
 <input
 type="text"
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 onKeyDown={handleTagInputKeyPress}
 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 placeholder="Add a tag and press Enter"
 maxLength={50}
 />
 <button
 type="button"
 onClick={addTag}
 disabled={!tagInput.trim() || formData.tags.length >= 10}
 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Add
 </button>
 </div>

 {formData.tags.length > 0 && (
 <div className="flex flex-wrap gap-2">
 {formData.tags.map((tag) => (
 <span
 key={tag}
 className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
 >
 {tag}
 <button
 type="button"
 onClick={() => removeTag(tag)}
 className="hover:text-purple-900"
 >
 <XMarkIcon className="w-4 h-4" />
 </button>
 </span>
 ))}
 </div>
 )}

 <p className="text-xs text-gray-500">
 {formData.tags.length}/10 tags
 </p>
 </div>
 </div>

 {}
 <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
 <button
 type="button"
 onClick={onClose}
 disabled={isLoading}
 className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isLoading || success}
 className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
 >
 {isLoading
 ? "Saving..."
 : success
 ? "Saved!"
 : "Save Changes"}
 </button>
 </div>
 </form>
 </motion.div>
 </div>
 </div>
 </AnimatePresence>
 );
}
