import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCw, Home, PhoneCall } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Soulaide ErrorBoundary Caught Exception]:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 text-slate-800">
          <Card className="w-full max-w-lg bg-white shadow-xl border-slate-200 overflow-hidden">
            <CardHeader className="bg-rose-50 border-b border-rose-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Terjadi Kendala Sistem
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Sistem Soulaide mengamankan data dan sesi Anda
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Mohon maaf atas ketidaknyamanan ini. Terjadi kendala teknis tak terduga pada antarmuka. Seluruh data asesmen dan rekam medis Anda tetap tersimpan dengan aman di server terlindungi kami.
              </p>

              {this.state.error && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs font-mono break-all max-h-32 overflow-y-auto">
                  {this.state.error.message || 'Unknown runtime error'}
                </div>
              )}

              {/* Crisis Escalation Link */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-950">Sedang dalam kondisi krisis mendesak?</p>
                  <p className="text-[11px] text-amber-800">Hubungi Hotline Kesehatan Jiwa Kemenkes 24 Jam.</p>
                </div>
                <a href="tel:119,8" className="shrink-0">
                  <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100 gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                    <span>119 ext. 8</span>
                  </Button>
                </a>
              </div>
            </CardContent>

            <CardFooter className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleGoHome}
                className="text-xs gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ke Beranda</span>
              </Button>
              <Button
                size="sm"
                onClick={this.handleReload}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
