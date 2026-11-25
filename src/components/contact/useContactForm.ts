"use client";

import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { rules, type FieldName } from "./rules";
import { sendRequest } from "./sendRequest";

export type FormStatus = "idle" | "sending" | "done" | "error";

/**
 * Validation and sending shared by the contact form and the short meeting form.
 * Fields are checked when the visitor leaves them and again on submit.
 */
export function useContactForm(fields: FieldName[], payload: (fd: FormData) => Record<string, unknown>) {
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [summary, setSummary] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);
  useEffect(() => {
    if (summary) summaryRef.current?.focus();
  }, [summary]);

  const check = (name: FieldName, value: string) => {
    const message = rules[name](value);
    setErrors((e) => {
      const next = { ...e };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
    return message;
  };

  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.currentTarget.name as FieldName;
    // Leaving an untouched field is not a mistake yet
    if (fields.includes(name) && (e.currentTarget.value || errors[name])) check(name, e.currentTarget.value);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const found = fields.filter((n) => check(n, String(fd.get(n) ?? "")));
    setSummary(false);
    if (found.length > 1) {
      // Wait a tick so the list is in the page before it gets focus
      requestAnimationFrame(() => setSummary(true));
      return;
    }
    if (found.length === 1) {
      form.querySelector<HTMLInputElement>(`[name="${found[0]}"]`)?.focus();
      return;
    }
    setStatus("sending");
    setStatus((await sendRequest(fd, payload(fd))) ? "done" : "error");
  }

  return { errors, summary, status, onSubmit, onBlur, summaryRef, doneRef };
}
