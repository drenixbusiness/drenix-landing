"use client";

import type { FocusEvent, InputHTMLAttributes, Ref } from "react";
import { Icon } from "@/components/ui/Icon";
import { fieldLabels, type FieldName } from "./useContactForm";

const box =
  "mt-1.5 w-full rounded-xl border bg-white px-4 text-[16px] text-graphite transition-colors placeholder:text-smoke/70 focus:border-graphite focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ember-deep";

type Props = {
  label: string;
  name: string;
  id: string;
  required?: boolean;
  error?: string;
  hint?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "type" | "autoComplete" | "inputMode" | "placeholder">;

export function Field({ label, name, id, required, error, hint, ...rest }: Props) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="text-[15px] font-medium">
        {label}
        {required ? <span className="text-ember-text"> *</span> : <span className="font-normal text-smoke"> (optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${box} h-12 ${error ? "border-[#b3261e]" : "border-graphite/25"}`}
        {...rest}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-[14px] text-smoke">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-2 text-[14px] text-[#b3261e]">
          <Icon name="alert" className="mt-0.5 size-4" /> {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({ label, name, id, placeholder }: { label: string; name: string; id: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-[15px] font-medium">{label}<span className="font-normal text-smoke"> (optional)</span></label>
      <textarea id={id} name={name} rows={4} placeholder={placeholder} className={`${box} resize-y border-graphite/25 py-3`} />
    </div>
  );
}

/** List of mistakes after a failed submit. Receives focus, and each item jumps to its field. */
export function ErrorSummary({ errors, prefix, ref }: { errors: Partial<Record<FieldName, string>>; prefix: string; ref: Ref<HTMLDivElement> }) {
  const list = Object.keys(errors) as FieldName[];
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="rounded-xl border border-[#b3261e]/40 bg-[#fdf1ef] p-4 text-[15px]">
      <p className="flex items-center gap-2 font-semibold text-[#8c1d18]"><Icon name="alert" className="size-5" /> Please check the form</p>
      <ul className="mt-2 space-y-1 pl-7">
        {list.map((n) => (
          <li key={n}>
            <a
              href={`#${prefix}-${n}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`${prefix}-${n}`)?.focus();
              }}
              className="underline underline-offset-4"
            >
              {fieldLabels[n]}: {errors[n]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Hidden trap for bots. */
export function Honeypot() {
  return <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />;
}
