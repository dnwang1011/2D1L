// apps/web-app/src/components/auth/SignUpModal.tsx
'use client';

import { useState, FormEvent } from 'react';

import { useModalStore } from '../../stores/ModalStore';
// import { useUserStore } from '../../stores/UserStore'; // Uncomment when UserStore is fully integrated
// import { apiClient } from '../../lib/apiClient'; // Uncomment for API calls

// Mock/Placeholder UserStore if not fully implemented
// const useUserStore = () => ({
//   login: (token: string, userData: any) => console.log('Mock UserStore: Login called after signup', token, userData),
// });


export default function SignUpModal() {
  const { closeModal, setActiveModal } = useModalStore();
  // const { login } = useUserStore(); // Commented out as unused

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // const [login, { loading, error, data: loginData }] = useMutation(LOGIN_MUTATION); // Commented out

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    console.log('Attempting sign up with:', { email, password });

    // TODO: Replace with actual API call to /api/auth/signup
    // try {
    //   // const response = await apiClient.post('/auth/signup', { email, password });
    //   // if (response.data && response.data.token && response.data.user) {
    //   //   login(response.data.token, response.data.user); // Log user in immediately after sign up
    //   //   closeModal();
    //   //   // Optionally redirect: router.push('/app/home');
    //   // } else {
    //   //   setError('Sign up failed. Invalid response from server.');
    //   // }
    // } catch (err: any) {
    //   setError(err.response?.data?.message || 'Sign up failed. Please try again.');
    // } finally {
    //   setIsLoading(false);
    // }

    // Simulate API call
    setTimeout(() => {
      // Simulate success for now
      console.log("Simulated successful sign up");
      // login("fake-jwt-token-signup", { id: "456", email: email, name: "New User" }); // Example
      closeModal();
      // setError('Sign up functionality not yet connected to backend. This is a mock success.');
      alert('Mock Sign Up Successful! You would now be logged in.');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-modal p-4 transition-opacity duration-300 ease-out">
      <div className="glass-panel p-8 md:p-12 rounded-xl w-full max-w-md relative animate-scale-in">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-sys-color-onSurface/70 hover:text-sys-color-onSurface text-3xl leading-none"
          aria-label="Close sign up modal"
        >
          ×
        </button>
        <h2 className="text-headline-medium font-brand text-sys-color-primary mb-8 text-center">
          Create Your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="signup-email" className="block text-label-large text-sys-color-onSurface opacity-80 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-sys-color-surfaceContainer/50 text-sys-color-onSurface border border-sys-color-outline rounded-medium focus:ring-2 focus:ring-sys-color-primary outline-none placeholder:text-sys-color-onSurfaceVariant/50"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-label-large text-sys-color-onSurface opacity-80 mb-2">
              Password
            </label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 bg-sys-color-surfaceContainer/50 text-sys-color-onSurface border border-sys-color-outline rounded-medium focus:ring-2 focus:ring-sys-color-primary outline-none"
              placeholder="Minimum 8 characters"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="signup-confirm-password" className="block text-label-large text-sys-color-onSurface opacity-80 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="signup-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 bg-sys-color-surfaceContainer/50 text-sys-color-onSurface border border-sys-color-outline rounded-medium focus:ring-2 focus:ring-sys-color-primary outline-none"
              placeholder="Re-enter your password"
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-ref-palette-error text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full py-3 text-lg mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-8 text-body-medium text-sys-color-onSurface opacity-80">
          Already have an account?{' '}
          <button
            onClick={() => {
              closeModal(); // Close sign up modal first
              setActiveModal('login'); // Then open login modal
            }}
            className="font-medium text-sys-color-primary hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}