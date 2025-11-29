
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Settings, 
  Share2, 
  Info, 
  Play,
  Search,
  ExternalLink,
  ArrowLeft,
  Bell,
  Heart
} from 'lucide-react';
import { Channel, CategoryItem, Notification, AppSettings, PromoItem } from './types';
import { 
  loadChannels, 
  saveChannels, 
  loadCategories, 
  saveCategories, 
  loadSettings,
  saveSettings,
  getLatestNotification,
  loadPromos,
  savePromos,
  loadFavorites,
  toggleFavorite
} from './services/storageService';
import { DEFAULT_SETTINGS } from './constants';
import VideoPlayer from './components/VideoPlayer';
import AdminPanel from './components/AdminPanel';
import AboutModal from './components/AboutModal';
import AdBanner from './components/AdBanner';
import PromoSlider from './components/PromoSlider';

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Initial Load
  useEffect(() => {
    setChannels(loadChannels());
    setCategories(loadCategories());
    setSettings(loadSettings());
    setPromos(loadPromos());
    setFavoriteIds(loadFavorites());

    // Check for notifications
    const latest = getLatestNotification();
    if (latest) {
      const lastSeenId = localStorage.getItem('last_seen_notification_id');
      if (lastSeenId !== latest.id) {
        setNotification(latest);
        setShowNotification(true);
      }
    }
  }, []);

  // Helpers
  const handleUpdateChannels = (newChannels: Channel[]) => {
    setChannels(newChannels);
    saveChannels(newChannels);
  };

  const handleUpdateCategories = (newCategories: CategoryItem[]) => {
    setCategories(newCategories);
    saveCategories(newCategories);
  };

  const handleUpdatePromos = (newPromos: PromoItem[]) => {
    setPromos(newPromos);
    savePromos(newPromos);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const closeNotification = () => {
    if (notification) {
      localStorage.setItem('last_seen_notification_id', notification.id);
    }
    setShowNotification(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening channel
    const newFavs = toggleFavorite(id, favoriteIds);
    setFavoriteIds(newFavs);
  };

  const handleShare = async () => {
    const shareData = {
      title: settings.shareTitle,
      text: settings.shareText,
      url: settings.shareUrl || window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
    if (channel.category !== 'movie') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isRecent = (timestamp?: number) => {
    if (!timestamp) return false;
    const now = Date.now();
    const diff = now - timestamp;
    return diff < 24 * 60 * 60 * 1000; // 24 hours
  };

  const filteredChannels = channels.filter(c => {
    let matchesCategory = true;
    if (currentCategory === 'favorites') {
      matchesCategory = favoriteIds.includes(c.id);
    } else if (currentCategory !== 'all') {
      matchesCategory = c.category === currentCategory;
    }
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Navigation Logic
  const isMainPage = !selectedChannel && view === 'user';

  const handleBack = () => {
    if (view === 'admin') {
      setView('user');
    } else if (selectedChannel) {
      setSelectedChannel(null);
    }
  };

  // --- Browser View for Movie Downloads ---
  if (selectedChannel && selectedChannel.category === 'movie') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f1113] flex flex-col animate-fade-in">
        <header className="flex items-center justify-between px-4 py-3 bg-[#15181a] border-b border-gray-800 shadow-md relative z-10">
          <button 
            onClick={() => setSelectedChannel(null)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="flex-1 text-center px-4 overflow-hidden">
            <h2 className="text-white font-bold truncate text-sm md:text-base">{selectedChannel.name}</h2>
            <div className="text-xs text-[#00d1ff] flex items-center justify-center gap-1 opacity-80">
               Movie Download Page
            </div>
          </div>

          <a 
             href={selectedChannel.link}
             target="_blank"
             rel="noreferrer"
             className="p-2 text-gray-400 hover:text-[#00d1ff] transition-colors rounded-lg hover:bg-white/5"
             title="Open in new tab"
          >
             <ExternalLink size={20} />
          </a>
        </header>
        <div className="flex-1 relative bg-white">
           <iframe 
             src={selectedChannel.link} 
             className="absolute inset-0 w-full h-full border-0"
             title={selectedChannel.name}
             sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
           />
        </div>
        <div className="bg-[#0f1113] border-t border-gray-800 pb-safe">
           <AdBanner className="my-0 border-none rounded-none" />
        </div>
      </div>
    );
  }

  // --- Main App Render ---
  return (
    <div className="min-h-screen flex flex-col bg-[#0f1113] text-gray-100 font-sans selection:bg-[#00d1ff] selection:text-black">
      
      {/* Notification Toast */}
      {showNotification && notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-[90%] md:w-full bg-[#15181a] border-l-4 border-[#00d1ff] shadow-2xl rounded-lg p-4 animate-slide-left">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-[#00d1ff]/10 p-2 rounded-full mt-0.5 flex-shrink-0">
                <Bell size={20} className="text-[#00d1ff]" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">{notification.title}</h4>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{notification.message}</p>
              </div>
            </div>
            <button onClick={closeNotification} className="text-gray-500 hover:text-white transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f1113]/90 backdrop-blur-md border-b border-white/5 h-16 px-4 md:px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {!isMainPage ? (
            <button 
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00d1ff] group"
              aria-label="Go Back"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={toggleSidebar}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00d1ff]"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
          )}

          {/* Logo - Visible on all screen sizes now */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => {setSelectedChannel(null); setView('user');}} role="button">
             <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-[#00d1ff] to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,209,255,0.4)] transform group-hover:scale-105 transition-all duration-300 border border-white/10">
                <span className="font-black text-white text-base md:text-lg tracking-tighter leading-none select-none">M</span>
             </div>
             <h1 className="font-bold text-lg md:text-xl tracking-tight text-white block">
               MLive<span className="text-[#00d1ff]">TV</span>
             </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
           {isMainPage && (
             <>
               {/* Desktop Search */}
               <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                 <input 
                    type="text" 
                    placeholder="Search channels..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#15181a] border border-gray-700 rounded-full py-1.5 pl-9 pr-4 text-sm focus:border-[#00d1ff] focus:outline-none w-48 transition-all focus:w-64"
                 />
               </div>
               {/* Mobile Search Toggle */}
               <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={`p-2 rounded-lg transition-colors md:hidden ${isMobileSearchOpen ? 'text-[#00d1ff] bg-white/5' : 'text-gray-400 hover:text-white'}`}
               >
                 <Search size={20} />
               </button>
             </>
           )}

          <button onClick={handleShare} className="p-2 text-gray-400 hover:text-[#00d1ff] transition-colors rounded-lg hover:bg-white/5" title="Share">
            <Share2 size={20} />
          </button>
          
          {view !== 'admin' && (
            <button onClick={() => setView('admin')} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-[#15181a] border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white hidden sm:flex">
              <Settings size={16} /> Admin
            </button>
          )}
        </div>
      </header>

      {/* Mobile Search Bar (Expandable) */}
      {isMobileSearchOpen && isMainPage && (
        <div className="md:hidden px-4 py-3 bg-[#15181a] border-b border-gray-800 animate-slide-down">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search channels..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1113] border border-gray-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:border-[#00d1ff] focus:outline-none text-white"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-[#15181a] border-r border-white/5 z-50 transform transition-transform duration-300 ease-in-out pt-20 px-4 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg lg:hidden"
        >
          <X size={24} />
        </button>

        <div className="overflow-y-auto h-full pb-10 custom-scrollbar">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Browse</h3>
          <div className="space-y-1">
            {/* Favorites Category (Injected Manually) */}
            <button
              onClick={() => {
                setCurrentCategory('favorites');
                setIsSidebarOpen(false);
                setView('user');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between group transition-all ${currentCategory === 'favorites' ? 'bg-[#00d1ff]/10 text-[#00d1ff] font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                 <Heart size={18} className={currentCategory === 'favorites' ? 'fill-[#00d1ff]' : ''} />
                 <span>Favorites</span>
              </div>
              {currentCategory === 'favorites' && <div className="w-1.5 h-1.5 rounded-full bg-[#00d1ff]" />}
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setCurrentCategory(cat.id);
                  setIsSidebarOpen(false);
                  setView('user');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between group transition-all ${currentCategory === cat.id ? 'bg-[#00d1ff]/10 text-[#00d1ff] font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <span>{cat.label}</span>
                {currentCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-[#00d1ff]" />}
              </button>
            ))}
            
            <div className="h-px bg-white/5 my-2 mx-2"></div>
            
            <button 
              onClick={() => { setIsAboutOpen(true); setIsSidebarOpen(false); }}
              className="w-full text-left px-3 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
            >
              <Info size={18} /> <span>About Us</span>
            </button>
            <button 
              onClick={handleShare}
              className="w-full text-left px-3 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
            >
              <Share2 size={18} /> <span>Share App</span>
            </button>
            
            {/* Mobile Admin Link in Sidebar */}
            <button 
               onClick={() => { setView('admin'); setIsSidebarOpen(false); }}
               className="w-full text-left px-3 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors sm:hidden"
            >
               <Settings size={18} /> <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full transition-all pb-safe">
        {view === 'admin' ? (
          <AdminPanel 
            channels={channels}
            categories={categories}
            promos={promos}
            settings={settings}
            onUpdateChannels={handleUpdateChannels}
            onUpdateCategories={handleUpdateCategories}
            onUpdatePromos={handleUpdatePromos}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setView('user')}
          />
        ) : (
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            
            {/* Top Ad Banner */}
            {isMainPage && (
              <AdBanner dataAdFormat="horizontal" className="mt-0" />
            )}

            {/* Promotional Banner Carousel */}
            {isMainPage && promos.length > 0 && (
               <PromoSlider items={promos} />
            )}
            
            {/* Player Section */}
            {selectedChannel && (
              <div className="animate-slide-down">
                <div className="bg-[#15181a] rounded-2xl p-0 md:p-6 shadow-2xl border border-gray-800 overflow-hidden">
                  <div className="flex items-center justify-between mb-0 md:mb-4 p-3 md:p-0 bg-[#15181a] md:bg-transparent border-b md:border-none border-gray-800">
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 truncate max-w-[200px] md:max-w-none">
                        <span className="w-1.5 h-6 md:w-2 md:h-8 bg-[#00d1ff] rounded-full mr-1 hidden md:block"></span>
                        {selectedChannel.name}
                      </h2>
                      <p className="text-xs md:text-sm text-gray-400 md:ml-4 mt-0.5 md:mt-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        Live Stream
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedChannel(null)} 
                      className="text-gray-500 hover:text-white transition-colors p-2 bg-gray-800/50 rounded-lg md:bg-transparent"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="md:rounded-xl overflow-hidden bg-black">
                     <VideoPlayer url={selectedChannel.link} title={selectedChannel.name} />
                  </div>
                </div>
                {/* Ad Below Video */}
                <AdBanner />
              </div>
            )}

            {/* Grid Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg md:text-xl font-bold text-gray-200">
                  {currentCategory === 'favorites' ? 'Your Favorites' : (
                     currentCategory === 'all' ? 'All Channels' : categories.find(c => c.id === currentCategory)?.label || currentCategory
                  )}
                </h2>
                <div className="text-xs md:text-sm text-gray-500">
                  {filteredChannels.length} Channels
                </div>
              </div>

              {filteredChannels.length > 0 ? (
                <div 
                  className="grid gap-3 pb-8"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(109px, 1fr))' }}
                >
                  {filteredChannels.map(channel => {
                    const isFav = favoriteIds.includes(channel.id);
                    return (
                      <div 
                        key={channel.id}
                        className={`group bg-[#15181a] hover:bg-[#1a1d21] border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden transition-all duration-300 active:scale-95 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] cursor-pointer flex flex-col relative ${selectedChannel?.id === channel.id ? 'ring-2 ring-[#00d1ff]' : ''}`}
                        style={{ height: '152.52px' }}
                        onClick={() => handleChannelClick(channel)}
                      >
                        <div className="w-full flex-1 bg-[#0a0c0e] relative overflow-hidden p-2 flex items-center justify-center">
                          <img 
                            src={channel.logo} 
                            alt={channel.name} 
                            className="w-full h-full object-contain opacity-90 md:opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-500"
                            loading="lazy"
                          />
                          
                          {/* Favorite Button */}
                          <div className="absolute top-1 left-1 z-30">
                              <button 
                                onClick={(e) => handleToggleFavorite(e, channel.id)}
                                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-sm"
                              >
                                <Heart size={14} className={`${isFav ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                              </button>
                          </div>
                          
                          {isRecent(channel.createdAt) && (
                            <div className="absolute top-0 right-0 bg-[#00d1ff] text-[#0f1113] text-[9px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm z-20">
                              NEW
                            </div>
                          )}

                          {/* Overlay: Visible on hover for desktop, handled by tap on mobile */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm duration-500 z-10 md:flex hidden">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 ${channel.category === 'movie' ? 'bg-green-500 text-black' : 'bg-[#00d1ff] text-[#0f1113]'}`}>
                                {channel.category === 'movie' ? <ExternalLink size={20} /> : <Play size={20} fill="currentColor" />}
                             </div>
                          </div>
                        </div>
                        
                        <div className="p-2 h-[42px] flex flex-col justify-center bg-[#15181a] border-t border-gray-800/50">
                          <h3 className="font-bold text-gray-200 line-clamp-1 group-hover:text-[#00d1ff] transition-colors text-[11px] leading-tight text-center">{channel.name}</h3>
                          <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide text-center mt-0.5 block truncate">
                            {categories.find(c => c.id === channel.category)?.label || channel.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-[#15181a] rounded-2xl border border-gray-800 border-dashed mx-2">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="text-lg">No channels found</p>
                  <p className="text-sm opacity-60">
                    {currentCategory === 'favorites' ? 'Add channels to favorites by clicking the heart icon.' : 'Try changing the category or search term.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <AboutModal 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
        content={settings.aboutContent}
      />
    </div>
  );
}

export default App;