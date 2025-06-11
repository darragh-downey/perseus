//! Application state management for Tauri commands.

use crate::ai::AIService;
use crate::export::ExportService;
use crate::analytics::AnalyticsService;
use crate::oulipo::OulipoService;
use std::sync::Mutex;
use tauri::State;

/// Main application state container
pub struct AppState {
    pub services: AppServices,
}

/// Container for all application services
pub struct AppServices {
    pub ai: Mutex<AIService>,
    pub export: ExportService,
    pub analytics: AnalyticsService,
    pub oulipo: OulipoService,
}

impl AppState {
    /// Create a new application state with default services
    pub fn new() -> Self {
        Self {
            services: AppServices::new(),
        }
    }
    
    /// Get a reference to the services
    pub fn services(&self) -> &AppServices {
        &self.services
    }
}

impl AppServices {
    /// Create new application services
    pub fn new() -> Self {
        Self {
            ai: Mutex::new(AIService::new()),
            export: ExportService::new(),
            analytics: AnalyticsService::new(),
            oulipo: OulipoService::new(),
        }
    }
    
    /// Get AI service (thread-safe)
    pub fn ai_service(&self) -> Result<std::sync::MutexGuard<AIService>, String> {
        self.ai.lock().map_err(|e| format!("Failed to lock AI service: {}", e))
    }
    
    /// Get export service
    pub fn export_service(&self) -> &ExportService {
        &self.export
    }
    
    /// Get analytics service
    pub fn analytics_service(&self) -> &AnalyticsService {
        &self.analytics
    }
    
    /// Get oulipo service
    pub fn oulipo_service(&self) -> &OulipoService {
        &self.oulipo
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

impl Default for AppServices {
    fn default() -> Self {
        Self::new()
    }
}

/// Get the current AI service from app state
#[tauri::command]
pub async fn get_ai_service(
    state: State<'_, AppState>
) -> Result<String, String> {
    let ai_service = state.services().ai_service()?;
    Ok(format!("AI Service: {}", ai_service.provider_name()))
}

/// Get user credits
#[tauri::command]
pub async fn get_user_credits(
    state: State<'_, AppState>
) -> Result<u32, String> {
    // In a real app, this would fetch from a database or API
    // For now, return a mock value
    Ok(100) // Mock credits
}

/// Deduct credits from user account
#[tauri::command]
pub async fn deduct_credits(
    state: State<'_, AppState>,
    amount: u32
) -> Result<u32, String> {
    // In a real app, this would update the database
    // For now, return remaining credits after deduction
    let remaining = if amount <= 100 { 100 - amount } else { 0 };
    Ok(remaining)
}
