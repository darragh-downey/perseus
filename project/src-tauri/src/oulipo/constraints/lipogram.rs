use crate::oulipo::{ConstraintResult, Violation};
use anyhow::Result;

/// Check if text follows lipogram constraint (avoids a specific letter)
pub fn check(text: &str, forbidden_letter: &str) -> Result<ConstraintResult> {
    let forbidden = forbidden_letter.to_lowercase();
    let mut violations = Vec::new();
    
    for (pos, ch) in text.char_indices() {
        if ch.to_lowercase().to_string() == forbidden {
            violations.push(Violation {
                position: pos,
                length: 1,
                issue: format!("Forbidden letter '{}' found", forbidden_letter),
                suggestion: Some("Replace with alternative word".to_string()),
            });
        }
    }
    
    let success = violations.is_empty();
    let suggestions = if success {
        vec!["Perfect lipogram!".to_string()]
    } else {
        generate_suggestions(&forbidden)
    };
    
    let violation_count = violations.len();
    
    Ok(ConstraintResult {
        success,
        result: Some(if success { "Valid lipogram" } else { "Violations found" }.to_string()),
        violations,
        suggestions,
        metadata: serde_json::json!({
            "forbidden_letter": forbidden_letter,
            "violation_count": violation_count,
            "text_length": text.len()
        }),
    })
}

fn generate_suggestions(forbidden_letter: &str) -> Vec<String> {
    vec![
        format!("Avoid words containing '{}'", forbidden_letter),
        "Use synonyms without the forbidden letter".to_string(),
        "Restructure sentences to eliminate problematic words".to_string(),
        "Consider alternative phrasings".to_string(),
    ]
}
