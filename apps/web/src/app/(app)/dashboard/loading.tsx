export default function DashboardLoading() {
	return (
		<div className="animate-pulse flex flex-col flex-1 min-h-0 w-full">
			{/* Header */}
			<div className="shrink-0 pb-3">
				<div className="h-4 w-48 rounded bg-muted/40 mb-1.5" />
				<div className="h-3 w-36 rounded bg-muted/25" />
			</div>

			{/* Two-column layout */}
			<div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 pb-2">
				{/* Left column */}
				<div className="lg:w-1/2 flex flex-col gap-3 lg:pr-2">
					{/* Activity marquee */}
					<div className="h-8 rounded bg-muted/20 border border-border/40" />

					{/* Stats row */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="h-14 rounded-md border border-border/40 bg-muted/15 p-3"
							>
								<div className="h-2.5 w-12 rounded bg-muted/30 mb-2" />
								<div className="h-4 w-6 rounded bg-muted/40" />
							</div>
						))}
					</div>

					{/* Work tabs */}
					<div className="flex-1 min-h-0 border border-border rounded-md overflow-hidden">
						{/* Tab bar */}
						<div className="flex items-center gap-1 px-3 py-2 border-b border-border/40">
							<div className="h-6 w-28 rounded bg-muted/40" />
							<div className="h-6 w-12 rounded bg-muted/25" />
							<div className="h-6 w-24 rounded bg-muted/25" />
						</div>
						{/* Items */}
						<div className="divide-y divide-border/40">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex items-start gap-3 px-4 py-3">
									<div className="h-4 w-4 rounded-full bg-muted/40 mt-0.5 shrink-0" />
									<div className="flex-1 space-y-1.5">
										<div
											className="h-3.5 rounded bg-muted/35"
											style={{ width: `${140 + i * 30}px` }}
										/>
										<div className="h-2.5 w-28 rounded bg-muted/20" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Right column */}
				<div className="lg:w-1/2 flex flex-col gap-3 lg:pl-2">
					{/* Recently viewed */}
					<div className="border border-border rounded-md p-3">
						<div className="h-3.5 w-24 rounded bg-muted/35 mb-3" />
						<div className="flex gap-2">
							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={i}
									className="h-16 flex-1 rounded-md border border-border/40 bg-muted/15 p-2"
								>
									<div className="h-2.5 w-full rounded bg-muted/25 mb-1.5" />
									<div className="h-2 w-2/3 rounded bg-muted/15" />
								</div>
							))}
						</div>
					</div>

					{/* Repos + trending tabs */}
					<div className="flex-1 min-h-0 border border-border rounded-md overflow-hidden">
						<div className="flex items-center gap-1 px-3 py-2 border-b border-border/40">
							<div className="h-6 w-16 rounded bg-muted/40" />
							<div className="h-6 w-20 rounded bg-muted/25" />
						</div>
						<div className="divide-y divide-border/40">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="flex items-center gap-3 px-4 py-2.5">
									<div className="h-5 w-5 rounded bg-muted/30 shrink-0" />
									<div className="flex-1 space-y-1">
										<div
											className="h-3 rounded bg-muted/35"
											style={{ width: `${100 + i * 20}px` }}
										/>
										<div className="h-2 w-16 rounded bg-muted/15" />
									</div>
									<div className="h-3 w-8 rounded bg-muted/20" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
