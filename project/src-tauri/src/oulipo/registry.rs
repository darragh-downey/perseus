
//! Registry system for managing all available constraints and generators.

use crate::oulipo::{
    types::{Constraint, Generator, Transformer, ConstraintResult},
    constraints::UnivocalicConstraint,
    errors::{OulipoError, OulipoResult},
};
use std::collections::HashMap;
use anyhow::Result;

/// Registry for constraint factories
pub struct ConstraintRegistry {
    constraints: HashMap<String, Box<dyn ConstraintFactory>>,
}

/// Factory trait for creating constraints
pub trait ConstraintFactory: Send + Sync {
    /// Create a constraint instance from configuration
    fn create(&self, config: &serde_json::Value) -> OulipoResult<Box<dyn Constraint>>;
    
    /// Get the constraint name
    fn name(&self) -> &'static str;
    
    /// Get the constraint description
    fn description(&self) -> &'static str;
    
    /// Get configuration schema for this constraint
    fn config_schema(&self) -> serde_json::Value;
}

/// Factory for creating univocalic constraints
pub struct UnivocalicFactory;

impl ConstraintFactory for UnivocalicFactory {
    fn create(&self, config: &serde_json::Value) -> OulipoResult<Box<dyn Constraint>> {
        let vowel = config["allowed_vowel"]
            .as_str()
            .and_then(|s| s.chars().next())
            .ok_or_else(|| OulipoError::InvalidConfig("Missing 'allowed_vowel' in config".to_string()))?;
            
        let constraint = UnivocalicConstraint::new(vowel)?;
        Ok(Box::new(constraint))
    }
    
    fn name(&self) -> &'static str {
        "univocalic"
    }
    
    fn description(&self) -> &'static str {
        "Text must use only one vowel throughout"
    }
    
    fn config_schema(&self) -> serde_json::Value {
        serde_json::json!({
            "type": "object",
            "properties": {
                "allowed_vowel": {
                    "type": "string",
                    "pattern": "^[aeiouAEIOU]$",
                    "description": "The only vowel allowed in the text"
                }
            },
            "required": ["allowed_vowel"]
        })
    }
}

impl Default for ConstraintRegistry {
    fn default() -> Self {
        Self::new()
    }
}

impl ConstraintRegistry {
    /// Create a new constraint registry with all built-in constraints
    pub fn new() -> Self {
        let mut registry = Self {
            constraints: HashMap::new(),
        };
        
        // Register built-in constraints
        registry.register(Box::new(UnivocalicFactory));
        
        registry
    }
    
    /// Register a new constraint factory
    pub fn register(&mut self, factory: Box<dyn ConstraintFactory>) {
        self.constraints.insert(factory.name().to_string(), factory);
    }
    
    /// Create a constraint by name with configuration
    pub fn create_constraint(&self, name: &str, config: &serde_json::Value) -> OulipoResult<Box<dyn Constraint>> {
        let factory = self.constraints.get(name)
            .ok_or_else(|| OulipoError::InvalidConfig(format!("Unknown constraint: {}", name)))?;
            
        factory.create(config)
    }
    
    /// Get list of all available constraint names
    pub fn available_constraints(&self) -> Vec<&str> {
        self.constraints.keys().map(|s| s.as_str()).collect()
    }
    
    /// Get configuration schema for a constraint
    pub fn get_config_schema(&self, name: &str) -> Option<serde_json::Value> {
        self.constraints.get(name).map(|f| f.config_schema())
    }
    
    /// Get constraint metadata (name, description, schema)
    pub fn get_constraint_info(&self, name: &str) -> Option<ConstraintInfo> {
        self.constraints.get(name).map(|factory| {
            ConstraintInfo {
                name: factory.name().to_string(),
                description: factory.description().to_string(),
                schema: factory.config_schema(),
            }
        })
    }
    
    /// Get information about all constraints
    pub fn list_constraints(&self) -> Vec<ConstraintInfo> {
        self.constraints.values()
            .map(|factory| ConstraintInfo {
                name: factory.name().to_string(),
                description: factory.description().to_string(),
                schema: factory.config_schema(),
            })
            .collect()
    }
}

/// Information about a constraint
#[derive(Debug, Clone)]
pub struct ConstraintInfo {
    pub name: String,
    pub description: String,
    pub schema: serde_json::Value,
}

/// Batch constraint checker for applying multiple constraints at once
pub struct BatchConstraintChecker {
    constraints: Vec<Box<dyn Constraint>>,
}

impl BatchConstraintChecker {
    /// Create a new batch checker
    pub fn new() -> Self {
        Self {
            constraints: Vec::new(),
        }
    }
    
    /// Add a constraint to the batch
    pub fn add_constraint(&mut self, constraint: Box<dyn Constraint>) {
        self.constraints.push(constraint);
    }
    
    /// Check text against all constraints in the batch
    pub fn check_all(&self, text: &str) -> Result<Vec<ConstraintResult>> {
        let mut results = Vec::new();
        
        for constraint in &self.constraints {
            results.push(constraint.check(text)?);
        }
        
        Ok(results)
    }
    
    /// Check if text passes all constraints
    pub fn check_all_pass(&self, text: &str) -> Result<bool> {
        for constraint in &self.constraints {
            let result = constraint.check(text)?;
            if !result.success {
                return Ok(false);
            }
        }
        Ok(true)
    }
}

impl Default for BatchConstraintChecker {
    fn default() -> Self {
        Self::new()
    }
}
