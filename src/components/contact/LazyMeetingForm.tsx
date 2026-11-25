"use client";

import { Suspense, lazy, type ComponentProps } from "react";
import type { MeetingForm } from "./MeetingForm";

const Form = lazy(() => import("./MeetingForm").then((m) => ({ default: m.MeetingForm })));

/** The form is in the page from the start; its code is a file of its own, shared by all pages. */
export function LazyMeetingForm(props: ComponentProps<typeof MeetingForm>) {
  return <Suspense><Form {...props} /></Suspense>;
}
