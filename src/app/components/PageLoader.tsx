interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({ label = "Загрузка..." }: PageLoaderProps) {
  return (
    <div className="container mx-auto px-4 max-w-7xl flex items-center justify-center min-h-[60vh]">
      <div className="text-center loader-pulse">
        <div className="loader-ring mx-auto mb-4" />
        <p className="text-text-dim">{label}</p>
      </div>
    </div>
  );
}
