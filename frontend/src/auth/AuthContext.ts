import { createContext } from 'react'

export type AccountRole = 'admin' | 'customer' | 'musician'
export type User = {
  id: string
  fullName: string
  email: string
  phone: string
  role: AccountRole
  isActive: boolean
}

export type AuthContextValue = {
  user: User | null
  loading: boolean
  sessionError: string
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>
  register: (input: {
    fullName: string
    email: string
    password: string
    phone: string
    role: 'customer' | 'musician'
  }) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
