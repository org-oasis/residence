import { Component, type ErrorInfo, type ReactNode } from "react";
import { log } from "@/lib/logger";

interface Props {
  children: ReactNode;
  /** Optional fallback UI; defaults to a minimal "something went wrong" panel. */
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * React error boundary — catches render-tree errors and renders a fallback
 * instead of unmounting the whole app. Routes errors to the central logger.
 *
 * React still has no first-party hook equivalent for boundaries; the class
 * API is the canonical pattern (https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    log.error(error, { componentStack: info.componentStack });
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 text-center"
          >
            <h2 className="text-2xl font-bold">Something went wrong.</h2>
            <p className="text-muted-foreground max-w-md">
              An unexpected error occurred. Please refresh the page or contact support if the
              issue persists.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
