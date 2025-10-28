import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pl-purple to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-pl-purple-light p-8 rounded-lg shadow-2xl text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-pl-pink"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-pl-green mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              The app encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-left text-xs text-gray-500 bg-pl-purple p-3 rounded mb-4">
                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                <pre className="overflow-x-auto">{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-pl-green text-pl-purple font-bold py-2 px-6 rounded-md hover:bg-white transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
