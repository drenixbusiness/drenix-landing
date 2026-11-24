"use client";

import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";

export type FormStatus = "idle" | "sending" | "done" | "error";
export type FieldName = "name" | "phone" | "email";

const rules: Record<FieldName, (v: string) => string | null> = {
  name: (v) => (v.trim().length >= 2 ? null : "Enter your name"),
  phone: (v) => (v.replace(/\D/g, "").length >= 7 ? null : "Enter a phone number with the code, for example +998 90 123 45 67"),
  email: (v) => (!v.trim() || /^\S+@\S+\.\S{2,}$/.test(v.trim()) ? null : "Check the email address, for example name@company.com"),
};

export const fieldLabels: Record<FieldName, string> = { name: "Your name", phone: "Phone", email: "Email" };

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
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fd.get("name"), phone: fd.get("phone"), email: fd.get("email"), website: fd.get("website"), ...payload(fd) }),
        signal: AbortSignal.timeout(15000),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return { errors, summary, status, onSubmit, onBlur, summaryRef, doneRef };
}
