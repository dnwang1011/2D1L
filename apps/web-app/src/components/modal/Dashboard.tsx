'use client';

export default function Dashboard() {
  return (
    <div className="center-fixed w-4/5 max-w-4xl max-h-4/5 overflow-hidden">
      <div className="glass-panel p-xl rounded-large modal-content overflow-y-auto max-h-full">
        {/* Dashboard Header */}
        <div className="mb-lg">
          <h1 className="text-headline-large text-sys-color-primary mb-sm">
            Cosmic Overview
          </h1>
          <p className="text-body-large text-sys-color-onSurface opacity-80">
            Your journey through the dimensions of growth
          </p>
        </div>

        {/* Growth Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-xl">
          {/* Self Knowledge */}
          <div className="glass-panel p-lg rounded-medium">
            <h3 className="text-title-large text-ref-palette-accent-reflectionAmethyst mb-sm">
              Self Knowledge
            </h3>
            <div className="text-display-medium text-sys-color-primary mb-xs">
              75%
            </div>
            <p className="text-body-small text-sys-color-onSurface opacity-70">
              Understanding your inner world
            </p>
          </div>

          {/* World Action */}
          <div className="glass-panel p-lg rounded-medium">
            <h3 className="text-title-large text-ref-palette-accent-growthAurora mb-sm">
              World Action
            </h3>
            <div className="text-display-medium text-sys-color-primary mb-xs">
              42%
            </div>
            <p className="text-body-small text-sys-color-onSurface opacity-70">
              Making impact in the world
            </p>
          </div>

          {/* Connection Strength */}
          <div className="glass-panel p-lg rounded-medium">
            <h3 className="text-title-large text-ref-palette-accent-connectionEmber mb-sm">
              Connections
            </h3>
            <div className="text-display-medium text-sys-color-primary mb-xs">
              127
            </div>
            <p className="text-body-small text-sys-color-onSurface opacity-70">
              Memory constellations formed
            </p>
          </div>
        </div>

        {/* Recent Insights */}
        <div className="mb-xl">
          <h2 className="text-title-large text-sys-color-primary mb-lg">
            Recent Insights
          </h2>
          <div className="space-y-md">
            <div className="glass-panel p-lg rounded-medium">
              <h4 className="text-title-medium text-sys-color-primary mb-sm">
                Pattern Discovery
              </h4>
              <p className="text-body-medium text-sys-color-onSurface">
                Your creativity peaks during evening reflection sessions. Consider scheduling important creative work during these times.
              </p>
            </div>
            <div className="glass-panel p-lg rounded-medium">
              <h4 className="text-title-medium text-sys-color-primary mb-sm">
                Growth Opportunity
              </h4>
              <p className="text-body-medium text-sys-color-onSurface">
                Your "communication skills" concept is ready to evolve. Try expressing your recent insights through a new medium.
              </p>
            </div>
          </div>
        </div>

        {/* Active Journeys */}
        <div>
          <h2 className="text-title-large text-sys-color-primary mb-lg">
            Active Journeys
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="glass-panel p-lg rounded-medium">
              <div className="flex items-center justify-between mb-sm">
                <h4 className="text-title-medium text-sys-color-primary">
                  Daily Reflection
                </h4>
                <span className="text-label-small text-ref-palette-accent-journeyGold">
                  3/7 days
                </span>
              </div>
              <div className="w-full bg-sys-color-outline rounded-full h-2 mb-sm">
                <div 
                  className="bg-ref-palette-accent-journeyGold h-2 rounded-full transition-all duration-medium1"
                  style={{ width: '43%' }}
                ></div>
              </div>
              <p className="text-body-small text-sys-color-onSurface opacity-70">
                Continue your daily reflection practice
              </p>
            </div>

            <div className="glass-panel p-lg rounded-medium">
              <div className="flex items-center justify-between mb-sm">
                <h4 className="text-title-medium text-sys-color-primary">
                  Connection Mapping
                </h4>
                <span className="text-label-small text-ref-palette-accent-growthAurora">
                  New
                </span>
              </div>
              <div className="w-full bg-sys-color-outline rounded-full h-2 mb-sm">
                <div 
                  className="bg-ref-palette-accent-growthAurora h-2 rounded-full transition-all duration-medium1"
                  style={{ width: '15%' }}
                ></div>
              </div>
              <p className="text-body-small text-sys-color-onSurface opacity-70">
                Explore relationships between your concepts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 