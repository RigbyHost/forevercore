'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Shield, Ban, Edit, Trash2, Crown } from "lucide-react"

interface User {
  id: number
  username: string
  email: string
  role: 'user' | 'moderator' | 'admin'
  status: 'active' | 'banned' | 'suspended'
  joinDate: string
  lastActive: string
  levels: number
  stars: number
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus] = useState("all")

  // Mock data
  const users: User[] = [
    {
      id: 1,
      username: "RobTop",
      email: "robtop@geometrydash.com",
      role: 'admin',
      status: 'active',
      joinDate: '2013-08-13',
      lastActive: '2024-01-15',
      levels: 21,
      stars: 149
    },
    {
      id: 2,
      username: "Riot",
      email: "riot@example.com",
      role: 'moderator',
      status: 'active',
      joinDate: '2014-03-20',
      lastActive: '2024-01-14',
      levels: 45,
      stars: 1250
    },
    {
      id: 3,
      username: "Player123",
      email: "player123@example.com",
      role: 'user',
      status: 'active',
      joinDate: '2023-11-05',
      lastActive: '2024-01-10',
      levels: 3,
      stars: 89
    },
    {
      id: 4,
      username: "Spammer",
      email: "spammer@example.com",
      role: 'user',
      status: 'banned',
      joinDate: '2024-01-01',
      lastActive: '2024-01-05',
      levels: 0,
      stars: 0
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'moderator': return <Shield className="h-4 w-4 text-blue-500" />
      default: return null
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'admin': 'bg-yellow-500',
      'moderator': 'bg-blue-500',
      'user': 'bg-gray-500'
    }
    return colors[role] || 'bg-gray-500'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-500',
      'banned': 'bg-red-500',
      'suspended': 'bg-orange-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label>Role Filter</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="moderator">Moderators</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="font-medium">{user.username}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getRoleColor(user.role)} text-white capitalize`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getStatusColor(user.status)} text-white capitalize`}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{user.levels} levels</span>
                        <span>{user.stars} stars</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">{user.lastActive}</span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit User: {user.username}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="role">Role</Label>
                                <Select defaultValue={user.role}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="moderator">Moderator</SelectItem>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button className="flex-1" variant="default">
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm" className="text-orange-600">
                          <Ban className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}