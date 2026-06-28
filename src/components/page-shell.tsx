export function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={`mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 ${className}`}>
      {children}
    </main>
  );
}
