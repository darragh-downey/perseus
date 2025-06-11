
//! Common types and data structures for the Oulipo constraint system.

use anyhow::Result;
use serde::{Deserialize, Serialize};

/// Result of applying an Oulipo constraint or generator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstraintResult {
    /// Whether the constraint was satisfied or generation was successful
    pub success: bool,
    /// Human-readable description of the result
    pub result: Option<String>,
    /// List of violations found (if any)
    pub violations: Vec<Violation>,
    /// Suggestions for improvement or examples
    pub suggestions: Vec<String>,
    /// Additional metadata specific to the constraint
    pub metadata: serde_json::Value,
}

/// Represents a violation of a constraint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Violation {
    /// Character position where the violation occurs
    pub position: usize,
    /// Length of the violating text span
    pub length: usize,
    /// Description of what rule was violated
    pub issue: String,
    /// Optional suggestion for fixing the violation
    pub suggestion: Option<String>,
}

/// Configuration for text validation
#[derive(Debug, Clone)]
pub struct ValidationConfig {
    pub min_length: Option<usize>,
    pub max_length: Option<usize>,
    pub min_words: Option<usize>,
    pub max_words: Option<usize>,
}

impl Default for ValidationConfig {
    fn default() -> Self {
        Self {
            min_length: None,
            max_length: None,
            min_words: None,
            max_words: None,
        }
    }
}

/// Trait for all Oulipo constraints
pub trait Constraint {
    /// Check if the given text satisfies this constraint
    fn check(&self, text: &str) -> Result<ConstraintResult>;
    
    /// Get the name of this constraint
    fn name(&self) -> &'static str;
    
    /// Get a description of this constraint
    fn description(&self) -> &'static str;
}

/// Trait for text generators
pub trait Generator {
    /// Generate text according to this generator's rules
    fn generate(&self, input: &str) -> Result<ConstraintResult>;
    
    /// Get the name of this generator
    fn name(&self) -> &'static str;
    
    /// Get a description of this generator
    fn description(&self) -> &'static str;
}

/// Trait for text transformers (like N+7)
pub trait Transformer {
    /// Transform the input text according to this transformer's rules
    fn transform(&self, text: &str) -> Result<ConstraintResult>;
    
    /// Get the name of this transformer
    fn name(&self) -> &'static str;
    
    /// Get a description of this transformer
    fn description(&self) -> &'static str;
}

impl ConstraintResult {
    /// Create a successful result
    pub fn success(result: String, suggestions: Vec<String>, metadata: serde_json::Value) -> Self {
        Self {
            success: true,
            result: Some(result),
            violations: Vec::new(),
            suggestions,
            metadata,
        }
    }
    
    /// Create a failed result with violations
    pub fn failure(
        result: String,
        violations: Vec<Violation>,
        suggestions: Vec<String>,
        metadata: serde_json::Value,
    ) -> Self {
        Self {
            success: false,
            result: Some(result),
            violations,
            suggestions,
            metadata,
        }
    }
}
