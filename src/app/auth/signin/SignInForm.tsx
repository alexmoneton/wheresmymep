'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/alerts',
      });

      if (result?.error) {
        setMessage('Error sending sign-in email. Please try again.');
      } else {
        setMessage('Check your email for a sign-in link!');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Sign in to your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send sign-in link'}
          </button>
        </div>

        {message && (
          <div className={`text-sm text-center ${
            message.includes('Check your email') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </div>
        )}
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">How it works</span>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2">
            <strong>1.</strong> Enter your email address above
          </p>
          <p className="mb-2">
            <strong>2.</strong> Check your email for a secure sign-in link
          </p>
          <p>
            <strong>3.</strong> Click the link to access your alerts dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

