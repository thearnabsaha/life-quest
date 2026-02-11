'use client';

export interface StatStrengthHeatmapItem {
  label: string;
  value: number;
  max: number;
}

interface StatStrengthHeatmapProps {
  data: StatStrengthHeatmapItem[];
  title?: string;
}

export function StatStrengthHeatmap({ data, title }: StatStrengthHeatmapProps) {
  const maxVal = Math.max(
    1,
    ...data.map((d) => (d.max > 0 ? d.value / d.max : 0))
  );

  const getOpacity = (value: number, max: number) => {
    if (max <= 0) return 0.2;
    const ratio = value / max;
    if (ratio <= 0) return 0.1;
    return 0.2 + ratio * 0.8;
  };

  const labelMaxLen = 12;
  const truncate = (s: string) =>
    s.length > labelMaxLen ? s.slice(0, labelMaxLen - 2) + '..' : s;

  return (
    <div className="w-full">
      {title && (
        <h3 className="font-heading text-xs text-zinc-400 mb-3">{title}</h3>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {data.map((item, i) => {
          const opacity = getOpacity(item.value, item.max);
          return (
            <div
              key={i}
              className="border-2 border-zinc-700 p-3 flex flex-col items-center justify-center min-h-[72px]"
              style={{
                backgroundColor: `rgba(57, 255, 20, ${opacity})`,
              }}
            >
              <span className="font-mono text-xs text-zinc-300 text-center line-clamp-2">
                {truncate(item.label)}
              </span>
              <span className="font-mono text-sm font-semibold text-neonGreen mt-1">
                {item.value}
                {item.max > 0 ? `/${item.max}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
