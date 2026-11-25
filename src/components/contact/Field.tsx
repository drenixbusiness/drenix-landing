"use client";

import type { FocusEvent, InputHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";
import { box } from "./box";

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

/** Hidden trap for bots. */
export function Honeypot() {
  return <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />;
}
