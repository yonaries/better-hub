"use server";

import { getOctokit } from "@/lib/github";
import { getErrorMessage } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function starRepo(owner: string, repo: string) {
	const octokit = await getOctokit();
	if (!octokit) return { error: "Not authenticated" };
	try {
		await octokit.activity.starRepoForAuthenticatedUser({ owner, repo });
		revalidatePath(`/repos/${owner}/${repo}`);
		return { success: true };
	} catch (e: unknown) {
		return { error: getErrorMessage(e) || "Failed to star" };
	}
}

export async function unstarRepo(owner: string, repo: string) {
	const octokit = await getOctokit();
	if (!octokit) return { error: "Not authenticated" };
	try {
		await octokit.activity.unstarRepoForAuthenticatedUser({ owner, repo });
		revalidatePath(`/repos/${owner}/${repo}`);
		return { success: true };
	} catch (e: unknown) {
		return { error: getErrorMessage(e) || "Failed to unstar" };
	}
}

export async function createRepo(
	name: string,
	description: string,
	isPrivate: boolean,
	autoInit: boolean,
	gitignoreTemplate: string,
	licenseTemplate: string,
	org?: string,
): Promise<{ success: boolean; full_name?: string; error?: string }> {
	const octokit = await getOctokit();
	if (!octokit) return { success: false, error: "Not authenticated" };

	try {
		const common = {
			name,
			description: description || undefined,
			private: isPrivate,
			auto_init: autoInit || undefined,
			gitignore_template: gitignoreTemplate || undefined,
			license_template: licenseTemplate || undefined,
		};

		const { data } = org
			? await octokit.repos.createInOrg({ ...common, org })
			: await octokit.repos.createForAuthenticatedUser(common);

		revalidatePath("/dashboard");
		if (org) revalidatePath(`/${org}`);
		return { success: true, full_name: data.full_name };
	} catch (e: unknown) {
		return {
			success: false,
			error: getErrorMessage(e) || "Failed to create repository",
		};
	}
}
