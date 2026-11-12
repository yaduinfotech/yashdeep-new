import { useState } from 'react';
import { Room, BookingData } from '../types/hotel';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Check,
  Upload,
  Eye,
  EyeOff,
  BedDouble,
  DollarSign,
  Calendar,
  Users,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface OwnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  onSaveRooms: (updatedRooms: Room[]) => void;
  bookings: BookingData[];
  onUpdateBookingStatus: (bookingId: string, status: string) => void;
}

export default function OwnerPortalModal({
  isOpen,
  onClose,
  rooms,
  onSaveRooms,
  bookings,
  onUpdateBookingStatus,
}: OwnerPortalModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [masterPin, setMasterPin] = useState(() => {
    return localStorage.getItem('ydp_owner_pin') || '8222';
  });

  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'settings'>('rooms');

  // Form for adding/editing a room
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState<'deluxe' | 'suite' | 'executive' | 'family'>('deluxe');
  const [formPrice, setFormPrice] = useState(3000);
  const [formOriginalPrice, setFormOriginalPrice] = useState(4000);
  const [formSize, setFormSize] = useState(350);
  const [formBedType, setFormBedType] = useState('1 King Bed');
  const [formOccupancy, setFormOccupancy] = useState(2);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('/src/assets/images/room_deluxe_king_1794500883485.jpg');
  const [formAmenities, setFormAmenities] = useState('High-Speed Wi-Fi, 4K Smart TV, Central AC, Luxury Toiletries');
  const [formUnits, setFormUnits] = useState(5);

  if (!isOpen) return null;

  // PIN Login
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === masterPin) {
      setIsAuthenticated(true);
      setPinError(false);
      trackEvent('owner_login_success', 'click', 'Owner authenticated with master PIN');
    } else {
      setPinError(true);
    }
  };

  // Handle local image file upload preview
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Edit Room Modal
  const handleStartEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setFormName(room.name);
    setFormTagline(room.tagline);
    setFormCategory(room.category);
    setFormPrice(room.price);
    setFormOriginalPrice(room.originalPrice);
    setFormSize(room.sizeSqFt);
    setFormBedType(room.bedType);
    setFormOccupancy(room.maxOccupancy);
    setFormDescription(room.description);
    setFormImageUrl(room.image);
    setFormAmenities(room.amenities.join(', '));
    setFormUnits(room.availableUnits);
    setIsAddingRoom(true);
  };

  // Save or Add Room
  const handleSaveRoomForm = (e: React.FormEvent) => {
    e.preventDefault();
    const amenitiesArray = formAmenities.split(',').map((a) => a.trim()).filter(Boolean);

    if (editingRoomId) {
      // Update existing
      const updated = rooms.map((r) => {
        if (r.id === editingRoomId) {
          return {
            ...r,
            name: formName,
            tagline: formTagline,
            category: formCategory,
            price: Number(formPrice),
            originalPrice: Number(formOriginalPrice),
            sizeSqFt: Number(formSize),
            bedType: formBedType,
            maxOccupancy: Number(formOccupancy),
            description: formDescription,
            image: formImageUrl,
            amenities: amenitiesArray,
            availableUnits: Number(formUnits),
          };
        }
        return r;
      });
      onSaveRooms(updated);
    } else {
      // Add new
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: formName,
        tagline: formTagline,
        category: formCategory,
        price: Number(formPrice),
        originalPrice: Number(formOriginalPrice),
        sizeSqFt: Number(formSize),
        bedType: formBedType,
        maxOccupancy: Number(formOccupancy),
        amenities: amenitiesArray,
        description: formDescription,
        image: formImageUrl,
        gallery: [formImageUrl],
        rating: 5.0,
        reviewsCount: 1,
        availableUnits: Number(formUnits),
        isAvailable: true,
      };
      onSaveRooms([newRoom, ...rooms]);
    }

    setIsAddingRoom(false);
    setEditingRoomId(null);
    trackEvent('owner_save_room', 'interaction', `Room: ${formName}, Price: ₹${formPrice}`);
  };

  // Delete Room from state and SQL
  const handleDeleteRoom = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const updated = rooms.filter((r) => r.id !== id);
      onSaveRooms(updated);
      try {
        await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete room from SQL:', err);
      }
      trackEvent('owner_delete_room', 'click', `RoomId: ${id}`);
    }
  };

  // Toggle Availability
  const handleToggleRoomAvailability = (id: string) => {
    const updated = rooms.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          isAvailable: r.isAvailable === false ? true : false,
        };
      }
      return r;
    });
    onSaveRooms(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl my-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-royal text-lg font-bold text-white">
                YashDeep Palace · Owner & Manager Portal
              </h3>
              <p className="text-[11px] text-slate-400">
                Live Room Inventory, Dynamic Rates & Booking Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AUTHENTICATION VIEW */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-md mx-auto text-center space-y-6">
            <div className="w-14 h-14 bg-amber-400/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-xl font-bold font-royal text-slate-900 dark:text-white">
                Manager PIN Verification
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter your secure 4-digit property management PIN to access live site rates and room controls.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="Enter PIN (Default: 8222)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center text-2xl tracking-widest font-mono py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {pinError && (
                  <p className="text-xs font-semibold text-red-500 mt-2">
                    Incorrect PIN. Please use master PIN: 8222
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
              >
                Access Owner Portal
              </button>
            </form>

            <p className="text-[11px] text-slate-400">
              Demo Access Hint: The default PIN is <strong>8222</strong> (configurable in Settings).
            </p>
          </div>
        ) : (
          /* OWNER CMS DASHBOARD */
          <div className="flex-1 flex flex-col">
            {/* Top Navigation Tabs */}
            <div className="px-6 pt-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex gap-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('rooms');
                    setIsAddingRoom(false);
                  }}
                  className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'rooms'
                      ? 'border-amber-400 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Room Inventory & Rates ({rooms.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('bookings');
                    setIsAddingRoom(false);
                  }}
                  className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'border-amber-400 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Guest Bookings ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('settings');
                    setIsAddingRoom(false);
                  }}
                  className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'settings'
                      ? 'border-amber-400 text-amber-600 dark:text-amber-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Property PIN & Settings
                </button>
              </div>

              {activeTab === 'rooms' && !isAddingRoom && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoomId(null);
                    setFormName('');
                    setFormTagline('');
                    setFormPrice(3200);
                    setFormOriginalPrice(4200);
                    setFormSize(360);
                    setFormDescription('');
                    setIsAddingRoom(true);
                  }}
                  className="mb-2 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Room Type</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {/* TAB 1: ROOMS MANAGEMENT */}
              {activeTab === 'rooms' && (
                <div>
                  {isAddingRoom ? (
                    /* ADD / EDIT ROOM FORM */
                    <form onSubmit={handleSaveRoomForm} className="space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {editingRoomId ? 'Edit Room Type & Tariffs' : 'Add New Room Category'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingRoom(false)}
                          className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Room Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. Maharaja Suite with Jacuzzi"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Tagline / Highlight
                          </label>
                          <input
                            type="text"
                            value={formTagline}
                            onChange={(e) => setFormTagline(e.target.value)}
                            placeholder="e.g. Panoramic Khuskheda Industrial Skyline View"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Live Rate (₹ / Night) *
                          </label>
                          <input
                            type="number"
                            required
                            value={formPrice}
                            onChange={(e) => setFormPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Original Rack Rate (₹)
                          </label>
                          <input
                            type="number"
                            required
                            value={formOriginalPrice}
                            onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Room Size (Sq Ft)
                          </label>
                          <input
                            type="number"
                            value={formSize}
                            onChange={(e) => setFormSize(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Available Inventory
                          </label>
                          <input
                            type="number"
                            value={formUnits}
                            onChange={(e) => setFormUnits(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Category
                          </label>
                          <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          >
                            <option value="deluxe">Deluxe</option>
                            <option value="suite">Royal Suite</option>
                            <option value="executive">Executive</option>
                            <option value="family">Family Suite</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Bed Configuration
                          </label>
                          <input
                            type="text"
                            value={formBedType}
                            onChange={(e) => setFormBedType(e.target.value)}
                            placeholder="e.g. 1 King Bed or 2 Twins"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Max Occupancy
                          </label>
                          <select
                            value={formOccupancy}
                            onChange={(e) => setFormOccupancy(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          >
                            <option value={1}>1 Guest</option>
                            <option value={2}>2 Guests</option>
                            <option value={3}>3 Guests</option>
                            <option value={4}>4 Guests</option>
                            <option value={5}>5 Guests</option>
                          </select>
                        </div>
                      </div>

                      {/* Image Upload / URL input */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Room Image (Upload File or Enter URL)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formImageUrl}
                            onChange={(e) => setFormImageUrl(e.target.value)}
                            placeholder="/src/assets/... or https://..."
                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-mono"
                          />
                          <label className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white rounded-lg flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {formImageUrl && (
                          <div className="mt-2 w-36 h-24 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                            <img
                              src={formImageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Amenities (Comma Separated)
                        </label>
                        <input
                          type="text"
                          value={formAmenities}
                          onChange={(e) => setFormAmenities(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Room Description
                        </label>
                        <textarea
                          rows={3}
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsAddingRoom(false)}
                          className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold uppercase tracking-wider rounded-lg shadow-sm"
                        >
                          {editingRoomId ? 'Save Changes' : 'Publish Room Type'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ROOM INVENTORY TABLE */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>All changes made here update the public website & booking engine immediately:</span>
                      </div>

                      <div className="space-y-3">
                        {rooms.map((room) => (
                          <div
                            key={room.id}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={room.image}
                                alt={room.name}
                                className="w-16 h-16 rounded-lg object-cover shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                    {room.name}
                                  </h4>
                                  {room.isAvailable === false ? (
                                    <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                                      Sold Out
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                      Available
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {room.bedType} · {room.sizeSqFt} sq ft · {room.availableUnits} units in stock
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                                    ₹{room.price.toLocaleString('en-IN')} / night
                                  </span>
                                  <span className="text-[10px] text-slate-400 line-through">
                                    ₹{room.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => handleToggleRoomAvailability(room.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                  room.isAvailable === false
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                                title="Toggle Available / Sold Out status"
                              >
                                {room.isAvailable === false ? 'Mark Available' : 'Mark Sold Out'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStartEditRoom(room)}
                                className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                                title="Edit Room & Rates"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteRoom(room.id, room.name)}
                                className="p-2 text-red-500 hover:text-red-700 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                                title="Delete Room Type"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GUEST BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Manage customer bookings made via instant UPI & Card checkout:</span>
                    <span>Total Bookings: {bookings.length}</span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <Calendar className="w-8 h-8 mx-auto" />
                      <p className="text-xs font-semibold">No reservations recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                              {b.bookingReference}
                            </span>
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {b.paymentStatus.toUpperCase()} · ₹{b.grandTotal.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-300">
                            <div>
                              <p className="text-[10px] text-slate-400">Guest:</p>
                              <p className="font-bold text-slate-900 dark:text-white">{b.guestName}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400">Phone & Email:</p>
                              <p className="truncate">{b.guestPhone}</p>
                              <p className="truncate text-slate-400">{b.guestEmail}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400">Room & Dates:</p>
                              <p className="font-semibold text-slate-900 dark:text-white truncate">{b.roomName}</p>
                              <p>{b.checkIn} to {b.checkOut}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400">Payment:</p>
                              <p className="font-mono">{b.paymentMethod.toUpperCase()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-md space-y-6 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                      Change Manager Master PIN
                    </h4>
                    <p className="text-slate-500 mb-3">
                      This PIN protects site settings and room inventory rates.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        maxLength={6}
                        defaultValue={masterPin}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.length >= 4) {
                            setMasterPin(val);
                            localStorage.setItem('ydp_owner_pin', val);
                          }
                        }}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                      />
                      <span className="text-[11px] text-emerald-600 font-semibold self-center">
                        PIN Auto-saved
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAuthenticated(false)}
                      className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-lg cursor-pointer"
                    >
                      Lock Portal / Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
