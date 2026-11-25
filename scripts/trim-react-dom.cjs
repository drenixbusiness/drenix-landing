/* eslint-disable @typescript-eslint/no-require-imports */
const { createHash } = require("node:crypto");

/**
 * Build step: leaves out parts of React DOM that this site never uses, about a tenth of its code.
 *
 * The functions below belong to features that only run when a page asks for them: <ViewTransition>,
 * <SuspenseList>, useActionState, custom elements, the event methods of Fragment refs, and the component
 * stacks React adds to error logs. Emptying them changes nothing else, and the minifier then drops
 * everything only they used.
 *
 * The list was checked against the exact file shipped with Next 16.4.6. With any other file the step does
 * nothing, so updating Next is safe: the build prints a note and React is used as it is.
 */
const KNOWN_FILE = "2a7d14c51ceeb9d361c12c74de89d1d8e1eb1407279014ae497b3ebbb473b7e5";

const EMPTY = [
  // <ViewTransition>
  "getViewTransitionName", "getViewTransitionClassName", "trackEnterViewTransitions", "applyViewTransitionToHostInstances",
  "applyViewTransitionToHostInstancesRecursive", "restoreViewTransitionOnHostInstances", "commitAppearingPairViewTransitions",
  "commitEnterViewTransitions", "commitDeletedPairViewTransitions", "commitExitViewTransitions", "commitNestedViewTransitions",
  "restorePairedViewTransitions", "restoreEnterOrExitViewTransitions", "restoreNestedViewTransitions",
  "measureViewTransitionHostInstancesRecursive", "measureNestedViewTransitions", "scheduleViewTransitionEvent",
  "reportViewTransitionError", "applyViewTransitionName", "restoreViewTransitionName", "createMeasurement", "startViewTransition",
  "ViewTransitionPseudoElement", "createViewTransitionInstance", "commitAfterMutationEffectsOnFiber",
  "recursivelyTraverseAfterMutationEffects", "flushAfterMutationEffects",
  // <SuspenseList>
  "updateSuspenseListComponent", "findFirstSuspended", "cutOffTailIfNeeded", "initSuspenseListRenderState",
  // useActionState
  "mountActionState", "updateActionStateImpl", "rerenderActionState", "dispatchActionState", "runActionStateAction",
  "handleActionReturnValue", "onActionSuccess", "onActionError",
  // Custom elements
  "setPropOnCustomElement",
  // Loading indicator of the browser during transitions: Next passes its own
  "defaultOnDefaultTransitionIndicator",
  // Names of components in error messages
  "getComponentNameFromType",
];

/** Component stacks in error logs. */
const EMPTY_STRING = ["describeNativeComponentFrame", "describeBuiltInComponentFrame", "getStackByFiberInDevAndProd"];

/** Methods of Fragment refs. Next uses getClientRects and scrollIntoView, which stay. */
const FRAGMENT_METHODS = ["compareDocumentPosition", "addEventListener", "removeEventListener", "dispatchEvent", "observeUsing", "unobserveUsing", "focus", "focusLast", "blur"];

module.exports = function trimReactDom(source) {
  // The dev server uses the development version of React
  if (process.env.NODE_ENV !== "production") return source;
  const hash = createHash("sha256").update(source.replace(/\r\n/g, "\n")).digest("hex");
  if (hash !== KNOWN_FILE) {
    console.warn(`[trim-react-dom] React DOM has changed (${hash.slice(0, 12)}), left as it is`);
    return source;
  }
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  /** Replaces a top-level block: from its first line to the next line that closes it in column 0. */
  const replace = (start, end, text) => {
    const a = lines.findIndex((l) => l.startsWith(start));
    const b = a < 0 ? -1 : lines.findIndex((l, i) => i > a && l === end);
    if (b < 0) throw new Error(`[trim-react-dom] not found: ${start}`);
    lines.splice(a, b - a + 1, text);
  };
  for (const name of EMPTY) replace(`function ${name}(`, "}", `function ${name}() {}`);
  for (const name of EMPTY_STRING) replace(`function ${name}(`, "}", `function ${name}() { return ""; }`);
  for (const name of FRAGMENT_METHODS) replace(`FragmentInstance.prototype.${name} = `, "};", "");
  for (const name of ["animate", "getAnimations", "getComputedStyle"]) replace(`ViewTransitionPseudoElement.prototype.${name} = `, "};", "");
  replace("ReactDOMSharedInternals.findDOMNode = ", "};", "ReactDOMSharedInternals.findDOMNode = function () { return null; };");
  return lines.join("\n");
};
