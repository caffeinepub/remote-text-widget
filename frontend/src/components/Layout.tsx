import { ReactNode } from 'react';
import { Heart } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'remote-text-widget'
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface text-foreground font-sans">
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t border-border/30">
        <span className="inline-flex items-center gap-1.5">
          Built with{' '}
          <Heart className="w-3 h-3 fill-neon text-neon" />
          {' '}using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </span>
        <span className="ml-3 text-muted-foreground/50">© {new Date().getFullYear()} Remote Text Widget</span>
      </footer>
    </div>
  );
}
