interface AppBrandProps {
  compact?: boolean;
}

export function AppBrand({ compact = false }: AppBrandProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
        <span className="text-primary-foreground" style={{ fontSize: 11, fontWeight: 600 }}>
          M
        </span>
      </div>
      {!compact && <span style={{ fontSize: 15, fontWeight: 600 }}>MindMark</span>}
    </div>
  );
}
