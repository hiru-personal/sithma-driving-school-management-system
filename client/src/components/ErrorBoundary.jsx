import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFCFE] text-[#152026]">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-white border-2 border-[#D4EEF8] shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59]">
              <AlertTriangle className="w-8 h-8 text-[#1B3D59]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-[#152026]">Something went wrong</h1>
              <p className="text-sm text-[#6A97C0]">
                An unexpected error occurred while rendering this page.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-4 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-left font-mono text-xs text-rose-800 overflow-x-auto max-h-40">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-secondary w-full sm:w-auto px-6 py-2.5 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
