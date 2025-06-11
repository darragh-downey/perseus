use crate::oulipo::{ConstraintResult, dictionary::Dictionary};
use anyhow::Result;

/// Transform text using N+7 method (replace each noun with the 7th noun following it)
pub fn transform(text: &str, offset: i32, dictionary: &Dictionary) -> Result<ConstraintResult> {
    let words: Vec<&str> = text.split_whitespace().collect();
    let word_count = words.len();
    let mut transformed_words = Vec::new();
    let mut replacements_made = 0;
    
    for word in words {
        if let Some(replacement) = dictionary.get_n_plus_word(word, offset) {
            transformed_words.push(replacement);
            replacements_made += 1;
        } else {
            transformed_words.push(word.to_string());
        }
    }
    
    let result_text = transformed_words.join(" ");
    
    Ok(ConstraintResult {
        success: true,
        result: Some(result_text),
        violations: Vec::new(),
        suggestions: vec![
            "Try different offset values for varied results".to_string(),
            "Focus on noun-heavy text for better transformation".to_string(),
        ],
        metadata: serde_json::json!({
            "offset": offset,
            "original_words": word_count,
            "replacements_made": replacements_made,
            "replacement_rate": replacements_made as f64 / word_count as f64
        }),
    })
}
