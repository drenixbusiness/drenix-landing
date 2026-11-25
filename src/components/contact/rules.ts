export type FieldName = "name" | "phone" | "email";

/** What is wrong with a value, or null. */
export const rules: Record<FieldName, (v: string) => string | null> = {
  name: (v) => (v.trim().length >= 2 ? null : "Enter your name"),
  phone: (v) => (v.replace(/\D/g, "").length >= 7 ? null : "Enter a phone number with the code, for example +998 90 123 45 67"),
  email: (v) => (!v.trim() || /^\S+@\S+\.\S{2,}$/.test(v.trim()) ? null : "Check the email address, for example name@company.com"),
};

export const fieldLabels: Record<FieldName, string> = { name: "Your name", phone: "Phone", email: "Email" };
