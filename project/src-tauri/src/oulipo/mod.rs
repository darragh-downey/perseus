//! # Oulipo Constraint-Based Writing Module
//! 
//! This module implements various Oulipo (Ouvroir de littérature potentielle) 
//! constraints and generators for creative writing assistance.
//! 
//! ## Features
//! 
//! - **Constraints**: Rules that text must follow (lipogram, palindrome, etc.)
//! - **Generators**: Tools to create text following specific patterns
//! - **Validators**: General text validation utilities
//! 
//! ## Example Usage
//! 
//! ```rust
//! use oulipo::{OulipoService, constraints::UnivocalicConstraint};
//! 
//! let service = OulipoService::new();
//! let result = service.check_univocalic("A cat sat at a mat", 'a')?;
//! ```

// Core modules
pub mod types;
pub mod errors;
pub mod utils;
pub mod registry;
pub mod builder;

// Examples and documentation
#[cfg(test)]
pub mod examples;

// Feature modules
pub mod constraints;
pub mod dictionary;
pub mod generators;
pub mod validators;

// Re-export commonly used types
pub use types::{ConstraintResult, Violation, Constraint, Generator, Transformer, ValidationConfig};
pub use errors::{OulipoError, OulipoResult};
pub use registry::{ConstraintRegistry, ConstraintInfo, BatchConstraintChecker};
pub use builder::{ConstraintWorkflowBuilder, ConstraintPresets, GenerationWorkflowBuilder, WorkflowResult, ConstraintWorkflowConfig};

use anyhow::Result;

/// Main service for Oulipo constraint checking and text generation
/// 
/// This service provides a high-level API for all Oulipo functionality,
/// managing internal state like dictionaries and caching results where appropriate.
pub struct OulipoService {
    dictionary: dictionary::Dictionary,
}

impl Default for OulipoService {
    fn default() -> Self {
        Self::new()
    }
}

impl OulipoService {
    /// Create a new Oulipo service instance
    pub fn new() -> Self {
        Self {
            dictionary: dictionary::Dictionary::new(),
        }
    }
    
    /// Get a reference to the internal dictionary
    pub fn dictionary(&self) -> &dictionary::Dictionary {
        &self.dictionary
    }

    // Constraint checking methods
    
    /// Check lipogram constraint (text without specific letters)
    pub fn check_lipogram(&self, text: &str, forbidden_letter: &str) -> Result<ConstraintResult> {
        constraints::lipogram::check(text, forbidden_letter)
    }

    /// Apply N+7 transformation (replace each noun with the noun 7 places later in dictionary)
    pub fn n_plus_7_transform(&self, text: &str, offset: i32) -> Result<ConstraintResult> {
        constraints::n_plus_7::transform(text, offset, &self.dictionary)
    }

    /// Check palindrome constraint
    pub fn check_palindrome(&self, text: &str) -> Result<ConstraintResult> {
        constraints::palindrome::check(text)
    }

    /// Check snowball constraint (each word one letter longer than the previous)
    pub fn check_snowball(&self, text: &str) -> Result<ConstraintResult> {
        constraints::snowball::check(text)
    }

    /// Check prisoners constraint (no letters with ascenders or descenders)
    pub fn check_prisoners_constraint(&self, text: &str) -> Result<ConstraintResult> {
        constraints::prisoners::check(text)
    }

    /// Check univocalic constraint (only one vowel allowed) 
    pub fn check_univocalic(&self, text: &str, vowel: &str) -> Result<ConstraintResult> {
        if let Some(vowel_char) = vowel.chars().next() {
            constraints::univocalic::check(text, vowel_char)
        } else {
            Ok(ConstraintResult {
                success: false,
                result: None,
                violations: vec![Violation {
                    position: 0,
                    length: 0,
                    issue: "Invalid vowel parameter".to_string(),
                    suggestion: Some("Provide a single vowel character".to_string()),
                }],
                suggestions: vec!["Provide a single vowel character".to_string()],
                metadata: serde_json::Value::Null,
            })
        }
    }

    /// Check sestina constraint (specific end-word pattern)
    pub fn check_sestina(&self, text: &str, end_words: &[String]) -> Result<ConstraintResult> {
        constraints::sestina::check(text, end_words)
    }

    // Generator methods
    
    /// Generate haiku based on theme with optional parameter
    pub fn generate_haiku(&self, theme: Option<&str>) -> Result<String> {
        let theme_str = theme.unwrap_or("nature");
        let result = generators::haiku::generate(theme_str)?;
        
        if result.success {
            // Extract the generated haiku from the result
            if let Some(result_text) = &result.result {
                return Ok(result_text.clone());
            }
            if let serde_json::Value::Object(metadata) = &result.metadata {
                if let Some(haiku) = metadata.get("generated_text") {
                    if let Some(haiku_str) = haiku.as_str() {
                        return Ok(haiku_str.to_string());
                    }
                }
            }
            Ok("Spring cherry blossoms / Dance in the gentle warm breeze / Peace fills the heart".to_string())
        } else {
            Err(OulipoError::ValidationError("Failed to generate haiku".to_string()).into())
        }
    }

    /// Generate anagrams with maximum results limit
    pub fn generate_anagrams(&self, word: &str, max_results: usize) -> Result<Vec<String>> {
        let result = generators::anagram::generate_anagrams(word)?;
        
        if result.success {
            if let Some(result_text) = &result.result {
                let anagrams: Vec<String> = result_text
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .take(max_results)
                    .collect();
                return Ok(anagrams);
            }
            if let serde_json::Value::Object(metadata) = &result.metadata {
                if let Some(anagrams_str) = metadata.get("anagrams") {
                    if let Some(anagrams_text) = anagrams_str.as_str() {
                        let anagrams: Vec<String> = anagrams_text
                            .split(',')
                            .map(|s| s.trim().to_string())
                            .take(max_results)
                            .collect();
                        return Ok(anagrams);
                    }
                }
            }
        }
        
        // Fallback: generate some simple anagrams
        Ok(vec![word.chars().rev().collect::<String>()])
    }

    /// Check if two words are anagrams
    pub fn check_anagram(&self, word1: &str, word2: &str) -> Result<bool> {
        let result = generators::anagram::check_anagram(word1, word2)?;
        Ok(result.success)
    }

    /// Generate combinatorial poem
    pub fn generate_combinatorial_poem(&self, word_sets: &[Vec<String>], pattern: Option<&str>) -> Result<String> {
        let pattern_str = pattern.unwrap_or("simple");
        let words: Vec<String> = word_sets.iter().flatten().cloned().collect();
        
        let result = generators::combinatorial::generate_combinatorial_poem(words, pattern_str)?;
        
        if result.success {
            if let Some(result_text) = &result.result {
                return Ok(result_text.clone());
            }
            if let serde_json::Value::Object(metadata) = &result.metadata {
                if let Some(poem) = metadata.get("generated_text") {
                    if let Some(poem_str) = poem.as_str() {
                        return Ok(poem_str.to_string());
                    }
                }
            }
        }
        
        // Fallback: create a simple poem
        let mut poem = String::new();
        for (i, word_set) in word_sets.iter().enumerate() {
            if let Some(word) = word_set.first() {
                poem.push_str(&format!("Line {}: {}\n", i + 1, word));
            }
        }
        
        Ok(poem)
    }

    // Validation methods
    
    /// Validate text length constraints
    pub fn validate_text_length(&self, text: &str, min_length: usize, max_length: Option<usize>) -> Result<ConstraintResult> {
        validators::validate_text_length(text, min_length, max_length)
    }

    /// Validate word count constraints
    pub fn validate_word_count(&self, text: &str, min_words: usize, max_words: Option<usize>) -> Result<ConstraintResult> {
        validators::validate_word_count(text, min_words, max_words)
    }

    /// Check character frequency constraints
    pub fn check_character_frequency(&self, text: &str, target_char: char, max_frequency: usize) -> Result<ConstraintResult> {
        validators::check_character_frequency(text, target_char, max_frequency)
    }
    
    /// Generate lipogram suggestions
    pub fn generate_lipogram_suggestions(&self, text: &str, forbidden_letter: &str) -> Result<Vec<String>> {
        let mut suggestions = Vec::new();
        
        // Find words that contain the forbidden letter
        let forbidden_char = forbidden_letter.chars().next().unwrap_or('e');
        let words: Vec<&str> = text.split_whitespace().collect();
        
        for word in words {
            if word.to_lowercase().contains(forbidden_char.to_ascii_lowercase()) {
                // Suggest alternatives (this is a simplified implementation)
                let suggestion = format!("Replace '{}' with a word that doesn't contain '{}'", word, forbidden_char);
                suggestions.push(suggestion);
            }
        }
        
        if suggestions.is_empty() {
            suggestions.push("Text already follows lipogram constraint".to_string());
        }
        
        Ok(suggestions)
    }
    
    /// Generate palindrome suggestions
    pub fn generate_palindrome_suggestions(&self, text: &str) -> Result<Vec<String>> {
        let suggestions = vec![
            "Try rearranging words to create symmetry".to_string(),
            "Consider using palindromic words like 'level', 'radar', 'civic'".to_string(),
            "Build from the center outward for sentence palindromes".to_string(),
            format!("Current text: '{}' - work on making it read the same forwards and backwards", text),
        ];
        
        Ok(suggestions)
    }
    
    /// Validate text against multiple constraints using configuration
    pub fn validate_with_config(&self, text: &str, config: &ValidationConfig) -> Result<Vec<ConstraintResult>> {
        let mut results = Vec::new();
        
        if let Some(min_len) = config.min_length {
            results.push(self.validate_text_length(text, min_len, config.max_length)?);
        }
        
        if let Some(min_words) = config.min_words {
            results.push(self.validate_word_count(text, min_words, config.max_words)?);
        }
        
        Ok(results)
    }

    // Advanced workflow methods
    
    /// Create a constraint workflow builder for complex constraint combinations
    pub fn create_workflow(&self) -> builder::ConstraintWorkflowBuilder {
        builder::ConstraintWorkflowBuilder::new()
    }
    
    /// Create a generation workflow builder
    pub fn create_generation_workflow(&self) -> builder::GenerationWorkflowBuilder {
        builder::GenerationWorkflowBuilder::new()
    }
    
    /// Get the constraint registry for advanced constraint management
    pub fn constraint_registry(&self) -> registry::ConstraintRegistry {
        registry::ConstraintRegistry::new()
    }
    
    /// Check text using a workflow configuration
    pub fn check_with_workflow(&self, text: &str, config: &builder::ConstraintWorkflowConfig) -> Result<builder::WorkflowResult> {
        let mut constraint_results = Vec::new();
        
        // Check each constraint in the configuration
        for (name, constraint_config) in &config.constraints {
            match name.as_str() {
                "univocalic" => {
                    let vowel = constraint_config["allowed_vowel"]
                        .as_str()
                        .and_then(|s| s.chars().next())
                        .unwrap_or('a');
                    let vowel_str = &vowel.to_string();
                    let result = self.check_univocalic(text, vowel_str)?;
                    constraint_results.push(result);
                }
                _ => {
                    // For unknown constraints, create a failure result
                    constraint_results.push(ConstraintResult {
                        success: false,
                        result: Some(format!("Unknown constraint: {}", name)),
                        violations: Vec::new(),
                        suggestions: vec!["Check constraint name".to_string()],
                        metadata: serde_json::json!({"error": "unknown_constraint"}),
                    });
                }
            }
        }
        
        // Add validation results
        let validation_results = self.validate_with_config(text, &config.validation_config)?;
        constraint_results.extend(validation_results);
        
        let overall_success = constraint_results.iter().all(|r| r.success);
        let summary = self.generate_workflow_summary(&constraint_results);
        
        Ok(builder::WorkflowResult {
            success: overall_success,
            constraint_results,
            summary,
        })
    }
    
    /// Check text using a predefined constraint preset
    pub fn check_with_preset(&self, text: &str, preset_name: &str) -> Result<builder::WorkflowResult> {
        let config = match preset_name {
            "strict" => builder::ConstraintPresets::strict_writing().build()?,
            "minimal" => builder::ConstraintPresets::minimal().build()?,
            "experimental" => builder::ConstraintPresets::experimental().build()?,
            _ => return Err(anyhow::anyhow!("Unknown preset: {}", preset_name)),
        };
        
        self.check_with_workflow(text, &config)
    }
    
    /// Create a custom constraint using the registry system
    pub fn create_custom_constraint(&self, name: &str, config: serde_json::Value) -> OulipoResult<Box<dyn Constraint>> {
        let registry = self.constraint_registry();
        registry.create_constraint(name, &config)
    }
    
    /// List all available constraint types
    pub fn list_available_constraints(&self) -> Vec<registry::ConstraintInfo> {
        let registry = self.constraint_registry();
        registry.list_constraints()
    }
    
    /// Generate a workflow summary from constraint results
    fn generate_workflow_summary(&self, results: &[ConstraintResult]) -> String {
        let total = results.len();
        let passed = results.iter().filter(|r| r.success).count();
        let failed = total - passed;
        
        if failed == 0 {
            format!("✅ All {} constraints satisfied", total)
        } else {
            format!("❌ {}/{} constraints failed", failed, total)
        }
    }
}
