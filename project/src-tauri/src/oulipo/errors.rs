
//! Error types for the Oulipo constraint system.

use thiserror::Error;

/// Errors that can occur in the Oulipo system
#[derive(Error, Debug)]
pub enum OulipoError {
    #[error("Invalid constraint configuration: {0}")]
    InvalidConfig(String),
    
    #[error("Dictionary error: {0}")]
    Dictionary(String),
    
    #[error("Text processing error: {0}")]
    TextProcessing(String),
    
    #[error("Generation failed: {0}")]
    GenerationFailed(String),
    
    #[error("Generation error: {0}")]
    GenerationError(String),
    
    #[error("Validation error: {0}")]
    ValidationError(String),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

pub type OulipoResult<T> = Result<T, OulipoError>;
