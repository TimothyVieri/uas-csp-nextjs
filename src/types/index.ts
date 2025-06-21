export type UserRole = 'user' | 'admin'

export interface UserData {
    id: string
    username: string
    password: string
    role: UserRole
}

export interface Product {
    id: number
    nama_produk: string
    harga_satuan: number
    quantity: number
}
