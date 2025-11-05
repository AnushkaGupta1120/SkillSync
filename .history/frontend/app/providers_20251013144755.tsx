'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from '@/lib/utils'

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
    const newSocket = io(SOCKET_URL, { autoConnect: false })
    setSocket(newSocket)
    // Optional: Check for user token and set user
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    // Fetch and set user here if needed
    return () => {
      if (newSocket) newSocket.disconnect()
    }
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
