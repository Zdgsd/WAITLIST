import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// FIX: Changed to extend `Component` directly and updated the import.
// This resolves a TypeScript error where the inherited `props` property was not being recognized.
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">SYSTEM ERROR</h1>
            <p className="text-lg md:text-xl text-gray-400">A critical error has occurred in the application.</p>
            <p className="text-lg text-gray-500 mt-2">Please refresh the page to try again.</p>
            <pre className="mt-6 p-4 bg-gray-900/50 border border-[var(--terminal-green)]/30 rounded-lg text-left text-sm text-red-400 max-w-xl overflow-auto">
                ERROR CODE: UI_RENDER_FAILURE
                <br />
                TRACE ID: {Date.now()}
                <br />
                STATUS: Unrecoverable
            </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
