import { Suspense } from "react";
import { headers } from "next/headers";
import { AppNavbar } from "@/components/layout/navbar";
import { GlobalChatProvider } from "@/components/shared/global-chat-provider";
import { GlobalChatPanel } from "@/components/shared/global-chat-panel";
import { auth } from "@/lib/auth";
import { type GhostTabState } from "@/lib/chat-store";
import { ColorThemeProvider } from "@/components/theme/theme-provider";
import { CodeThemeProvider } from "@/components/theme/code-theme-provider";
import { GitHubLinkInterceptor } from "@/components/shared/github-link-interceptor";
import { MutationEventProvider } from "@/components/shared/mutation-event-provider";
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";
import { getAuthenticatedUser } from "@/lib/github";
import { getUserSettings } from "@/lib/user-settings-store";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	// Fresh tab state every refresh — history is shown as a list in the panel
	const freshTabId = crypto.randomUUID();
	const initialTabState: GhostTabState = {
		tabs: [{ id: freshTabId, label: "New chat" }],
		activeTabId: freshTabId,
		counter: 1,
	};

	const [session, ghUser] = await Promise.all([
		auth.api.getSession({ headers: await headers() }).catch(() => null),
		getAuthenticatedUser().catch(() => null),
	]);
	const userSettings = session?.user?.id
		? await getUserSettings(session.user.id).catch(() => null)
		: null;

	return (
		<GlobalChatProvider initialTabState={initialTabState}>
			<MutationEventProvider>
			<ColorThemeProvider>
				<CodeThemeProvider>
					<GitHubLinkInterceptor>
						<div className="flex flex-col h-dvh overflow-y-auto lg:overflow-hidden">
							<AppNavbar
								userImage={
									session?.user?.image || null
								}
								userName={
									session?.user?.name || null
								}
							/>
							<div className="mt-10 lg:h-[calc(100dvh-var(--spacing)*10)] flex flex-col px-2 sm:px-4 pt-2 lg:overflow-auto">
								{children}
							</div>
							<Suspense>
								<GlobalChatPanel />
							</Suspense>
						</div>
						<OnboardingOverlay
							userName={
								ghUser?.name || ghUser?.login || ""
							}
							userAvatar={session?.user?.image || ""}
							bio={ghUser?.bio || ""}
							company={ghUser?.company || ""}
							location={ghUser?.location || ""}
							publicRepos={ghUser?.public_repos ?? 0}
							followers={ghUser?.followers ?? 0}
							createdAt={ghUser?.created_at || ""}
							onboardingDone={userSettings?.onboardingDone ?? false}
						/>
					</GitHubLinkInterceptor>
				</CodeThemeProvider>
			</ColorThemeProvider>
			</MutationEventProvider>
		</GlobalChatProvider>
	);
}
