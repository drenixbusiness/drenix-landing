"use client";

import { Suspense, lazy, type ComponentProps } from "react";
import type { DepartmentTour } from "./DepartmentTour";

const Tour = lazy(() => import("./DepartmentTour").then((m) => ({ default: m.DepartmentTour })));

/** The text is in the page from the start; the code comes with the page itself, not with every link to it. */
export function LazyDepartmentTour(props: ComponentProps<typeof DepartmentTour>) {
  return <Suspense><Tour {...props} /></Suspense>;
}
