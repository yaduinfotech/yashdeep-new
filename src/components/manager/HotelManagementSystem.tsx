import { useState, useEffect } from 'react';
import { Room, BookingData, PhysicalRoom, GuestFolioItem, ManagerProfile, HMSOverview } from '../../types/hotel';
import { useHotelData } from '../../context/HotelDataContext';
import {
  X,
  Lock,
  Building2,
  BedDouble,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeftRight,
  LogOut,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
  RefreshCw,
  Plus,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Tag,
  Wrench,
  Search,
  Check,
  Phone,
  Mail,
  Receipt,
  Coffee,
  UtensilsCrossed,
  Database,
  Wifi,
  WifiOff,
  ExternalLink,
  ArrowLeft,
  Upload,
  Edit2,
  Trash2,
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';
import {
  syncCloudSqlToSqlite,
  getOfflinePhysicalRooms,
  updateOfflineHousekeeping,
  checkInOfflineGuest,
  getOfflineGuestFolios,
  addOfflineFolioItem,
  getPendingSyncCount,
  flushPendingSyncToCloud,
  getOfflineKeyValue,
  setOfflineKeyValue,
  deleteOfflineKeyValue,
} from '../../utils/offlineSqlite';

interface HotelManagementSystemProps {
  isOpen?: boolean;
  onClose?: () => void;
  isStandalone?: boolean;
  catalogRooms?: Room[];
  onSaveCatalogRooms?: (rooms: Room[]) => void;
  bookings?: BookingData[];
  onRefreshData?: () => void;
}

export default function HotelManagementSystem({
  isOpen = true,
  onClose,
  isStandalone = false,
  catalogRooms = [],
  onSaveCatalogRooms,
  bookings = [],
  onRefreshData,
}: HotelManagementSystemProps) {
  // Authentication State (stored in SQLite)
  const [manager, setManager] = useState<ManagerProfile | null>(null);

  useEffect(() => {
    getOfflineKeyValue<ManagerProfile>('ydp_active_manager')
      .then((saved) => {
        if (saved) setManager(saved);
      })
      .catch(() => { });
  }, []);

  const [loginEmail, setLoginEmail] = useState('rasu2027@gmail.com');
  const [loginPassword, setLoginPassword] = useState('Yashdeep@2026');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<
    | 'frontdesk'
    | 'arrivals_departures'
    | 'housekeeping'
    | 'physical_rooms'
    | 'room_transfers'
    | 'expenses'
    | 'service_requests'
    | 'folios'
    | 'inventory'
    | 'reports'
  >('frontdesk');

  // Realtime Hotel Data Context
  const {
    physicalRooms: contextPhysicalRooms,
    addPhysicalRoom,
    updatePhysicalRoom,
    deletePhysicalRoom,
    roomChanges,
    changeGuestRoom,
    expenses,
    addExpense,
    deleteExpense,
    serviceRequests,
    addServiceRequest,
    updateServiceRequestStatus,
    deleteServiceRequest,
    createRoom,
    updateRoom,
    deleteRoom,
  } = useHotelData();

  // Offline SQLite Mode State
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Not synced yet');
  const [isSyncing, setIsSyncing] = useState(false);

  // Live HMS State
  const [overview, setOverview] = useState<HMSOverview | null>(null);
  const [physicalRooms, setPhysicalRooms] = useState<PhysicalRoom[]>(contextPhysicalRooms || []);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Sync physical rooms from context
  useEffect(() => {
    if (contextPhysicalRooms && contextPhysicalRooms.length > 0) {
      setPhysicalRooms(contextPhysicalRooms);
    }
  }, [contextPhysicalRooms]);

  // Room Transfer Modal State
  const [transferBooking, setTransferBooking] = useState<BookingData | null>(null);
  const [targetTransferRoom, setTargetTransferRoom] = useState('');
  const [transferReason, setTransferReason] = useState('Guest requested room upgrade');
  const [isTransferring, setIsTransferring] = useState(false);

  // Physical Rooms Inventory Modal State
  const [isPhysRoomModalOpen, setIsPhysRoomModalOpen] = useState(false);
  const [editingPhysRoom, setEditingPhysRoom] = useState<PhysicalRoom | null>(null);
  const [physRoomForm, setPhysRoomForm] = useState({
    roomNumber: '',
    roomTypeId: 'deluxe-room',
    floor: 1,
    housekeepingStatus: 'clean',
    occupancyStatus: 'vacant',
    notes: '',
  });

  // Operational Expenses State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'maintenance',
    description: '',
    amount: 0,
    paymentMethod: 'cash',
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Service Requests Desk State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    roomNumber: '101',
    guestName: '',
    requestType: 'room_service',
    priority: 'medium',
    description: '',
    assignedTo: 'Housekeeping Desk',
  });

  // Check-In Dialog State
  const [checkInModalBooking, setCheckInModalBooking] = useState<BookingData | null>(null);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Folio Viewer / Charge State
  const [activeFolioBooking, setActiveFolioBooking] = useState<BookingData | null>(null);
  const [folioItems, setFolioItems] = useState<GuestFolioItem[]>([]);
  const [folioCharges, setFolioCharges] = useState(0);
  const [folioPayments, setFolioPayments] = useState(0);
  const [folioBalance, setFolioBalance] = useState(0);
  const [newChargeType, setNewChargeType] = useState('restaurant');
  const [newChargeDesc, setNewChargeDesc] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState<number | ''>('');
  const [isPostingCharge, setIsPostingCharge] = useState(false);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      handleFlushPendingSync();
    };
    const handleOffline = () => {
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Live HMS Data (from Cloud SQL if online, or SQLite if offline)
  const fetchHMSData = async () => {
    setIsLoadingData(true);
    try {
      const pending = await getPendingSyncCount();
      setPendingSyncCount(pending);

      if (isOfflineMode) {
        // Read directly from offline SQLite database
        const offlineRooms = await getOfflinePhysicalRooms();
        if (offlineRooms.length > 0) {
          setPhysicalRooms(offlineRooms);

          // Calculate offline overview metrics
          const total = offlineRooms.length;
          const occupied = offlineRooms.filter((r) => r.occupancyStatus === 'occupied').length;
          const cleanVacant = offlineRooms.filter((r) => r.occupancyStatus === 'vacant' && r.housekeepingStatus === 'clean').length;
          const dirty = offlineRooms.filter((r) => r.housekeepingStatus === 'dirty').length;

          setOverview({
            totalRooms: total,
            occupiedCount: occupied,
            cleanVacantCount: cleanVacant,
            dirtyCount: dirty,
            outOfOrderCount: 0,
            occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
            inHouseGuests: occupied * 2,
            todayArrivals: 1,
            todayDepartures: 0,
            totalRoomRevenue: 3920,
          });
        }
      } else {
        // Online: Fetch from Cloud SQL
        const [overviewRes, physRes] = await Promise.all([
          fetch('/api/manager/overview').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/manager/rooms/physical').then((r) => (r.ok ? r.json() : [])),
        ]);

        if (overviewRes) setOverview(overviewRes);
        if (Array.isArray(physRes)) {
          setPhysicalRooms(physRes);
          // Mirror live data into client SQLite database
          await syncCloudSqlToSqlite(physRes, bookings);
          setLastSyncTime(new Date().toLocaleTimeString('en-IN'));
        }
      }
    } catch (err) {
      console.warn('Network issue fetching HMS data, falling back to SQLite:', err);
      // Fallback to SQLite
      const offlineRooms = await getOfflinePhysicalRooms();
      if (offlineRooms.length > 0) setPhysicalRooms(offlineRooms);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen && manager) {
      fetchHMSData();
    }
  }, [isOpen, manager, isOfflineMode]);

  // Flush pending offline changes to Cloud SQL
  const handleFlushPendingSync = async () => {
    setIsSyncing(true);
    try {
      const syncedCount = await flushPendingSyncToCloud();
      const remaining = await getPendingSyncCount();
      setPendingSyncCount(remaining);
      if (syncedCount > 0) {
        setActionSuccessMsg(`Synced ${syncedCount} offline change(s) to Cloud SQL!`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
      fetchHMSData();
    } catch (err) {
      console.error('Failed to flush offline sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  // Manager Login Handler
  const handleManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/manager/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Manager authentication failed');
        return;
      }

      setManager(data.manager);
      setOfflineKeyValue('ydp_active_manager', data.manager);
      trackEvent('manager_login_success', 'click', `Manager: ${data.manager.email}`);
      fetchHMSData();
    } catch (err: any) {
      // In offline emergency mode, allow rasu2027@gmail.com
      if (loginEmail.trim().toLowerCase() === 'rasu2027@gmail.com') {
        const offlineManager: ManagerProfile = {
          id: 1,
          email: 'rasu2027@gmail.com',
          name: 'Rasu Kumar (General Manager - Offline)',
          role: 'general_manager',
        };
        setManager(offlineManager);
        setOfflineKeyValue('ydp_active_manager', offlineManager);
        fetchHMSData();
      } else {
        setLoginError('Server error while connecting to Cloud SQL');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Manager Logout
  const handleManagerLogout = () => {
    setManager(null);
    deleteOfflineKeyValue('ydp_active_manager');
    trackEvent('manager_logout', 'click', 'Manager logged out');
  };

  // 1-Click Housekeeping Status Update
  const handleUpdateHousekeeping = async (roomNumber: string, nextStatus: 'clean' | 'dirty' | 'inspected' | 'out_of_order') => {
    try {
      if (isOfflineMode) {
        // Record in SQLite
        await updateOfflineHousekeeping(roomNumber, nextStatus);
        setPhysicalRooms((prev) =>
          prev.map((r) => (r.roomNumber === roomNumber ? { ...r, housekeepingStatus: nextStatus } : r))
        );
        const count = await getPendingSyncCount();
        setPendingSyncCount(count);
        setActionSuccessMsg(`[Offline SQLite] Room ${roomNumber} updated to ${nextStatus.toUpperCase()} (queued for sync)`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        // Online: Cloud SQL
        const res = await fetch(`/api/manager/rooms/${roomNumber}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ housekeepingStatus: nextStatus }),
        });
        if (res.ok) {
          setPhysicalRooms((prev) =>
            prev.map((r) => (r.roomNumber === roomNumber ? { ...r, housekeepingStatus: nextStatus } : r))
          );
          setActionSuccessMsg(`Room ${roomNumber} updated to ${nextStatus.toUpperCase()} in Cloud SQL`);
          setTimeout(() => setActionSuccessMsg(''), 3000);
          fetchHMSData();
        }
      }
    } catch (err) {
      console.error('Failed to update housekeeping:', err);
    }
  };

  // Check In Guest Action
  const handleConfirmCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInModalBooking || !selectedRoomNumber) return;

    setIsCheckingIn(true);
    try {
      if (isOfflineMode) {
        // Record in SQLite
        await checkInOfflineGuest({
          bookingReference: checkInModalBooking.bookingReference,
          roomNumber: selectedRoomNumber,
          idProofType,
          idProofNumber,
        });
        const count = await getPendingSyncCount();
        setPendingSyncCount(count);
        setActionSuccessMsg(`[Offline SQLite] Guest ${checkInModalBooking.guestName} checked in to Room ${selectedRoomNumber}!`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        setCheckInModalBooking(null);
        setSelectedRoomNumber('');
        setIdProofNumber('');
        fetchHMSData();
      } else {
        // Online: Cloud SQL
        const res = await fetch('/api/manager/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingReference: checkInModalBooking.bookingReference,
            roomNumber: selectedRoomNumber,
            idProofType,
            idProofNumber,
          }),
        });

        if (res.ok) {
          setActionSuccessMsg(`Guest ${checkInModalBooking.guestName} checked in to Room ${selectedRoomNumber}!`);
          setTimeout(() => setActionSuccessMsg(''), 4000);
          setCheckInModalBooking(null);
          setSelectedRoomNumber('');
          setIdProofNumber('');
          fetchHMSData();
          if (onRefreshData) onRefreshData();
        }
      }
    } catch (err) {
      console.error('Check-in error:', err);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Check Out Guest Action
  const handleConfirmCheckOut = async (booking: BookingData, roomNum: string) => {
    if (!confirm(`Confirm check-out for ${booking.guestName} (Room ${roomNum})? Physical room will be queued for housekeeping.`)) {
      return;
    }

    try {
      const res = await fetch('/api/manager/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference: booking.bookingReference,
          roomNumber: roomNum,
        }),
      });

      if (res.ok) {
        setActionSuccessMsg(`Guest ${booking.guestName} checked out successfully. Room ${roomNum} marked as DIRTY.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        fetchHMSData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Check-out error:', err);
    }
  };

  // Execute Room Transfer
  const handleExecuteRoomTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferBooking || !targetTransferRoom || !transferReason.trim()) {
      alert('Target room and reason are required');
      return;
    }

    setIsTransferring(true);
    try {
      await changeGuestRoom({
        bookingReference: transferBooking.bookingReference,
        fromRoomNumber: transferBooking.assignedRoomNumber || '',
        toRoomNumber: targetTransferRoom,
        reason: transferReason.trim(),
        changedBy: manager?.name || 'Front Desk Duty Manager',
      });

      setActionSuccessMsg(`Guest transferred from Room ${transferBooking.assignedRoomNumber} ➔ Room ${targetTransferRoom}`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      setTransferBooking(null);
      setTargetTransferRoom('');
      fetchHMSData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to transfer guest room');
    } finally {
      setIsTransferring(false);
    }
  };

  // Physical Room Save & Delete
  const handleSavePhysicalRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!physRoomForm.roomNumber.trim()) {
      alert('Room number is required');
      return;
    }
    await addPhysicalRoom({
      roomNumber: physRoomForm.roomNumber.trim(),
      roomTypeId: physRoomForm.roomTypeId,
      floor: Number(physRoomForm.floor),
      housekeepingStatus: physRoomForm.housekeepingStatus as any,
      occupancyStatus: (physRoomForm.occupancyStatus as any) || 'vacant',
      currentBookingReference: null,
      notes: physRoomForm.notes,
      updatedAt: new Date().toISOString(),
    });
    setActionSuccessMsg(`Physical Room #${physRoomForm.roomNumber} saved.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
    setIsPhysRoomModalOpen(false);
    fetchHMSData();
  };

  const handleDeletePhysicalRoom = async (roomNumber: string) => {
    if (!confirm(`Are you sure you want to delete physical room #${roomNumber}?`)) return;
    await deletePhysicalRoom(roomNumber);
    setActionSuccessMsg(`Deleted room #${roomNumber}`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
    fetchHMSData();
  };

  // Operational Expenses Handler
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || expenseForm.amount <= 0) {
      alert('Valid description and amount are required');
      return;
    }
    await addExpense({
      category: expenseForm.category as any,
      description: expenseForm.description,
      amount: Number(expenseForm.amount),
      paymentMethod: expenseForm.paymentMethod as any,
      receiptNumber: expenseForm.receiptNumber || `REC-${Date.now().toString().slice(-4)}`,
      date: expenseForm.date,
      recordedBy: manager?.name || 'Duty Manager',
    });
    setActionSuccessMsg(`Expense recorded: ₹${expenseForm.amount} for ${expenseForm.description}`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
    setIsExpenseModalOpen(false);
    setExpenseForm({
      category: 'maintenance',
      description: '',
      amount: 0,
      paymentMethod: 'cash',
      receiptNumber: '',
      date: new Date().toISOString().split('T')[0],
    });
    fetchHMSData();
  };

  // Service Request Handler
  const handleCreateServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.description.trim()) {
      alert('Request description is required');
      return;
    }
    await addServiceRequest({
      roomNumber: serviceForm.roomNumber,
      guestName: serviceForm.guestName || 'In-House Guest',
      requestType: serviceForm.requestType as any,
      priority: serviceForm.priority as any,
      description: serviceForm.description,
      assignedTo: serviceForm.assignedTo,
      status: 'pending',
    });
    setActionSuccessMsg(`Created ticket for Room ${serviceForm.roomNumber}`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
    setIsServiceModalOpen(false);
    setServiceForm({
      roomNumber: '101',
      guestName: '',
      requestType: 'room_service',
      priority: 'medium',
      description: '',
      assignedTo: 'Housekeeping Desk',
    });
  };

  // Load Folio for Booking
  const handleOpenFolio = async (booking: BookingData) => {
    setActiveFolioBooking(booking);
    try {
      if (isOfflineMode) {
        const offlineItems = await getOfflineGuestFolios(booking.bookingReference);
        setFolioItems(offlineItems);
        const charges = offlineItems.filter((f) => f.amount > 0).reduce((sum, f) => sum + f.amount, 0);
        const payments = offlineItems.filter((f) => f.amount < 0).reduce((sum, f) => sum + Math.abs(f.amount), 0);
        setFolioCharges(charges);
        setFolioPayments(payments);
        setFolioBalance(charges - payments);
      } else {
        const res = await fetch(`/api/manager/folios/${booking.bookingReference}`);
        if (res.ok) {
          const data = await res.json();
          setFolioItems(data.folios || []);
          setFolioCharges(data.charges || 0);
          setFolioPayments(data.payments || 0);
          setFolioBalance(data.balanceDue || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load folio:', err);
    }
  };

  // Post Charge/Payment to Folio
  const handlePostFolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFolioBooking || !newChargeDesc || !newChargeAmount) return;

    setIsPostingCharge(true);
    try {
      const amountNum = Number(newChargeAmount);
      const computedAmount = newChargeType === 'payment_received' || newChargeType === 'discount' ? -Math.abs(amountNum) : Math.abs(amountNum);

      if (isOfflineMode) {
        await addOfflineFolioItem({
          bookingReference: activeFolioBooking.bookingReference,
          itemType: newChargeType,
          description: newChargeDesc,
          amount: computedAmount,
          recordedBy: manager?.name || 'Offline Duty Manager',
        });
        const count = await getPendingSyncCount();
        setPendingSyncCount(count);
        setNewChargeDesc('');
        setNewChargeAmount('');
        handleOpenFolio(activeFolioBooking);
        setActionSuccessMsg('[Offline SQLite] Charge recorded and queued for Cloud SQL sync.');
        setTimeout(() => setActionSuccessMsg(''), 3000);
      } else {
        const res = await fetch(`/api/manager/folios/${activeFolioBooking.bookingReference}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemType: newChargeType,
            description: newChargeDesc,
            amount: computedAmount,
            recordedBy: manager?.name || 'Duty Manager',
          }),
        });

        if (res.ok) {
          setNewChargeDesc('');
          setNewChargeAmount('');
          handleOpenFolio(activeFolioBooking);
          setActionSuccessMsg('Folio charge recorded successfully in Cloud SQL.');
          setTimeout(() => setActionSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      console.error('Failed to post folio item:', err);
    } finally {
      setIsPostingCharge(false);
    }
  };

  // Filtered physical rooms
  const filteredRooms = selectedFloor === 'all' ? physicalRooms : physicalRooms.filter((r) => r.floor === selectedFloor);

  // Shell container class based on standalone mode or modal
  const containerClasses = isStandalone
    ? 'min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans'
    : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200';

  const cardClasses = isStandalone
    ? 'flex-1 flex flex-col bg-slate-900 border-none w-full'
    : 'bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl my-4 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]';

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-royal text-base font-bold text-amber-400 tracking-wider">
                  YASHDEEP PALACE
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Property Management System (HMS)
                </span>
                {isStandalone && (
                  <span className="hidden lg:inline text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-sm font-mono">
                    Full Workspace
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Karuli Industrial Area, Khuskheda · Dual-Engine (Cloud SQL + Offline SQLite)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* SQLite Offline Engine Status Badge & Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextState = !isOfflineMode;
                  setIsOfflineMode(nextState);
                  if (!nextState) handleFlushPendingSync();
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${isOfflineMode
                  ? 'border-amber-500/60 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
                  : 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                title={isOfflineMode ? 'Using Local SQLite WebAssembly. Click to reconnect Cloud SQL.' : 'Using Cloud SQL. Click to simulate Offline SQLite mode.'}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isOfflineMode ? 'Offline SQLite Active' : 'Cloud SQL Online'}</span>
                {isOfflineMode ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
              </button>

              {/* Pending Offline Sync Badge */}
              {pendingSyncCount > 0 && (
                <button
                  type="button"
                  onClick={handleFlushPendingSync}
                  disabled={isSyncing}
                  className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Flush pending offline SQLite transactions to Cloud SQL"
                >
                  <Upload className={`w-3 h-3 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>Sync {pendingSyncCount} Pending</span>
                </button>
              )}
            </div>

            {/* Standalone Navigation Button: Return to Public Site */}
            {isStandalone ? (
              <a
                href="/"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Guest Website</span>
              </a>
            ) : (
              /* Modal Mode: Open in Dedicated Tab */
              <a
                href="/manager"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-amber-400 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                title="Open Manager Workspace in a dedicated new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in Tab</span>
              </a>
            )}

            {manager && (
              <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Manager:</span>
                <span className="font-bold text-amber-400">{manager.name}</span>
                <button
                  type="button"
                  onClick={handleManagerLogout}
                  className="ml-2 text-[10px] text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  title="Sign out from HMS"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Exit</span>
                </button>
              </div>
            )}

            {onClose && !isStandalone && (
              <button
                onClick={onClose}
                type="button"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Action success alert banner */}
        {actionSuccessMsg && (
          <div className="bg-emerald-500 text-slate-950 px-6 py-2 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-1">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionSuccessMsg}</span>
            </span>
            <button onClick={() => setActionSuccessMsg('')} className="cursor-pointer font-extrabold text-sm">×</button>
          </div>
        )}

        {/* AUTHENTICATION GATE */}
        {!manager ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-500 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-royal text-slate-900 dark:text-white">
                Manager HMS Authentication
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Authorized access for general managers, front desk duty officers, and night auditors.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleManagerLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manager Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="manager@yashdeeppalace.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manager Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                Authorized in SQL: <strong className="text-slate-800 dark:text-slate-200">rasu2027@gmail.com</strong> or <strong className="text-slate-800 dark:text-slate-200">manager@yashdeeppalace.com</strong> (Password: <code className="font-mono text-amber-600 dark:text-amber-400">Yashdeep@2026</code>)
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying SQL Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign in to Hotel Management System</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED MANAGER HMS WORKSPACE */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* KPI METRIC STRIP (Live from Cloud SQL / SQLite) */}
            <div className="bg-slate-100 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Occupancy</span>
                <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                  {overview ? `${overview.occupancyRate}%` : '...'}
                </p>
                <span className="text-[10px] text-slate-400">
                  {overview ? `${overview.occupiedCount}/${overview.totalRooms} Rooms` : ''}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">In-House</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                  {overview ? overview.inHouseGuests : '0'}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Active Guests
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Clean Vacant</span>
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {overview ? overview.cleanVacantCount : '0'}
                </p>
                <span className="text-[10px] text-slate-400">Ready for Check-In</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Dirty Rooms</span>
                <p className="text-base font-extrabold text-amber-500 font-mono">
                  {overview ? overview.dirtyCount : '0'}
                </p>
                <span className="text-[10px] text-slate-400">Housekeeping Queue</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Arrivals</span>
                <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  {overview ? overview.todayArrivals : '0'}
                </p>
                <span className="text-[10px] text-slate-400">Expected Today</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Departures</span>
                <p className="text-base font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                  {overview ? overview.todayDepartures : '0'}
                </p>
                <span className="text-[10px] text-slate-400">Due Today</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Room Sales</span>
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono truncate">
                  ₹{overview ? overview.totalRoomRevenue.toLocaleString('en-IN') : '0'}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isOfflineMode ? 'Local SQLite' : 'Cloud SQL'}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 overflow-x-auto text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('frontdesk')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'frontdesk'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>Room Matrix & Tape Chart</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('arrivals_departures')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'arrivals_departures'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Front Desk Check-In / Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('housekeeping')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'housekeeping'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Housekeeping Board</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('physical_rooms')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'physical_rooms'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>Physical Rooms Inventory</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('room_transfers')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'room_transfers'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Room Transfers & Audits</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('expenses')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'expenses'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Operational Expenses</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('service_requests')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'service_requests'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Service Requests</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('folios')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'folios'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Guest Folios & Invoicing</span>
                </button>



                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'inventory'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Room Rates & Tariffs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-3 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'reports'
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Revenue & Night Audit</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 hidden xl:inline">
                  SQLite Synced: {lastSyncTime}
                </span>
                <button
                  type="button"
                  onClick={fetchHMSData}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Refresh / Sync SQLite & Cloud SQL"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/40">
              {/* ================= TAB 1: ROOM MATRIX & TAPE CHART ================= */}
              {activeTab === 'frontdesk' && (
                <div className="space-y-6">
                  {/* Floor Filters & Color Legend */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Filter Floor:</span>
                      {(['all', 1, 2, 3, 4] as const).map((fl) => (
                        <button
                          key={String(fl)}
                          type="button"
                          onClick={() => setSelectedFloor(fl)}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${selectedFloor === fl
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          {fl === 'all' ? 'All Floors' : `Floor ${fl}`}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-600 dark:text-slate-400">Vacant Clean</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span className="text-slate-600 dark:text-slate-400">Vacant Dirty</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span className="text-slate-600 dark:text-slate-400">Occupied</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        <span className="text-slate-600 dark:text-slate-400">Inspected</span>
                      </span>
                    </div>
                  </div>

                  {/* Physical Rooms Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredRooms.map((room) => {
                      const activeBooking = bookings.find(
                        (b) => b.assignedRoomNumber === room.roomNumber && b.stayStatus === 'checked_in'
                      );

                      const isOccupied = room.occupancyStatus === 'occupied' || !!activeBooking;

                      return (
                        <div
                          key={room.roomNumber}
                          className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${isOccupied
                            ? 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20'
                            : room.housekeepingStatus === 'clean'
                              ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900'
                              : room.housekeepingStatus === 'dirty'
                                ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
                                #{room.roomNumber}
                              </span>
                              <div className="flex items-center gap-1">
                                {isOccupied ? (
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500 text-white">
                                    Occupied
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                    Vacant
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${room.housekeepingStatus === 'clean'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                    : room.housekeepingStatus === 'dirty'
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                      : room.housekeepingStatus === 'inspected'
                                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                    }`}
                                >
                                  {room.housekeepingStatus}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 capitalize">
                              {room.roomTypeId.replace('-', ' ')} · Floor {room.floor}
                            </p>

                            {room.notes && (
                              <p className="text-[11px] text-slate-500 mt-1 italic">
                                "{room.notes}"
                              </p>
                            )}

                            {/* Active In-House Guest Details */}
                            {activeBooking && (
                              <div className="mt-3 p-2 rounded-lg bg-blue-100/60 dark:bg-blue-900/30 text-xs space-y-0.5">
                                <p className="font-bold text-blue-950 dark:text-blue-200 truncate">
                                  {activeBooking.guestName}
                                </p>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                  Ref: <span className="font-mono">{activeBooking.bookingReference}</span>
                                </p>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                  Departs: {activeBooking.checkOut}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Quick Card Action Buttons */}
                          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            {isOccupied && activeBooking ? (
                              <div className="flex items-center gap-1.5 w-full">
                                <button
                                  type="button"
                                  onClick={() => handleOpenFolio(activeBooking)}
                                  className="flex-1 py-1 px-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-md text-[11px] font-bold cursor-pointer"
                                >
                                  Folio
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmCheckOut(activeBooking, room.roomNumber)}
                                  className="flex-1 py-1 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-[11px] font-bold cursor-pointer"
                                >
                                  Check Out
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 w-full">
                                {room.housekeepingStatus === 'dirty' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateHousekeeping(room.roomNumber, 'clean')}
                                    className="w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md text-[11px] font-bold cursor-pointer"
                                  >
                                    Mark Cleaned
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateHousekeeping(room.roomNumber, 'dirty')}
                                    className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-semibold cursor-pointer"
                                  >
                                    Set Dirty (Turnover)
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= TAB 2: FRONT DESK CHECK-IN & CHECK-OUT ================= */}
              {activeTab === 'arrivals_departures' && (
                <div className="space-y-6">
                  {/* Expected Arrivals Queue */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Arrivals Queue & Room Allocation</span>
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Direct engine bookings requiring physical room allocation and guest ID verification upon arrival.
                    </p>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3">Reference</th>
                            <th className="p-3">Guest Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Dates</th>
                            <th className="p-3">Assigned Room</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {bookings
                            .filter((b) => b.stayStatus !== 'checked_out')
                            .map((b) => (
                              <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                                  {b.bookingReference}
                                </td>
                                <td className="p-3">
                                  <p className="font-bold text-slate-900 dark:text-white">{b.guestName}</p>
                                  <p className="text-[11px] text-slate-500">{b.guestPhone}</p>
                                </td>
                                <td className="p-3 font-medium">{b.roomName}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-400">
                                  {b.checkIn} ➔ {b.checkOut} ({b.nights}n)
                                </td>
                                <td className="p-3">
                                  {b.assignedRoomNumber ? (
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-sm">
                                      Room #{b.assignedRoomNumber}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">Unassigned</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                    ₹{b.grandTotal.toLocaleString('en-IN')} (Paid)
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {b.stayStatus === 'checked_in' ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-md">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> In-House
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTransferBooking(b);
                                          const cleanTarget = physicalRooms.find((r) => r.occupancyStatus === 'vacant' && r.housekeepingStatus === 'clean');
                                          if (cleanTarget) setTargetTransferRoom(cleanTarget.roomNumber);
                                        }}
                                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-md shadow-xs cursor-pointer flex items-center gap-1"
                                      >
                                        <ArrowLeftRight className="w-3 h-3" />
                                        <span>Transfer Room</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleConfirmCheckOut(b, b.assignedRoomNumber || '')}
                                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-[11px] rounded-md cursor-pointer"
                                      >
                                        Check Out
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCheckInModalBooking(b);
                                        const cleanRoom = physicalRooms.find((r) => r.occupancyStatus === 'vacant' && r.housekeepingStatus === 'clean');
                                        if (cleanRoom) setSelectedRoomNumber(cleanRoom.roomNumber);
                                      }}
                                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                                    >
                                      Check In Guest
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: HOUSEKEEPING TURNAROUND BOARD ================= */}
              {activeTab === 'housekeeping' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Housekeeping & Room Turnaround Board
                      </h3>
                      <p className="text-xs text-slate-500">
                        Manage physical room status transitions for room attendants and supervisory inspections.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* DIRTY COLUMN */}
                    <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-300 dark:border-amber-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4" />
                          <span>Dirty / Turnover Needed</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold text-xs">
                          {physicalRooms.filter((r) => r.housekeepingStatus === 'dirty').length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {physicalRooms
                          .filter((r) => r.housekeepingStatus === 'dirty')
                          .map((r) => (
                            <div key={r.roomNumber} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                              <div className="flex justify-between items-baseline">
                                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                                  #{r.roomNumber}
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase">Floor {r.floor}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 capitalize">
                                {r.roomTypeId.replace('-', ' ')}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleUpdateHousekeeping(r.roomNumber, 'clean')}
                                className="w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-md transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Mark Cleaned</span>
                              </button>
                            </div>
                          ))}
                        {physicalRooms.filter((r) => r.housekeepingStatus === 'dirty').length === 0 && (
                          <p className="text-center py-6 text-xs text-slate-400 italic">No rooms pending cleaning.</p>
                        )}
                      </div>
                    </div>

                    {/* CLEAN VACANT COLUMN */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-300 dark:border-emerald-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Clean & Ready for Arrival</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold text-xs">
                          {physicalRooms.filter((r) => r.housekeepingStatus === 'clean' && r.occupancyStatus === 'vacant').length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {physicalRooms
                          .filter((r) => r.housekeepingStatus === 'clean' && r.occupancyStatus === 'vacant')
                          .map((r) => (
                            <div key={r.roomNumber} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                              <div className="flex justify-between items-baseline">
                                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                                  #{r.roomNumber}
                                </span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Ready</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 capitalize">
                                {r.roomTypeId.replace('-', ' ')} · Floor {r.floor}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleUpdateHousekeeping(r.roomNumber, 'inspected')}
                                className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-slate-700 dark:text-slate-300 font-semibold text-[11px] rounded-md transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                <span>Supervisor Inspect</span>
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* SUPERVISOR INSPECTED COLUMN */}
                    <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-300 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <Sparkles className="w-4 h-4" />
                          <span>VIP Inspected / Penthouse</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-bold text-xs">
                          {physicalRooms.filter((r) => r.housekeepingStatus === 'inspected').length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {physicalRooms
                          .filter((r) => r.housekeepingStatus === 'inspected')
                          .map((r) => (
                            <div key={r.roomNumber} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                              <div className="flex justify-between items-baseline">
                                <span className="font-mono text-base font-extrabold text-purple-600 dark:text-purple-400">
                                  #{r.roomNumber}
                                </span>
                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold uppercase">VIP Checked</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 capitalize">
                                {r.roomTypeId.replace('-', ' ')}
                              </p>
                              <span className="text-[10px] text-slate-500 block">Linens, mini-bar & HVAC verified</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: GUEST FOLIOS & INVOICING ================= */}
              {activeTab === 'folios' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Guest Folios & Incidentals Ledger
                    </h3>
                    <p className="text-xs text-slate-500">
                      Post restaurant tabs, airport transfers, or laundry charges to in-house guests and print final settled tax invoices.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active In-House Guest Picker */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Select In-House Guest
                      </p>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {bookings.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => handleOpenFolio(b)}
                            className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${activeFolioBooking?.bookingReference === b.bookingReference
                              ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-400/40'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                              }`}
                          >
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {b.guestName}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-amber-600">
                                {b.assignedRoomNumber ? `Room #${b.assignedRoomNumber}` : 'Unassigned'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {b.bookingReference}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Folio Ledger & New Charge Form */}
                    <div className="lg:col-span-2 space-y-4">
                      {activeFolioBooking ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400">Guest Folio</span>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                {activeFolioBooking.guestName} (Room {activeFolioBooking.assignedRoomNumber || 'N/A'})
                              </h4>
                              <p className="text-xs text-slate-500">Ref: {activeFolioBooking.bookingReference}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold uppercase text-slate-400">Balance Due</span>
                              <p className={`text-xl font-extrabold font-mono ${folioBalance > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>
                                ₹{folioBalance.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          {/* Itemized Folio Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="p-2.5">Date</th>
                                  <th className="p-2.5">Service / Description</th>
                                  <th className="p-2.5">Recorded By</th>
                                  <th className="p-2.5 text-right">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {folioItems.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="p-2.5 text-slate-500">
                                      {new Date(item.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                                      {item.description}
                                    </td>
                                    <td className="p-2.5 text-slate-500">{item.recordedBy}</td>
                                    <td className={`p-2.5 text-right font-mono font-bold ${item.amount < 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                      {item.amount < 0 ? `-₹${Math.abs(item.amount).toLocaleString('en-IN')}` : `+₹${item.amount.toLocaleString('en-IN')}`}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Post New Folio Item Form */}
                          <form onSubmit={handlePostFolioItem} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                              + Post New Incidental Charge or Payment
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <select
                                value={newChargeType}
                                onChange={(e) => setNewChargeType(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                              >
                                <option value="restaurant">The Royal Feast Restaurant</option>
                                <option value="minibar">Gourmet Mini-Bar</option>
                                <option value="laundry">Dry Cleaning & Laundry</option>
                                <option value="transport">Airport Cab Transfer</option>
                                <option value="payment_received">Payment Received (Credit)</option>
                                <option value="discount">Manager Courtesy Discount</option>
                              </select>
                              <input
                                type="text"
                                required
                                value={newChargeDesc}
                                onChange={(e) => setNewChargeDesc(e.target.value)}
                                placeholder="Description (e.g. Dinner Buffet - Table 4)"
                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                              />
                              <input
                                type="number"
                                required
                                min={1}
                                value={newChargeAmount}
                                onChange={(e) => setNewChargeAmount(e.target.value ? Number(e.target.value) : '')}
                                placeholder="Amount (₹)"
                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                disabled={isPostingCharge}
                                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                              >
                                {isPostingCharge ? 'Recording...' : 'Add to Guest Folio'}
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                          <p className="text-sm font-semibold">Select a guest from the left panel to inspect folio ledger.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* ================= TAB 6: ROOM RATES & TARIFFS CMS ================= */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Room Category Tariffs & Live Inventory
                    </h3>
                    <p className="text-xs text-slate-500">
                      Update base pricing, occupancy limits, and descriptions directly reflected on the public booking engine.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {catalogRooms.map((room) => (
                      <div key={room.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-4">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-24 h-24 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {room.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">{room.tagline}</p>
                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                              ₹{room.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{room.originalPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Available Inventory: <strong>{room.availableUnits} units</strong> · Max Occupancy: {room.maxOccupancy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= TAB 7: REVENUE & NIGHT AUDIT REPORTS ================= */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Night Audit & Financial Revenue Report
                    </h3>
                    <p className="text-xs text-slate-500">
                      Audited transaction summary directly calculated from {isOfflineMode ? 'Local SQLite WebAssembly' : 'Cloud SQL PostgreSQL'} records.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Gross Room Revenue</span>
                      <p className="text-2xl font-extrabold text-emerald-600 font-mono">
                        ₹{overview ? overview.totalRoomRevenue.toLocaleString('en-IN') : '0'}
                      </p>
                      <span className="text-[11px] text-slate-400">All direct confirmed reservations</span>
                    </div>

                  </div>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Property Operational Key Performance Indicators</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                      <div>
                        <span className="text-slate-400">ADR (Average Daily Rate):</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white text-base">₹3,450</p>
                      </div>
                      <div>
                        <span className="text-slate-400">RevPAR:</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white text-base">₹2,850</p>
                      </div>
                      <div>
                        <span className="text-slate-400">GST Collected (5%):</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white text-base">
                          ₹{overview ? Math.round(overview.totalRoomRevenue * 0.05).toLocaleString('en-IN') : '0'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">RIICO Corporate Share:</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white text-base">78.5%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB: PHYSICAL ROOMS INVENTORY ================= */}
              {activeTab === 'physical_rooms' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-amber-500" />
                        <span>Physical Rooms Inventory & Housekeeping</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Manage physical room units (101, 102, 201...), assign floor, category and set housekeeping conditions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPhysRoom(null);
                        setPhysRoomForm({
                          roomNumber: '',
                          roomTypeId: 'deluxe-room',
                          floor: 1,
                          housekeepingStatus: 'clean',
                          occupancyStatus: 'vacant',
                          notes: '',
                        });
                        setIsPhysRoomModalOpen(true);
                      }}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer self-start"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Physical Room</span>
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Room #</th>
                          <th className="p-3">Floor</th>
                          <th className="p-3">Type / Category</th>
                          <th className="p-3">Housekeeping</th>
                          <th className="p-3">Occupancy</th>
                          <th className="p-3">Notes</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {physicalRooms.map((pr) => (
                          <tr key={pr.roomNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white text-sm">
                              #{pr.roomNumber}
                            </td>
                            <td className="p-3 font-medium">Floor {pr.floor}</td>
                            <td className="p-3">
                              <span className="font-semibold text-amber-700 dark:text-amber-400 uppercase text-[10px]">
                                {pr.roomTypeId.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pr.housekeepingStatus === 'clean'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : pr.housekeepingStatus === 'dirty'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                    : pr.housekeepingStatus === 'inspected'
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                  }`}
                              >
                                {pr.housekeepingStatus}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pr.occupancyStatus === 'occupied'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  }`}
                              >
                                {pr.occupancyStatus}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                              {pr.notes || '—'}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPhysRoom(pr);
                                    setPhysRoomForm({
                                      roomNumber: pr.roomNumber,
                                      roomTypeId: pr.roomTypeId,
                                      floor: pr.floor,
                                      housekeepingStatus: pr.housekeepingStatus,
                                      occupancyStatus: pr.occupancyStatus,
                                      notes: pr.notes || '',
                                    });
                                    setIsPhysRoomModalOpen(true);
                                  }}
                                  className="p-1 text-slate-500 hover:text-amber-600 rounded cursor-pointer"
                                  title="Edit Room"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePhysicalRoom(pr.roomNumber)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                  title="Delete Room"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= TAB: ROOM TRANSFERS & AUDITS ================= */}
              {activeTab === 'room_transfers' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-amber-500" />
                      <span>Guest Room Transfer & Audit Log</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live audit history of guest room relocations. Automatically updates physical room occupancy, sets previous room to dirty, and posts audit notes.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Reference</th>
                          <th className="p-3">From Room</th>
                          <th className="p-3">To Room</th>
                          <th className="p-3">Transfer Reason</th>
                          <th className="p-3">Authorizing Staff</th>
                          <th className="p-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {roomChanges.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400">
                              No guest room transfers recorded yet. In-house guests can be transferred directly from Front Desk arrivals/departures view.
                            </td>
                          </tr>
                        ) : (
                          roomChanges.map((rc) => (
                            <tr key={rc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                                {rc.bookingReference}
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                                Room #{rc.fromRoomNumber}
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                Room #{rc.toRoomNumber}
                              </td>
                              <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                                {rc.reason}
                              </td>
                              <td className="p-3 text-slate-500 dark:text-slate-400">
                                {rc.changedBy}
                              </td>
                              <td className="p-3 text-slate-400">
                                {new Date(rc.changedAt).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= TAB: OPERATIONAL EXPENSES TRACKER ================= */}
              {activeTab === 'expenses' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-500" />
                        <span>Property Operational Expenses Tracker</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Log diesel for generator sets, food supplies, laundry, equipment maintenance, and utility bills.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsExpenseModalOpen(true)}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer self-start"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Record Expense</span>
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Total Expenses</span>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
                        ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[11px] text-slate-400">{expenses.length} recorded voucher(s)</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Maintenance & Generator</span>
                      <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1">
                        ₹{expenses.filter((e) => e.category === 'maintenance' || e.category === 'utilities').reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[11px] text-slate-400">Power backup & plant equipment</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Kitchen & Linen</span>
                      <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                        ₹{expenses.filter((e) => e.category === 'supplies' || e.category === 'laundry').reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[11px] text-slate-400">Dining & housekeeping operations</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Receipt / Ref</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Payment</th>
                          <th className="p-3">Recorded By</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {expenses.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400">
                              No expense vouchers recorded. Click "Record Expense" to log operational expenses.
                            </td>
                          </tr>
                        ) : (
                          expenses.map((exp) => (
                            <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                {exp.receiptNumber || exp.id}
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-400">{exp.date}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                  {exp.category}
                                </span>
                              </td>
                              <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                                {exp.description}
                              </td>
                              <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                                ₹{exp.amount.toLocaleString('en-IN')}
                              </td>
                              <td className="p-3 uppercase text-slate-500">{exp.paymentMethod}</td>
                              <td className="p-3 text-slate-500">{exp.recordedBy}</td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm('Delete expense voucher?')) {
                                      await deleteExpense(exp.id);
                                      setActionSuccessMsg('Deleted expense voucher');
                                      setTimeout(() => setActionSuccessMsg(''), 4000);
                                      fetchHMSData();
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= TAB: GUEST SERVICE REQUESTS ================= */}
              {activeTab === 'service_requests' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-500" />
                        <span>Front Desk Service & Maintenance Desk</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Dispatch and resolve room service, extra amenities, plumbing/AC maintenance, and housekeeping tickets.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsServiceModalOpen(true)}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer self-start"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Service Ticket</span>
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Room</th>
                          <th className="p-3">Guest Name</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Priority</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Assigned Desk</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {serviceRequests.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400">
                              No open service requests. All guest tickets are resolved.
                            </td>
                          </tr>
                        ) : (
                          serviceRequests.map((sr) => (
                            <tr key={sr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                #{sr.roomNumber}
                              </td>
                              <td className="p-3 font-bold">{sr.guestName}</td>
                              <td className="p-3 capitalize">{sr.requestType.replace('_', ' ')}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sr.priority === 'urgent'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    : sr.priority === 'medium'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                >
                                  {sr.priority}
                                </span>
                              </td>
                              <td className="p-3 text-slate-700 dark:text-slate-300">{sr.description}</td>
                              <td className="p-3 text-slate-500">{sr.assignedTo}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sr.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : sr.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                    }`}
                                >
                                  {sr.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {sr.status !== 'completed' && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await updateServiceRequestStatus(sr.id, 'completed', 'Resolved by staff');
                                        setActionSuccessMsg(`Ticket for Room ${sr.roomNumber} marked completed.`);
                                        setTimeout(() => setActionSuccessMsg(''), 4000);
                                      }}
                                      className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] rounded cursor-pointer"
                                    >
                                      Resolve
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await deleteServiceRequest(sr.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                    title="Delete ticket"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHECK-IN ROOM ASSIGNMENT MODAL */}
        {checkInModalBooking && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
              <div>
                <h4 className="text-lg font-bold font-royal text-slate-900 dark:text-white">
                  Front Desk Guest Check-In {isOfflineMode && <span className="text-amber-500 font-mono text-xs">(SQLite Offline)</span>}
                </h4>
                <p className="text-xs text-slate-500">
                  Assign physical room and record government ID for {checkInModalBooking.guestName}.
                </p>
              </div>

              <form onSubmit={handleConfirmCheckIn} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Available Physical Room *
                  </label>
                  <select
                    required
                    value={selectedRoomNumber}
                    onChange={(e) => setSelectedRoomNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
                  >
                    <option value="">-- Select Vacant Physical Room --</option>
                    {physicalRooms
                      .filter((r) => r.occupancyStatus === 'vacant')
                      .map((r) => (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room #{r.roomNumber} (Floor {r.floor} · {r.roomTypeId.replace('-', ' ')} · {r.housekeepingStatus.toUpperCase()})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ID Proof Type *
                    </label>
                    <select
                      value={idProofType}
                      onChange={(e) => setIdProofType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Corporate ID">Corporate / Honda ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ID Proof Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={idProofNumber}
                      onChange={(e) => setIdProofNumber(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/60 text-slate-700 dark:text-slate-300">
                  <p className="font-bold">Reservation Summary:</p>
                  <p>Ref: <strong className="font-mono">{checkInModalBooking.bookingReference}</strong></p>
                  <p>Category: {checkInModalBooking.roomName}</p>
                  <p>Dates: {checkInModalBooking.checkIn} to {checkInModalBooking.checkOut} ({checkInModalBooking.nights} nights)</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckInModalBooking(null)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCheckingIn || !selectedRoomNumber}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isCheckingIn ? 'Allocating...' : 'Complete Check-In'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ROOM TRANSFER / CHANGE MODAL */}
        {transferBooking && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
              <div>
                <h4 className="text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-amber-500" />
                  <span>Transfer Guest Room</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Transfer in-house guest {transferBooking.guestName} from Room #{transferBooking.assignedRoomNumber} to another room.
                </p>
              </div>

              <form onSubmit={handleExecuteRoomTransfer} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Clean Room *
                  </label>
                  <select
                    required
                    value={targetTransferRoom}
                    onChange={(e) => setTargetTransferRoom(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold"
                  >
                    <option value="">-- Select Vacant Clean Room --</option>
                    {physicalRooms
                      .filter((r) => r.occupancyStatus === 'vacant' && r.housekeepingStatus === 'clean' && r.roomNumber !== transferBooking.assignedRoomNumber)
                      .map((r) => (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room #{r.roomNumber} (Floor {r.floor} · {r.roomTypeId.replace('-', ' ')})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transfer Reason *
                  </label>
                  <input
                    type="text"
                    required
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="e.g. AC cooling issue / Guest requested upper floor"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/60 text-slate-700 dark:text-slate-300">
                  <p className="font-bold">Transfer Summary:</p>
                  <p>Current: <strong>Room #{transferBooking.assignedRoomNumber}</strong> (will be marked DIRTY for housekeeping)</p>
                  <p>Target: <strong>{targetTransferRoom ? `Room #${targetTransferRoom}` : 'Select a room'}</strong> (will be marked OCCUPIED)</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTransferBooking(null)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isTransferring || !targetTransferRoom}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isTransferring ? 'Relocating...' : 'Execute Room Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT PHYSICAL ROOM MODAL */}
        {isPhysRoomModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-amber-500" />
                  <span>{editingPhysRoom ? `Edit Physical Room #${editingPhysRoom.roomNumber}` : 'Add Physical Room'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsPhysRoomModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePhysicalRoom} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Room Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 105 or 204"
                      disabled={!!editingPhysRoom}
                      value={physRoomForm.roomNumber}
                      onChange={(e) => setPhysRoomForm({ ...physRoomForm, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Floor Level *</label>
                    <select
                      value={physRoomForm.floor}
                      onChange={(e) => setPhysRoomForm({ ...physRoomForm, floor: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value={1}>Floor 1 (Ground / Executive)</option>
                      <option value={2}>Floor 2 (Palace Suites)</option>
                      <option value={3}>Floor 3 (Club Floor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Category / Type *</label>
                  <select
                    value={physRoomForm.roomTypeId}
                    onChange={(e) => setPhysRoomForm({ ...physRoomForm, roomTypeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="deluxe-room">Deluxe Room</option>
                    <option value="luxury-double">Luxury Double Room</option>
                    <option value="executive-suite">Executive Business Suite</option>
                    <option value="presidential-suite">Presidential Family Suite</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Housekeeping Status</label>
                    <select
                      value={physRoomForm.housekeepingStatus}
                      onChange={(e) => setPhysRoomForm({ ...physRoomForm, housekeepingStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="clean">Clean (Ready)</option>
                      <option value="dirty">Dirty (Needs Turnover)</option>
                      <option value="inspected">Inspected (Supervisor Approved)</option>
                      <option value="out_of_order">Out of Order (Maintenance)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Occupancy</label>
                    <select
                      value={physRoomForm.occupancyStatus}
                      onChange={(e) => setPhysRoomForm({ ...physRoomForm, occupancyStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Room Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Garden facing, acoustic insulated, extra sofa bed"
                    value={physRoomForm.notes}
                    onChange={(e) => setPhysRoomForm({ ...physRoomForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPhysRoomModalOpen(false)}
                    className="px-4 py-2 text-slate-500 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-xs cursor-pointer"
                  >
                    Save Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RECORD OPERATIONAL EXPENSE MODAL */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span>Record Property Operational Expense</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Expense Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="maintenance">Maintenance & Repairs (AC, Plumbing, Electrical)</option>
                    <option value="utilities">Utilities & Fuel (Generator Diesel, Electricity, Water)</option>
                    <option value="supplies">Kitchen & F&B Supplies</option>
                    <option value="laundry">Linen & Laundry Services</option>
                    <option value="other">General Administration & Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Description / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 200L Diesel for Generator Backup / AC Servicing Room 201"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 4500"
                      value={expenseForm.amount || ''}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Payment Method</label>
                    <select
                      value={expenseForm.paymentMethod}
                      onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="cash">Petty Cash</option>
                      <option value="upi">UPI / Online</option>
                      <option value="bank_transfer">Bank Transfer / NEFT</option>
                      <option value="credit_card">Company Card</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Receipt / Invoice Ref</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-8821"
                      value={expenseForm.receiptNumber}
                      onChange={(e) => setExpenseForm({ ...expenseForm, receiptNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Expense Date</label>
                    <input
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2 text-slate-500 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-xs cursor-pointer"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE SERVICE REQUEST TICKET MODAL */}
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <span>Create Service & Maintenance Ticket</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateServiceRequest} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Room Number *</label>
                    <select
                      value={serviceForm.roomNumber}
                      onChange={(e) => setServiceForm({ ...serviceForm, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                    >
                      {physicalRooms.map((r) => (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room #{r.roomNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Ticket Priority</label>
                    <select
                      value={serviceForm.priority}
                      onChange={(e) => setServiceForm({ ...serviceForm, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent / Immediate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Service Type *</label>
                    <select
                      value={serviceForm.requestType}
                      onChange={(e) => setServiceForm({ ...serviceForm, requestType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="room_service">In-Room Dining / Meal Delivery</option>
                      <option value="housekeeping">Housekeeping / Extra Towels / Linen</option>
                      <option value="maintenance">Maintenance (AC, Electrical, TV, Plumbing)</option>
                      <option value="laundry">Express Laundry & Pressing</option>
                      <option value="bell_desk">Luggage Assistance / Bell Desk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Assign To</label>
                    <select
                      value={serviceForm.assignedTo}
                      onChange={(e) => setServiceForm({ ...serviceForm, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="Housekeeping Desk">Housekeeping Team</option>
                      <option value="Kitchen Staff">Kitchen / Room Service</option>
                      <option value="Maintenance Engineer">Engineering / Electrician</option>
                      <option value="Duty Concierge">Duty Concierge</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    placeholder="Guest name or leave blank for room occupant"
                    value={serviceForm.guestName}
                    onChange={(e) => setServiceForm({ ...serviceForm, guestName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Description / Details *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Specify the service item, special instructions, or repair needed..."
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="px-4 py-2 text-slate-500 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-xs cursor-pointer"
                  >
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
