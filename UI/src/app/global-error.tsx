"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
        <div className="max-w-md text-center">
          <h2 className="mb-2">系统发生错误</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "请稍后重试"}
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
