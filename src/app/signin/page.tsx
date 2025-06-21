'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { UserData } from '@/types'
import { User, Lock, LoaderCircle, AlertTriangle } from 'lucide-react'

export default function SignInPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false) // State untuk loading
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isLoading) return; // Mencegah double-click

        setIsLoading(true)
        setError('')

        try {
            // Ini adalah metode login yang sangat tidak aman untuk produksi!
            // Hanya untuk tujuan demonstrasi.
            // Di produksi, Anda harus menggunakan Supabase Auth (signInWithPassword).
            const { data, error: queryError } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password) // <- Sangat tidak aman
                .single<UserData>()

            if (queryError || !data) {
                // Memberikan pesan error yang lebih spesifik
                if (queryError && queryError.code === 'PGRST116') {
                    setError('Username atau password salah.')
                } else {
                    setError('Terjadi kesalahan. Silakan coba lagi.')
                }
                return;
            }

            // Jika berhasil
            localStorage.setItem('user', JSON.stringify(data))
            router.push('/dashboard')

        } catch (_err) { // Tambahkan underscore di sini
            setError('Terjadi kesalahan tak terduga.')
        } finally {
            
            setIsLoading(false) // Selalu matikan loading state di akhir
        }
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-black px-4">
            <div className="w-full max-w-md">
                {/* Judul Aplikasi (Opsional) */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">Nama Aplikasi Anda</h1>
                    <p className="text-gray-500">Silakan masuk untuk melanjutkan ke dashboard</p>
                </div>

                <div className="bg-white p-8 shadow-xl rounded-2xl border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-2xl font-semibold text-center text-gray-800">Sign In</h2>

                        {/* Input Username */}
                        <div>
                            <label htmlFor="username" className="text-sm font-medium text-gray-700 sr-only">Username</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                </span>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700 sr-only">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Pesan Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Tombol Submit dengan Loading State */}
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <LoaderCircle className="h-6 w-6 animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <div className="text-center text-sm">
                            <p className="text-gray-500">
                                Belum punya akun?{' '}
                                <a href="#" className="font-medium text-blue-600 hover:underline">
                                    Hubungi admin
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}