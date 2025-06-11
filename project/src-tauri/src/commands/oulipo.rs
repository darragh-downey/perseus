//! Oulipo constraint-related Tauri commands.

use crate::oulipo::{OulipoService, ConstraintResult, Violation};
use crate::commands::state::AppState;
use tauri::State;

/// Check lipogram constraint (text without specific letters)
#[tauri::command]
pub fn check_lipogram(
    state: State<'_, AppState>,
    text: String,
    forbidden_letter: String,
) -> Result<ConstraintResult, String> {
    state.services()
        .oulipo_service()
        .check_lipogram(&text, &forbidden_letter)
        .map_err(|e| e.to_string())
}

/// Check palindrome constraint
#[tauri::command]
pub fn check_palindrome(
    state: State<'_, AppState>,
    text: String,
) -> Result<ConstraintResult, String> {
    state.services()
        .oulipo_service()
        .check_palindrome(&text)
        .map_err(|e| e.to_string())
}

/// Check snowball constraint (each word one letter longer)
#[tauri::command]
pub fn check_snowball(
    state: State<'_, AppState>,
    text: String,
) -> Result<ConstraintResult, String> {
    state.services()
        .oulipo_service()
        .check_snowball(&text)
        .map_err(|e| e.to_string())
}

/// Check univocalic constraint (only one vowel allowed)
#[tauri::command]
pub fn check_univocalic(
    state: State<'_, AppState>,
    text: String,
    vowel: String,
) -> Result<ConstraintResult, String> {
    state.services()
        .oulipo_service()
        .check_univocalic(&text, &vowel)
        .map_err(|e| e.to_string())
}

/// Check lipogram constraint (alias for consistency)
#[tauri::command]
pub fn lipogram_check(
    state: State<'_, AppState>,
    text: String,
    forbidden_letter: String,
) -> Result<ConstraintResult, String> {
    check_lipogram(state, text, forbidden_letter)
}

/// Check palindrome constraint (alias for consistency)
#[tauri::command]
pub fn palindrome_check(
    state: State<'_, AppState>,
    text: String,
) -> Result<ConstraintResult, String> {
    check_palindrome(state, text)
}

/// Check snowball constraint (alias for consistency)
#[tauri::command]
pub fn snowball_check(
    state: State<'_, AppState>,
    text: String,
) -> Result<ConstraintResult, String> {
    check_snowball(state, text)
}

/// Check univocalic constraint (alias for consistency)
#[tauri::command]
pub fn univocalic_check(
    state: State<'_, AppState>,
    text: String,
    vowel: String,
) -> Result<ConstraintResult, String> {
    check_univocalic(state, text, vowel)
}

/// Check prisoners constraint
#[tauri::command]
pub fn prisoners_constraint_check(
    state: State<'_, AppState>,
    text: String,
) -> Result<ConstraintResult, String> {
    state.services()
        .oulipo_service()
        .check_prisoners_constraint(&text)
        .map_err(|e| e.to_string())
}

/// Check sestina constraint
#[tauri::command]
pub fn sestina_check(
    state: State<'_, AppState>,
    text: String,
    end_words: Vec<String>,
) -> Result<ConstraintResult, String> {
    state.services()
        .oulipo_service()
        .check_sestina(&text, &end_words)
        .map_err(|e| e.to_string())
}

/// Apply N+7 transformation
#[tauri::command]
pub fn n_plus_7_transform(
    state: State<'_, AppState>,
    text: String,
    offset: i32,
) -> Result<ConstraintResult, String> {
    state.services()
        .oulipo_service()
        .n_plus_7_transform(&text, offset)
        .map_err(|e| e.to_string())
}

/// Generate haiku
#[tauri::command]
pub fn generate_haiku(
    state: State<'_, AppState>,
    theme: Option<String>,
) -> Result<String, String> {
    state.services()
        .oulipo_service()
        .generate_haiku(theme.as_deref())
        .map_err(|e| e.to_string())
}

/// Generate anagrams
#[tauri::command]
pub fn generate_anagrams(
    state: State<'_, AppState>,
    word: String,
    max_results: Option<usize>,
) -> Result<Vec<String>, String> {
    state.services()
        .oulipo_service()
        .generate_anagrams(&word, max_results.unwrap_or(10))
        .map_err(|e| e.to_string())
}

/// Check if two words are anagrams
#[tauri::command]
pub fn check_anagram(
    state: State<'_, AppState>,
    word1: String,
    word2: String,
) -> Result<bool, String> {
    state.services()
        .oulipo_service()
        .check_anagram(&word1, &word2)
        .map_err(|e| e.to_string())
}

/// Generate combinatorial poem
#[tauri::command]
pub fn generate_combinatorial_poem(
    state: State<'_, AppState>,
    word_sets: Vec<Vec<String>>,
    pattern: Option<String>,
) -> Result<String, String> {
    state.services()
        .oulipo_service()
        .generate_combinatorial_poem(&word_sets, pattern.as_deref())
        .map_err(|e| e.to_string())
}

/// Validate text length constraint
#[tauri::command]
pub fn validate_text_length(
    text: String,
    min_length: Option<usize>,
    max_length: Option<usize>,
) -> Result<ConstraintResult, String> {
    let length = text.chars().count();
    
    let mut violations = Vec::new();
    let mut is_valid = true;
    
    if let Some(min) = min_length {
        if length < min {
            violations.push(format!("Text too short: {} characters (minimum: {})", length, min));
            is_valid = false;
        }
    }
    
    if let Some(max) = max_length {
        if length > max {
            violations.push(format!("Text too long: {} characters (maximum: {})", length, max));
            is_valid = false;
        }
    }
    
    Ok(ConstraintResult {
        success: is_valid,
        result: None,
        violations: violations.into_iter().map(|v| crate::oulipo::types::Violation {
            position: 0,
            length: 0,
            issue: v,
            suggestion: None,
        }).collect(),
        suggestions: if is_valid { 
            Vec::new() 
        } else { 
            vec!["Adjust text length to meet requirements".to_string()] 
        },
        metadata: serde_json::Value::Null,
    })
}

/// Validate word count constraint
#[tauri::command]
pub fn validate_word_count(
    text: String,
    min_words: Option<usize>,
    max_words: Option<usize>,
) -> Result<ConstraintResult, String> {
    let word_count = text.split_whitespace().count();
    
    let mut violations = Vec::new();
    let mut is_valid = true;
    
    if let Some(min) = min_words {
        if word_count < min {
            violations.push(format!("Too few words: {} (minimum: {})", word_count, min));
            is_valid = false;
        }
    }
    
    if let Some(max) = max_words {
        if word_count > max {
            violations.push(format!("Too many words: {} (maximum: {})", word_count, max));
            is_valid = false;
        }
    }
    
    Ok(ConstraintResult {
        success: is_valid,
        result: Some(format!("Word count: {}", word_count)),
        violations: violations.into_iter().map(|msg| Violation {
            position: 0,
            length: 0,
            issue: msg,
            suggestion: Some("Adjust word count to meet requirements".to_string()),
        }).collect(),
        suggestions: if is_valid { 
            Vec::new() 
        } else { 
            vec!["Adjust word count to meet requirements".to_string()] 
        },
        metadata: serde_json::Value::Null,
    })
}

/// Generate lipogram suggestions
#[tauri::command]
pub fn lipogram_suggestions(
    state: State<'_, AppState>,
    text: String,
    forbidden_letter: String,
) -> Result<Vec<String>, String> {
    state.services()
        .oulipo_service()
        .generate_lipogram_suggestions(&text, &forbidden_letter)
        .map_err(|e| e.to_string())
}

/// Generate palindrome suggestions
#[tauri::command]
pub fn palindrome_suggestions(
    state: State<'_, AppState>,
    text: String,
) -> Result<Vec<String>, String> {
    state.services()
        .oulipo_service()
        .generate_palindrome_suggestions(&text)
        .map_err(|e| e.to_string())
}

/// Advanced constraint workflow creation
#[tauri::command]
pub fn create_constraint_workflow(
    state: State<'_, AppState>,
    constraints: Vec<serde_json::Value>,
) -> Result<serde_json::Value, String> {
    let oulipo = state.services().oulipo_service();
    let mut workflow = oulipo.create_workflow();
    
    // Parse constraints and add them to workflow
    for constraint in constraints {
        if let Some(constraint_type) = constraint.get("type").and_then(|v| v.as_str()) {
            match constraint_type {
                "univocalic" => {
                    if let Some(vowel) = constraint.get("vowel").and_then(|v| v.as_str()).and_then(|s| s.chars().next()) {
                        workflow = workflow.with_univocalic(vowel);
                    }
                }
                "length" => {
                    let min = constraint.get("min").and_then(|v| v.as_u64()).map(|v| v as usize);
                    let max = constraint.get("max").and_then(|v| v.as_u64()).map(|v| v as usize);
                    workflow = workflow.with_length_limits(min, max);
                }
                "words" => {
                    let min = constraint.get("min").and_then(|v| v.as_u64()).map(|v| v as usize);
                    let max = constraint.get("max").and_then(|v| v.as_u64()).map(|v| v as usize);
                    workflow = workflow.with_word_limits(min, max);
                }
                _ => {}
            }
        }
    }
    
    match workflow.build() {
        Ok(_config) => Ok(serde_json::json!({
            "success": true,
            "message": "Workflow created successfully"
        })),
        Err(e) => Err(format!("Failed to create workflow: {}", e))
    }
}
