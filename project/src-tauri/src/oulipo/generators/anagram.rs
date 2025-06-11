// Anagram generation and challenges
use crate::oulipo::{ConstraintResult, Violation};
use anyhow::Result;
use std::collections::HashMap;

pub fn generate_anagrams(text: &str) -> Result<ConstraintResult> {
    let clean_text = text.chars()
        .filter(|c| c.is_alphabetic())
        .collect::<String>()
        .to_lowercase();
    
    if clean_text.is_empty() {
        return Ok(ConstraintResult {
            success: false,
            result: None,
            violations: vec![Violation {
                position: 0,
                length: text.len(),
                issue: "No alphabetic characters found".to_string(),
                suggestion: Some("Enter text with letters".to_string()),
            }],
            suggestions: vec!["Try entering some words with letters".to_string()],
            metadata: serde_json::json!({
                "constraint_type": "anagram_generation",
                "original_length": text.len(),
                "clean_length": clean_text.len()
            }),
        });
    }

    // Generate some simple anagrams by rearranging letters
    let anagrams = generate_simple_anagrams(&clean_text);
    
    Ok(ConstraintResult {
        success: true,
        result: Some(anagrams.join(", ")),
        violations: vec![],
        suggestions: vec![
            "Try different letter combinations".to_string(),
            "Look for meaningful words in the anagrams".to_string(),
        ],
        metadata: serde_json::json!({
            "constraint_type": "anagram_generation",
            "anagram_count": anagrams.len(),
            "original_text": text,
            "letter_frequency": get_letter_frequency(&clean_text)
        }),
    })
}

fn generate_simple_anagrams(text: &str) -> Vec<String> {
    let mut chars: Vec<char> = text.chars().collect();
    let mut anagrams = Vec::new();
    
    // Generate a few simple permutations
    for _i in 0..std::cmp::min(5, text.len()) {
        chars.rotate_left(1);
        let anagram: String = chars.iter().collect();
        if anagram != text && !anagrams.contains(&anagram) {
            anagrams.push(anagram);
        }
    }
    
    // Add some reversed versions
    let reversed: String = text.chars().rev().collect();
    if reversed != text && !anagrams.contains(&reversed) {
        anagrams.push(reversed);
    }
    
    anagrams
}

fn get_letter_frequency(text: &str) -> HashMap<char, usize> {
    let mut freq = HashMap::new();
    for c in text.chars() {
        *freq.entry(c).or_insert(0) += 1;
    }
    freq
}

pub fn check_anagram(text1: &str, text2: &str) -> Result<ConstraintResult> {
    let clean1: String = text1.chars()
        .filter(|c| c.is_alphabetic())
        .collect::<String>()
        .to_lowercase();
    
    let clean2: String = text2.chars()
        .filter(|c| c.is_alphabetic())
        .collect::<String>()
        .to_lowercase();
    
    let freq1 = get_letter_frequency(&clean1);
    let freq2 = get_letter_frequency(&clean2);
    
    let is_anagram = freq1 == freq2;
    
    Ok(ConstraintResult {
        success: is_anagram,
        result: Some(if is_anagram { "Valid anagram" } else { "Not an anagram" }.to_string()),
        violations: if is_anagram { 
            vec![] 
        } else { 
            vec![Violation {
                position: 0,
                length: text2.len(),
                issue: "Letter frequencies don't match".to_string(),
                suggestion: Some("Rearrange letters to match the first text".to_string()),
            }]
        },
        suggestions: if is_anagram {
            vec!["Perfect anagram!".to_string()]
        } else {
            vec!["Check letter frequencies".to_string(), "Try rearranging".to_string()]
        },
        metadata: serde_json::json!({
            "constraint_type": "anagram_check",
            "text1_freq": freq1,
            "text2_freq": freq2,
            "is_anagram": is_anagram
        }),
    })
}
