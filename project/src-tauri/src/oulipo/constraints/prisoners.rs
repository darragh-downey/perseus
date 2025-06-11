use crate::oulipo::{ConstraintResult, Violation};
use anyhow::Result;

/// Check prisoner's constraint (only letters without loops: c, f, h, i, j, k, l, m, n, s, t, u, v, w, x, y, z)
pub fn check(text: &str) -> Result<ConstraintResult> {
    let allowed_letters = "cfhijklmnstuvwxyz";
    let mut violations = Vec::new();
    
    for (pos, ch) in text.char_indices() {
        if ch.is_alphabetic() {
            let lower_ch = ch.to_lowercase().to_string();
            if !allowed_letters.contains(&lower_ch) {
                violations.push(Violation {
                    position: pos,
                    length: 1,
                    issue: format!("Letter '{}' contains loops and is forbidden", ch),
                    suggestion: Some("Replace with a letter without loops".to_string()),
                });
            }
        }
    }
    
    let success = violations.is_empty();
    let suggestions = if success {
        vec!["Perfect prisoner's constraint text!".to_string()]
    } else {
        generate_prisoners_suggestions()
    };
    
    let violation_count = violations.len();
    
    Ok(ConstraintResult {
        success,
        result: Some(if success { 
            "Valid prisoner's constraint text".to_string()
        } else { 
            format!("{} forbidden letters found", violation_count) 
        }),
        violations,
        suggestions,
        metadata: serde_json::json!({
            "allowed_letters": allowed_letters,
            "forbidden_letters": "abdegopqr",
            "violation_count": violation_count,
            "text_length": text.len()
        }),
    })
}

fn generate_prisoners_suggestions() -> Vec<String> {
    vec![
        "Use only letters without loops: c, f, h, i, j, k, l, m, n, s, t, u, v, w, x, y, z".to_string(),
        "Avoid letters: a, b, d, e, g, o, p, q, r".to_string(),
        "Focus on words with straight lines and simple curves".to_string(),
        "Think of letters that could be drawn with sticks".to_string(),
    ]
}
