// Re-mounts on every navigation, giving each route a short, fast fade-up.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
