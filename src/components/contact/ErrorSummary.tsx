"use client";

import type { Ref } from "react";
import { Icon } from "@/components/ui/Icon";
import { fieldLabels, type FieldName } from "./rules";

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
