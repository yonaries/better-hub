"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { pinItem, unpinItem, getPinnedItemUrls } from "@/lib/pinned-items-store";
import { revalidatePath } from "next/cache";

export async function pinToOverview(
	owner: string,
	repo: string,
	url: string,
	title: string,
	itemType: string,
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) return { error: "Not authenticated" };

	await pinItem(session.user.id, owner, repo, url, title, itemType);
	revalidatePath(`/repos/${owner}/${repo}`);
	return { success: true };
}

export async function unpinFromOverview(
	owner: string,
	repo: string,
	url: string,
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) return { error: "Not authenticated" };

	await unpinItem(session.user.id, owner, repo, url);
	revalidatePath(`/repos/${owner}/${repo}`);
	return { success: true };
}

export async function getPinnedUrlsForRepo(
	owner: string,
	repo: string,
): Promise<string[]> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) return [];
	return getPinnedItemUrls(session.user.id, owner, repo);
}
