'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from '@/frontend/lib/utils.ts'

interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'recruiter' | 'admin'
  avatar?: string
}

interface AppContextType {
  user: User | null
  socket: Socket | null
  setUser: (user: User | null) => void
}

const AppContext = createContext<AppContextType>({
  user: null,
  socket: null,
  setUser: () => {},
})

export const useApp = () => useContext(AppContext)

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      autoConnect: false
    })

    setSocket(newSocket)

    // Check for existing session
    const token = localStorage.getItem('token')
    if (token) {
      // Validate token and set user
      // This would typically be done with an API call
    }

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    if (user && socket) {
      socket.auth = { userId: user.id }
      socket.connect()
    } else if (socket) {
      socket.disconnect()
    }
  }, [user, socket])

  return (
    <AppContext.Provider value={{ user, socket, setUser }}>
      {children}
    </AppContext.Provider>
  )
}