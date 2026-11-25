import { box } from "./box";

export function TextArea({ label, name, id, placeholder }: { label: string; name: string; id: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-[15px] font-medium">{label}<span className="font-normal text-smoke"> (optional)</span></label>
      <textarea id={id} name={name} rows={4} placeholder={placeholder} className={`${box} resize-y border-graphite/25 py-3`} />
    </div>
  );
}
