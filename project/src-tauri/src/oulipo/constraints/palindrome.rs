use crate::oulipo::{ConstraintResult, Violation};
use anyhow::Result;

/// Check if text is a palindrome (reads the same forwards and backwards)
pub fn check(text: &str) -> Result<ConstraintResult> {
    let cleaned: String = text
        .chars()
        .filter(|c| c.is_alphanumeric())
        .map(|c| c.to_lowercase().next().unwrap())
        .collect();
    
    let reversed: String = cleaned.chars().rev().collect();
    let is_palindrome = cleaned == reversed;
    
    let violations = if is_palindrome {
        Vec::new()
    } else {
        find_palindrome_violations(&cleaned, &reversed)
    };
    
    let suggestions = if is_palindrome {
        vec!["Perfect palindrome!".to_string()]
    } else {
        generate_palindrome_suggestions()
    };
    
    Ok(ConstraintResult {
        success: is_palindrome,
        result: Some(if is_palindrome { 
            "Valid palindrome" 
        } else { 
            "Not a palindrome" 
        }.to_string()),
        violations,
        suggestions,
        metadata: serde_json::json!({
            "original_length": text.len(),
            "cleaned_length": cleaned.len(),
            "is_palindrome": is_palindrome,
            "cleaned_text": cleaned
        }),
    })
}

fn find_palindrome_violations(text: &str, reversed: &str) -> Vec<Violation> {
    let chars: Vec<char> = text.chars().collect();
    let rev_chars: Vec<char> = reversed.chars().collect();
    let mut violations = Vec::new();
    
    for (i, (&ch, &rev_ch)) in chars.iter().zip(rev_chars.iter()).enumerate() {
        if ch != rev_ch {
            violations.push(Violation {
                position: i,
                length: 1,
                issue: format!("Character '{}' doesn't match its mirror '{}'", ch, rev_ch),
                suggestion: Some(format!("Consider changing to '{}'", rev_ch)),
            });
        }
    }
    
    violations
}

fn generate_palindrome_suggestions() -> Vec<String> {
    vec![
        "Add mirroring words at the end".to_string(),
        "Remove or modify middle words".to_string(),
        "Try single-word palindromes first".to_string(),
        "Consider phrase-level palindromes".to_string(),
    ]
}
