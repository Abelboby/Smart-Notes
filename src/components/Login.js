import React from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = ({ setUser }) => {
  const signIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => setUser(result.user))
      .catch((error) => console.log(error));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Notes Sharing Platform
          </h2>
          <p className="text-sm text-gray-600">
            Your personal space for creating and sharing knowledge
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-500 to-indigo-600">
            <h3 className="text-xl font-bold text-white text-center">
              Welcome Back!
            </h3>
          </div>

          {/* Card Content */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Why choose our platform?
                </h4>
                <ul className="space-y-3">
                  {[
                    'Create and edit notes with a beautiful interface',
                    'Share notes securely with friends via email',
                    'Get AI-powered summaries and insights',
                    'Access from any device, anywhere'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sign In Button */}
              <button
                onClick={signIn}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.607,1.972-2.101,3.467-4.073,4.073v-3.536 c0-1.054-0.855-1.909-1.909-1.909h0c-1.054,0-1.909,0.855-1.909,1.909v3.536c-1.972-0.607-3.467-2.101-4.073-4.073h3.536 c1.054,0,1.909-0.855,1.909-1.909v0c0-1.054-0.855-1.909-1.909-1.909H5.988c0.607-1.972,2.101-3.467,4.073-4.073v3.536 c0,1.054,0.855,1.909,1.909,1.909h0c1.054,0,1.909-0.855,1.909-1.909V6.169c1.972,0.607,3.467,2.101,4.073,4.073h-3.536 C13.4,10.242,12.545,11.097,12.545,12.151z" />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;