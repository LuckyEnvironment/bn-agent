const DEFAULT_ACTIVE = [3, 4, 10, 11, 15];

export function PatchPanel({
  total = 18,
  active = DEFAULT_ACTIVE,
}: {
  total?: number;
  active?: number[];
}) {
  return (
    <div className="patchpanel">
      {Array.from({ length: total }, (_, i) => {
        const on = active.includes(i);
        const cls = on ? (i % 2 === 0 ? "jack on-copper" : "jack on-teal") : "jack";
        return (
          <div key={i} className={cls}>
            <div className="pin" />
          </div>
        );
      })}
    </div>
  );
}

export function JackStrip({ states }: { states: ("off" | "copper" | "teal")[] }) {
  return (
    <div className="jack-strip">
      {states.map((s, i) => (
        <div key={i} className={s === "off" ? "jack" : `jack on-${s}`}>
          <div className="pin" />
        </div>
      ))}
    </div>
  );
}
