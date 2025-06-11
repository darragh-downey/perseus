
//! Builder patterns for constructing constraint configurations and complex operations.

use crate::oulipo::{
    types::{ConstraintResult, ValidationConfig},
    errors::{OulipoError, OulipoResult},
};
use anyhow::Result;
use serde_json::json;

/// Builder for creating complex constraint checking workflows
pub struct ConstraintWorkflowBuilder {
    constraints: Vec<(String, serde_json::Value)>,
    validation_config: ValidationConfig,
}

impl Default for ConstraintWorkflowBuilder {
    fn default() -> Self {
        Self::new()
    }
}

impl ConstraintWorkflowBuilder {
    /// Create a new workflow builder
    pub fn new() -> Self {
        Self {
            constraints: Vec::new(),
            validation_config: ValidationConfig::default(),
        }
    }
    
    /// Add a univocalic constraint
    pub fn with_univocalic(mut self, allowed_vowel: char) -> Self {
        self.constraints.push((
            "univocalic".to_string(),
            json!({ "allowed_vowel": allowed_vowel.to_string() })
        ));
        self
    }
    
    /// Add text length validation
    pub fn with_length_limits(mut self, min: Option<usize>, max: Option<usize>) -> Self {
        self.validation_config.min_length = min;
        self.validation_config.max_length = max;
        self
    }
    
    /// Add word count validation
    pub fn with_word_limits(mut self, min: Option<usize>, max: Option<usize>) -> Self {
        self.validation_config.min_words = min;
        self.validation_config.max_words = max;
        self
    }
    
    /// Add a custom constraint by name and configuration
    pub fn with_constraint(mut self, name: &str, config: serde_json::Value) -> Self {
        self.constraints.push((name.to_string(), config));
        self
    }
    
    /// Build the workflow configuration
    pub fn build(self) -> OulipoResult<ConstraintWorkflowConfig> {
        Ok(ConstraintWorkflowConfig {
            constraints: self.constraints,
            validation_config: self.validation_config,
        })
    }
}

/// Configuration for a constraint workflow
#[derive(Debug, Clone)]
pub struct ConstraintWorkflowConfig {
    pub constraints: Vec<(String, serde_json::Value)>,
    pub validation_config: ValidationConfig,
}

/// Result of running a complete workflow
#[derive(Debug)]
pub struct WorkflowResult {
    pub success: bool,
    pub constraint_results: Vec<ConstraintResult>,
    pub summary: String,
}

/// Builder for creating text generation workflows
pub struct GenerationWorkflowBuilder {
    theme: Option<String>,
    constraints: Vec<String>,
    max_attempts: usize,
}

impl Default for GenerationWorkflowBuilder {
    fn default() -> Self {
        Self::new()
    }
}

impl GenerationWorkflowBuilder {
    /// Create a new generation workflow builder
    pub fn new() -> Self {
        Self {
            theme: None,
            constraints: Vec::new(),
            max_attempts: 10,
        }
    }
    
    /// Set the theme for generation
    pub fn with_theme(mut self, theme: &str) -> Self {
        self.theme = Some(theme.to_string());
        self
    }
    
    /// Add a constraint that generated text must satisfy
    pub fn with_constraint(mut self, constraint: &str) -> Self {
        self.constraints.push(constraint.to_string());
        self
    }
    
    /// Set maximum generation attempts
    pub fn max_attempts(mut self, attempts: usize) -> Self {
        self.max_attempts = attempts;
        self
    }
    
    /// Build a generation workflow
    pub fn build(self) -> GenerationWorkflowConfig {
        GenerationWorkflowConfig {
            theme: self.theme.unwrap_or_else(|| "creative writing".to_string()),
            constraints: self.constraints,
            max_attempts: self.max_attempts,
        }
    }
}

/// Configuration for a text generation workflow
#[derive(Debug, Clone)]
pub struct GenerationWorkflowConfig {
    pub theme: String,
    pub constraints: Vec<String>,
    pub max_attempts: usize,
}

/// Predefined constraint combinations for common use cases
pub struct ConstraintPresets;

impl ConstraintPresets {
    /// Create a strict writing constraint (multiple rules)
    pub fn strict_writing() -> ConstraintWorkflowBuilder {
        ConstraintWorkflowBuilder::new()
            .with_length_limits(Some(100), Some(1000))
            .with_word_limits(Some(10), Some(200))
    }
    
    /// Create a minimal constraint (very restricted)
    pub fn minimal() -> ConstraintWorkflowBuilder {
        ConstraintWorkflowBuilder::new()
            .with_length_limits(Some(10), Some(100))
            .with_word_limits(Some(3), Some(20))
    }
    
    /// Create an experimental constraint combination
    pub fn experimental() -> ConstraintWorkflowBuilder {
        ConstraintWorkflowBuilder::new()
            .with_univocalic('e')
            .with_length_limits(Some(50), None)
    }
}
