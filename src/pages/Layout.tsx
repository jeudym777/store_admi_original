export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 animate-fade-in">{children}</div>
    </div>
  );
}
