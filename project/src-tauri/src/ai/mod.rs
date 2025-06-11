
//! AI service module for creative writing assistance.
//! 
//! This module provides AI-powered features for story development, character creation,
//! and writing analysis using various AI providers.

pub mod types;
pub mod service;
pub mod providers;
pub mod responses;

// Re-export commonly used types
pub use types::{Character, Beat, Theme, Conflict, AISettings, AIProvider};
pub use service::AIService;
pub use responses::{AIResponse, BeatSuggestion, CharacterArcSuggestion, ThemeAnalysis, 
                    CharacterSuggestion, PlotSuggestion, StyleAnalysis};
pub use providers::{OpenAIProvider, AnthropicProvider, LocalProvider};
