// Dictionary service for word transformations
use std::collections::HashMap;

pub struct Dictionary {
    word_map: HashMap<String, Vec<String>>,
}

impl Dictionary {
    pub fn new() -> Self {
        Self {
            word_map: HashMap::new(),
        }
    }

    /// Get the nth word after the given word in alphabetical order
    pub fn get_n_plus_word(&self, word: &str, offset: i32) -> Option<String> {
        // For now, we'll use a simple transformation
        // In a full implementation, this would use a real dictionary
        let words = vec![
            "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
            "and", "runs", "through", "forest", "with", "great", "speed",
            "while", "birds", "sing", "in", "trees", "above", "ground",
            "where", "flowers", "bloom", "during", "spring", "season",
            "creating", "beautiful", "scenes", "that", "inspire", "writers",
            "to", "craft", "poems", "using", "various", "techniques"
        ];
        
        let word_lower = word.to_lowercase();
        if let Some(index) = words.iter().position(|&w| w == word_lower) {
            let new_index = ((index as i32 + offset) % words.len() as i32) as usize;
            Some(words[new_index].to_string())
        } else {
            // If word not found, return a transformed version
            Some(format!("{}+{}", word, offset))
        }
    }

    /// Check if a word exists in the dictionary
    pub fn contains_word(&self, word: &str) -> bool {
        // Simple check - in real implementation would use proper dictionary
        !word.trim().is_empty() && word.chars().all(|c| c.is_alphabetic())
    }

    /// Get synonyms for a word (placeholder implementation)
    pub fn get_synonyms(&self, word: &str) -> Vec<String> {
        // Placeholder - would integrate with real dictionary/thesaurus
        vec![format!("{}_synonym", word)]
    }
}
