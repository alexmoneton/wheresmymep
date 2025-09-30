'use client'

import { useState, useEffect } from 'react'
import { useFlag, type FlagName } from '@/lib/useFlag'
import { ENV_DEFAULTS, FLAG_VERSION, resetFlagsToDefaults } from '@/lib/flags'
import { Button } from '@/components/shadcn/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'
import { Badge } from '@/components/shadcn/ui/badge'
import { RefreshCw, ExternalLink } from 'lucide-react'

export default function DebugFlagsPage() {
  const [localStorageValues, setLocalStorageValues] = useState<Record<string, string>>({})
  const [hasOverrides, setHasOverrides] = useState(false)

  // Get all flag values
  const [alertsEnabled] = useFlag('alerts')
  const [csvEnabled] = useFlag('csv')
  const [changesEnabled] = useFlag('changes')
  const [actradarEnabled] = useFlag('actradar')

  const flagValues = {
    alerts: alertsEnabled,
    csv: csvEnabled,
    changes: changesEnabled,
    actradar: actradarEnabled,
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Read localStorage values
    const values: Record<string, string> = {}
    const flagKeys = ['ff_alerts', 'ff_csv', 'ff_changes', 'ff_actradar', 'ff_version']
    
    flagKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value !== null) {
        values[key] = value
      }
    })

    setLocalStorageValues(values)
    setHasOverrides(flagKeys.some(key => key !== 'ff_version' && localStorage.getItem(key) !== null))
  }, [alertsEnabled, csvEnabled, changesEnabled, actradarEnabled])

  const handleResetOverrides = () => {
    resetFlagsToDefaults()
    // Reload to show updated values
    window.location.reload()
  }

  const getFlagStatus = (flagName: FlagName) => {
    const envDefault = ENV_DEFAULTS[flagName]
    const hasOverride = typeof window !== 'undefined' ? localStorage.getItem(`ff_${flagName}`) !== null : false
    const effectiveValue = flagValues[flagName]
    
    return {
      envDefault,
      hasOverride,
      effectiveValue,
      source: hasOverride ? 'localStorage' : 'env'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Feature Flags Debug
          </h1>
          <p className="text-gray-600">
            Debug page for feature flag configuration and overrides
          </p>
        </div>

        <div className="grid gap-6">
          {/* Environment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Configuration</CardTitle>
              <CardDescription>
                Default values from environment variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Flag Version:</span>
                  <Badge variant="outline">{FLAG_VERSION}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Has Overrides:</span>
                  <Badge variant={hasOverrides ? "default" : "secondary"}>
                    {hasOverrides ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Environment Defaults:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(ENV_DEFAULTS, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Flag Status */}
          <Card>
            <CardHeader>
              <CardTitle>Flag Status</CardTitle>
              <CardDescription>
                Current effective values for each feature flag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(flagValues).map(([flagName, value]) => {
                  const status = getFlagStatus(flagName as FlagName)
                  return (
                    <div key={flagName} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium capitalize">{flagName}</span>
                        <Badge variant={value ? "default" : "secondary"}>
                          {value ? "ON" : "OFF"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {status.source}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Env: {status.envDefault ? "ON" : "OFF"}
                        {status.hasOverride && " (overridden)"}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* LocalStorage Values */}
          <Card>
            <CardHeader>
              <CardTitle>LocalStorage Values</CardTitle>
              <CardDescription>
                Raw localStorage values for debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(localStorageValues).length > 0 ? (
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(localStorageValues, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No localStorage overrides found</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Quick actions for testing and debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleResetOverrides} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Overrides
                </Button>
                
                <Button asChild variant="outline">
                  <a href="/?all=on">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    All ON
                  </a>
                </Button>
                
                <Button asChild variant="outline">
                  <a href="/?all=off">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    All OFF
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
