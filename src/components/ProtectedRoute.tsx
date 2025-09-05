'use client'

import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import AuthDialog from '@/components/AuthDialog'
import { Lock } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('buyer' | 'supplier')[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isLoggedIn, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e33f3f] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Demo Access Required</h2>
          <p className="text-gray-600 mb-4">
            <span className="text-green-600 font-medium">🎯 DEMO MODE:</span> Use any email and password to access this page instantly!
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-left mb-6">
            <div className="text-blue-800 font-medium mb-1">💡 Quick Demo Login:</div>
            <div className="text-blue-700">
              • Email: demo@company.com<br/>
              • Password: demo123<br/>
              • Or use any email/password combination!
            </div>
          </div>
          <AuthDialog>
            <Button className="w-full mbs-red mbs-red-hover">
              🚀 Instant Demo Access (Any Login Works!)
            </Button>
          </AuthDialog>
        </div>
      </div>
    )
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This page is restricted to {allowedRoles.join(' and ')} accounts only.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
