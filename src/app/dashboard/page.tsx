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
    }, [router]) // <-- Perbaikan untuk dependency warning (sudah benar)

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

    // GANTI SELURUH FUNGSI INI DENGAN VERSI YANG SUDAH DIPERBAIKI
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (form.id) {
                // Bagian untuk UPDATE produk
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
                // Bagian untuk INSERT produk
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
        } catch (err: unknown) { // <-- PERBAIKAN UTAMA: Mengatasi error 'any'
            // Logika penanganan error yang lebih aman
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
            <div className="min-h-screen bg-gray-100 p-8 text-black">
                <div className="max-w-5xl mx-auto bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">
                        Welcome, <span className="text-blue-600">{user.username}</span>
                    </h1>

                    {user.role === 'admin' && (
                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                        >
                            <div className="flex flex-col">
                                <label className="text-sm font-semibold mb-1">Nama Produk</label>
                                <input
                                    placeholder="Nama Produk"
                                    className="border p-2 rounded"
                                    value={form.nama_produk}
                                    onChange={(e) =>
                                        setForm({ ...form, nama_produk: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-semibold mb-1">Harga Satuan</label>
                                <input
                                    placeholder="Harga"
                                    className="border p-2 rounded"
                                    type="number"
                                    value={form.harga_satuan}
                                    onChange={(e) =>
                                        setForm({ ...form, harga_satuan: Number(e.target.value) })
                                    }
                                    required
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-semibold mb-1">Quantity</label>
                                <input
                                    placeholder="Qty"
                                    className="border p-2 rounded"
                                    type="number"
                                    value={form.quantity}
                                    onChange={(e) =>
                                        setForm({ ...form, quantity: Number(e.target.value) })
                                    }
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                >
                                    {form.id ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        <table className="table-auto w-full text-sm border border-gray-200">
                            <thead className="bg-blue-100 text-left">
                                <tr>
                                    <th className="p-3 border">Nama Produk</th>
                                    <th className="p-3 border">Harga</th>
                                    <th className="p-3 border">Qty</th>
                                    {user.role === 'admin' && (
                                        <th className="p-3 border text-center">Aksi</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="p-3 border">{p.nama_produk}</td>
                                        <td className="p-3 border">Rp {p.harga_satuan.toLocaleString()}</td>
                                        <td className="p-3 border">{p.quantity}</td>
                                        {user.role === 'admin' && (
                                            <td className="p-3 border text-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={user.role === 'admin' ? 4 : 3}
                                            className="text-center py-4"
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
        </>
    )
}