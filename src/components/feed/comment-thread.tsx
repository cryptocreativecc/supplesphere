"use client";

import { useState, useEffect, useCallback } from "react";
import { VoteButtons } from "./vote-buttons";
import { UserBadge } from "../user-badge";
import { CommentForm } from "../forms/comment-form";

export interface CommentData {
  id: string;
  author: string;
  authorId?: string;
  authorTier: string;
  body: string;
  upvotes: number;
  downvotes: number;
  created: string;
  children: CommentData[];
}

function CommentNode({
  comment,
  depth = 0,
  postId,
  currentUserId,
  onCommentAdded,
}: {
  comment: CommentData;
  depth?: number;
  postId: string;
  currentUserId?: string;
  onCommentAdded?: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [collapsed, setCollapsed] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const maxDepth = 3;
  const isAuthor = currentUserId && comment.authorId === currentUserId;

  async function handleEdit() {
    if (!editText.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText }),
      });
      if (res.ok) {
        comment.body = editText;
        setEditing(false);
      }
    } catch {
      // Revert
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleted(true);
      }
    } catch {
      // Ignore
    }
  }

  if (deleted) {
    return (
      <div className={`${depth > 0 ? "ml-6 border-l-2 border-neutral-100 pl-4" : ""}`}>
        <div className="py-3 text-sm text-neutral-400 italic">[deleted]</div>
      </div>
    );
  }

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-neutral-100 pl-4" : ""}`}>
      <div className="py-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 pt-0.5">
            <VoteButtons
              targetId={comment.id}
              targetType="comment"
              initialUpvotes={comment.upvotes}
              initialDownvotes={comment.downvotes}
              orientation="vertical"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <UserBadge username={comment.author} tier={comment.authorTier} size="sm" />
              <span className="text-xs text-neutral-400">• {comment.created}</span>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                [{collapsed ? "+" : "−"}]
              </button>
            </div>
            {!collapsed && (
              <>
                {editing ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-accent-teal focus:ring-1 focus:ring-accent-teal focus:outline-none"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleEdit}
                        disabled={editLoading}
                        className="rounded-lg bg-accent-teal px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-teal-light disabled:opacity-50"
                      >
                        {editLoading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => { setEditing(false); setEditText(comment.body); }}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
                    {comment.body}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-3">
                  {depth < maxDepth && (
                    <button
                      onClick={() => setReplying(!replying)}
                      className="text-xs font-medium text-neutral-400 transition hover:text-accent-teal"
                    >
                      Reply
                    </button>
                  )}
                  {isAuthor && (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className="text-xs font-medium text-neutral-400 transition hover:text-accent-teal"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="text-xs font-medium text-neutral-400 transition hover:text-error"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  <button className="text-xs font-medium text-neutral-400 transition hover:text-error">
                    Report
                  </button>
                </div>

                {replying && (
                  <div className="mt-3">
                    <CommentForm
                      postId={postId}
                      parentCommentId={comment.id}
                      compact
                      placeholder="Write a reply..."
                      onSubmit={() => {
                        setReplying(false);
                        onCommentAdded?.();
                      }}
                      onCancel={() => setReplying(false)}
                    />
                  </div>
                )}

                {comment.children.length > 0 && (
                  <div className="mt-2">
                    {comment.children.map((child) => (
                      <CommentNode
                        key={child.id}
                        comment={child}
                        depth={depth + 1}
                        postId={postId}
                        currentUserId={currentUserId}
                        onCommentAdded={onCommentAdded}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentThread({
  comments,
  postId = "",
  currentUserId,
}: {
  comments: CommentData[];
  postId?: string;
  currentUserId?: string;
}) {
  const [allComments, setAllComments] = useState(comments);

  function handleCommentAdded() {
    // Refresh comments from API
    if (!postId) return;
    fetch(`/api/comments?postId=${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          // Transform flat list into tree
          const tree = buildCommentTree(data.items);
          setAllComments(tree);
        }
      })
      .catch(() => {});
  }

  return (
    <div>
      {/* New comment box */}
      {postId && (
        <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
          <CommentForm
            postId={postId}
            onSubmit={handleCommentAdded}
          />
        </div>
      )}

      {/* Thread */}
      <div className="space-y-0 divide-y divide-neutral-100">
        {allComments.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-400">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          allComments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
              onCommentAdded={handleCommentAdded}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Helper to build nested comment tree from flat list
function buildCommentTree(flatComments: Record<string, unknown>[]): CommentData[] {
  const map = new Map<string, CommentData>();
  const roots: CommentData[] = [];

  // First pass: create all nodes
  for (const c of flatComments) {
    const expand = c.expand as Record<string, unknown> | undefined;
    const author = expand?.author as Record<string, unknown> | undefined;
    map.set(c.id as string, {
      id: c.id as string,
      author: (author?.username as string) || "Unknown",
      authorId: c["author"] as string,
      authorTier: (author?.reputation_tier as string) || "bronze",
      body: c["body"] as string,
      upvotes: (c["upvotes"] as number) || 0,
      downvotes: (c["downvotes"] as number) || 0,
      created: formatTimeAgo(c.created as string),
      children: [],
    });
  }

  // Second pass: link children
  for (const c of flatComments) {
    const node = map.get(c.id as string)!;
    const parentId = c["parent_comment"] as string;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}


