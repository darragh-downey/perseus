import { baseStorageService } from './storage';
import { TauriStorageService } from './tauriStorage';
import { aiService } from './ai';
import { exportService } from './export';
import { analyticsService } from './analytics';
import { OulipoService } from './oulipo';

// Factory to create the appropriate storage service
export function createStorageService() {
  if (window.__TAURI__) {
    return new TauriStorageService(baseStorageService);
  }
  return baseStorageService;
}

// Export the enhanced storage service
export const storageService = createStorageService();

// Re-export AI and Export services
export { aiService, exportService, analyticsService };

// Export Oulipo service instance
export const oulipoService = OulipoService.getInstance();
