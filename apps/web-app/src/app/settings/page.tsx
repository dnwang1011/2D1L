export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Settings</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-secondary">Profile</h2>
          <div className="bg-backgroundLight p-6 rounded-lg shadow-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-textDark">Name</label>
              <input type="text" defaultValue="Current User Name" className="mt-1 block w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-textDark">Email</label>
              <input type="email" defaultValue="user@example.com" disabled className="mt-1 block w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"/>
            </div>
            <button className="px-4 py-2 bg-accent text-white rounded-md hover:bg-opacity-80">Update Profile</button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-secondary">Preferences</h2>
          <div className="bg-backgroundLight p-6 rounded-lg shadow-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-textDark">Theme</label>
              <select className="mt-1 block w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option>Light</option>
                <option>Dark</option>
                <option>System Default</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textDark">Notifications</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-secondary" defaultChecked />
                  <span className="ml-2 text-textDark">Email Notifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-secondary" />
                  <span className="ml-2 text-textDark">Push Notifications</span>
                </label>
              </div>
            </div>
            <button className="px-4 py-2 bg-accent text-white rounded-md hover:bg-opacity-80">Save Preferences</button>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-secondary">Data Management</h2>
          <div className="bg-backgroundLight p-6 rounded-lg shadow-md space-y-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Export My Data</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete My Account</button>
          </div>
        </section>
      </div>
    </div>
  );
} 