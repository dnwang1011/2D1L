// apps/web-app/src/components/auth/LoginModal.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useModalStore } from '../../stores/ModalStore';
// import { useUserStore } from '../../stores/UserStore'; // Uncomment when UserStore is fully integrated
// import { apiClient } from '../../lib/apiClient'; // Uncomment for API calls

// Mock/Placeholder UserStore if not fully implemented
const useUserStore = () => ({
  login: (token: string, userData: any) => console.log('Mock UserStore: Login called', token, userData),
});


export default function LoginModal() {
  const { closeModal, setActiveModal } = useModalStore();
  const { login } = useUserStore(); // Get login action from store

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log('Attempting login with:', { email, password });

    // TODO: Replace with actual API call
    // try {
    //   // const response = await apiClient.post('/auth/login', { email, password });
    //   // if (response.data && response.data.token && response.data.user) {
    //   //   login(response.data.token, response.data.user);
    //   //   closeModal();
    //   //   // Optionally redirect: router.push('/app/home');
    //   // } else {
    //   //   setError('Login failed. Invalid response from server.');
    //   // }
    // } catch (err: any) {
    //   setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    // } finally {
    //   setIsLoading(false);
    // }

    // Simulate API call
    setTimeout(() => {
      if (email === "test@example.com" && password === "password") {
        console.log("Simulated successful login");
        // login("fake-jwt-token", { id: "123", email: email, name: "Test User" }); // Example
        closeModal();
      } else {
        setError('Invalid credentials (mock response).');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal p-4 transition-opacity duration-300 ease-out">
      <div className="glass-panel p-8 md:p-12 rounded-xl w-full max-w-md relative animate-scale-in">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-sys-color-onSurface/70 hover:text-sys-color-onSurface text-3xl leading-none"
          aria-label="Close login modal"
        >
          ×
        </button>
        <h2 className="text-headline-medium font-brand text-sys-color-primary mb-8 text-center">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="login-email" className="block text-label-large text-sys-color-onSurface opacity-80 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-sys-color-surfaceContainer/50 text-sys-color-onSurface border border-sys-color-outline rounded-medium focus:ring-2 focus:ring-sys-color-primary outline-none placeholder:text-sys-color-onSurfaceVariant/50"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="login-password" className="block text-label-large text-sys-color-onSurface opacity-80">
                Password
              </label>
              <button
                type="button"
                onClick={() => console.log('Forgot password clicked')} // Placeholder
                className="text-label-medium text-sys-color-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-sys-color-surfaceContainer/50 text-sys-color-onSurface border border-sys-color-outline rounded-medium focus:ring-2 focus:ring-sys-color-primary outline-none"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-ref-palette-error text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full py-3 text-lg mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-8 text-body-medium text-sys-color-onSurface opacity-80">
          Don't have an account?{' '}
          <button
            onClick={() => {
              closeModal(); // Close login modal first
              setActiveModal('signUp'); // Then open sign up modal
            }}
            className="font-medium text-sys-color-primary hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}