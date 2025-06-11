use crate::oulipo::{ConstraintResult, Violation};
use anyhow::Result;

/// Check if text follows sestina pattern (6 stanzas, 6 lines each, specific end-word rotation)
pub fn check(text: &str, end_words: &[String]) -> Result<ConstraintResult> {
    let lines: Vec<&str> = text.lines().collect();
    
    if end_words.len() != 6 {
        return Ok(ConstraintResult {
            success: false,
            result: None,
            violations: vec![Violation {
                position: 0,
                length: text.len(),
                issue: "Sestina requires exactly 6 end words".to_string(),
                suggestion: Some("Provide exactly 6 end words for the sestina pattern".to_string()),
            }],
            suggestions: vec!["A sestina uses 6 specific words that end each line in a rotating pattern".to_string()],
            metadata: serde_json::json!({
                "constraint_type": "sestina",
                "provided_end_words": end_words.len(),
                "required_end_words": 6
            }),
        });
    }
    
    // Basic validation - should have 39 lines (6 stanzas * 6 lines + 3 line envoi)
    if lines.len() != 39 {
        return Ok(ConstraintResult {
            success: false,
            result: None,
            violations: vec![Violation {
                position: 0,
                length: text.len(),
                issue: format!("Sestina should have 39 lines (6 stanzas + 3-line envoi), found {}", lines.len()),
                suggestion: Some("Structure: 6 stanzas of 6 lines each, plus 3-line concluding envoi".to_string()),
            }],
            suggestions: vec![
                "Each stanza should have 6 lines".to_string(),
                "End with a 3-line envoi (concluding tercet)".to_string(),
                "Each line should end with one of the 6 designated words".to_string(),
            ],
            metadata: serde_json::json!({
                "constraint_type": "sestina",
                "line_count": lines.len(),
                "expected_lines": 39
            }),
        });
    }
    
    // Check if lines end with the expected words (simplified check)
    let mut violations = Vec::new();
    let expected_pattern = [
        // Stanza 1: 1,2,3,4,5,6
        [0,1,2,3,4,5],
        // Stanza 2: 6,1,5,2,4,3  
        [5,0,4,1,3,2],
        // Stanza 3: 3,6,4,1,2,5
        [2,5,3,0,1,4],
        // Stanza 4: 5,3,2,6,1,4
        [4,2,1,5,0,3],
        // Stanza 5: 4,5,1,3,6,2
        [3,4,0,2,5,1],  
        // Stanza 6: 2,4,6,5,3,1
        [1,3,5,4,2,0],
    ];
    
    for (stanza_idx, pattern) in expected_pattern.iter().enumerate() {
        for (line_idx, &word_idx) in pattern.iter().enumerate() {
            let overall_line_idx = stanza_idx * 6 + line_idx;
            if overall_line_idx < lines.len() {
                let line = lines[overall_line_idx].trim();
                let expected_end_word = &end_words[word_idx];
                
                if !line.to_lowercase().ends_with(&expected_end_word.to_lowercase()) {
                    violations.push(Violation {
                        position: overall_line_idx,
                        length: line.len(),
                        issue: format!("Line {} should end with '{}', but ends with '{}'", 
                            overall_line_idx + 1, expected_end_word, 
                            line.split_whitespace().last().unwrap_or("")),
                        suggestion: Some(format!("Rewrite line to end with '{}'", expected_end_word)),
                    });
                }
            }
        }
    }
    
    let violation_count = violations.len();
    let is_empty = violations.is_empty();
    
    Ok(ConstraintResult {
        success: is_empty,
        result: Some(if is_empty { 
            "Valid sestina structure".to_string() 
        } else { 
            format!("Sestina structure has {} violations", violation_count) 
        }),
        violations,
        suggestions: if is_empty {
            vec!["Perfect sestina structure!".to_string()]
        } else {
            vec![
                "Check line endings match the sestina pattern".to_string(),
                "Ensure each stanza follows the word rotation".to_string(),
                "Verify the 3-line envoi uses all 6 words".to_string(),
            ]
        },
        metadata: serde_json::json!({
            "constraint_type": "sestina",
            "end_words": end_words,
            "violations_count": violation_count,
            "line_count": lines.len()
        }),
    })
}
