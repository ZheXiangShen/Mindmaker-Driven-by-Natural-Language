export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6 bg-background text-foreground">
      <div>
        <h1 className="mb-2">404</h1>
        <p className="text-muted-foreground" style={{ fontSize: 14 }}>
          页面未找到
        </p>
      </div>
    </div>
  );
}
