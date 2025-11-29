
import React, { useState, useEffect } from 'react';
import { Channel, CategoryItem, Notification, AppSettings, PromoItem } from '../types';
import { ADMIN_PASSWORD } from '../constants';
import { 
  Lock, LogIn, Plus, Trash2, Edit2, Save, X, LogOut, 
  LayoutGrid, Tv, Bell, Send, Settings as SettingsIcon, CheckCircle,
  Eye, EyeOff, Megaphone, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { saveNotifications, loadNotifications } from '../services/storageService';

interface AdminPanelProps {
  channels: Channel[];
  categories: CategoryItem[];
  promos: PromoItem[];
  settings: AppSettings;
  onUpdateChannels: (channels: Channel[]) => void;
  onUpdateCategories: (categories: CategoryItem[]) => void;
  onUpdatePromos: (promos: PromoItem[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

type Tab = 'channels' | 'categories' | 'promos' | 'notifications' | 'settings';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  channels, 
  categories, 
  promos,
  settings,
  onUpdateChannels, 
  onUpdateCategories, 
  onUpdatePromos,
  onUpdateSettings,
  onClose 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('channels');

  // --- Channel Form State ---
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState<string>('tamil');

  // --- Category Form State ---
  const [catName, setCatName] = useState('');

  // --- Promo Form State ---
  const [promoTitle, setPromoTitle] = useState('');
  const [promoImg, setPromoImg] = useState('');
  const [promoLink, setPromoLink] = useState('');

  // --- Notification Form State ---
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifSuccess, setNotifSuccess] = useState('');

  // --- Settings Form State ---
  const [aboutContent, setAboutContent] = useState(settings.aboutContent);
  const [shareTitle, setShareTitle] = useState(settings.shareTitle);
  const [shareText, setShareText] = useState(settings.shareText);
  const [shareUrl, setShareUrl] = useState(settings.shareUrl);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Update form state if props change (e.g. initial load)
  useEffect(() => {
    setAboutContent(settings.aboutContent);
    setShareTitle(settings.shareTitle);
    setShareText(settings.shareText);
    setShareUrl(settings.shareUrl);
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  // --- Channel Logic ---
  const handleSaveChannel = () => {
    if (!name.trim() || !link.trim()) {
      alert('Name and Link are required');
      return;
    }

    let updatedChannels = [...channels];

    if (editId) {
      updatedChannels = updatedChannels.map(c => 
        c.id === editId ? { ...c, name, logo, link, category } : c
      );
    } else {
      const newChannel: Channel = {
        id: uuidv4(),
        name,
        logo: logo || `https://via.placeholder.com/320x180?text=${encodeURIComponent(name)}`,
        link,
        category,
        createdAt: Date.now()
      };
      updatedChannels.push(newChannel);
    }

    onUpdateChannels(updatedChannels);
    resetChannelForm();
  };

  const handleEditChannelStart = (c: Channel) => {
    setEditId(c.id);
    setName(c.name);
    setLogo(c.logo);
    setLink(c.link);
    setCategory(c.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteChannel = (id: string) => {
    if (confirm('Are you sure you want to delete this channel?')) {
      onUpdateChannels(channels.filter(c => c.id !== id));
    }
  };

  const resetChannelForm = () => {
    setEditId(null);
    setName('');
    setLogo('');
    setLink('');
    setCategory('tamil');
  };

  // --- Category Logic ---
  const handleAddCategory = () => {
    if (!catName.trim()) return;
    const id = catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    if (categories.some(c => c.id === id)) {
      alert('Category already exists!');
      return;
    }

    const newCat: CategoryItem = { id, label: catName };
    onUpdateCategories([...categories, newCat]);
    setCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (id === 'all') return;
    if (confirm(`Delete category '${id}'? Channels in this category might get hidden.`)) {
      onUpdateCategories(categories.filter(c => c.id !== id));
    }
  };

  // --- Promo Logic ---
  const handleAddPromo = () => {
    if (!promoImg.trim()) {
      alert("Image URL is required");
      return;
    }

    const newPromo: PromoItem = {
      id: uuidv4(),
      title: promoTitle || 'Untitled Promo',
      imageUrl: promoImg,
      link: promoLink,
      isActive: true
    };

    onUpdatePromos([...promos, newPromo]);
    setPromoTitle('');
    setPromoImg('');
    setPromoLink('');
  };

  const handleDeletePromo = (id: string) => {
    if (confirm("Delete this banner?")) {
      onUpdatePromos(promos.filter(p => p.id !== id));
    }
  };

  // --- Notification Logic ---
  const handleSendNotification = () => {
    if (!notifTitle.trim() || !notifMsg.trim()) {
      alert("Title and message required");
      return;
    }

    const newNotif: Notification = {
      id: uuidv4(),
      title: notifTitle,
      message: notifMsg,
      timestamp: Date.now()
    };

    const current = loadNotifications();
    saveNotifications([...current, newNotif]);
    
    setNotifTitle('');
    setNotifMsg('');
    setNotifSuccess('Notification sent successfully! Users will see it on next refresh.');
    setTimeout(() => setNotifSuccess(''), 3000);
  };

  // --- Settings Logic ---
  const handleSaveSettings = () => {
    onUpdateSettings({
      aboutContent,
      shareTitle,
      shareText,
      shareUrl
    });
    setSettingsSuccess('Settings updated successfully!');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-[#15181a] rounded-xl shadow-lg border border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-[#00d1ff]" />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Access</h2>
          <p className="text-gray-400 text-sm mt-1">Enter password to manage channels</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00d1ff] transition-colors pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {error && <p className="text-red-500 text-xs mt-2 absolute -bottom-5 left-0">{error}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#00d1ff] hover:bg-[#00b8e6] text-[#0f1113] font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn size={18} /> Login
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
        <button
          onClick={onClose}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <LogOut size={16} /> Exit
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-800 pb-1 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab('channels')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'channels' ? 'bg-[#15181a] border-[#00d1ff] text-[#00d1ff]' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          <Tv size={18} /> Manage Channels
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'categories' ? 'bg-[#15181a] border-[#00d1ff] text-[#00d1ff]' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          <LayoutGrid size={18} /> Categories
        </button>
        <button 
          onClick={() => setActiveTab('promos')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'promos' ? 'bg-[#15181a] border-[#00d1ff] text-[#00d1ff]' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          <Megaphone size={18} /> Promotions
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'notifications' ? 'bg-[#15181a] border-[#00d1ff] text-[#00d1ff]' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          <Bell size={18} /> Notifications
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'settings' ? 'bg-[#15181a] border-[#00d1ff] text-[#00d1ff]' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          <SettingsIcon size={18} /> App Settings
        </button>
      </div>

      {/* === CHANNELS TAB === */}
      {activeTab === 'channels' && (
        <>
          {/* Editor Form */}
          <div className="bg-[#15181a] p-6 rounded-xl border border-gray-800 mb-8 shadow-lg">
            <h3 className="text-lg font-semibold text-[#00d1ff] mb-4 flex items-center gap-2">
              {editId ? <Edit2 size={18} /> : <Plus size={18} />}
              {editId ? 'Edit Channel' : 'Add New Channel'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase font-semibold">Channel Name</label>
                <input
                  className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none"
                  placeholder="e.g. Sun TV"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                 <label className="text-xs text-gray-400 uppercase font-semibold">Category</label>
                 <select
                  className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-gray-400 uppercase font-semibold">Stream URL (m3u8, mp4, YouTube)</label>
                <input
                  className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none font-mono text-sm"
                  placeholder="https://..."
                  value={link}
                  onChange={e => setLink(e.target.value)}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-gray-400 uppercase font-semibold">Logo URL</label>
                <input
                  className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none font-mono text-sm"
                  placeholder="https://...png"
                  value={logo}
                  onChange={e => setLogo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveChannel}
                className="flex-1 bg-[#00d1ff] hover:bg-[#00b8e6] text-[#0f1113] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,209,255,0.3)]"
              >
                <Save size={18} /> {editId ? 'Save Changes' : 'Add Channel'}
              </button>
              {editId && (
                <button
                  onClick={resetChannelForm}
                  className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="bg-[#15181a] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-[#1a1d21]">
              <h3 className="font-semibold text-gray-300">Channel List ({channels.length})</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {channels.map(channel => (
                <div key={channel.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-[#1a1d21] transition-colors">
                  <div className="w-24 h-14 bg-gray-900 rounded-md overflow-hidden flex-shrink-0 border border-gray-800">
                    <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{channel.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className="bg-gray-800 px-2 py-0.5 rounded text-[#00d1ff] border border-gray-700">
                        {categories.find(c => c.id === channel.category)?.label || channel.category}
                      </span>
                      <span className="truncate max-w-[200px] opacity-60 font-mono">{channel.link}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEditChannelStart(channel)}
                      className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* === CATEGORIES TAB === */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Add Category */}
           <div className="md:col-span-1 bg-[#15181a] p-6 rounded-xl border border-gray-800 h-fit">
              <h3 className="text-lg font-semibold text-[#00d1ff] mb-4">Add Category</h3>
              <div className="space-y-4">
                 <input 
                    placeholder="Category Name (e.g. Comedy)"
                    className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-3 text-white focus:border-[#00d1ff] focus:outline-none"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                 />
                 <button 
                   onClick={handleAddCategory}
                   className="w-full bg-[#00d1ff] hover:bg-[#00b8e6] text-[#0f1113] font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                 >
                   <Plus size={18} /> Add Category
                 </button>
              </div>
           </div>

           {/* List Categories */}
           <div className="md:col-span-2 bg-[#15181a] rounded-xl border border-gray-800 overflow-hidden">
             <div className="p-4 border-b border-gray-800 bg-[#1a1d21]">
               <h3 className="font-semibold text-gray-300">Existing Categories</h3>
             </div>
             <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                {categories.map((cat) => (
                   <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-[#1a1d21]">
                      <div>
                         <div className="font-medium text-white">{cat.label}</div>
                         <div className="text-xs text-gray-500 font-mono">ID: {cat.id}</div>
                      </div>
                      {!cat.isSystem ? (
                        <button 
                           onClick={() => handleDeleteCategory(cat.id)}
                           className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"
                           title="Delete Category"
                        >
                           <Trash2 size={18} />
                        </button>
                      ) : (
                         <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">System</span>
                      )}
                   </div>
                ))}
             </div>
           </div>
        </div>
      )}

      {/* === PROMOS TAB === */}
      {activeTab === 'promos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Add Promo */}
           <div className="bg-[#15181a] p-6 rounded-xl border border-gray-800 h-fit">
              <h3 className="text-lg font-semibold text-[#00d1ff] mb-4 flex items-center gap-2">
                 <Plus size={18} /> Add Banner
              </h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">Title</label>
                    <input 
                       className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none"
                       placeholder="e.g. Follow us on Instagram"
                       value={promoTitle}
                       onChange={e => setPromoTitle(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">Image URL (Wide Aspect Ratio)</label>
                    <div className="relative">
                       <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                       <input 
                          className="w-full bg-[#0f1113] border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-white focus:border-[#00d1ff] focus:outline-none font-mono text-xs"
                          placeholder="https://..."
                          value={promoImg}
                          onChange={e => setPromoImg(e.target.value)}
                       />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">Link URL (Optional)</label>
                    <div className="relative">
                       <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                       <input 
                          className="w-full bg-[#0f1113] border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-white focus:border-[#00d1ff] focus:outline-none font-mono text-xs"
                          placeholder="https://..."
                          value={promoLink}
                          onChange={e => setPromoLink(e.target.value)}
                       />
                    </div>
                 </div>
                 <button 
                   onClick={handleAddPromo}
                   className="w-full bg-[#00d1ff] hover:bg-[#00b8e6] text-[#0f1113] font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                 >
                   <Plus size={18} /> Add to Carousel
                 </button>
              </div>
           </div>

           {/* List Promos */}
           <div className="bg-[#15181a] rounded-xl border border-gray-800 overflow-hidden">
             <div className="p-4 border-b border-gray-800 bg-[#1a1d21]">
               <h3 className="font-semibold text-gray-300">Active Banners</h3>
             </div>
             <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                {promos.map((item) => (
                   <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-[#1a1d21]">
                      <div className="aspect-[3/1] bg-gray-900 rounded-lg overflow-hidden border border-gray-800 relative group">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button 
                              onClick={() => handleDeletePromo(item.id)}
                              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                           >
                              <Trash2 size={20} />
                           </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="font-bold text-white text-sm">{item.title}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.link || 'No link'}</div>
                         </div>
                      </div>
                   </div>
                ))}
                {promos.length === 0 && (
                  <div className="p-8 text-center text-gray-500 italic">No banners active. Add one to show on main page.</div>
                )}
             </div>
           </div>
        </div>
      )}

      {/* === NOTIFICATIONS TAB === */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-[#15181a] p-6 rounded-xl border border-gray-800 h-fit">
              <h3 className="text-lg font-semibold text-[#00d1ff] mb-4 flex items-center gap-2">
                 <Send size={18} /> Send Push Notification
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                 Send a message to all users. It will appear as a popup when they open the app.
              </p>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">Title</label>
                    <input 
                       className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none"
                       value={notifTitle}
                       onChange={e => setNotifTitle(e.target.value)}
                       placeholder="e.g. New Channels Added!"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">Message</label>
                    <textarea 
                       className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none h-32 resize-none"
                       value={notifMsg}
                       onChange={e => setNotifMsg(e.target.value)}
                       placeholder="Enter your announcement details here..."
                    />
                 </div>
                 
                 <button 
                    onClick={handleSendNotification}
                    className="w-full bg-[#00d1ff] hover:bg-[#00b8e6] text-[#0f1113] font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,209,255,0.3)]"
                 >
                    <Send size={18} /> Send to All Users
                 </button>

                 {notifSuccess && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-2 rounded text-center text-sm animate-fade-in">
                       {notifSuccess}
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-[#15181a] p-6 rounded-xl border border-gray-800 opacity-60 pointer-events-none">
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
                 <Bell size={48} className="text-gray-600" />
                 <h4 className="text-gray-400 font-medium">Notification Preview</h4>
                 <div className="w-full max-w-sm bg-[#1a1d21] border border-[#00d1ff] rounded-lg p-4 shadow-lg text-left relative">
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    <h5 className="font-bold text-white text-sm mb-1">{notifTitle || 'Title Preview'}</h5>
                    <p className="text-xs text-gray-400">{notifMsg || 'Message preview will appear here...'}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* === SETTINGS TAB === */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* About Us Content */}
          <div className="bg-[#15181a] p-6 rounded-xl border border-gray-800 h-fit">
            <h3 className="text-lg font-semibold text-[#00d1ff] mb-4">About Us Content</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">Content Text</label>
                <textarea 
                  className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none h-64 resize-none leading-relaxed text-sm"
                  value={aboutContent}
                  onChange={e => setAboutContent(e.target.value)}
                  placeholder="Enter the text for the About Us modal..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Line breaks will be preserved.
                </p>
              </div>
            </div>
          </div>

          {/* Share Settings */}
          <div className="bg-[#15181a] p-6 rounded-xl border border-gray-800 h-fit space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#00d1ff] mb-4">Share Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">Share Title</label>
                  <input 
                    className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none"
                    value={shareTitle}
                    onChange={e => setShareTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">Share Message</label>
                  <input 
                    className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none"
                    value={shareText}
                    onChange={e => setShareText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold block mb-1">Custom Share URL (Optional)</label>
                  <input 
                    className="w-full bg-[#0f1113] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#00d1ff] focus:outline-none font-mono text-sm"
                    value={shareUrl}
                    onChange={e => setShareUrl(e.target.value)}
                    placeholder="Leave empty to use current site URL"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
               <button 
                  onClick={handleSaveSettings}
                  className="w-full bg-[#00d1ff] hover:bg-[#00b8e6] text-[#0f1113] font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,209,255,0.3)] transition-all"
               >
                  <Save size={18} /> Save All Settings
               </button>

               {settingsSuccess && (
                  <div className="mt-4 bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-2 rounded text-center text-sm flex items-center justify-center gap-2 animate-fade-in">
                     <CheckCircle size={16} /> {settingsSuccess}
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
