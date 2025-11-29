
import { Channel, CategoryItem, Notification, AppSettings, PromoItem } from '../types';
import { STORAGE_KEY, CATEGORIES_KEY, NOTIFICATIONS_KEY, SETTINGS_KEY, PROMOS_KEY, FAVORITES_KEY, DEFAULT_CHANNELS, DEFAULT_CATEGORIES, DEFAULT_SETTINGS, DEFAULT_PROMOS } from '../constants';

// --- Channels ---
export const loadChannels = (): Channel[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveChannels(DEFAULT_CHANNELS);
      return DEFAULT_CHANNELS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load channels", e);
    return [];
  }
};

export const saveChannels = (channels: Channel[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
  } catch (e) {
    console.error("Failed to save channels", e);
  }
};

// --- Categories ---
export const loadCategories = (): CategoryItem[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load categories", e);
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = (categories: CategoryItem[]): void => {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error("Failed to save categories", e);
  }
};

// --- Promos ---
export const loadPromos = (): PromoItem[] => {
  try {
    const raw = localStorage.getItem(PROMOS_KEY);
    if (!raw) {
      savePromos(DEFAULT_PROMOS);
      return DEFAULT_PROMOS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load promos", e);
    return DEFAULT_PROMOS;
  }
};

export const savePromos = (promos: PromoItem[]): void => {
  try {
    localStorage.setItem(PROMOS_KEY, JSON.stringify(promos));
  } catch (e) {
    console.error("Failed to save promos", e);
  }
};

// --- Notifications ---
export const loadNotifications = (): Notification[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const saveNotifications = (notifications: Notification[]): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error("Failed to save notifications", e);
  }
};

export const getLatestNotification = (): Notification | null => {
  const all = loadNotifications();
  if (all.length === 0) return null;
  // Assuming list is pushed in order, or we sort
  return all.sort((a, b) => b.timestamp - a.timestamp)[0];
};

// --- Settings ---
export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load settings", e);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};

// --- Favorites ---
export const loadFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load favorites", e);
    return [];
  }
};

export const saveFavorites = (favIds: string[]): void => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favIds));
  } catch (e) {
    console.error("Failed to save favorites", e);
  }
};

export const toggleFavorite = (id: string, currentFavs: string[]): string[] => {
  let newFavs;
  if (currentFavs.includes(id)) {
    newFavs = currentFavs.filter(favId => favId !== id);
  } else {
    newFavs = [...currentFavs, id];
  }
  saveFavorites(newFavs);
  return newFavs;
};