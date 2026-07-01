import React from "react";
import { EvaAvatar } from "@/components/EvaAvatar";

/** Global JS error boundary — prevents a broken component from taking down the whole app. */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // Log to console; a future improvement can POST to /api/health/audit
    console.error("EvaOne UI error:", error, info);
  }
  handleReset = () => {
    this.setState({ error: null });
    window.location.href = "/";
  };
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#030304] text-white flex items-center justify-center px-6">
          <div className="eva-glass rounded-3xl p-10 max-w-md w-full text-center">
            <div className="flex justify-center">
              <EvaAvatar state="thinking" size={110} showLabel={false} />
            </div>
            <div className="label-eyebrow mt-6 text-red-300">SOMETHING BROKE</div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Eva ran into an unexpected error.</h2>
            <p className="mt-2 text-sm text-white/55">
              The system stayed safe. You can reload the app and continue where you left off.
            </p>
            <pre className="mt-4 text-[10px] font-mono text-white/40 whitespace-pre-wrap max-h-32 overflow-y-auto bg-white/[0.02] p-3 rounded-lg border border-white/5">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={this.handleReset}
              className="mt-6 btn-cyan rounded-xl px-5 py-3 text-sm font-medium w-full"
              data-testid="error-boundary-reload"
            >
              Reload EvaOne
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
