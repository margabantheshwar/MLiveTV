
import { Channel, CategoryItem, AppSettings } from './types';

export const STORAGE_KEY = 'live_tv_channels_v5';
export const CATEGORIES_KEY = 'live_tv_categories_v1';
export const NOTIFICATIONS_KEY = 'live_tv_notifications_v1';
export const SETTINGS_KEY = 'live_tv_settings_v1';

export const ADMIN_PASSWORD = '12345'; // In a real app, use backend auth

// REPLACE THIS WITH YOUR REAL ADSENSE PUBLISHER ID
export const ADSENSE_CLIENT_ID = 'ca-pub-0000000000000000'; 

export const DEFAULT_SETTINGS: AppSettings = {
  aboutContent: `The content on MLiveTV (the “Website”) is provided for informational and entertainment purposes only.\n\nMLiveTV does not stream or host any channels directly. All live TV channels and streams featured on our platform are publicly available on the internet and are aggregated from third-party sources.\n\nWe do not own, control, or claim any rights to the content provided.`,
  shareTitle: 'MLiveTV',
  shareText: 'Watch Live TV Channels on MLiveTV!',
  shareUrl: ''
};

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'All Channels', isSystem: true },
  { id: 'tamil', label: 'Tamil' },
  { id: 'news', label: 'News' },
  { id: 'sports', label: 'Sports' },
  { id: 'movie', label: 'Movies Download' },
  { id: 'kids', label: 'Kids' },
  { id: 'music', label: 'Music' },
  { id: 'international', label: 'International' },
  { id: 'devotional', label: 'Devotional' },
];

export const DEFAULT_CHANNELS: Channel[] = [
  { 
    id: '1', 
    name: "Sample News", 
    logo: "https://picsum.photos/id/1/320/180", 
    link: "https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig", 
    category: "news",
    createdAt: Date.now() 
  },
  { 
    id: '2', 
    name: "Sample Sports (HLS)", 
    logo: "https://picsum.photos/id/2/320/180", 
    link: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", 
    category: "sports",
    createdAt: Date.now() - 100000000 
  },
  { 
    id: '3', 
    name: "Kids Clip (MP4)", 
    logo: "https://picsum.photos/id/3/320/180", 
    link: "https://www.w3schools.com/html/mov_bbb.mp4", 
    category: "kids",
    createdAt: Date.now() - 100000000 
  },
  { 
    id: '4', 
    name: "Music Stream", 
    logo: "https://picsum.photos/id/4/320/180", 
    link: "https://www.w3schools.com/html/mov_bbb.mp4", 
    category: "music",
    createdAt: Date.now() - 100000000 
  }
];
