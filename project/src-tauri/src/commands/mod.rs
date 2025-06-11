
//! Command modules for Tauri application.
//! 
//! This module organizes all Tauri commands into logical groups for better maintainability.

pub mod ai;
pub mod analytics;
pub mod export;
pub mod oulipo;
pub mod state;

// Re-export commonly used types and state
pub use state::{AppState, AppServices};

// Re-export all command functions for easy registration
pub use ai::*;
pub use analytics::*;
pub use export::*;
pub use oulipo::*;
pub use state::{get_user_credits, deduct_credits, get_ai_service};
