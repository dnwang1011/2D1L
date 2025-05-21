export default function TodayPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Today View</h1>
      <p className="text-lg text-textDark">
        This page will provide a summary of your day, including recent activities, upcoming events, and proactive insights from Dot.
      </p>
      {/* Placeholder for Today's summary components */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-backgroundLight p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-secondary">Recent Memories</h2>
          <p className="text-textDark">List of recent journal entries or chat snippets...</p>
        </div>
        <div className="bg-backgroundLight p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-secondary">Insights</h2>
          <p className="text-textDark">Proactive insights from Dot will appear here...</p>
        </div>
        <div className="bg-backgroundLight p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-secondary">Quick Actions</h2>
          <p className="text-textDark">Links to start a new chat, journal, etc.</p>
        </div>
      </div>
    </div>
  );
} 