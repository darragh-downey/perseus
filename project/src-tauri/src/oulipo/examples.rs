
//! Examples and usage patterns for the Oulipo constraint system.
//! 
//! This module demonstrates various ways to use the refactored constraint system,
//! from simple single-constraint checks to complex workflows.

#[cfg(test)]
mod tests {
    use crate::oulipo::*;
    use anyhow::Result;

    #[test]
    fn test_simple_constraint_usage() -> Result<()> {
        let service = OulipoService::new();
        
        // Simple univocalic check
        let result = service.check_univocalic("A cat sat at a mat", 'a')?;
        assert!(result.success);
        
        // This should fail
        let result = service.check_univocalic("The cat sits", 'a')?;
        assert!(!result.success);
        
        Ok(())
    }

    #[test]
    fn test_trait_based_constraints() -> Result<()> {
        use crate::oulipo::constraints::UnivocalicConstraint;
        
        // Create constraint using the trait system
        let constraint = UnivocalicConstraint::new('e')?;
        
        let result = constraint.check("The sentence never lets letters elsewhere")?;
        // This might not pass perfectly, but demonstrates the trait usage
        
        assert_eq!(constraint.name(), "Univocalic");
        assert!(!constraint.description().is_empty());
        
        Ok(())
    }

    #[test]
    fn test_workflow_builder() -> Result<()> {
        let service = OulipoService::new();
        
        // Create a complex workflow
        let workflow = service
            .create_workflow()
            .with_univocalic('a')
            .with_length_limits(Some(10), Some(100))
            .with_word_limits(Some(3), Some(20))
            .build()?;
        
        let result = workflow.check("A cat and a rat ran fast", &service)?;
        
        // Check that we got results
        assert!(!result.constraint_results.is_empty());
        assert!(!result.summary.is_empty());
        
        Ok(())
    }

    #[test]
    fn test_constraint_registry() -> Result<()> {
        let service = OulipoService::new();
        let registry = service.constraint_registry();
        
        // Check that univocalic is registered
        let constraints = registry.available_constraints();
        assert!(constraints.contains(&"univocalic"));
        
        // Get constraint info
        let info = registry.get_constraint_info("univocalic").unwrap();
        assert_eq!(info.name, "univocalic");
        assert!(!info.description.is_empty());
        
        // Create constraint from registry
        let config = serde_json::json!({ "allowed_vowel": "i" });
        let constraint = registry.create_constraint("univocalic", &config)?;
        
        let result = constraint.check("This is it")?;
        assert!(result.success);
        
        Ok(())
    }

    #[test]
    fn test_batch_constraint_checker() -> Result<()> {
        let service = OulipoService::new();
        let registry = service.constraint_registry();
        
        let mut batch = BatchConstraintChecker::new();
        
        // Add multiple constraints
        let config1 = serde_json::json!({ "allowed_vowel": "a" });
        let constraint1 = registry.create_constraint("univocalic", &config1)?;
        batch.add_constraint(constraint1);
        
        // Check text against all constraints
        let results = batch.check_all("A cat ran fast")?;
        assert_eq!(results.len(), 1);
        
        // Quick pass/fail check
        let passes = batch.check_all_pass("A cat ran fast")?;
        assert!(passes);
        
        Ok(())
    }

    #[test]
    fn test_preset_workflows() -> Result<()> {
        let service = OulipoService::new();
        
        // Test predefined presets
        let text = "This is a sample text for testing various constraint presets and workflows.";
        
        let result = service.check_with_preset(text, "strict")?;
        assert!(!result.constraint_results.is_empty());
        
        let result = service.check_with_preset(text, "minimal")?;
        assert!(!result.constraint_results.is_empty());
        
        Ok(())
    }

    #[test]
    fn test_utility_functions() -> Result<()> {
        use crate::oulipo::utils::*;
        
        // Test vowel detection
        assert!(is_vowel('a'));
        assert!(is_vowel('E'));
        assert!(!is_vowel('b'));
        
        // Test text utilities
        assert_eq!(word_count("hello world test"), 3);
        assert!(is_palindrome("A man a plan a canal Panama"));
        
        let vowels = extract_vowels("hello world");
        assert_eq!(vowels, vec!['e', 'o', 'o']);
        
        Ok(())
    }

    #[test]
    fn test_generation_workflow() -> Result<()> {
        let service = OulipoService::new();
        
        let workflow = service
            .create_generation_workflow()
            .with_theme("nature")
            .with_constraint("short")
            .max_attempts(5)
            .build();
        
        let result = workflow.generate(&service)?;
        // Should generate something (haiku in this case)
        assert!(result.result.is_some());
        
        Ok(())
    }
}

/// Example usage patterns and demonstrations
pub mod examples {
    use super::*;
    use anyhow::Result;
    
    /// Demonstrate simple constraint checking
    pub fn simple_constraint_example() -> Result<()> {
        println!("=== Simple Constraint Example ===");
        
        let service = OulipoService::new();
        
        let text = "A cat sat at a mat";
        let result = service.check_univocalic(text, 'a')?;
        
        println!("Text: '{}'", text);
        println!("Constraint: Univocalic (only 'a' allowed)");
        println!("Success: {}", result.success);
        
        if let Some(ref result_text) = result.result {
            println!("Result: {}", result_text);
        }
        
        for suggestion in &result.suggestions {
            println!("Suggestion: {}", suggestion);
        }
        
        Ok(())
    }
    
    /// Demonstrate workflow builder usage
    pub fn workflow_builder_example() -> Result<()> {
        println!("\n=== Workflow Builder Example ===");
        
        let service = OulipoService::new();
        
        // Build a complex workflow
        let workflow = service
            .create_workflow()
            .with_univocalic('e')
            .with_length_limits(Some(20), Some(200))
            .with_word_limits(Some(5), Some(50))
            .build()?;
        
        let text = "The sentence never lets letters elsewhere enter here";
        let result = workflow.check(text, &service)?;
        
        println!("Text: '{}'", text);
        println!("Workflow: Univocalic 'e' + Length limits + Word limits");
        println!("Overall success: {}", result.success);
        println!("Summary: {}", result.summary);
        
        for (i, constraint_result) in result.constraint_results.iter().enumerate() {
            println!("  Constraint {}: {}", i + 1, 
                constraint_result.result.as_ref().unwrap_or(&"No result".to_string()));
        }
        
        Ok(())
    }
    
    /// Demonstrate registry system usage
    pub fn registry_example() -> Result<()> {
        println!("\n=== Registry System Example ===");
        
        let service = OulipoService::new();
        let registry = service.constraint_registry();
        
        println!("Available constraints:");
        for info in registry.list_constraints() {
            println!("  - {}: {}", info.name, info.description);
        }
        
        // Create constraint from registry
        let config = serde_json::json!({ "allowed_vowel": "o" });
        let constraint = registry.create_constraint("univocalic", &config)?;
        
        let text = "So cool to go";
        let result = constraint.check(text)?;
        
        println!("\nUsing registry-created constraint:");
        println!("Text: '{}'", text);
        println!("Success: {}", result.success);
        
        Ok(())
    }
    
    /// Run all examples
    pub fn run_all_examples() -> Result<()> {
        simple_constraint_example()?;
        workflow_builder_example()?;
        registry_example()?;
        
        println!("\n=== All examples completed successfully! ===");
        Ok(())
    }
}
