'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('')

    useEffect(() => {
        const data = localStorage.getItem('user')
        if (data) {
            const user = JSON.parse(data)
            setUsername(user.username)
            setRole(user.role)
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('user')
        router.push('/signin')
    }

    return (
        <nav className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <div className="text-xl font-semibold text-blue-600">📦 UAS Dashboard</div>

            <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-700">
                    Welcome, <strong>{username}</strong> <span className="text-xs bg-gray-200 px-2 py-0.5 rounded ml-2">{role}</span>
                </span>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}
