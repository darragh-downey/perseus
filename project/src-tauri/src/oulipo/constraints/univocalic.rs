use crate::oulipo::{
    types::{ConstraintResult, Violation, Constraint},
    errors::{OulipoError, OulipoResult},
    utils::{is_vowel, VOWELS},
};
use anyhow::Result;

/// Univocalic constraint - text must use only one vowel throughout
pub struct UnivocalicConstraint {
    allowed_vowel: char,
}

impl UnivocalicConstraint {
    /// Create a new univocalic constraint with the specified allowed vowel
    pub fn new(allowed_vowel: char) -> OulipoResult<Self> {
        if !is_vowel(allowed_vowel) {
            return Err(OulipoError::InvalidConfig(
                format!("'{}' is not a valid vowel", allowed_vowel)
            ));
        }
        
        Ok(Self { allowed_vowel })
    }
}

impl Constraint for UnivocalicConstraint {
    fn check(&self, text: &str) -> Result<ConstraintResult> {
        check_univocalic(text, self.allowed_vowel)
    }
    
    fn name(&self) -> &'static str {
        "Univocalic"
    }
    
    fn description(&self) -> &'static str {
        "Text must use only one vowel throughout"
    }
}

/// Check if text uses only one vowel throughout
pub fn check(text: &str, allowed_vowel: char) -> Result<ConstraintResult> {
    check_univocalic(text, allowed_vowel)
}

/// Internal implementation of the univocalic check
fn check_univocalic(text: &str, allowed_vowel: char) -> Result<ConstraintResult> {
    let allowed = allowed_vowel.to_lowercase().to_string();
    let mut violations = Vec::new();
    
    for (pos, ch) in text.char_indices() {
        if ch.is_alphabetic() && is_vowel(ch) {
            let lower_ch = ch.to_lowercase().to_string();
            if lower_ch != allowed {
                violations.push(Violation {
                    position: pos,
                    length: 1,
                    issue: format!("Vowel '{}' is not allowed (only '{}' permitted)", ch, allowed_vowel),
                    suggestion: Some(format!("Replace with word containing only '{}'", allowed_vowel)),
                });
            }
        }
    }
    
    let success = violations.is_empty();
    let suggestions = if success {
        vec![format!("Perfect univocalic using '{}'!", allowed_vowel)]
    } else {
        generate_univocalic_suggestions(&allowed)
    };
    
    let violation_count = violations.len();
    let forbidden_vowels = VOWELS.replace(&allowed, "");
    
    Ok(ConstraintResult {
        success,
        result: Some(if success { 
            format!("Valid univocalic using '{}'", allowed_vowel)
        } else { 
            format!("{} forbidden vowels found", violation_count) 
        }),
        violations,
        suggestions,
        metadata: serde_json::json!({
            "allowed_vowel": allowed_vowel,
            "forbidden_vowels": forbidden_vowels,
            "violation_count": violation_count,
            "text_length": text.len()
        }),
    })
}

fn generate_univocalic_suggestions(allowed_vowel: &str) -> Vec<String> {
    match allowed_vowel {
        "a" => vec![
            "Use words like: at, and, has, that, man, can".to_string(),
            "A constraint that can make grand narratives".to_string(),
        ],
        "e" => vec![
            "Use words like: the, when, then, these, never".to_string(),
            "Create sentences where every letter helps".to_string(),
        ],
        "i" => vec![
            "Use words like: in, is, it, this, with, kind".to_string(),
            "Think minimal - it is tricky writing".to_string(),
        ],
        "o" => vec![
            "Use words like: on, do, go, of, from, long".to_string(),
            "Conform to strong word contortions".to_string(),
        ],
        "u" => vec![
            "Use words like: up, but, just, much, run".to_string(),
            "Construct full turns - unusually fun".to_string(),
        ],
        _ => vec![
            format!("Focus on words containing only '{}'", allowed_vowel),
            "Use a dictionary to find suitable words".to_string(),
        ]
    }
}
