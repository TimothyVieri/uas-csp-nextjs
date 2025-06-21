'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product, UserData } from '@/types'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Swal from 'sweetalert2'

export default function Dashboard() {
    const [user, setUser] = useState<UserData | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [form, setForm] = useState<Omit<Product, 'id'> & { id?: number }>({
        nama_produk: '',
        harga_satuan: 0,
        quantity: 0,
    })
    const router = useRouter()

    useEffect(() => {
        const data = localStorage.getItem('user')
        if (!data) {
            router.push('/signin')
            return
        }
        const parsed: UserData = JSON.parse(data)
        setUser(parsed)
        fetchProducts()
    }, [router])

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*')
        if (data) setProducts(data)
    }

    const handleDelete = async (id: number) => {
        const confirm = await Swal.fire({
            title: 'Yakin ingin menghapus produk?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        })

        if (!confirm.isConfirmed) return

        await supabase.from('products').delete().eq('id', id)
        fetchProducts()
    }

    const handleEdit = (p: Product) => {
        setForm({ ...p })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (form.id) {
                const confirm = await Swal.fire({
                    title: 'Simpan perubahan?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, simpan',
                    cancelButtonText: 'Batal',
                })

                if (!confirm.isConfirmed) return

                const { error } = await supabase
                    .from('products')
                    .update({
                        nama_produk: form.nama_produk,
                        harga_satuan: form.harga_satuan,
                        quantity: form.quantity,
                    })
                    .eq('id', form.id)

                if (error) throw new Error('Gagal update produk.')
                Swal.fire('Berhasil', 'Produk berhasil diupdate.', 'success')
            } else {
                const { error } = await supabase.from('products').insert({
                    nama_produk: form.nama_produk,
                    harga_satuan: form.harga_satuan,
                    quantity: form.quantity,
                })

                if (error) throw new Error('Gagal menambahkan produk.')
                Swal.fire('Berhasil', 'Produk berhasil ditambahkan.', 'success')
            }

            await fetchProducts()
            setForm({ nama_produk: '', harga_satuan: 0, quantity: 0 })
        } catch (err: unknown) {
            let message = 'Terjadi error tidak dikenal saat menyimpan data.'
            if (err instanceof Error) {
                message = err.message
            }
            Swal.fire({
                title: 'Terjadi kesalahan!',
                text: message,
                icon: 'error',
            })
        }
    }

    if (!user) return null

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6 text-black">
                <div className="max-w-6xl mx-auto space-y-8">
                    <h1 className="text-3xl font-bold text-center text-gray-800">
                        Selamat Datang, <span className="text-blue-600">{user.username}</span>
                    </h1>

                    {user.role === 'admin' && (
                        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                                {form.id ? 'Edit Produk' : 'Tambah Produk'}
                            </h2>
                            <form
                                onSubmit={handleSubmit}
                                className="grid grid-cols-1 md:grid-cols-4 gap-5"
                            >
                                <div className="flex flex-col">
                                    <label className="text-sm mb-1 text-gray-600">Nama Produk</label>
                                    <input
                                        className="border rounded-lg p-2 focus:outline-blue-500"
                                        value={form.nama_produk}
                                        onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
                                        placeholder="Contoh: Buku Tulis"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm mb-1 text-gray-600">Harga Satuan</label>
                                    <input
                                        type="number"
                                        className="border rounded-lg p-2 focus:outline-blue-500"
                                        value={form.harga_satuan}
                                        onChange={(e) =>
                                            setForm({ ...form, harga_satuan: Number(e.target.value) })
                                        }
                                        placeholder="Contoh: 15000"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm mb-1 text-gray-600">Quantity</label>
                                    <input
                                        type="number"
                                        className="border rounded-lg p-2 focus:outline-blue-500"
                                        value={form.quantity}
                                        onChange={(e) =>
                                            setForm({ ...form, quantity: Number(e.target.value) })
                                        }
                                        placeholder="Contoh: 10"
                                        required
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-all ${form.id
                                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                                : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                    >
                                        {form.id ? 'Update' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                            Daftar Produk
                        </h2>
                        <div className="overflow-x-auto rounded-lg">
                            <table className="min-w-full text-sm">
                                <thead className="bg-blue-100 text-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 border">Nama Produk</th>
                                        <th className="px-4 py-2 border">Harga</th>
                                        <th className="px-4 py-2 border">Qty</th>
                                        {user.role === 'admin' && (
                                            <th className="px-4 py-2 border text-center">Aksi</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-2 border">{p.nama_produk}</td>
                                            <td className="px-4 py-2 border">Rp {p.harga_satuan.toLocaleString()}</td>
                                            <td className="px-4 py-2 border">{p.quantity}</td>
                                            {user.role === 'admin' && (
                                                <td className="px-4 py-2 border text-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={user.role === 'admin' ? 4 : 3}
                                                className="text-center py-6 text-gray-500"
                                            >
                                                Tidak ada data produk.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
