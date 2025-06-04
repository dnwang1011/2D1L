'use client';

import { useState } from 'react';

// Mock card data - will be replaced with real data from API
const mockCards = [
  {
    id: '1',
    title: 'Creative Expression',
    description: 'Your journey in exploring artistic outlets and creative thinking patterns.',
    evolutionState: 'bloom',
    growthDimensions: ['self_know', 'self_show'],
    lastUpdated: '2 days ago',
  },
  {
    id: '2', 
    title: 'Sarah (Friend)',
    description: 'Deep friendship built on mutual support and shared experiences.',
    evolutionState: 'constellation',
    growthDimensions: ['world_know', 'world_show'],
    lastUpdated: '1 week ago',
  },
  {
    id: '3',
    title: 'Communication Skills',
    description: 'Developing better ways to express thoughts and connect with others.',
    evolutionState: 'sprout',
    growthDimensions: ['self_act', 'world_act'],
    lastUpdated: '3 days ago',
  },
  {
    id: '4',
    title: 'Morning Routine',
    description: 'Building consistent habits that set a positive tone for each day.',
    evolutionState: 'seed',
    growthDimensions: ['self_act'],
    lastUpdated: '5 days ago',
  },
];

const evolutionColors = {
  seed: 'text-gray-400',
  sprout: 'text-green-400',
  bloom: 'text-blue-400',
  constellation: 'text-purple-400',
  supernova: 'text-yellow-400',
};

const evolutionIcons = {
  seed: '🌱',
  sprout: '🌿',
  bloom: '🌸',
  constellation: '⭐',
  supernova: '💫',
};

export default function CardGallery() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <div className="center-fixed w-5/6 max-w-6xl max-h-5/6 overflow-hidden">
      <div className="glass-panel p-xl rounded-large modal-content overflow-y-auto max-h-full">
        {/* Gallery Header */}
        <div className="mb-xl">
          <h1 className="text-headline-large text-sys-color-primary mb-sm">
            Knowledge Gallery
          </h1>
          <p className="text-body-large text-sys-color-onSurface opacity-80">
            Explore your evolving constellation of memories and insights
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-sm mb-xl">
          <button className="btn-primary text-xs px-md py-sm">
            All Cards
          </button>
          <button className="btn-secondary text-xs px-md py-sm">
            Recent
          </button>
          <button className="btn-secondary text-xs px-md py-sm">
            Evolving
          </button>
          <button className="btn-secondary text-xs px-md py-sm">
            Connections
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {mockCards.map((card) => (
            <div
              key={card.id}
              className={`card-base cursor-pointer transition-all duration-medium1 ${
                selectedCard === card.id ? 'card-hover' : ''
              }`}
              onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <span className="text-lg">
                    {evolutionIcons[card.evolutionState as keyof typeof evolutionIcons]}
                  </span>
                  <span className={`text-label-small font-medium ${evolutionColors[card.evolutionState as keyof typeof evolutionColors]}`}>
                    {card.evolutionState}
                  </span>
                </div>
                <span className="text-label-small text-sys-color-onSurface opacity-60">
                  {card.lastUpdated}
                </span>
              </div>

              {/* Card Content */}
              <h3 className="text-title-large text-sys-color-primary mb-sm">
                {card.title}
              </h3>
              <p className="text-body-medium text-sys-color-onSurface opacity-80 mb-md">
                {card.description}
              </p>

              {/* Growth Dimensions */}
              <div className="flex flex-wrap gap-xs">
                {card.growthDimensions.map((dimension) => (
                  <span
                    key={dimension}
                    className="text-label-small px-sm py-xs rounded-small bg-sys-color-primaryContainer text-sys-color-onPrimaryContainer"
                  >
                    {dimension.replace('_', ' ')}
                  </span>
                ))}
              </div>

              {/* Expanded Content */}
              {selectedCard === card.id && (
                <div className="mt-lg pt-lg border-t border-sys-color-outline animate-fade-in">
                  <h4 className="text-title-medium text-sys-color-primary mb-sm">
                    Recent Connections
                  </h4>
                  <div className="space-y-xs">
                    <div className="text-body-small text-sys-color-onSurface opacity-70">
                      → Connected to &quot;Personal Growth&quot; 3 days ago
                    </div>
                    <div className="text-body-small text-sys-color-onSurface opacity-70">
                      → Influenced by &quot;Daily Reflection&quot; 1 week ago
                    </div>
                  </div>
                  
                  <div className="flex gap-sm mt-md">
                    <button className="btn-primary text-xs px-sm py-xs">
                      Explore
                    </button>
                    <button className="btn-secondary text-xs px-sm py-xs">
                      Connect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-xl">
          <button className="btn-secondary px-xl py-md">
            Load More Cards
          </button>
        </div>
      </div>
    </div>
  );
} 