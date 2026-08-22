import type { DefaultSession } from 'next-auth'
import type { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'HR' | 'EMPLOYEE'
      name: string
      email: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: 'ADMIN' | 'HR' | 'EMPLOYEE'
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: 'ADMIN' | 'HR' | 'EMPLOYEE'
  }
}
