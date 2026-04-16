import { headers } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'finance-dashboard-dev-secret'

export interface UserToken {
  id: string
  role: 'ADMIN' | 'ANALYST' | 'VIEWER'
}

export async function getAuthUser(): Promise<UserToken | null> {
  const headersList = await headers()
  const authHeader = headersList.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token || '', JWT_SECRET!) as unknown as UserToken
    return decoded
  } catch (error) {
    return null
  }
}

export function authorizeRole(user: UserToken | null, allowedRoles: string[]) {
  if (!user) return false
  return allowedRoles.includes(user.role)
}
