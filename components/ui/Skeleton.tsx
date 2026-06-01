"use client";

// components/ui/Skeleton.tsx — Loading skeletons con shimmer
//
// Variantes: text, circular, rectangular.
// Usa la animación shimmer del design system global.

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

function SkeletonLine({
  className = "",
  width,
  height,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: width || "100%", height: height || "16px" }}
      role="status"
      aria-label="Cargando..."
    />
  );
}

export default function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  if (variant === "circular") {
    const size = width || height || 40;
    return (
      <div
        className={`skeleton ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
        }}
        role="status"
        aria-label="Cargando..."
      />
    );
  }

  if (variant === "rectangular") {
    return (
      <div
        className={`skeleton ${className}`}
        style={{ width: width || "100%", height: height || "120px" }}
        role="status"
        aria-label="Cargando..."
      />
    );
  }

  // Text variant — supports multiple lines
  if (lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`} role="status" aria-label="Cargando...">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? "75%" : "100%"}
            height={height || "14px"}
          />
        ))}
      </div>
    );
  }

  return <SkeletonLine className={className} width={width} height={height} />;
}

// Pre-built skeleton for panel detalle
export function PanelDetalleSkeleton() {
  return (
    <div className="p-5 flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Skeleton variant="rectangular" width={80} height={24} className="!rounded-full" />
        <Skeleton width={100} height={14} />
      </div>
      <Skeleton lines={3} height={16} />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={60} />
      </div>
      <Skeleton variant="rectangular" height={48} />
      <div className="flex gap-3 pt-2">
        <Skeleton variant="rectangular" width="33%" height={44} className="!rounded-xl" />
        <Skeleton variant="rectangular" width="33%" height={44} className="!rounded-xl" />
        <Skeleton variant="rectangular" width="33%" height={44} className="!rounded-xl" />
      </div>
    </div>
  );
}
