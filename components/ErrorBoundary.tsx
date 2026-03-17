import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
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
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest p-4 text-cornsilk">
                    <div className="max-w-xl rounded-xl border border-red-500/50 bg-black/50 p-8 shadow-2xl">
                        <h1 className="mb-4 text-3xl font-bold text-red-500">Something went wrong.</h1>
                        <p className="mb-4 text-lg">The application crashed with the following error:</p>
                        <pre className="mb-6 max-h-60 overflow-auto rounded bg-black/80 p-4 text-sm font-mono text-red-300">
                            {this.state.error?.message}
                            {'\n\n'}
                            {this.state.error?.stack}
                        </pre>
                        <button
                            className="rounded bg-cornsilk px-4 py-2 font-bold text-forest hover:bg-caramel"
                            onClick={() => window.location.reload()}
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
