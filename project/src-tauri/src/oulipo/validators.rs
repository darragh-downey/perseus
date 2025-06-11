// Text validation utilities for Oulipo constraints
use crate::oulipo::{ConstraintResult, Violation};
use anyhow::Result;

pub fn validate_text_length(text: &str, min_length: usize, max_length: Option<usize>) -> Result<ConstraintResult> {
    let text_length = text.len();
    let mut violations = Vec::new();
    
    if text_length < min_length {
        violations.push(Violation {
            position: 0,
            length: text_length,
            issue: format!("Text too short: {} characters (minimum {})", text_length, min_length),
            suggestion: Some(format!("Add {} more characters", min_length - text_length)),
        });
    }
    
    if let Some(max_len) = max_length {
        if text_length > max_len {
            violations.push(Violation {
                position: max_len,
                length: text_length - max_len,
                issue: format!("Text too long: {} characters (maximum {})", text_length, max_len),
                suggestion: Some(format!("Remove {} characters", text_length - max_len)),
            });
        }
    }
    
    let is_empty = violations.is_empty();
    
    Ok(ConstraintResult {
        success: is_empty,
        result: Some(format!("Text length: {} characters", text_length)),
        violations,
        suggestions: if is_empty {
            vec!["Text length is within bounds".to_string()]
        } else {
            vec!["Adjust text length to meet requirements".to_string()]
        },
        metadata: serde_json::json!({
            "constraint_type": "length_validation",
            "current_length": text_length,
            "min_length": min_length,
            "max_length": max_length
        }),
    })
}

pub fn validate_word_count(text: &str, min_words: usize, max_words: Option<usize>) -> Result<ConstraintResult> {
    let word_count = text.split_whitespace().count();
    let mut violations = Vec::new();
    
    if word_count < min_words {
        violations.push(Violation {
            position: 0,
            length: text.len(),
            issue: format!("Too few words: {} (minimum {})", word_count, min_words),
            suggestion: Some(format!("Add {} more words", min_words - word_count)),
        });
    }
    
    if let Some(max_words) = max_words {
        if word_count > max_words {
            violations.push(Violation {
                position: 0,
                length: text.len(),
                issue: format!("Too many words: {} (maximum {})", word_count, max_words),
                suggestion: Some(format!("Remove {} words", word_count - max_words)),
            });
        }
    }
    
    let is_empty = violations.is_empty();
    
    Ok(ConstraintResult {
        success: is_empty,
        result: Some(format!("Word count: {}", word_count)),
        violations,
        suggestions: if is_empty {
            vec!["Word count is within bounds".to_string()]
        } else {
            vec!["Adjust word count to meet requirements".to_string()]
        },
        metadata: serde_json::json!({
            "constraint_type": "word_count_validation",
            "current_words": word_count,
            "min_words": min_words,
            "max_words": max_words
        }),
    })
}

pub fn check_character_frequency(text: &str, target_char: char, max_frequency: usize) -> Result<ConstraintResult> {
    let char_count = text.chars()
        .filter(|&c| c.to_lowercase().to_string() == target_char.to_lowercase().to_string())
        .count();
    
    let violations = if char_count > max_frequency {
        vec![Violation {
            position: 0,
            length: text.len(),
            issue: format!("Character '{}' appears {} times (maximum {})", target_char, char_count, max_frequency),
            suggestion: Some(format!("Remove {} occurrences of '{}'", char_count - max_frequency, target_char)),
        }]
    } else {
        vec![]
    };
    
    let is_empty = violations.is_empty();
    
    Ok(ConstraintResult {
        success: is_empty,
        result: Some(format!("Character '{}' appears {} times", target_char, char_count)),
        violations,
        suggestions: if is_empty {
            vec![format!("Character frequency for '{}' is within limits", target_char)]
        } else {
            vec![format!("Reduce usage of character '{}'", target_char)]
        },
        metadata: serde_json::json!({
            "constraint_type": "character_frequency",
            "target_character": target_char,
            "frequency": char_count,
            "max_frequency": max_frequency
        }),
    })
}
