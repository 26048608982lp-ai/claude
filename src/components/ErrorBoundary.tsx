import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-xl max-w-md w-full text-center">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">💔</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6">
              The app encountered an unexpected error. Please refresh the page or try again later.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-500/20 rounded-lg p-4 mb-4 sm:mb-6 text-left">
                <p className="text-white font-semibold mb-2">Error Details:</p>
                <p className="text-white/80 text-xs sm:text-sm mb-2">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <p className="text-white/60 text-xs">
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-qixi-pink to-qixi-purple text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-qixi-pink/80 hover:to-qixi-purple/80 transition-all duration-300"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-white/20 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-white/30 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;