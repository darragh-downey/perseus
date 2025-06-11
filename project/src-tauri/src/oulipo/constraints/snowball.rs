use crate::oulipo::{ConstraintResult, Violation};
use anyhow::Result;

/// Check if text follows snowball pattern (each word is one letter longer than the previous)
pub fn check(text: &str) -> Result<ConstraintResult> {
    let words: Vec<&str> = text.split_whitespace().collect();
    let mut violations = Vec::new();
    let mut position = 0;
    
    for (i, word) in words.iter().enumerate() {
        let expected_length = i + 1;
        let actual_length = word.len();
        
        if actual_length != expected_length {
            violations.push(Violation {
                position,
                length: word.len(),
                issue: format!(
                    "Word {} should be {} letters, but is {}", 
                    i + 1, expected_length, actual_length
                ),
                suggestion: Some(format!("Replace with a {}-letter word", expected_length)),
            });
        }
        
        position += word.len() + 1; // +1 for space
    }
    
    let success = violations.is_empty();
    let suggestions = if success {
        vec!["Perfect snowball pattern!".to_string()]
    } else {
        generate_snowball_suggestions()
    };
    
    let violation_count = violations.len();
    
    Ok(ConstraintResult {
        success,
        result: Some(if success { 
            "Valid snowball pattern".to_string()
        } else { 
            format!("{} violations found", violation_count) 
        }),
        violations,
        suggestions,
        metadata: serde_json::json!({
            "word_count": words.len(),
            "violation_count": violation_count,
            "expected_pattern": (1..=words.len()).collect::<Vec<_>>(),
            "actual_lengths": words.iter().map(|w| w.len()).collect::<Vec<_>>()
        }),
    })
}

fn generate_snowball_suggestions() -> Vec<String> {
    vec![
        "Start with single-letter words (I, a)".to_string(),
        "Use progressively longer synonyms".to_string(),
        "Consider compound words for longer positions".to_string(),
        "Plan the sentence structure in advance".to_string(),
    ]
}
