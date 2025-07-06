'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, Server, Database, Clock } from "lucide-react"

interface StatsData {
  totalUsers: number
  activeUsers: number
  totalLevels: number
  ratedLevels: number
  serverUptime: string
  avgResponseTime: number
  dbConnections: number
  cacheHitRate: number
  trends: {
    usersChange: number
    levelsChange: number
    performanceChange: number
  }
}

export default function AdvancedStats() {
  // Mock data - replace with real API calls
  const stats: StatsData = {
    totalUsers: 15420,
    activeUsers: 1230,
    totalLevels: 8950,
    ratedLevels: 2340,
    serverUptime: "15d 8h 23m",
    avgResponseTime: 145,
    dbConnections: 8,
    cacheHitRate: 94.2,
    trends: {
      usersChange: 12.5,
      levelsChange: 8.3,
      performanceChange: -2.1
    }
  }

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-1">
              <TrendIcon value={stats.trends.usersChange} />
              <p className="text-xs text-muted-foreground">
                +{stats.trends.usersChange}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <Progress value={(stats.activeUsers / stats.totalUsers) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Levels</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLevels.toLocaleString()}</div>
            <div className="flex items-center space-x-1">
              <TrendIcon value={stats.trends.levelsChange} />
              <p className="text-xs text-muted-foreground">
                +{stats.trends.levelsChange}% this week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rated Levels</CardTitle>
            <Badge variant="secondary" className="h-4">
              {((stats.ratedLevels / stats.totalLevels) * 100).toFixed(1)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ratedLevels.toLocaleString()}</div>
            <Progress value={(stats.ratedLevels / stats.totalLevels) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Performance</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uptime</span>
                <span className="font-mono">{stats.serverUptime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Response Time</span>
                <span className="font-mono">{stats.avgResponseTime}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>DB Connections</span>
                <span className="font-mono">{stats.dbConnections}/10</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Performance</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cacheHitRate}%</div>
            <Progress value={stats.cacheHitRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Cache hit rate (last 24h)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Server</span>
              <Badge variant="default" className="bg-green-500">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge variant="default" className="bg-green-500">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Redis Cache</span>
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Real-time activity monitoring coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}