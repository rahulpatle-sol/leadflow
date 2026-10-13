export default function DashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
      <div className="h-10 animate-pulse rounded-xl bg-ink/5" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-ink/5"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-ink/5" />
    </main>
  );
}
