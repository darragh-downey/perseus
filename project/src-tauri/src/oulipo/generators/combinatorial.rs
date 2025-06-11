// Combinatorial poetry generation
use crate::oulipo::{ConstraintResult, Violation};
use anyhow::Result;
use rand::seq::SliceRandom;
use rand::thread_rng;

pub fn generate_combinatorial_poem(words: Vec<String>, structure: &str) -> Result<ConstraintResult> {
    if words.is_empty() {
        return Ok(ConstraintResult {
            success: false,
            result: None,
            violations: vec![Violation {
                position: 0,
                length: 0,
                issue: "No words provided".to_string(),
                suggestion: Some("Provide a list of words to combine".to_string()),
            }],
            suggestions: vec!["Enter at least 3-5 words".to_string()],
            metadata: serde_json::json!({
                "constraint_type": "combinatorial_poem",
                "word_count": 0
            }),
        });
    }

    let poem = match structure {
        "random" => generate_random_combination(&words),
        "ascending" => generate_ascending_combination(&words),
        "chiasmus" => generate_chiasmus(&words),
        "spiral" => generate_spiral_combination(&words),
        _ => generate_random_combination(&words),
    };

    Ok(ConstraintResult {
        success: true,
        result: Some(poem),
        violations: vec![],
        suggestions: vec![
            "Try different structures".to_string(),
            "Experiment with word order".to_string(),
            "Add more words for variety".to_string(),
        ],
        metadata: serde_json::json!({
            "constraint_type": "combinatorial_poem",
            "structure": structure,
            "word_count": words.len(),
            "input_words": words
        }),
    })
}

fn generate_random_combination(words: &[String]) -> String {
    let mut rng = thread_rng();
    let mut shuffled = words.to_vec();
    shuffled.shuffle(&mut rng);
    
    let lines: Vec<String> = shuffled.chunks(3)
        .map(|chunk| chunk.join(" "))
        .collect();
    
    lines.join("\n")
}

fn generate_ascending_combination(words: &[String]) -> String {
    let mut sorted_words = words.to_vec();
    sorted_words.sort_by_key(|w| w.len());
    
    let mut lines = Vec::new();
    let mut current_line = Vec::new();
    let mut current_length = 0;
    
    for word in sorted_words {
        if current_length + word.len() > 50 || current_line.len() >= 4 {
            if !current_line.is_empty() {
                lines.push(current_line.join(" "));
                current_line.clear();
                current_length = 0;
            }
        }
        current_line.push(word.clone());
        current_length += word.len() + 1;
    }
    
    if !current_line.is_empty() {
        lines.push(current_line.join(" "));
    }
    
    lines.join("\n")
}

fn generate_chiasmus(words: &[String]) -> String {
    if words.len() < 4 {
        return words.join(" ");
    }
    
    let mid = words.len() / 2;
    let first_half = &words[0..mid];
    let second_half: Vec<String> = words[mid..].iter().rev().cloned().collect();
    
    format!("{}\n{}", first_half.join(" "), second_half.join(" "))
}

fn generate_spiral_combination(words: &[String]) -> String {
    if words.is_empty() {
        return String::new();
    }
    
    let mut lines = Vec::new();
    let mut used = vec![false; words.len()];
    let mut current_index = 0;
    let step = std::cmp::max(1, words.len() / 3);
    
    while lines.len() < 4 && used.iter().any(|&u| !u) {
        let mut line_words = Vec::new();
        
        for _ in 0..3 {
            if !used[current_index] {
                line_words.push(words[current_index].clone());
                used[current_index] = true;
            }
            
            current_index = (current_index + step) % words.len();
            
            // Find next unused word if we've cycled back
            while used[current_index] && used.iter().any(|&u| !u) {
                current_index = (current_index + 1) % words.len();
            }
        }
        
        if !line_words.is_empty() {
            lines.push(line_words.join(" "));
        }
    }
    
    lines.join("\n")
}
