import { baseStorageService } from './storage';
import { TauriStorageService } from './tauriStorage';

// Factory to create the appropriate storage service
export function createStorageService() {
  if (window.__TAURI__) {
    return new TauriStorageService(baseStorageService);
  }
  return baseStorageService;
}

// Export the enhanced storage service
export const storageService = createStorageService();
