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
import { Search, Star, Eye, Download, Edit, Trash2 } from "lucide-react"

interface Level {
  id: number
  name: string
  author: string
  difficulty: string
  stars: number
  downloads: number
  likes: number
  featured: boolean
  status: 'pending' | 'approved' | 'rejected'
  uploadDate: string
}

export default function LevelManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDifficulty] = useState("all")

  // Mock data
  const levels: Level[] = [
    {
      id: 1,
      name: "Bloodbath",
      author: "Riot",
      difficulty: "Extreme Demon",
      stars: 10,
      downloads: 1500000,
      likes: 45000,
      featured: true,
      status: 'approved',
      uploadDate: '2023-12-01'
    },
    {
      id: 2,
      name: "Theory of Everything 2",
      author: "RobTop",
      difficulty: "Harder",
      stars: 6,
      downloads: 2000000,
      likes: 80000,
      featured: true,
      status: 'approved',
      uploadDate: '2023-11-15'
    },
    {
      id: 3,
      name: "Custom Level",
      author: "Player123",
      difficulty: "Hard",
      stars: 0,
      downloads: 150,
      likes: 12,
      featured: false,
      status: 'pending',
      uploadDate: '2024-01-10'
    }
  ]

  const filteredLevels = levels.filter(level => {
    const matchesSearch = level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         level.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || level.status === filterStatus
    const matchesDifficulty = filterDifficulty === "all" || level.difficulty === filterDifficulty
    
    return matchesSearch && matchesStatus && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'Auto': 'bg-gray-500',
      'Easy': 'bg-green-500',
      'Normal': 'bg-blue-500',
      'Hard': 'bg-yellow-500',
      'Harder': 'bg-orange-500',
      'Insane': 'bg-red-500',
      'Extreme Demon': 'bg-purple-500'
    }
    return colors[difficulty] || 'bg-gray-500'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-500',
      'approved': 'bg-green-500',
      'rejected': 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Level Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Levels</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label>Status Filter</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level Info</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLevels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{level.name}</span>
                        <span className="text-sm text-muted-foreground">ID: {level.id}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>{level.author}</TableCell>
                    
                    <TableCell>
                      <Badge className={`${getDifficultyColor(level.difficulty)} text-white`}>
                        {level.difficulty}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" /> {level.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" /> {level.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {level.likes.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getStatusColor(level.status)} text-white capitalize`}>
                        {level.status}
                      </Badge>
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
                              <DialogTitle>Rate Level: {level.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="stars">Star Rating (0-10)</Label>
                                <Input
                                  id="stars"
                                  type="number"
                                  min="0"
                                  max="10"
                                  defaultValue={level.stars}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select defaultValue={level.difficulty}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Auto">Auto</SelectItem>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                    <SelectItem value="Harder">Harder</SelectItem>
                                    <SelectItem value="Insane">Insane</SelectItem>
                                    <SelectItem value="Extreme Demon">Extreme Demon</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button className="flex-1" variant="default">
                                  Approve
                                </Button>
                                <Button className="flex-1" variant="destructive">
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
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
          
          {filteredLevels.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No levels found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}