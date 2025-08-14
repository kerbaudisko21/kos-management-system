"use client"

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
    Calendar,
    Home,
    Users,
    CreditCard,
    Bell,
    Search,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    Clock,
    Download,
    Menu,
    X
} from 'lucide-react';

const KosManagementSystem = () => {
    // State Management
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bookingType, setBookingType] = useState('monthly');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // --- MOCK DATA (replace with API calls in a real application) ---
    const [rooms] = useState([
        {
            id: 1,
            number: 'A01',
            type: 'Standard',
            price: 800000,
            status: 'available',
            floor: 1,
            facilities: ['AC', 'WiFi', 'Lemari']
        },
        {
            id: 2,
            number: 'A02',
            type: 'Standard',
            price: 800000,
            status: 'occupied',
            floor: 1,
            facilities: ['AC', 'WiFi', 'Lemari'],
            tenant: 'Ahmad Rizki'
        },
        {
            id: 3,
            number: 'A03',
            type: 'Deluxe',
            price: 1200000,
            status: 'available',
            floor: 1,
            facilities: ['AC', 'WiFi', 'Lemari', 'TV', 'Kulkas']
        },
        {
            id: 4,
            number: 'B01',
            type: 'Standard',
            price: 800000,
            status: 'maintenance',
            floor: 2,
            facilities: ['AC', 'WiFi', 'Lemari']
        },
        {
            id: 5,
            number: 'B02',
            type: 'Premium',
            price: 1500000,
            status: 'occupied',
            floor: 2,
            facilities: ['AC', 'WiFi', 'Lemari', 'TV', 'Kulkas', 'Balkon'],
            tenant: 'Sari Dewi'
        },
        {
            id: 6,
            number: 'B03',
            type: 'Standard',
            price: 800000,
            status: 'available',
            floor: 2,
            facilities: ['AC', 'WiFi', 'Lemari']
        },
    ]);

    const [tenants] = useState([
        {
            id: 1,
            name: 'Ahmad Rizki',
            room: 'A02',
            phone: '0812-3456-7890',
            checkIn: '2024-01-15',
            type: 'monthly',
            paymentStatus: 'paid',
            lastPayment: '2024-08-01'
        },
        {
            id: 2,
            name: 'Sari Dewi',
            room: 'B02',
            phone: '0813-9876-5432',
            checkIn: '2024-02-01',
            type: 'monthly',
            paymentStatus: 'pending',
            lastPayment: '2024-07-01'
        },
        {
            id: 3,
            name: 'Budi Santoso',
            room: 'C01',
            phone: '0814-1111-2222',
            checkIn: '2024-08-10',
            type: 'daily',
            checkOut: '2024-08-15',
            paymentStatus: 'paid',
            lastPayment: '2024-08-10'
        },
    ]);

    const [payments] = useState([
        {
            id: 1,
            tenant: 'Ahmad Rizki',
            room: 'A02',
            amount: 800000,
            date: '2024-08-01',
            type: 'monthly',
            status: 'confirmed',
            method: 'Transfer Bank'
        },
        {
            id: 2,
            tenant: 'Budi Santoso',
            room: 'C01',
            amount: 150000,
            date: '2024-08-10',
            type: 'daily',
            status: 'confirmed',
            method: 'Cash'
        },
        {
            id: 3,
            tenant: 'Sari Dewi',
            room: 'B02',
            amount: 1200000,
            date: '2024-07-01',
            type: 'monthly',
            status: 'confirmed',
            method: 'Transfer Bank'
        },
    ]);
    // --- END OF MOCK DATA ---

    // Derived state for dashboard stats
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
    const availableRooms = rooms.filter(room => room.status === 'available').length;
    const pendingPayments = tenants.filter(tenant => tenant.paymentStatus === 'pending').length;
    const monthlyRevenue = payments
        .filter(payment => payment.date.startsWith('2024-08') && payment.status === 'confirmed')
        .reduce((sum, payment) => sum + payment.amount, 0);

    // --- HELPER & LAYOUT COMPONENTS ---

    const StatCard = ({title, value, icon, color}) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            red: 'bg-red-100 text-red-600',
            indigo: 'bg-indigo-100 text-indigo-600',
        };
        return (
            <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${colors[color]}`}>
                        {icon}
                    </div>
                </div>
            </div>
        );
    };

    StatCard.propTypes = {
        title: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        icon: PropTypes.element.isRequired,
        color: PropTypes.string.isRequired,
    };

    const InputField = ({label, type, placeholder, focusColor = 'blue'}) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-${focusColor}-500`}
            />
        </div>
    );

    InputField.propTypes = {
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        focusColor: PropTypes.string,
    };

    const RadioPill = ({id, name, value, label, checked, onChange}) => (
        <div className="flex-1">
            <input type="radio" id={id} name={name} value={value} className="hidden peer" checked={checked}
                   onChange={onChange}/>
            <label htmlFor={id}
                   className="block text-center w-full px-4 py-2 rounded-lg border border-gray-300 cursor-pointer peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-colors">
                {label}
            </label>
        </div>
    );

    RadioPill.propTypes = {
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        checked: PropTypes.bool.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    // --- SUB-COMPONENTS FOR EACH TAB ---

    const Dashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Kamar" value={totalRooms} icon={<Home className="h-6 w-6 text-blue-600"/>}
                          color="blue"/>
                <StatCard title="Kamar Terisi" value={occupiedRooms} icon={<Users className="h-6 w-6 text-green-600"/>}
                          color="green"/>
                <StatCard title="Kamar Tersedia" value={availableRooms}
                          icon={<CheckCircle className="h-6 w-6 text-indigo-600"/>} color="indigo"/>
                <StatCard title="Pembayaran Pending" value={pendingPayments}
                          icon={<Bell className="h-6 w-6 text-red-600"/>} color="red"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Keuangan</h3>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                        Rp {monthlyRevenue.toLocaleString('id-ID')}
                    </div>
                    <p className="text-sm text-gray-600">Total pendapatan bulan ini
                        dari {payments.filter(p => p.date.startsWith('2024-08')).length} transaksi.</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
                    <ul className="space-y-4">
                        <li key="activity-1" className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-full"><CheckCircle
                                className="h-4 w-4 text-green-600"/></div>
                            <p className="text-sm text-gray-600">Ahmad Rizki melakukan pembayaran kamar A02.</p>
                        </li>
                        <li key="activity-2" className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-full"><Users className="h-4 w-4 text-blue-600"/>
                            </div>
                            <p className="text-sm text-gray-600">Budi Santoso check-in kamar C01.</p>
                        </li>
                        <li key="activity-3" className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-full"><Clock className="h-4 w-4 text-red-600"/></div>
                            <p className="text-sm text-gray-600">Sari Dewi pembayaran tertunda.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const RoomManagement = () => {
        const filteredRooms = rooms.filter(room =>
            room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (room.tenant && room.tenant.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        const getStatusPill = (status) => {
            const styles = {
                available: 'bg-green-100 text-green-800',
                occupied: 'bg-red-100 text-red-800',
                maintenance: 'bg-yellow-100 text-yellow-800',
            };
            const text = {
                available: 'Tersedia',
                occupied: 'Terisi',
                maintenance: 'Maintenance',
            };
            return (
                <span className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${styles[status]}`}>
              {text[status]}
            </span>
            );
        };

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Manajemen Kamar</h2>
                    <button
                        onClick={() => setShowBookingModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm hover:shadow-md"
                    >
                        <Plus className="h-4 w-4"/>
                        <span>Tambah Booking</span>
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                    <input
                        type="text"
                        placeholder="Cari kamar (nomor, tipe, atau nama penghuni)..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga/Bulan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penghuni</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRooms.map(room => (
                                <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusPill(room.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">Rp {room.price.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.tenant || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {room.status === 'available' ? (
                                            <button
                                                onClick={() => setShowBookingModal(true)}
                                                className="text-blue-600 hover:text-blue-900 font-semibold transition-colors">
                                                Booking
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const TenantManagement = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Manajemen Penghuni</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe
                                Sewa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status
                                Bayar
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {tenants.map(tenant => (
                            <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.room}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.checkIn}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${tenant.type === 'monthly' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {tenant.type === 'monthly' ? 'Bulanan' : 'Harian'}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${tenant.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <span
                          className={`h-1.5 w-1.5 rounded-full ${tenant.paymentStatus === 'paid' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {tenant.paymentStatus === 'paid' ? 'Lunas' : 'Pending'}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button className="text-blue-600 hover:text-blue-900 transition-colors"><Edit
                                            className="h-5 w-5"/></button>
                                        <button className="text-red-600 hover:text-red-900 transition-colors"><Trash2
                                            className="h-5 w-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const PaymentManagement = () => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h2>
                <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm hover:shadow-md"
                >
                    <Plus className="h-4 w-4"/>
                    <span>Catat Pembayaran</span>
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penghuni</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal
                                Bayar
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map(payment => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.tenant}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.room}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {payment.amount.toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.method}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold leading-5 rounded-full bg-green-100 text-green-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                      Terkonfirmasi
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 transition-colors">
                                        <Download className="h-4 w-4"/>
                                        <span>Kwitansi</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // --- MODAL COMPONENTS ---

    const BookingModal = () => (
        showBookingModal && (
            <div
                className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Tambah Booking Baru</h3>
                    <div className="space-y-4">
                        <InputField label="Nama Penghuni" type="text" placeholder="Contoh: Budi Santoso"/>
                        <InputField label="Nomor Telepon" type="tel" placeholder="Contoh: 081234567890"/>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kamar</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                                <option value="">Pilih kamar yang tersedia...</option>
                                {rooms.filter(room => room.status === 'available').map(room => (
                                    <option key={room.id}
                                            value={room.id}>Kamar {room.number} - {room.type} (Rp {room.price.toLocaleString('id-ID')})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Sewa</label>
                            <div className="flex space-x-4">
                                <RadioPill id="monthly" name="bookingType" value="monthly" label="Bulanan"
                                           checked={bookingType === 'monthly'}
                                           onChange={(e) => setBookingType(e.target.value)}/>
                                <RadioPill id="daily" name="bookingType" value="daily" label="Harian"
                                           checked={bookingType === 'daily'}
                                           onChange={(e) => setBookingType(e.target.value)}/>
                            </div>
                        </div>
                        <InputField label="Tanggal Check-in" type="date"/>
                        {bookingType === 'daily' && (
                            <InputField label="Tanggal Check-out" type="date"/>
                        )}
                    </div>
                    <div className="flex space-x-3 mt-8">
                        <button
                            onClick={() => setShowBookingModal(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm hover:shadow-md">
                            Simpan Booking
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    const PaymentModal = () => (
        showPaymentModal && (
            <div
                className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Catat Pembayaran</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Penghuni</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
                                <option value="">Pilih penghuni...</option>
                                {tenants.map(tenant => (
                                    <option key={tenant.id} value={tenant.id}>{tenant.name} -
                                        Kamar {tenant.room}</option>
                                ))}
                            </select>
                        </div>
                        <InputField label="Jumlah Pembayaran" type="number" placeholder="Contoh: 800000"
                                    focusColor="green"/>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
                                <option value="">Pilih metode...</option>
                                <option value="cash">Tunai</option>
                                <option value="transfer">Transfer Bank</option>
                                <option value="ewallet">E-Wallet</option>
                            </select>
                        </div>
                        <InputField label="Tanggal Pembayaran" type="date" focusColor="green"/>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                            <textarea
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Contoh: Pembayaran untuk bulan Agustus"
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex space-x-3 mt-8">
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm hover:shadow-md">
                            Simpan Pembayaran
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    const navItems = [
        {id: 'dashboard', label: 'Dashboard', icon: Home},
        {id: 'rooms', label: 'Manajemen Kamar', icon: Calendar},
        {id: 'tenants', label: 'Manajemen Penghuni', icon: Users},
        {id: 'payments', label: 'Manajemen Pembayaran', icon: CreditCard},
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard/>;
            case 'rooms':
                return <RoomManagement/>;
            case 'tenants':
                return <TenantManagement/>;
            case 'payments':
                return <PaymentManagement/>;
            default:
                return <Dashboard/>;
        }
    };

    // Main component render
    return (
        <div className="bg-gray-50 min-h-screen flex">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} lg:w-64`}>
                <div className="flex items-center justify-between h-16 px-6 border-b">
                    <h1 className={`text-xl font-bold text-blue-600 transition-opacity ${!isSidebarOpen && 'lg:opacity-100 opacity-0'}`}>KosKu</h1>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100">
                        {isSidebarOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                    </button>
                </div>
                <nav className="py-6 px-4">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveTab(item.id);
                                    }}
                                    className={`flex items-center py-3 px-4 rounded-lg transition-colors text-gray-700 hover:bg-blue-50 hover:text-blue-600
                    ${activeTab === item.id ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                    ${!isSidebarOpen && 'lg:justify-start justify-center'}
                  `}
                                >
                                    <item.icon className="h-5 w-5"/>
                                    <span
                                        className={`ml-4 transition-opacity ${!isSidebarOpen && 'lg:inline-block hidden'}`}>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-md hover:bg-gray-100 lg:hidden">
                        <Menu className="h-6 w-6 text-gray-600"/>
                    </button>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <Bell className="h-5 w-5 text-gray-600"/>
                        </button>
                        <div
                            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>

            {/* Modals */}
            <BookingModal/>
            <PaymentModal/>
        </div>
    );
};

export default KosManagementSystem;
