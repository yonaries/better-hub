"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserPlus, Settings, Check, X, Loader2, ExternalLink, KeyRound, Copy } from "lucide-react";
import dynamic from "next/dynamic";

const CommandMenu = dynamic(
	() => import("@/components/command-menu").then((m) => m.CommandMenu),
	{ ssr: false },
);
import { signOut } from "@/lib/auth-client";
import { useMutationEvents } from "@/components/shared/mutation-event-provider";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

interface AccountInfo {
	id: string;
	login: string;
	avatarUrl: string;
	label: string;
	active: boolean;
}

interface AccountsData {
	accounts: AccountInfo[];
	oauthLogin: string;
	oauthAvatar: string;
	oauthActive: boolean;
}

interface AppNavbarProps {
	userImage: string | null;
	userName: string | null;
}

export function AppNavbar({ userImage, userName }: AppNavbarProps) {
	const router = useRouter();
	const { emit } = useMutationEvents();
	const [accountsData, setAccountsData] = useState<AccountsData | null>(null);
	const [patDialogOpen, setPatDialogOpen] = useState(false);
	const [patInput, setPatInput] = useState("");
	const [patError, setPatError] = useState("");
	const [patSubmitting, setPatSubmitting] = useState(false);

	const fetchAccounts = useCallback(async () => {
		try {
			const res = await fetch("/api/github-accounts");
			if (res.ok) {
				setAccountsData(await res.json());
			}
		} catch {
			// silent
		}
	}, []);

	useEffect(() => {
		fetchAccounts();
		const handler = () => fetchAccounts();
		window.addEventListener("github-account-switched", handler);
		return () => window.removeEventListener("github-account-switched", handler);
	}, [fetchAccounts]);

	const activeAccount = accountsData?.accounts.find((a) => a.active);
	const avatarSrc = activeAccount?.avatarUrl || userImage;
	const displayName = activeAccount?.login || userName;

	const handleSwitchAccount = useCallback(
		async (accountId: string | null) => {
			try {
				await fetch("/api/github-accounts", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ accountId }),
				});
				await fetchAccounts();
				window.dispatchEvent(new Event("github-account-switched"));
				emit({ type: "github-account:switched" });
				router.refresh();
			} catch {
				// silent
			}
		},
		[fetchAccounts, router, emit],
	);

	const handleRemoveAccount = useCallback(
		async (accountId: string) => {
			try {
				await fetch("/api/github-accounts", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ accountId }),
				});
				await fetchAccounts();
				window.dispatchEvent(new Event("github-account-switched"));
				emit({ type: "github-account:removed" });
			} catch {
				// silent
			}
		},
		[fetchAccounts, emit],
	);

	const handleAddPat = useCallback(async () => {
		if (!patInput.trim() || patSubmitting) return;
		setPatSubmitting(true);
		setPatError("");
		try {
			const res = await fetch("/api/github-accounts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ pat: patInput }),
			});
			const data = await res.json();
			if (!res.ok) {
				setPatError(data.error || "Failed to add account");
				return;
			}
			setPatInput("");
			setPatDialogOpen(false);
			await fetchAccounts();
			window.dispatchEvent(new Event("github-account-switched"));
			emit({ type: "github-account:added" });
		} catch {
			setPatError("Network error");
		} finally {
			setPatSubmitting(false);
		}
	}, [patInput, patSubmitting, fetchAccounts, emit]);

	return (
		<header className="fixed top-0 h-10 flex w-full flex-col bg-background backdrop-blur-lg z-10">
			<nav className="top-0 flex h-full items-center justify-between border-border px-2 sm:px-4 border-b">
				<div className="flex items-center gap-0" id="navbar-breadcrumb">
					<Link
						className="shrink-0 text-foreground transition-colors text-xs tracking-tight"
						href="/dashboard"
					>
					<span className="text-sm tracking-tight text-foreground">
							BETTER-HUB.
						</span>
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<CommandMenu />
					{avatarSrc && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									className="relative shrink-0 cursor-pointer group p-1.5 outline-none"
									title={displayName ? `Signed in as ${displayName}` : "Account"}
								>
									<img
										src={avatarSrc}
										alt={displayName || "User avatar"}
										className="w-6 h-6 rounded-full border border-border/60 dark:border-white/8 group-hover:border-foreground/20 transition-colors"
									/>
									{activeAccount && (
										<span
											className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 border border-background"
											title="Using PAT account"
										/>
									)}
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-52">
								{/* Current user */}
								<div className="px-2 py-1.5 flex items-center gap-2">
									<img src={avatarSrc} alt="" className="w-6 h-6 rounded-full shrink-0" />
									<div className="flex flex-col min-w-0">
										<span className="text-[11px] font-medium truncate">{displayName}</span>
										{activeAccount && (
											<span className="text-[9px] font-mono text-muted-foreground/40">PAT</span>
										)}
									</div>
								</div>
								<DropdownMenuSeparator />

								{/* Switch account — only when multiple accounts exist */}
								{accountsData && accountsData.accounts.length > 0 && (
									<>
										<DropdownMenuGroup>
											{/* OAuth account */}
											<DropdownMenuItem
												onClick={() => handleSwitchAccount(null)}
												className="text-[11px] gap-2 h-7"
											>
												<img src={accountsData.oauthAvatar} alt="" className="w-4 h-4 rounded-full shrink-0" />
												<span className="flex-1 truncate">{accountsData.oauthLogin}</span>
												{accountsData.oauthActive && <Check className="w-3 h-3 text-success shrink-0" />}
											</DropdownMenuItem>
											{/* PAT accounts */}
											{accountsData.accounts.map((acc) => (
												<DropdownMenuItem
													key={acc.id}
													onClick={() => handleSwitchAccount(acc.id)}
													className="text-[11px] gap-2 h-7 group/acc"
												>
													<img src={acc.avatarUrl} alt="" className="w-4 h-4 rounded-full shrink-0" />
													<span className="flex-1 truncate">{acc.login}</span>
													{acc.active && <Check className="w-3 h-3 text-success shrink-0" />}
													<button
														onClick={(e) => { e.stopPropagation(); handleRemoveAccount(acc.id); }}
														className="opacity-0 group-hover/acc:opacity-100 p-0.5 text-muted-foreground/30 hover:text-destructive transition-all cursor-pointer"
													>
														<X className="w-2.5 h-2.5" />
													</button>
												</DropdownMenuItem>
											))}
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
									</>
								)}

								<DropdownMenuItem
									onClick={() => { setPatDialogOpen(true); setPatInput(""); setPatError(""); }}
									className="text-[11px] gap-2 h-7"
								>
									<UserPlus className="w-3.5 h-3.5" />
									Add account
								</DropdownMenuItem>

								<DropdownMenuItem
									onClick={() => router.push("/settings")}
									className="text-[11px] gap-2 h-7"
								>
									<Settings className="w-3.5 h-3.5" />
									Settings
								</DropdownMenuItem>
								{displayName && (
									<DropdownMenuItem
										onClick={() => window.open(`https://github.com/${displayName}`, "_blank")}
										className="text-[11px] gap-2 h-7"
									>
										<ExternalLink className="w-3.5 h-3.5" />
										GitHub profile
									</DropdownMenuItem>
								)}

								<DropdownMenuSeparator />

								<DropdownMenuItem
									onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
									className="text-[11px] gap-2 h-7 text-destructive focus:text-destructive"
								>
									<LogOut className="w-3.5 h-3.5" />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}

					{/* Add PAT dialog */}
					<Dialog open={patDialogOpen} onOpenChange={(open) => {
						setPatDialogOpen(open);
						if (!open) { setPatInput(""); setPatError(""); }
					}}>
						<DialogContent className="sm:max-w-sm gap-0">
							<DialogHeader>
								<DialogTitle className="text-sm">Add account</DialogTitle>
								<DialogDescription className="text-xs text-muted-foreground/70">
									Add a GitHub account using a Personal Access Token.
								</DialogDescription>
							</DialogHeader>

							<div className="mt-4 flex flex-col gap-3">
								{/* Guide */}
								<div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 flex flex-col gap-2">
									<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50">How to generate a PAT</span>
									<ol className="text-[11px] text-muted-foreground/70 leading-relaxed list-decimal list-inside flex flex-col gap-1">
										<li>
											Go to{" "}
											<a
												href="https://github.com/settings/tokens?type=beta"
												target="_blank"
												rel="noopener noreferrer"
												className="text-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors"
											>
												GitHub Token Settings
											</a>
										</li>
										<li>Click <span className="font-medium text-foreground/60">Generate new token</span></li>
										<li>Select scopes: <code className="text-[10px] bg-muted px-1 py-0.5 rounded font-mono">repo</code>, <code className="text-[10px] bg-muted px-1 py-0.5 rounded font-mono">read:org</code>, <code className="text-[10px] bg-muted px-1 py-0.5 rounded font-mono">read:user</code></li>
										<li>Copy the token and paste it below</li>
									</ol>
								</div>

								{/* Input */}
								<div className="flex flex-col gap-1.5">
									<label className="text-[11px] font-medium text-muted-foreground/70">
										Personal Access Token
									</label>
									<input
										type="password"
										value={patInput}
										onChange={(e) => { setPatInput(e.target.value); setPatError(""); }}
										onKeyDown={(e) => {
											if (e.key === "Enter") { e.preventDefault(); handleAddPat(); }
										}}
										placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
										autoFocus
										className="w-full border border-border bg-transparent px-2.5 py-2 text-xs font-mono placeholder:text-muted-foreground/25 focus:outline-none focus:border-foreground/30 rounded-md transition-colors"
									/>
									{patError && (
										<p className="text-[10px] font-mono text-destructive">{patError}</p>
									)}
								</div>

								{/* Submit */}
								<button
									onClick={handleAddPat}
									disabled={patSubmitting || !patInput.trim()}
									className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-40 cursor-pointer"
								>
									{patSubmitting ? (
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
									) : (
										<KeyRound className="w-3.5 h-3.5" />
									)}
									{patSubmitting ? "Adding..." : "Add account"}
								</button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</nav>
		</header>
	);
}
