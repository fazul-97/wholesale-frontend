interface QuantityDiffProps { requested: number; confirmed: number | null | undefined; unit: string }

export function QuantityDiff({ requested, confirmed, unit }: QuantityDiffProps) {
  const changed = confirmed != null && confirmed !== requested;
  return (
    <span className="flex items-center gap-1.5">
      {changed ? (
        <>
          <span className="line-through text-gray-400">{requested} {unit}</span>
          <span className="font-semibold text-amber-600">{confirmed} {unit}</span>
        </>
      ) : (
        <span>{requested} {unit}</span>
      )}
    </span>
  );
}
