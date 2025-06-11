
//! Utility functions for text processing and constraint checking.

/// Common vowels used in constraint checking
pub const VOWELS: &str = "aeiou";
pub const VOWELS_UPPER: &str = "AEIOU";

/// Check if a character is a vowel
pub fn is_vowel(ch: char) -> bool {
    VOWELS.contains(ch.to_lowercase().next().unwrap_or('?')) || 
    VOWELS_UPPER.contains(ch)
}

/// Get all vowels present in text
pub fn extract_vowels(text: &str) -> Vec<char> {
    text.chars()
        .filter(|&ch| is_vowel(ch))
        .collect()
}

/// Normalize text for analysis (lowercase, remove punctuation)
pub fn normalize_text(text: &str) -> String {
    text.chars()
        .filter(|ch| ch.is_alphabetic() || ch.is_whitespace())
        .map(|ch| ch.to_lowercase().next().unwrap_or(ch))
        .collect()
}

/// Count words in text
pub fn word_count(text: &str) -> usize {
    text.split_whitespace().count()
}

/// Get character frequency map
pub fn char_frequency(text: &str) -> std::collections::HashMap<char, usize> {
    let mut freq = std::collections::HashMap::new();
    for ch in text.chars() {
        *freq.entry(ch).or_insert(0) += 1;
    }
    freq
}

/// Split text into sentences
pub fn split_sentences(text: &str) -> Vec<&str> {
    text.split(|c| c == '.' || c == '!' || c == '?')
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .collect()
}

/// Check if text is a palindrome (ignoring case and non-alphabetic characters)
pub fn is_palindrome(text: &str) -> bool {
    let normalized: String = text.chars()
        .filter(|ch| ch.is_alphabetic())
        .map(|ch| ch.to_lowercase().next().unwrap_or(ch))
        .collect();
    
    normalized == normalized.chars().rev().collect::<String>()
}
