//! AI response structures and utilities.

use serde::{Deserialize, Serialize};

/// Generic AI response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub credits_used: u32,
    pub processing_time_ms: u128,
    pub metadata: Option<serde_json::Value>,
}

impl<T> AIResponse<T> {
    /// Create a successful response
    pub fn success(data: T, credits_used: u32, processing_time_ms: u128) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            credits_used,
            processing_time_ms,
            metadata: None,
        }
    }
    
    /// Create a successful response with metadata
    pub fn success_with_metadata(
        data: T, 
        credits_used: u32, 
        processing_time_ms: u128,
        metadata: serde_json::Value
    ) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            credits_used,
            processing_time_ms,
            metadata: Some(metadata),
        }
    }
    
    /// Create an error response
    pub fn error(error: String, credits_used: u32, processing_time_ms: u128) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            credits_used,
            processing_time_ms,
            metadata: None,
        }
    }
    
    /// Create a timeout error response
    pub fn timeout(credits_used: u32, processing_time_ms: u128) -> Self {
        Self::error(
            "Request timed out".to_string(),
            credits_used,
            processing_time_ms
        )
    }
    
    /// Create a rate limit error response
    pub fn rate_limit(credits_used: u32, processing_time_ms: u128) -> Self {
        Self::error(
            "Rate limit exceeded".to_string(),
            credits_used,
            processing_time_ms
        )
    }
    
    /// Create an authentication error response
    pub fn auth_error(processing_time_ms: u128) -> Self {
        Self::error(
            "Authentication failed".to_string(),
            0,
            processing_time_ms
        )
    }
    
    /// Map the data to a different type
    pub fn map<U, F>(self, f: F) -> AIResponse<U>
    where
        F: FnOnce(T) -> U,
    {
        AIResponse {
            success: self.success,
            data: self.data.map(f),
            error: self.error,
            credits_used: self.credits_used,
            processing_time_ms: self.processing_time_ms,
            metadata: self.metadata,
        }
    }
    
    /// Check if the response is successful and has data
    pub fn is_ok(&self) -> bool {
        self.success && self.data.is_some()
    }
    
    /// Get the data if successful, or None
    pub fn data(&self) -> Option<&T> {
        self.data.as_ref()
    }
    
    /// Consume and get the data if successful
    pub fn into_data(self) -> Option<T> {
        self.data
    }
    
    /// Get error message if failed
    pub fn get_error(&self) -> Option<&str> {
        self.error.as_deref()
    }
}

/// Response metadata for AI operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseMetadata {
    pub model_used: String,
    pub tokens_consumed: Option<u32>,
    pub confidence_score: Option<f32>,
    pub provider: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

impl ResponseMetadata {
    pub fn new(model_used: String, provider: String) -> Self {
        Self {
            model_used,
            tokens_consumed: None,
            confidence_score: None,
            provider,
            timestamp: chrono::Utc::now(),
        }
    }
    
    pub fn with_tokens(mut self, tokens: u32) -> Self {
        self.tokens_consumed = Some(tokens);
        self
    }
    
    pub fn with_confidence(mut self, confidence: f32) -> Self {
        self.confidence_score = Some(confidence);
        self
    }
}

// Re-export response types from types module
pub use crate::ai::types::{
    BeatSuggestion, CharacterArcSuggestion, ThemeAnalysis,
    CharacterSuggestion, PlotSuggestion, StyleAnalysis
};