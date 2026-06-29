import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const clerkPubKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '').trim()
const isClerkConfigured = Boolean(clerkPubKey)

if (!isClerkConfigured) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY. Set it in admin/.env.local before running the app.')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isClerkConfigured ? (
      <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/">
        <App isClerkConfigured />
      </ClerkProvider>
    ) : (
      <App isClerkConfigured={false} />
    )}
  </React.StrictMode>,
)
