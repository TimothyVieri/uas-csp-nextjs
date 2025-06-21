'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { UserData } from '@/types'


export default function SignInPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single<UserData>()

        if (error || !data) {
            setError('Invalid credentials')
        } else {
            localStorage.setItem('user', JSON.stringify(data))
            router.push('/dashboard')
        }
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 text-black">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 shadow-md rounded w-96 space-y-4"
            >
                <h1 className="text-xl font-bold text-center">Sign In</h1>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    className="w-full border px-3 py-2"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    className="w-full border px-3 py-2"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded"
                >
                    Sign In
                </button>
                {error && <p className="text-red-600 text-center">{error}</p>}
            </form>
        </div>
    )
}
