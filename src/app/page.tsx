import { ChatContainer } from '@/components/chat/ChatContainer';
import { Building2, MapPin, Sparkles, Clock, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col border-r bg-muted/30">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Tandem</h1>
              <p className="text-xs text-muted-foreground">Office Space Matchmaker</p>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Find your perfect
              <span className="gradient-text block">office space</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-powered office matching for San Francisco and New York City.
              Tell us about your team and we&apos;ll find spaces that fit.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <FeatureItem
              icon={<Sparkles className="h-4 w-4" />}
              title="Smart Matching"
              description="AI analyzes your needs and finds perfect fits"
            />
            <FeatureItem
              icon={<MapPin className="h-4 w-4" />}
              title="Prime Locations"
              description="SOMA, FiDi, Flatiron, Chelsea & more"
            />
            <FeatureItem
              icon={<Clock className="h-4 w-4" />}
              title="Fast Process"
              description="From search to lease in minutes, not weeks"
            />
            <FeatureItem
              icon={<FileText className="h-4 w-4" />}
              title="Instant Leases"
              description="Generate draft lease agreements instantly"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <StatCard value="16+" label="Available Spaces" />
            <StatCard value="2" label="Cities" />
            <StatCard value="$4k-30k" label="Price Range" />
            <StatCard value="6-60mo" label="Lease Terms" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            No brokers. No pressure. Just perfect spaces.
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Tandem</h1>
              <p className="text-xs text-muted-foreground">Office Space Matchmaker</p>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden">
          <ChatContainer />
        </div>
      </main>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-background/50 border">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-3 rounded-lg bg-background/50 border text-center">
      <p className="text-lg font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
