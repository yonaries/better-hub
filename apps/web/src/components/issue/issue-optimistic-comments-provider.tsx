"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

interface OptimisticComment {
	id: number;
	body: string;
	created_at: string;
	userAvatarUrl?: string;
	userName?: string;
}

interface IssueOptimisticCommentsContextValue {
	comments: OptimisticComment[];
	addComment: (comment: {
		body: string;
		userAvatarUrl?: string | undefined;
		userName?: string | undefined;
	}) => number;
	removeComment: (id: number) => void;
}

const IssueOptimisticCommentsContext = createContext<IssueOptimisticCommentsContextValue | null>(null);

export function useIssueOptimisticComments() {
	const ctx = useContext(IssueOptimisticCommentsContext);
	if (!ctx) {
		throw new Error(
			"useIssueOptimisticComments must be used within IssueOptimisticCommentsProvider",
		);
	}
	return ctx;
}

interface IssueOptimisticCommentsProviderProps {
	serverCommentCount: number;
	children: React.ReactNode;
}

export function IssueOptimisticCommentsProvider({
	serverCommentCount,
	children,
}: IssueOptimisticCommentsProviderProps) {
	const [comments, setComments] = useState<OptimisticComment[]>([]);
	const initialCountRef = useRef(serverCommentCount);

	// Clear optimistic comments when server comment count increases
	// (server has caught up after router.refresh())
	useEffect(() => {
		if (serverCommentCount > initialCountRef.current) {
			setComments([]);
			initialCountRef.current = serverCommentCount;
		}
	}, [serverCommentCount]);

	const addComment = useCallback(
		(comment: {
			body: string;
			userAvatarUrl?: string | undefined;
			userName?: string | undefined;
		}) => {
			const id = Date.now();
			setComments((prev) => [
				...prev,
				{ ...comment, id, created_at: new Date().toISOString() },
			]);
			return id;
		},
		[],
	);

	const removeComment = useCallback((id: number) => {
		setComments((prev) => prev.filter((c) => c.id !== id));
	}, []);

	return (
		<IssueOptimisticCommentsContext.Provider value={{ comments, addComment, removeComment }}>
			{children}
		</IssueOptimisticCommentsContext.Provider>
	);
}

/** Hook for components that only need to read optimistic comments */
export function useIssueOptimisticCommentsData() {
	const ctx = useContext(IssueOptimisticCommentsContext);
	return ctx?.comments ?? [];
}
