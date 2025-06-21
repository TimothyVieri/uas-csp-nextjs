'use client'

export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product, UserData } from '@/types'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Swal from 'sweetalert2'
// Impor ikon-ikon yang akan kita gunakan
import { PlusCircle, Edit, Trash2, X, LoaderCircle } from 'lucide-react'

// Komponen untuk tampilan loading (Skeleton)
const ProductListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg animate-pulse">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-24"></div>
            </div>
        ))}
    </div>
);


export default function Dashboard() {
    const [user, setUser] = useState<UserData | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true); // State untuk loading
    const [isModalOpen, setIsModalOpen] = useState(false); // State untuk membuka/menutup modal
    const [form, setForm] = useState<Omit<Product, 'id'> & { id?: number }>({
        nama_produk: '',
        harga_satuan: 0,
        quantity: 0,
    })
    const router = useRouter()

    const fetchProducts = async () => {
        setIsLoading(true);
        // Cukup ambil 'data' saja
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) {
            setProducts(data);
        }
        setIsLoading(false);
    }
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

    // Fungsi untuk membuka modal, bisa untuk 'tambah' atau 'edit'
    const handleOpenModal = (product: Product | null = null) => {
        if (product) {
            // Jika ada produk, kita sedang mengedit
            setForm({
                id: product.id,
                nama_produk: product.nama_produk,
                harga_satuan: product.harga_satuan,
                quantity: product.quantity,
            })
        } else {
            // Jika tidak, kita menambah produk baru
            setForm({
                nama_produk: '',
                harga_satuan: 0,
                quantity: 0,
            })
        }
        setIsModalOpen(true);
    }

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const isEditing = !!form.id;
            const { nama_produk, harga_satuan, quantity } = form;

            if (isEditing) {
                // Proses update
                const { error } = await supabase
                    .from('products')
                    .update({ nama_produk, harga_satuan, quantity })
                    .eq('id', form.id);
                if (error) throw error;
                Swal.fire('Berhasil', 'Produk berhasil diupdate.', 'success')
            } else {
                // Proses insert
                const { error } = await supabase
                    .from('products')
                    .insert({ nama_produk, harga_satuan, quantity });
                if (error) throw error;
                Swal.fire('Berhasil', 'Produk berhasil ditambahkan.', 'success')
            }

            await fetchProducts();
            handleCloseModal();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Terjadi error saat menyimpan data.'
            Swal.fire('Terjadi kesalahan!', message, 'error')
        }
    }

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Anda yakin?',
            text: "Produk yang dihapus tidak dapat dikembalikan.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        })

        if (result.isConfirmed) {
            await supabase.from('products').delete().eq('id', id)
            Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success')
            fetchProducts()
        }
    }

    // Tampilan loading utama saat user belum terotentikasi
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoaderCircle className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <Navbar />
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header Halaman */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Produk</h1>
                            <p className="mt-1 text-md text-gray-600">
                                Selamat datang kembali, <span className="font-semibold text-blue-600">{user.username}</span>!
                            </p>
                        </div>
                        {user.role === 'admin' && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                <PlusCircle size={20} />
                                Tambah Produk
                            </button>
                        )}
                    </div>

                    {/* Konten Utama: Loading, Empty, atau Daftar Produk */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        {isLoading ? (
                            <ProductListSkeleton />
                        ) : products.length === 0 ? (
                            <div className="text-center py-16">
                                <h3 className="text-xl font-semibold text-gray-800">Belum Ada Produk</h3>
                                <p className="text-gray-500 mt-2">Mulai dengan menambahkan produk pertama Anda.</p>
                                {user.role === 'admin' && (
                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="mt-4 flex mx-auto items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                                    >
                                        <PlusCircle size={20} />
                                        Tambah Produk
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {products.map((p) => (
                                    <div key={p.id} className="grid grid-cols-3 sm:grid-cols-5 items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="col-span-2 sm:col-span-2">
                                            <p className="font-semibold text-gray-800">{p.nama_produk}</p>
                                            <p className="text-sm text-gray-500">Qty: {p.quantity}</p>
                                        </div>
                                        <p className="text-gray-700 font-medium sm:text-left">
                                            Rp {p.harga_satuan.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-sm text-gray-500 hidden sm:block">
                                            ID: {p.id}
                                        </p>
                                        {user.role === 'admin' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(p)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal untuk Form Tambah/Edit Produk */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">{form.id ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                            <button onClick={handleCloseModal} className="p-1 hover:bg-gray-200 rounded-full">
                                <X size={22} className="text-gray-600" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Kopi Robusta"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={form.nama_produk}
                                    onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Satuan (Rp)</label>
                                <input
                                    type="number"
                                    placeholder="Contoh: 50000"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={form.harga_satuan}
                                    onChange={(e) => setForm({ ...form, harga_satuan: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    placeholder="Contoh: 100"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={form.quantity}
                                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                                    {form.id ? 'Simpan Perubahan' : 'Simpan Produk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}