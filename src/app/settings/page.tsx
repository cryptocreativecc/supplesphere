"use client";

import { useState, useRef } from "react";

export default function SettingsPage() {
  // Profile state
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Account state
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountError, setAccountError] = useState("");

  // Notification preferences
  const [notifyReplies, setNotifyReplies] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyUpvotes, setNotifyUpvotes] = useState(false);

  // Privacy
  const [profileVisible, setProfileVisible] = useState(true);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleProfileSave() {
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const formData = new FormData();
      if (username) formData.append("username", username);
      formData.append("bio", bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleAccountSave() {
    setAccountLoading(true);
    setAccountError("");
    setAccountSuccess("");

    try {
      if (newPassword && newPassword !== confirmPassword) {
        throw new Error("Passwords don't match");
      }

      const body: Record<string, string> = {};
      if (email) body.email = email;
      if (oldPassword && newPassword) {
        body.oldPassword = oldPassword;
        body.newPassword = newPassword;
      }

      if (Object.keys(body).length === 0) {
        throw new Error("No changes to save");
      }

      const res = await fetch("/api/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update account");
      }

      const data = await res.json();
      setAccountSuccess(data.message || "Account updated!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setAccountSuccess(""), 3000);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAccountLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-brand-navy">Settings</h1>

      {/* Points & Reputation link */}
      <a
        href="/points"
        className="mb-6 flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition hover:border-accent-teal"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="font-semibold text-brand-navy">Points & Reputation</p>
            <p className="text-xs text-neutral-400">View your tier, points history, and daily progress</p>
          </div>
        </div>
        <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-brand-navy">Profile</h2>
          <div className="space-y-4">
            {/* Avatar */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Avatar</label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy text-xl font-bold text-white overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    "?"
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-accent-teal hover:text-accent-teal"
                >
                  Change Avatar
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
                placeholder="Your username"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-neutral-400">{bio.length}/500</p>
            </div>

            {profileError && (
              <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{profileError}</div>
            )}
            {profileSuccess && (
              <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">{profileSuccess}</div>
            )}

            <button
              onClick={handleProfileSave}
              disabled={profileLoading}
              className="rounded-lg bg-accent-teal px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-teal-light disabled:opacity-50"
            >
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-brand-navy">Account</h2>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
                placeholder="new@email.com"
              />
              <p className="mt-1 text-xs text-neutral-400">A verification email will be sent to the new address</p>
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <h3 className="mb-3 text-sm font-medium text-neutral-700">Change Password</h3>
              <div className="space-y-3">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
                  placeholder="Current password"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
                  placeholder="New password"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {accountError && (
              <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{accountError}</div>
            )}
            {accountSuccess && (
              <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">{accountSuccess}</div>
            )}

            <button
              onClick={handleAccountSave}
              disabled={accountLoading}
              className="rounded-lg bg-accent-teal px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-teal-light disabled:opacity-50"
            >
              {accountLoading ? "Saving..." : "Save Account"}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-brand-navy">Notifications</h2>
          <div className="space-y-4">
            <ToggleSetting
              label="Reply notifications"
              description="Get notified when someone replies to your post or comment"
              checked={notifyReplies}
              onChange={setNotifyReplies}
            />
            <ToggleSetting
              label="Mention notifications"
              description="Get notified when someone mentions you"
              checked={notifyMentions}
              onChange={setNotifyMentions}
            />
            <ToggleSetting
              label="Upvote notifications"
              description="Get notified when your content receives upvotes"
              checked={notifyUpvotes}
              onChange={setNotifyUpvotes}
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-brand-navy">Privacy</h2>
          <ToggleSetting
            label="Public profile"
            description="Allow others to see your profile, reviews, and activity"
            checked={profileVisible}
            onChange={setProfileVisible}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-700">{label}</p>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          checked ? "bg-accent-teal" : "bg-neutral-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
