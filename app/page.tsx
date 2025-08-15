"use client"

import React, { useState, useEffect} from 'react';
import { Calendar, Home, Users, CreditCard, Bell, Search, Plus, Edit, Trash2, CheckCircle, Clock, Download, Menu, X, LucideProps, LogIn, LogOut, BedDouble, Building, UserCheck, Filter } from 'lucide-react';

// --- TYPE DEFINITIONS ---

interface Booking {
    id: number;
    tenantName: string;
    checkIn: string;
    checkOut?: string;
}

interface Room {
    id: number;
    number: string;
    type: 'Kos' | 'Homestay';
    price: number;
    status: 'available' | 'occupied' | 'booked';
    floor: number;
    facilities: string[];
    tenant: string | null;
    bookings: Booking[];
}

interface Tenant {
    id: number;
    name: string;
    room: string;
    phone: string;
    checkIn: string;
    type: 'monthly' | 'daily';
    paymentStatus: 'paid' | 'pending';
    lastPayment: string;
    amountOwed: number;
    checkOut?: string;
    hasVehicle?: boolean;
    vehicleType?: 'Roda 2' | 'Roda 4';
    licensePlate?: string;
}

interface Payment {
    id: number;
    tenant: string;
    room: string;
    amount: number;
    date: string;
    type: 'monthly' | 'daily';
    status: 'confirmed';
    method: string;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement<LucideProps>;
    color: 'blue' | 'green' | 'red' | 'indigo' | 'orange';
    onButtonClick?: () => void;
}

interface InputFieldProps {
    label: string;
    type: string;
    placeholder?: string;
    focusColor?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    disabled?: boolean;
    min?: string;
}

interface BookingModalProps {
    show: boolean;
    onClose: () => void;
    rooms: Room[];
    initialRoomId: number | null;
    onSubmit: (bookingData: {
        roomId: number;
        name: string;
        phone: string;
        checkIn: string;
        checkOut?: string;
        rentalType: 'monthly' | 'daily';
        finalPrice: number;
        hasVehicle: boolean;
        vehicleType?: 'Roda 2' | 'Roda 4';
        licensePlate?: string;
    }) => void;
}

interface EditTenantModalProps {
    show: boolean;
    onClose: () => void;
    tenant: Tenant | null;
    onSubmit: (updatedTenant: Tenant) => void;
}

interface PaymentModalProps {
    show: boolean;
    onClose: () => void;
    tenant: Tenant | null;
    onSubmit: (paymentData: { tenant: Tenant, method: string, date: string, amount: number }) => void;
}

interface FilterPillProps {
    label: string;
    value: string;
    activeValue: string;
    onClick: (value: string) => void;
}

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}


const KosManagementSystem: React.FC = () => {
    // State Management
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [tenantSearchTerm, setTenantSearchTerm] = useState('');
    const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
    const [bookingSearchTerm, setBookingSearchTerm] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showEditTenantModal, setShowEditTenantModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [tenantForPayment, setTenantForPayment] = useState<Tenant | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
    const [roomStatusFilter, setRoomStatusFilter] = useState<'all' | 'available' | 'occupied' | 'booked'>('all');
    const [roomTypeFilter, setRoomTypeFilter] = useState<'all' | 'Kos' | 'Homestay'>('all');
    const [tenantPaymentFilter, setTenantPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
    const [tenantTypeFilter, setTenantTypeFilter] = useState<'all' | 'monthly' | 'daily'>('all');
    const [tenantVehicleFilter, setTenantVehicleFilter] = useState<'all' | 'yes' | 'no'>('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    const [initialBookingRoomId, setInitialBookingRoomId] = useState<number | null>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);


    // --- MOCK DATA (replace with API calls in a real application) ---
    const [rooms, setRooms] = useState<Room[]>([
        { id: 1, number: 'A01', type: 'Kos', price: 800000, status: 'available', floor: 1, facilities: ['AC', 'WiFi', 'Lemari'], tenant: null, bookings: [] },
        { id: 2, number: 'A02', type: 'Kos', price: 800000, status: 'occupied', floor: 1, facilities: ['AC', 'WiFi', 'Lemari'], tenant: 'Ahmad Rizki', bookings: [{id: 1, tenantName: 'Ahmad Rizki', checkIn: '2024-01-15'}] },
        { id: 3, number: 'A03', type: 'Kos', price: 1200000, status: 'available', floor: 1, facilities: ['AC', 'WiFi', 'Lemari', 'TV', 'Kulkas'], tenant: null, bookings: [] },
        { id: 4, number: 'H01', type: 'Homestay', price: 250000, status: 'available', floor: 2, facilities: ['AC', 'WiFi', 'Lemari'], tenant: null, bookings: [] },
        { id: 5, number: 'H02', type: 'Homestay', price: 450000, status: 'occupied', floor: 2, facilities: ['AC', 'WiFi', 'Lemari', 'TV', 'Kulkas', 'Balkon'], tenant: 'Sari Dewi', bookings: [{id: 2, tenantName: 'Sari Dewi', checkIn: '2024-08-12', checkOut: '2024-08-15'}] },
        { id: 6, number: 'B01', type: 'Kos', price: 800000, status: 'available', floor: 2, facilities: ['AC', 'WiFi', 'Lemari'], tenant: null, bookings: [] },
    ]);

    const [tenants, setTenants] = useState<Tenant[]>([
        { id: 1, name: 'Ahmad Rizki', room: 'A02', phone: '0812-3456-7890', checkIn: '2024-01-15', type: 'monthly', paymentStatus: 'paid', lastPayment: '2024-08-01', amountOwed: 800000, hasVehicle: true, vehicleType: 'Roda 2', licensePlate: 'B 1234 ABC' },
        { id: 2, name: 'Sari Dewi', room: 'H02', phone: '0813-9876-5432', checkIn: '2024-08-12', type: 'daily', paymentStatus: 'paid', lastPayment: '2024-08-12', amountOwed: 450000, hasVehicle: false },
        { id: 3, name: 'Budi Santoso', room: 'C01', phone: '0814-1111-2222', checkIn: '2024-08-10', type: 'daily', checkOut: '2024-08-15', paymentStatus: 'paid', lastPayment: '2024-08-10', amountOwed: 150000, hasVehicle: true, vehicleType: 'Roda 4', licensePlate: 'D 4321 XYZ' },
    ]);

    const [payments, setPayments] = useState<Payment[]>([
        { id: 1, tenant: 'Ahmad Rizki', room: 'A02', amount: 800000, date: '2024-08-01', type: 'monthly', status: 'confirmed', method: 'Transfer Bank' },
        { id: 2, tenant: 'Budi Santoso', room: 'C01', amount: 150000, date: '2024-08-10', type: 'daily', status: 'confirmed', method: 'Cash' },
        { id: 3, tenant: 'Sari Dewi', room: 'H02', amount: 450000, date: '2024-08-12', type: 'daily', status: 'confirmed', method: 'E-Wallet' },
    ]);
    // --- END OF MOCK DATA ---

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    // --- HELPER FUNCTIONS ---
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Derived state for dashboard stats
    const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
    const availableRooms = rooms.filter(room => room.status === 'available').length;
    const bookedRooms = rooms.filter(room => room.status === 'booked').length;
    const pendingPayments = tenants.filter(tenant => tenant.paymentStatus === 'pending').length;
    const monthlyRevenue = payments
        .filter(payment => payment.date.startsWith('2024-08') && payment.status === 'confirmed')
        .reduce((sum, payment) => sum + payment.amount, 0);

    // --- HANDLER FUNCTIONS ---
    const handleBookingSubmit = (bookingData: {roomId: number, name: string, phone: string, checkIn: string, checkOut?: string, rentalType: 'monthly' | 'daily', finalPrice: number, hasVehicle: boolean, vehicleType?: 'Roda 2' | 'Roda 4', licensePlate?: string}) => {
        const { roomId, name, checkIn, rentalType, finalPrice, hasVehicle, vehicleType, licensePlate } = bookingData;
        const roomBooked = rooms.find(r => r.id === roomId);
        if (!roomBooked) return;

        const today = new Date().toISOString().split('T')[0];
        const isFutureBooking = checkIn > today;
        const newStatus = isFutureBooking ? 'booked' : 'occupied';

        const newBooking: Booking = {
            id: Date.now(),
            tenantName: name,
            checkIn: checkIn,
            checkOut: bookingData.checkOut,
        };

        // Update room status
        setRooms(prevRooms => prevRooms.map(room =>
            room.id === roomId ? { ...room, status: newStatus, tenant: isFutureBooking ? null : name, bookings: [...room.bookings, newBooking] } : room
        ));

        const paymentStatus = (rentalType === 'daily' && !isFutureBooking) ? 'paid' : 'pending';

        // Add new tenant
        const newTenant: Tenant = {
            id: tenants.length + 1,
            name,
            room: roomBooked.number,
            phone: bookingData.phone,
            checkIn,
            type: rentalType,
            paymentStatus,
            lastPayment: (rentalType === 'daily' && !isFutureBooking) ? checkIn : '',
            amountOwed: finalPrice,
            hasVehicle,
            vehicleType: hasVehicle ? vehicleType : undefined,
            licensePlate: hasVehicle ? licensePlate : undefined,
        };
        setTenants(prevTenants => [...prevTenants, newTenant]);

        // If it's a daily rental for today, also add a payment record for upfront payment
        if (rentalType === 'daily' && !isFutureBooking) {
            const newPayment: Payment = {
                id: payments.length + 1,
                tenant: name,
                room: roomBooked.number,
                amount: finalPrice,
                date: checkIn,
                type: 'daily',
                status: 'confirmed',
                method: 'Bayar di Awal'
            };
            setPayments(prevPayments => [...prevPayments, newPayment]);
        }

        setShowBookingModal(false);
        showNotification('Booking berhasil dibuat!', 'success');
    };

    const handleCheckout = (roomId: number) => {
        const roomToCheckOut = rooms.find(r => r.id === roomId);
        if (!roomToCheckOut) return;

        // In a real app, you'd also handle payments, etc.
        setRooms(prevRooms => prevRooms.map(room =>
            room.id === roomId ? { ...room, status: 'available', tenant: null, bookings: room.bookings.filter(b => b.tenantName !== room.tenant) } : room
        ));

        // Remove tenant from list or mark as inactive
        setTenants(prevTenants => prevTenants.filter(t => t.name !== roomToCheckOut.tenant));
        showNotification(`Kamar ${roomToCheckOut.number} berhasil di-checkout.`, 'success');
    };

    const handleEditTenant = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setShowEditTenantModal(true);
    };

    const handleUpdateTenant = (updatedTenant: Tenant) => {
        const oldTenant = tenants.find(t => t.id === updatedTenant.id);

        setTenants(tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t));

        // Update tenant name in rooms list if it changed
        if(oldTenant && oldTenant.name !== updatedTenant.name) {
            setRooms(rooms.map(r => r.tenant === oldTenant.name ? {...r, tenant: updatedTenant.name} : r));
        }

        setShowEditTenantModal(false);
        setEditingTenant(null);
        showNotification('Data penghuni berhasil diperbarui.', 'success');
    };

    const handleDeleteTenant = (tenantId: number) => {
        const tenantToDelete = tenants.find(t => t.id === tenantId);
        if (!tenantToDelete) return;

        // Free up the room
        setRooms(rooms.map(r => r.number === tenantToDelete.room ? {...r, status: 'available', tenant: null, bookings: []} : r));

        // Delete tenant
        setTenants(tenants.filter(t => t.id !== tenantId));

        // Delete associated payments
        setPayments(payments.filter(p => p.tenant !== tenantToDelete.name));
        showNotification('Data penghuni berhasil dihapus.', 'success');
    };

    const handleOpenPaymentModal = (tenant: Tenant) => {
        setTenantForPayment(tenant);
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = (paymentData: { tenant: Tenant, method: string, date: string, amount: number }) => {
        // 1. Update tenant's payment status
        setTenants(prev => prev.map(t => t.id === paymentData.tenant.id ? {...t, paymentStatus: 'paid', lastPayment: paymentData.date} : t));

        // 2. Add new payment record
        const newPayment: Payment = {
            id: payments.length + 1,
            tenant: paymentData.tenant.name,
            room: paymentData.tenant.room,
            amount: paymentData.amount,
            date: paymentData.date,
            type: paymentData.tenant.type,
            status: 'confirmed',
            method: paymentData.method
        };
        setPayments(prev => [...prev, newPayment]);

        // 3. Close modal and reset state
        setShowPaymentModal(false);
        setTenantForPayment(null);
        showNotification('Pembayaran berhasil dicatat!', 'success');
    };

    const handleCancelBooking = (roomId: number, bookingId: number) => {
        const roomToCancel = rooms.find(r => r.id === roomId);
        if (!roomToCancel) return;

        const updatedBookings = roomToCancel.bookings.filter(b => b.id !== bookingId);
        const newStatus = updatedBookings.length > 0 ? 'booked' : 'available';

        setRooms(prevRooms => prevRooms.map(room =>
            room.id === roomId ? { ...room, status: newStatus, bookings: updatedBookings } : room
        ));

        const bookingToCancel = roomToCancel.bookings.find(b => b.id === bookingId);
        if (bookingToCancel) {
            setTenants(prevTenants => prevTenants.filter(t => t.name !== bookingToCancel.tenantName));
            setPayments(prevPayments => prevPayments.filter(p => p.tenant !== bookingToCancel.tenantName));
        }
        showNotification(`Booking untuk kamar ${roomToCancel.number} berhasil dibatalkan.`, 'success');
    };

    const handleManualCheckIn = (roomId: number, bookingId: number) => {
        const roomToCheckIn = rooms.find(r => r.id === roomId);
        const booking = roomToCheckIn?.bookings.find(b => b.id === bookingId);
        if (!roomToCheckIn || !booking) return;

        setRooms(prevRooms => prevRooms.map(room =>
            room.id === roomId ? { ...room, status: 'occupied', tenant: booking.tenantName } : room
        ));
        showNotification(`Kamar ${roomToCheckIn.number} berhasil di-check-in.`, 'success');
    };


    // --- HELPER & LAYOUT COMPONENTS ---

    const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
        useEffect(() => {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }, [onClose]);

        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

        return (
            <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg text-white shadow-lg transition-transform transform animate-slide-in ${bgColor}`}>
                <div className="flex items-center">
                    {type === 'success' ? <CheckCircle className="h-5 w-5 mr-3" /> : <X className="h-5 w-5 mr-3" />}
                    <span>{message}</span>
                </div>
            </div>
        );
    };

    const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onButtonClick }) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            red: 'bg-red-100 text-red-600',
            indigo: 'bg-indigo-100 text-indigo-600',
            orange: 'bg-orange-100 text-orange-600',
        };
        return (
            <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${colors[color]}`}>
                        {icon}
                    </div>
                </div>
                {onButtonClick && (
                    <button onClick={onButtonClick} className="text-sm font-semibold text-blue-600 hover:underline mt-4 text-left">
                        Lihat Detail
                    </button>
                )}
            </div>
        );
    };

    const FilterPill: React.FC<FilterPillProps> = ({ label, value, activeValue, onClick }) => {
        const isActive = activeValue === value;
        return (
            <button
                onClick={() => onClick(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    isActive
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
                {label}
            </button>
        );
    };

    const InputField: React.FC<InputFieldProps> = ({ label, type, placeholder, focusColor = 'blue', value, onChange, name, disabled = false, min }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                min={min}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:border-transparent focus:ring-${focusColor}-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
        </div>
    );

    // --- SUB-COMPONENTS FOR EACH TAB ---

    const Dashboard: React.FC = () => {
        const handleViewDetails = (status: 'available' | 'occupied' | 'booked') => {
            setActiveTab('rooms');
            setRoomStatusFilter(status);
        };

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Kamar Terisi" value={occupiedRooms} icon={<Users className="h-6 w-6 text-green-600" />} color="green" onButtonClick={() => handleViewDetails('occupied')} />
                    <StatCard title="Kamar Tersedia" value={availableRooms} icon={<CheckCircle className="h-6 w-6 text-indigo-600" />} color="indigo" onButtonClick={() => handleViewDetails('available')} />
                    <StatCard title="Kamar Dipesan" value={bookedRooms} icon={<Calendar className="h-6 w-6 text-blue-600" />} color="blue" onButtonClick={() => handleViewDetails('booked')} />
                    <StatCard title="Pembayaran Pending" value={pendingPayments} icon={<Bell className="h-6 w-6 text-red-600" />} color="red" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Keuangan</h3>
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            Rp {monthlyRevenue.toLocaleString('id-ID')}
                        </div>
                        <p className="text-sm text-gray-600">Total pendapatan bulan ini dari {payments.filter(p => p.date.startsWith('2024-08')).length} transaksi.</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
                        <ul className="space-y-4">
                            <li key="activity-1" className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-full"><CheckCircle className="h-4 w-4 text-green-600"/></div>
                                <p className="text-sm text-gray-600">Ahmad Rizki melakukan pembayaran kamar A02.</p>
                            </li>
                            <li key="activity-2" className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-full"><LogIn className="h-4 w-4 text-blue-600"/></div>
                                <p className="text-sm text-gray-600">Sari Dewi check-in homestay H02.</p>
                            </li>
                            <li key="activity-3" className="flex items-center space-x-3">
                                <div className="p-2 bg-red-100 rounded-full"><Clock className="h-4 w-4 text-red-600"/></div>
                                <p className="text-sm text-gray-600">Pembayaran penghuni X tertunda.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    const RoomManagement: React.FC = () => {
        const filteredRooms = rooms.filter(room => {
            const statusMatch = roomStatusFilter === 'all' || room.status === roomStatusFilter;
            const typeMatch = roomTypeFilter === 'all' || room.type === roomTypeFilter;
            const searchMatch = searchTerm === '' ||
                room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (room.tenant && room.tenant.toLowerCase().includes(searchTerm.toLowerCase()));
            return statusMatch && typeMatch && searchMatch;
        });

        const getStatusPill = (status: 'available' | 'occupied' | 'booked') => {
            const styles = {
                available: 'bg-green-100 text-green-800',
                occupied: 'bg-red-100 text-red-800',
                booked: 'bg-blue-100 text-blue-800',
            };
            const text = {
                available: 'Tersedia',
                occupied: 'Terisi',
                booked: 'Dipesan',
            };
            return (
                <span className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${styles[status]}`}>
              {text[status]}
            </span>
            );
        };

        const handleOpenBookingModal = (roomId: number | null = null) => {
            setInitialBookingRoomId(roomId);
            setShowBookingModal(true);
        };

        const handleStatusFilterClick = (value: string) => {
            setRoomStatusFilter(value as 'all' | 'available' | 'occupied' | 'booked');
        };

        const handleTypeFilterClick = (value: string) => {
            setRoomTypeFilter(value as 'all' | 'Kos' | 'Homestay');
        };

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Manajemen Kamar</h2>
                    <button
                        onClick={() => handleOpenBookingModal(null)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm hover:shadow-md"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Booking</span>
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <h3 className="text-md font-semibold text-gray-800">Filter</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status Kamar</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterPill label="Semua" value="all" activeValue={roomStatusFilter} onClick={handleStatusFilterClick} />
                                <FilterPill label="Tersedia" value="available" activeValue={roomStatusFilter} onClick={handleStatusFilterClick} />
                                <FilterPill label="Terisi" value="occupied" activeValue={roomStatusFilter} onClick={handleStatusFilterClick} />
                                <FilterPill label="Dipesan" value="booked" activeValue={roomStatusFilter} onClick={handleStatusFilterClick} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Kamar</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterPill label="Semua" value="all" activeValue={roomTypeFilter} onClick={handleTypeFilterClick} />
                                <FilterPill label="Kos" value="Kos" activeValue={roomTypeFilter} onClick={handleTypeFilterClick} />
                                <FilterPill label="Homestay" value="Homestay" activeValue={roomTypeFilter} onClick={handleTypeFilterClick} />
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Cari kamar, tipe, atau penghuni..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>


                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penghuni</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRooms.map(room => (
                                <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                            {room.type === 'Kos' ? <Building className="h-4 w-4 text-gray-400" /> : <BedDouble className="h-4 w-4 text-gray-400" />}
                            {room.type}
                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusPill(room.status as 'available' | 'occupied' | 'booked')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">Rp {room.price.toLocaleString('id-ID')}<span className="text-gray-500 text-xs">{room.type === 'Kos' ? '/bulan' : '/hari'}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.tenant || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-4">
                                            {(() => {
                                                if (room.status === 'available' || room.status === 'booked') {
                                                    return <button onClick={() => handleOpenBookingModal(room.id)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Booking"><Plus className="h-5 w-5"/></button>
                                                } else if (room.status === 'occupied') {
                                                    if (room.type === 'Kos') {
                                                        return (
                                                            <>
                                                                <button onClick={() => { setActiveTab('tenants'); setSearchTerm(room.tenant || ''); }} className="text-purple-600 hover:text-purple-900 transition-colors" title="Detail Penghuni"><UserCheck className="h-5 w-5"/></button>
                                                                <button onClick={() => handleCheckout(room.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Check-out"><LogOut className="h-5 w-5"/></button>
                                                            </>
                                                        );
                                                    } else {
                                                        return <button onClick={() => handleCheckout(room.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Check-out"><LogOut className="h-5 w-5"/></button>;
                                                    }
                                                }
                                                return <span className="text-gray-400">-</span>;
                                            })()}
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
    };

    const TenantManagement: React.FC = () => {
        const filteredTenants = tenants.filter(tenant => {
            const statusMatch = tenantPaymentFilter === 'all' || tenant.paymentStatus === tenantPaymentFilter;
            const typeMatch = tenantTypeFilter === 'all' || tenant.type === tenantTypeFilter;
            const vehicleMatch = tenantVehicleFilter === 'all' || (tenantVehicleFilter === 'yes' && tenant.hasVehicle) || (tenantVehicleFilter === 'no' && !tenant.hasVehicle);
            const searchMatch = tenantSearchTerm === '' ||
                tenant.name.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
                tenant.room.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
                (tenant.licensePlate && tenant.licensePlate.toLowerCase().includes(tenantSearchTerm.toLowerCase()));
            return statusMatch && typeMatch && searchMatch && vehicleMatch;
        });

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Manajemen Penghuni</h2>
                <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <h3 className="text-md font-semibold text-gray-800">Filter Penghuni</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status Pembayaran</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterPill label="Semua" value="all" activeValue={tenantPaymentFilter} onClick={(v) => setTenantPaymentFilter(v as 'all' | 'paid' | 'pending')} />
                                <FilterPill label="Lunas" value="paid" activeValue={tenantPaymentFilter} onClick={(v) => setTenantPaymentFilter(v as 'all' | 'paid' | 'pending')} />
                                <FilterPill label="Pending" value="pending" activeValue={tenantPaymentFilter} onClick={(v) => setTenantPaymentFilter(v as 'all' | 'paid' | 'pending')} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Sewa</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterPill label="Semua" value="all" activeValue={tenantTypeFilter} onClick={(v) => setTenantTypeFilter(v as 'all' | 'monthly' | 'daily')} />
                                <FilterPill label="Bulanan" value="monthly" activeValue={tenantTypeFilter} onClick={(v) => setTenantTypeFilter(v as 'all' | 'monthly' | 'daily')} />
                                <FilterPill label="Harian" value="daily" activeValue={tenantTypeFilter} onClick={(v) => setTenantTypeFilter(v as 'all' | 'monthly' | 'daily')} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kendaraan</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterPill label="Semua" value="all" activeValue={tenantVehicleFilter} onClick={(v) => setTenantVehicleFilter(v as 'all' | 'yes' | 'no')} />
                                <FilterPill label="Ada" value="yes" activeValue={tenantVehicleFilter} onClick={(v) => setTenantVehicleFilter(v as 'all' | 'yes' | 'no')} />
                                <FilterPill label="Tidak Ada" value="no" activeValue={tenantVehicleFilter} onClick={(v) => setTenantVehicleFilter(v as 'all' | 'yes' | 'no')} />
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Cari nama, kamar, atau plat nomor..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={tenantSearchTerm}
                            onChange={(e) => setTenantSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kendaraan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Sewa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Bayar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTenants.map(tenant => (
                                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.room}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tenant.hasVehicle ? `${tenant.vehicleType} (${tenant.licensePlate})` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(tenant.checkIn)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${tenant.type === 'monthly' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {tenant.type === 'monthly' ? 'Bulanan' : 'Harian'}
                    </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${tenant.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${tenant.paymentStatus === 'paid' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {tenant.paymentStatus === 'paid' ? 'Lunas' : 'Pending'}
                    </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-3">
                                            {tenant.paymentStatus === 'pending' && (
                                                <button
                                                    onClick={() => handleOpenPaymentModal(tenant)}
                                                    className="text-green-600 hover:text-green-900 transition-colors"
                                                    title="Atur Pembayaran"
                                                >
                                                    <CreditCard className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button onClick={() => handleEditTenant(tenant)} className="text-blue-600 hover:text-blue-900 transition-colors"><Edit className="h-5 w-5" /></button>
                                            <button onClick={() => handleDeleteTenant(tenant.id)} className="text-red-600 hover:text-red-900 transition-colors"><Trash2 className="h-5 w-5" /></button>
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
    };

    const PaymentManagement: React.FC = () => {
        const filteredPayments = payments.filter(payment => {
            const typeMatch = paymentMethodFilter === 'all' || payment.method === paymentMethodFilter;
            const searchMatch = paymentSearchTerm === '' ||
                payment.tenant.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
                payment.room.toLowerCase().includes(paymentSearchTerm.toLowerCase());
            return typeMatch && searchMatch;
        });

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Riwayat Pembayaran</h2>
                <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <h3 className="text-md font-semibold text-gray-800">Filter Pembayaran</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterPill label="Semua" value="all" activeValue={paymentMethodFilter} onClick={setPaymentMethodFilter} />
                                <FilterPill label="Tunai" value="Tunai" activeValue={paymentMethodFilter} onClick={setPaymentMethodFilter} />
                                <FilterPill label="Transfer Bank" value="Transfer Bank" activeValue={paymentMethodFilter} onClick={setPaymentMethodFilter} />
                                <FilterPill label="E-Wallet" value="E-Wallet" activeValue={paymentMethodFilter} onClick={setPaymentMethodFilter} />
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Cari nama penghuni atau kamar..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={paymentSearchTerm}
                            onChange={(e) => setPaymentSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penghuni</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Bayar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.map(payment => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.tenant}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.room}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {payment.amount.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.method}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold leading-5 rounded-full bg-green-100 text-green-800">
                      <span className={`h-1.5 w-1.5 rounded-full bg-green-600`}></span>
                      Terkonfirmasi
                    </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 transition-colors">
                                            <Download className="h-4 w-4" />
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
    };

    const BookingManagement: React.FC = () => {
        const bookedRooms = rooms.filter(room => room.status === 'booked');

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Manajemen Pesanan Booking</h2>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pemesan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {bookedRooms.flatMap(room =>
                                room.bookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.tenantName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(booking.checkIn)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.checkOut ? formatDate(booking.checkOut) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => handleManualCheckIn(room.id, booking.id)} className="text-green-600 hover:text-green-900 transition-colors" title="Check-in Manual"><LogIn className="h-5 w-5"/></button>
                                                <button onClick={() => handleCancelBooking(room.id, booking.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Batalkan Booking"><X className="h-5 w-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // --- MODAL COMPONENTS ---

    const BookingModal: React.FC<BookingModalProps> = ({ show, onClose, rooms, initialRoomId, onSubmit }) => {
        const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
        const [formData, setFormData] = useState({ name: '', phone: '', checkIn: '', checkOut: '', licensePlate: '' });
        const [totalPrice, setTotalPrice] = useState(0);
        const [rentalType, setRentalType] = useState<'monthly' | 'daily'>('monthly');
        const [manualDailyPrice, setManualDailyPrice] = useState('');
        const [hasVehicle, setHasVehicle] = useState(false);
        const [vehicleType, setVehicleType] = useState<'Roda 2' | 'Roda 4'>('Roda 2');
        const [dateError, setDateError] = useState<string | null>(null);

        const initialRoomType = rooms.find(r => r.id === initialRoomId)?.type || null;

        const selectedRoom = rooms.find(room => room.id === selectedRoomId);

        useEffect(() => {
            if (selectedRoom) {
                if (selectedRoom.type === 'Kos') {
                    if (rentalType === 'monthly') {
                        setTotalPrice(selectedRoom.price);
                    } else { // daily
                        const dailyPrice = parseInt(manualDailyPrice, 10) || 0;
                        const startDate = new Date(formData.checkIn);
                        const endDate = new Date(formData.checkOut);
                        if (formData.checkIn && formData.checkOut && endDate > startDate) {
                            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            setTotalPrice(diffDays * dailyPrice);
                        } else {
                            setTotalPrice(0);
                        }
                    }
                } else if (selectedRoom.type === 'Homestay') {
                    setRentalType('daily');
                    const startDate = new Date(formData.checkIn);
                    const endDate = new Date(formData.checkOut);
                    if (formData.checkIn && formData.checkOut && endDate > startDate) {
                        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        setTotalPrice(diffDays * selectedRoom.price);
                    } else {
                        setTotalPrice(0);
                    }
                }
            } else {
                setTotalPrice(0);
            }
        }, [selectedRoom, formData.checkIn, formData.checkOut, rentalType, manualDailyPrice]);

        useEffect(() => {
            setSelectedRoomId(initialRoomId);
            if (initialRoomId) {
                const room = rooms.find(r => r.id === initialRoomId);
                if (room?.type === 'Homestay') {
                    setRentalType('daily');
                } else {
                    setRentalType('monthly');
                }
            }
        }, [initialRoomId, rooms]);

        useEffect(() => {
            if (selectedRoom && formData.checkIn && formData.checkOut) {
                let overlap = false;
                for (const booking of selectedRoom.bookings) {
                    if (new Date(formData.checkIn) < new Date(booking.checkOut!) && new Date(formData.checkOut) > new Date(booking.checkIn)) {
                        overlap = true;
                        break;
                    }
                }
                if (overlap) {
                    setDateError('Tanggal yang dipilih tumpang tindih dengan pesanan lain.');
                } else {
                    setDateError(null);
                }
            } else {
                setDateError(null);
            }
        }, [selectedRoom, formData.checkIn, formData.checkOut]);

        const availableRoomsForDropdown = rooms.filter(room => room.status !== 'occupied');

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleRoomSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const roomId = parseInt(e.target.value, 10);
            setSelectedRoomId(roomId || null);
            const room = rooms.find(r => r.id === roomId);
            if (room?.type === 'Homestay') {
                setRentalType('daily');
            } else {
                setRentalType('monthly');
            }
        };

        const handleFormSubmit = () => {
            if (!selectedRoomId) return;
            onSubmit({
                roomId: selectedRoomId,
                ...formData,
                rentalType,
                finalPrice: totalPrice,
                hasVehicle,
                vehicleType: hasVehicle ? vehicleType : undefined,
                licensePlate: hasVehicle ? formData.licensePlate : undefined,
            });
            handleCloseModal();
        };

        const handleCloseModal = () => {
            setFormData({ name: '', phone: '', checkIn: '', checkOut: '', licensePlate: '' });
            setSelectedRoomId(null);
            setManualDailyPrice('');
            setHasVehicle(false);
            setVehicleType('Roda 2');
            onClose();
        };

        if (!show) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Tambah Booking Baru</h3>
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Nama Penghuni" type="text" name="name" placeholder="Contoh: Budi Santoso" value={formData.name} onChange={handleInputChange} />
                            <InputField label="Nomor Telepon" type="tel" name="phone" placeholder="Contoh: 081234567890" value={formData.phone} onChange={handleInputChange} />

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kamar</label>
                                <select
                                    onChange={handleRoomSelect}
                                    value={selectedRoomId || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                                >
                                    <option value="">Pilih kamar yang tersedia...</option>
                                    {availableRoomsForDropdown.map(room => (
                                        <option key={room.id} value={room.id}>
                                            Kamar {room.number} - {room.type} (Rp {room.price.toLocaleString('id-ID')})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedRoom && (
                                <>
                                    {selectedRoom.bookings.length > 0 && (
                                        <div className="sm:col-span-2 bg-blue-50 p-3 rounded-lg">
                                            <p className="text-sm font-semibold text-blue-800">Jadwal Terpesan:</p>
                                            <ul className="list-disc list-inside text-sm text-blue-700">
                                                {selectedRoom.bookings.map(b => (
                                                    <li key={b.id}>{formatDate(b.checkIn)} s/d {b.checkOut ? formatDate(b.checkOut) : '...'}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {selectedRoom.type === 'Kos' && (
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Sewa</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input type="radio" name="rentalType" value="monthly" checked={rentalType === 'monthly'} onChange={() => setRentalType('monthly')} className="mr-2"/>
                                                    Bulanan
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="rentalType" value="daily" checked={rentalType === 'daily'} onChange={() => setRentalType('daily')} className="mr-2"/>
                                                    Harian
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    <InputField label="Tanggal Check-in" type="date" name="checkIn" value={formData.checkIn} onChange={handleInputChange} />
                                    {(selectedRoom.type === 'Homestay' || (selectedRoom.type === 'Kos' && rentalType === 'daily')) && (
                                        <InputField label="Tanggal Check-out" type="date" name="checkOut" value={formData.checkOut} onChange={handleInputChange} min={formData.checkIn} />
                                    )}
                                    {dateError && <p className="text-red-500 text-sm sm:col-span-2">{dateError}</p>}
                                    {selectedRoom.type === 'Kos' && rentalType === 'daily' && (
                                        <div className="sm:col-span-2">
                                            <InputField label="Harga Harian" type="number" name="manualDailyPrice" placeholder="Masukkan harga per hari" value={manualDailyPrice} onChange={(e) => setManualDailyPrice(e.target.value)} />
                                        </div>
                                    )}

                                    <div className="sm:col-span-2 flex items-center">
                                        <input type="checkbox" id="hasVehicle" checked={hasVehicle} onChange={(e) => setHasVehicle(e.target.checked)} className="mr-2 h-4 w-4"/>
                                        <label htmlFor="hasVehicle" className="text-sm font-medium text-gray-700">Bawa Kendaraan?</label>
                                    </div>

                                    {hasVehicle && (
                                        <div className="sm:col-span-2 pl-6 border-l-2 border-gray-200 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Kendaraan</label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center">
                                                        <input type="radio" name="vehicleType" value="Roda 2" checked={vehicleType === 'Roda 2'} onChange={() => setVehicleType('Roda 2')} className="mr-2"/>
                                                        Roda 2
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="vehicleType" value="Roda 4" checked={vehicleType === 'Roda 4'} onChange={() => setVehicleType('Roda 4')} className="mr-2"/>
                                                        Roda 4
                                                    </label>
                                                </div>
                                            </div>
                                            <InputField label="Plat Nomor" type="text" name="licensePlate" placeholder="Contoh: B 1234 ABC" value={formData.licensePlate} onChange={handleInputChange} />
                                        </div>
                                    )}

                                    {totalPrice > 0 && (
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Bayar</label>
                                            <p className="text-lg font-bold text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                                                Rp {totalPrice.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3 mt-8 pt-4 border-t">
                        <button
                            onClick={handleCloseModal}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleFormSubmit}
                            disabled={!selectedRoom || !formData.name || !formData.checkIn || !!dateError}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Simpan Booking
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const EditTenantModal: React.FC<EditTenantModalProps> = ({ show, onClose, tenant, onSubmit }) => {
        const [formData, setFormData] = useState({ name: '', phone: '', hasVehicle: false, vehicleType: 'Roda 2' as 'Roda 2' | 'Roda 4', licensePlate: '' });

        React.useEffect(() => {
            if (tenant) {
                setFormData({
                    name: tenant.name,
                    phone: tenant.phone,
                    hasVehicle: tenant.hasVehicle || false,
                    vehicleType: tenant.vehicleType || 'Roda 2',
                    licensePlate: tenant.licensePlate || ''
                });
            }
        }, [tenant]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value, type, checked } = e.target;
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        };

        const handleVehicleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({ ...prev, vehicleType: e.target.value as 'Roda 2' | 'Roda 4' }));
        };

        const handleFormSubmit = () => {
            if (!tenant) return;
            onSubmit({
                ...tenant,
                ...formData,
                vehicleType: formData.hasVehicle ? formData.vehicleType : undefined,
                licensePlate: formData.hasVehicle ? formData.licensePlate : undefined,
            });
        };

        if (!show) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Data Penghuni</h3>
                    <div className="space-y-4">
                        <InputField label="Nama Penghuni" type="text" name="name" value={formData.name} onChange={handleInputChange} />
                        <InputField label="Nomor Telepon" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kamar</label>
                            <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{tenant?.room}</p>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="hasVehicleEdit" name="hasVehicle" checked={formData.hasVehicle} onChange={handleInputChange} className="mr-2"/>
                            <label htmlFor="hasVehicleEdit" className="text-sm font-medium text-gray-700">Bawa Kendaraan?</label>
                        </div>

                        {formData.hasVehicle && (
                            <div className="pl-6 border-l-2 border-gray-200 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Kendaraan</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input type="radio" name="vehicleType" value="Roda 2" checked={formData.vehicleType === 'Roda 2'} onChange={handleVehicleTypeChange} className="mr-2"/>
                                            Roda 2
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name="vehicleType" value="Roda 4" checked={formData.vehicleType === 'Roda 4'} onChange={handleVehicleTypeChange} className="mr-2"/>
                                            Roda 4
                                        </label>
                                    </div>
                                </div>
                                <InputField label="Plat Nomor" type="text" name="licensePlate" placeholder="Contoh: B 1234 ABC" value={formData.licensePlate} onChange={handleInputChange} />
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-3 mt-8">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                            Batal
                        </button>
                        <button onClick={handleFormSubmit} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm hover:shadow-md">
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const PaymentModal: React.FC<PaymentModalProps> = ({ show, onClose, tenant, onSubmit }) => {
        const [method, setMethod] = useState('');
        const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

        useEffect(() => {
            if (!show) {
                setMethod('');
                setDate(new Date().toISOString().split('T')[0]);
            }
        }, [show]);

        const handleFormSubmit = () => {
            if (!tenant || !method || !date) return;
            onSubmit({
                tenant,
                method,
                date,
                amount: tenant.amountOwed
            });
        };

        if (!show) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Catat Pembayaran</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Penghuni</label>
                            <p className="text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">{tenant?.name} - Kamar {tenant?.room}</p>
                        </div>
                        <InputField label="Jumlah Pembayaran" type="number" name="amount" value={String(tenant?.amountOwed)} onChange={() => {}} disabled />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900">
                                <option value="">Pilih metode...</option>
                                <option value="Tunai">Tunai</option>
                                <option value="Transfer Bank">Transfer Bank</option>
                                <option value="E-Wallet">E-Wallet</option>
                            </select>
                        </div>
                        <InputField label="Tanggal Pembayaran" type="date" name="paymentDate" focusColor="green" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div className="flex space-x-3 mt-8">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                            Batal
                        </button>
                        <button onClick={handleFormSubmit} disabled={!method} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm hover:shadow-md disabled:bg-gray-400">
                            Simpan Pembayaran
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'rooms', label: 'Manajemen Kamar', icon: Calendar },
        { id: 'bookings', label: 'Manajemen Booking', icon: Calendar },
        { id: 'tenants', label: 'Manajemen Penghuni', icon: Users },
        { id: 'payments', label: 'Manajemen Pembayaran', icon: CreditCard },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'rooms': return <RoomManagement />;
            case 'tenants': return <TenantManagement />;
            case 'payments': return <PaymentManagement />;
            case 'bookings': return <BookingManagement />;
            default: return <Dashboard />;
        }
    };

    // Main component render
    return (
        <div className="bg-gray-50 min-h-screen lg:flex">
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 transform transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64`}>
                <div className="flex items-center justify-between h-16 px-6 border-b">
                    <h1 className="text-xl font-bold text-blue-600">KosKu</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 rounded-md hover:bg-gray-100">
                        <X className="h-6 w-6" />
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
                                        setIsSidebarOpen(false); // Close sidebar on mobile after navigation
                                    }}
                                    className={`flex items-center py-3 px-4 rounded-lg transition-colors text-gray-700 hover:bg-blue-50 hover:text-blue-600
                    ${activeTab === item.id ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                  `}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="ml-4">{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col w-full">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-100 lg:hidden">
                        <Menu className="h-6 w-6 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize ml-2 lg:ml-0">{activeTab.replace('-', ' ')}</h2>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>

            {/* Modals */}
            <BookingModal
                show={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                rooms={rooms}
                initialRoomId={initialBookingRoomId}
                onSubmit={handleBookingSubmit}
            />
            <EditTenantModal
                show={showEditTenantModal}
                onClose={() => setShowEditTenantModal(false)}
                tenant={editingTenant}
                onSubmit={handleUpdateTenant}
            />
            <PaymentModal
                show={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setTenantForPayment(null);
                }}
                tenant={tenantForPayment}
                onSubmit={handlePaymentSubmit}
            />
        </div>
    );
};

export default KosManagementSystem;
