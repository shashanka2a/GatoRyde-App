'use client'

import { useAuth } from '@/lib/auth/useAuth'
import { Button } from '@/src/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { User, LogOut, Car, Settings, Mail } from 'lucide-react'
import Link from 'next/link'

export function AuthNavigation() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
    )
  }

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
    )
  }

  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoUrl || undefined} alt={user.name || user.email} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name || 'Student'}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            {user.university && (
              <p className="text-xs text-muted-foreground">
                {user.university}
              </p>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/drive">
            <Car className="mr-2 h-4 w-4" />
            My Rides
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/profile/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}