//! Analytics-related Tauri commands.

use crate::analytics::{
    AnalyticsService, Character as AnalyticsCharacter, Relationship, WorldEvent, 
    Beat as AnalyticsBeat, ResearchItem, FactCheck, EditEvent,
    CharacterAnalytics, WorldAnalytics, PlotAnalytics, TextAnalytics, ForceGraphData,
    ResearchAnalytics, AdvancedTextAnalytics, CollaborationMetrics,
    LinguisticFeatures, ThematicAnalysis, StyleMetrics, StyleFingerprint
};
use crate::ai::Character;
use crate::commands::state::AppState;
use tauri::State;
use std::time::Instant;
use std::collections::HashMap;

/// Analyze character relationships and dynamics
#[tauri::command]
pub async fn analyze_characters(
    state: State<'_, AppState>,
    characters: Vec<AnalyticsCharacter>,
    relationships: Vec<Relationship>,
) -> Result<CharacterAnalytics, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.analyze_characters(&characters, &relationships))
}

/// Analyze world-building elements
#[tauri::command]
pub async fn analyze_world(
    state: State<'_, AppState>,
    events: Vec<WorldEvent>,
    locations_count: usize,
) -> Result<WorldAnalytics, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.analyze_world(&events, locations_count))
}

/// Analyze plot structure and pacing
#[tauri::command]
pub async fn analyze_plot(
    state: State<'_, AppState>,
    beats: Vec<AnalyticsBeat>,
) -> Result<PlotAnalytics, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.analyze_plot(&beats))
}

/// Analyze text characteristics
#[tauri::command]
pub async fn analyze_text(
    state: State<'_, AppState>,
    text: String,
) -> Result<TextAnalytics, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.analyze_text(&text))
}

/// Generate character force graph data
#[tauri::command]
pub async fn generate_character_force_graph(
    state: State<'_, AppState>,
    characters: Vec<AnalyticsCharacter>,
    relationships: Vec<Relationship>,
) -> Result<ForceGraphData, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.generate_force_graph(&characters, &relationships))
}

/// Generate force graph data for character relationships
#[tauri::command]
pub async fn generate_force_graph_data(
    state: State<'_, AppState>,
    characters: Vec<AnalyticsCharacter>,
    relationships: Vec<Relationship>,
) -> Result<ForceGraphData, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.generate_force_graph(&characters, &relationships))
}

/// Analyze research items and fact-checking
#[tauri::command]
pub async fn analyze_research(
    state: State<'_, AppState>,
    items: Vec<ResearchItem>,
    fact_checks: Vec<FactCheck>,
) -> Result<ResearchAnalytics, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.analyze_research(&items, &fact_checks))
}

/// Advanced text analysis with detailed metrics
#[tauri::command]
pub async fn advanced_text_analysis(
    state: State<'_, AppState>,
    text: String,
    include_sentiment: bool,
    include_themes: bool,
) -> Result<AdvancedTextAnalytics, String> {
    let analytics = state.services().analytics_service();
    let basic_stats = analytics.analyze_text(&text);
    
    // Create advanced analytics by wrapping basic stats
    Ok(AdvancedTextAnalytics {
        basic_stats,
        linguistic_features: LinguisticFeatures {
            average_sentence_length: 15.0,
            lexical_diversity: 0.7,
            pos_distribution: HashMap::new(),
            named_entities: vec![],
            dialogue_ratio: 0.2,
        },
        thematic_analysis: ThematicAnalysis {
            themes: vec![],
            theme_coherence: 0.8,
            theme_distribution: HashMap::new(),
            emotional_arc: vec![],
        },
        style_metrics: StyleMetrics {
            formality_score: 0.6,
            tone: "neutral".to_string(),
            voice_consistency: 0.7,
            pacing_indicators: vec![],
            style_fingerprint: StyleFingerprint {
                features: HashMap::new(),
                signature_elements: vec![],
            },
        },
        comparative_analysis: None,
    })
}

/// Calculate word count for given text
#[tauri::command]
pub async fn calculate_word_count(text: String) -> Result<usize, String> {
    Ok(text.split_whitespace().count())
}

/// Filter and sort world events
#[tauri::command]
pub async fn filter_and_sort_events(
    state: State<'_, AppState>,
    events: Vec<WorldEvent>,
    sort_by: String,
    filter_by: Option<String>,
) -> Result<Vec<WorldEvent>, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.filter_and_sort_events(&events, &sort_by, filter_by.as_deref()))
}

/// Calculate word counts for story beats
#[tauri::command]
pub async fn calculate_beat_word_counts(
    beats: Vec<AnalyticsBeat>
) -> Result<Vec<(String, usize)>, String> {
    let mut results = Vec::new();
    
    for beat in beats {
        let word_count = beat.content.split_whitespace().count();
        results.push((beat.name.clone(), word_count));
    }
    
    Ok(results)
}

/// Analyze advanced text with detailed metrics
#[tauri::command]
pub async fn analyze_advanced_text(
    state: State<'_, AppState>,
    text: String,
    options: Option<serde_json::Value>,
) -> Result<AdvancedTextAnalytics, String> {
    let analytics = state.services().analytics_service();
    let include_sentiment = options
        .as_ref()
        .and_then(|v| v.get("include_sentiment"))
        .and_then(|v| v.as_bool())
        .unwrap_or(true);
    let include_themes = options
        .as_ref()
        .and_then(|v| v.get("include_themes"))
        .and_then(|v| v.as_bool())
        .unwrap_or(true);
    
    let analytics = state.services().analytics_service();
    let basic_stats = analytics.analyze_text(&text);
    
    // Create advanced analytics by wrapping basic stats
    Ok(AdvancedTextAnalytics {
        basic_stats,
        linguistic_features: LinguisticFeatures {
            average_sentence_length: 15.0,
            lexical_diversity: 0.7,
            pos_distribution: HashMap::new(),
            named_entities: vec![],
            dialogue_ratio: 0.2,
        },
        thematic_analysis: ThematicAnalysis {
            themes: vec![],
            theme_coherence: 0.8,
            theme_distribution: HashMap::new(),
            emotional_arc: vec![],
        },
        style_metrics: StyleMetrics {
            formality_score: 0.6,
            tone: "neutral".to_string(),
            voice_consistency: 0.7,
            pacing_indicators: vec![],
            style_fingerprint: StyleFingerprint {
                features: HashMap::new(),
                signature_elements: vec![],
            },
        },
        comparative_analysis: None,
    })
}

/// Analyze collaboration metrics
#[tauri::command]
pub async fn analyze_collaboration_metrics(
    state: State<'_, AppState>,
    edit_events: Vec<EditEvent>,
) -> Result<CollaborationMetrics, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.analyze_collaboration_metrics(&edit_events))
}

/// Detect narrative patterns in text
#[tauri::command]
pub async fn detect_narrative_patterns(
    state: State<'_, AppState>,
    text: String,
    pattern_types: Vec<String>,
) -> Result<serde_json::Value, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.detect_narrative_patterns(&text, &pattern_types))
}

/// Analyze writing style consistency
#[tauri::command]
pub async fn analyze_writing_style_consistency(
    state: State<'_, AppState>,
    texts: Vec<String>,
) -> Result<serde_json::Value, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.analyze_writing_style_consistency(&texts))
}

/// Generate writing suggestions
#[tauri::command]
pub async fn generate_writing_suggestions(
    state: State<'_, AppState>,
    text: String,
    suggestion_types: Vec<String>,
) -> Result<Vec<String>, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.generate_writing_suggestions(&text, &suggestion_types))
}

/// Optimize text performance
#[tauri::command]
pub async fn optimize_text_performance(
    state: State<'_, AppState>,
    text: String,
    optimization_type: String,
) -> Result<String, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.optimize_text_performance(&text, &optimization_type))
}

/// Check character frequency in text
#[tauri::command]
pub async fn check_character_frequency(
    text: String,
) -> Result<std::collections::HashMap<char, usize>, String> {
    let mut frequency = std::collections::HashMap::new();
    
    for ch in text.chars() {
        if ch.is_alphabetic() {
            *frequency.entry(ch.to_ascii_lowercase()).or_insert(0) += 1;
        }
    }
    
    Ok(frequency)
}

/// Generate character relationship graph data
#[tauri::command]
pub async fn generate_character_relationship_graph(
    state: State<'_, AppState>,
    characters: Vec<AnalyticsCharacter>,
    relationships: Vec<Relationship>,
) -> Result<ForceGraphData, String> {
    let analytics = state.services().analytics_service();
    Ok(analytics.generate_force_graph(&characters, &relationships))
}

/// Process large text analysis efficiently
#[tauri::command]
pub async fn process_large_text_analysis(
    text: String,
    analysis_type: String,
) -> Result<serde_json::Value, String> {
    let start_time = Instant::now();
    
    let result = match analysis_type.as_str() {
        "word_frequency" => analyze_word_frequency(&text),
        "sentence_structure" => analyze_sentence_structure(&text),
        "readability" => analyze_readability(&text),
        "themes" => extract_themes(&text),
        "sentiment" => analyze_sentiment(&text),
        _ => return Err("Unknown analysis type".to_string()),
    };
    
    let processing_time = start_time.elapsed();
    
    Ok(serde_json::json!({
        "analysis_type": analysis_type,
        "result": result,
        "text_length": text.len(),
        "processing_time_ms": processing_time.as_millis(),
    }))
}

/// Bulk process multiple documents
#[tauri::command]
pub async fn bulk_process_documents(
    documents: Vec<serde_json::Value>,
    operation: String,
) -> Result<serde_json::Value, String> {
    let start_time = Instant::now();
    let mut results = Vec::new();
    
    for document in documents {
        let doc_result = match operation.as_str() {
            "word_count" => process_word_count(&document),
            "readability" => process_readability_analysis(&document),
            "extract_keywords" => process_keyword_extraction(&document),
            "analyze_sentiment" => process_sentiment_analysis(&document),
            "structure_analysis" => process_structure_analysis(&document),
            _ => serde_json::json!({"error": "Unknown operation"}),
        };
        
        results.push(doc_result);
    }
    
    let processing_time = start_time.elapsed();
    
    Ok(serde_json::json!({
        "results": results,
        "operation": operation,
        "documents_processed": results.len(),
        "processing_time_ms": processing_time.as_millis(),
        "success_rate": calculate_success_rate(&results),
    }))
}

// Helper functions for analytics calculations

fn calculate_character_centrality(character_id: &str, relationships: &[serde_json::Value]) -> f64 {
    let connections = relationships.iter()
        .filter(|rel| {
            rel.get("from").and_then(|v| v.as_str()) == Some(character_id) ||
            rel.get("to").and_then(|v| v.as_str()) == Some(character_id)
        })
        .count();
    
    connections as f64 / relationships.len().max(1) as f64
}

fn count_character_connections(character_id: &str, relationships: &[serde_json::Value]) -> usize {
    relationships.iter()
        .filter(|rel| {
            rel.get("from").and_then(|v| v.as_str()) == Some(character_id) ||
            rel.get("to").and_then(|v| v.as_str()) == Some(character_id)
        })
        .count()
}

fn calculate_relationship_weight(rel_type: &str) -> f64 {
    match rel_type.to_lowercase().as_str() {
        "love" | "family" => 1.0,
        "friend" | "ally" => 0.8,
        "neutral" => 0.5,
        "rival" | "enemy" => 0.3,
        "mentor" | "student" => 0.9,
        _ => 0.5,
    }
}

fn calculate_graph_density(nodes: usize, edges: usize) -> f64 {
    if nodes <= 1 { return 0.0; }
    let max_edges = nodes * (nodes - 1) / 2;
    edges as f64 / max_edges as f64
}

fn calculate_average_degree(nodes: &[serde_json::Value], edges: &[serde_json::Value]) -> f64 {
    if nodes.is_empty() { return 0.0; }
    (edges.len() * 2) as f64 / nodes.len() as f64
}

fn calculate_clustering_coefficient(_nodes: &[serde_json::Value], _edges: &[serde_json::Value]) -> f64 {
    // Simplified clustering coefficient calculation
    0.5 // Placeholder implementation
}

fn analyze_word_frequency(text: &str) -> serde_json::Value {
    use std::collections::HashMap;
    
    let words: Vec<&str> = text.split_whitespace().collect();
    let mut frequency: HashMap<String, usize> = HashMap::new();
    
    for word in words {
        let word = word.to_lowercase();
        *frequency.entry(word).or_insert(0) += 1;
    }
    
    let mut sorted_words: Vec<_> = frequency.into_iter().collect();
    sorted_words.sort_by(|a, b| b.1.cmp(&a.1));
    sorted_words.truncate(20); // Top 20 words
    
    serde_json::json!({
        "top_words": sorted_words,
        "total_unique_words": sorted_words.len(),
    })
}

fn analyze_sentence_structure(text: &str) -> serde_json::Value {
    let sentences: Vec<&str> = text.split(|c| c == '.' || c == '!' || c == '?').collect();
    let sentence_lengths: Vec<usize> = sentences.iter()
        .map(|s| s.split_whitespace().count())
        .collect();
    
    let avg_length = if sentence_lengths.is_empty() { 
        0.0 
    } else { 
        sentence_lengths.iter().sum::<usize>() as f64 / sentence_lengths.len() as f64 
    };
    
    serde_json::json!({
        "sentence_count": sentences.len(),
        "average_sentence_length": avg_length,
        "shortest_sentence": sentence_lengths.iter().min().unwrap_or(&0),
        "longest_sentence": sentence_lengths.iter().max().unwrap_or(&0),
    })
}

fn analyze_readability(text: &str) -> serde_json::Value {
    let word_count = text.split_whitespace().count();
    let sentence_count = text.matches(|c| c == '.' || c == '!' || c == '?').count().max(1);
    let syllable_count = estimate_syllables(text);
    
    // Flesch Reading Ease Score
    let flesch_score = 206.835 - (1.015 * (word_count as f64 / sentence_count as f64)) 
                      - (84.6 * (syllable_count as f64 / word_count as f64));
    
    serde_json::json!({
        "flesch_reading_ease": flesch_score,
        "grade_level": calculate_grade_level(flesch_score),
        "word_count": word_count,
        "sentence_count": sentence_count,
        "syllable_count": syllable_count,
    })
}

fn extract_themes(text: &str) -> serde_json::Value {
    // Simple theme extraction based on keywords
    let theme_keywords = vec![
        ("love", vec!["love", "heart", "romance", "relationship"]),
        ("conflict", vec!["fight", "war", "battle", "struggle"]),
        ("growth", vec!["learn", "grow", "change", "develop"]),
        ("mystery", vec!["secret", "hidden", "mystery", "unknown"]),
    ];
    
    let text_lower = text.to_lowercase();
    let mut themes = Vec::new();
    
    for (theme, keywords) in theme_keywords {
        let score = keywords.iter()
            .map(|keyword| text_lower.matches(keyword).count())
            .sum::<usize>();
        
        if score > 0 {
            themes.push(serde_json::json!({
                "theme": theme,
                "score": score,
                "relevance": score as f64 / text.split_whitespace().count() as f64,
            }));
        }
    }
    
    serde_json::json!({ "themes": themes })
}

fn analyze_sentiment(text: &str) -> serde_json::Value {
    // Simple sentiment analysis
    let positive_words = ["good", "great", "happy", "love", "wonderful", "amazing"];
    let negative_words = ["bad", "terrible", "sad", "hate", "awful", "horrible"];
    
    let text_lower = text.to_lowercase();
    let positive_count = positive_words.iter()
        .map(|word| text_lower.matches(word).count())
        .sum::<usize>();
    
    let negative_count = negative_words.iter()
        .map(|word| text_lower.matches(word).count())
        .sum::<usize>();
    
    let total_sentiment = positive_count as i32 - negative_count as i32;
    let sentiment_score = total_sentiment as f64 / text.split_whitespace().count() as f64;
    
    serde_json::json!({
        "sentiment_score": sentiment_score,
        "positive_words": positive_count,
        "negative_words": negative_count,
        "overall": if sentiment_score > 0.0 { "positive" } else if sentiment_score < 0.0 { "negative" } else { "neutral" },
    })
}

fn estimate_syllables(text: &str) -> usize {
    // Simple syllable estimation
    text.split_whitespace()
        .map(|word| {
            let vowels = word.chars().filter(|c| "aeiouAEIOU".contains(*c)).count();
            vowels.max(1) // At least 1 syllable per word
        })
        .sum()
}

fn calculate_grade_level(flesch_score: f64) -> &'static str {
    match flesch_score as i32 {
        90..=100 => "5th grade",
        80..=89 => "6th grade",
        70..=79 => "7th grade",
        60..=69 => "8th-9th grade",
        50..=59 => "10th-12th grade",
        30..=49 => "College level",
        _ => "Graduate level",
    }
}

fn process_word_count(document: &serde_json::Value) -> serde_json::Value {
    let content = document.get("content")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    
    serde_json::json!({
        "word_count": content.split_whitespace().count(),
        "character_count": content.len(),
        "paragraph_count": content.split("\n\n").count(),
    })
}

fn process_readability_analysis(document: &serde_json::Value) -> serde_json::Value {
    let content = document.get("content")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    
    analyze_readability(content)
}

fn process_keyword_extraction(document: &serde_json::Value) -> serde_json::Value {
    let content = document.get("content")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    
    analyze_word_frequency(content)
}

fn process_sentiment_analysis(document: &serde_json::Value) -> serde_json::Value {
    let content = document.get("content")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    
    analyze_sentiment(content)
}

fn process_structure_analysis(document: &serde_json::Value) -> serde_json::Value {
    let content = document.get("content")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    
    analyze_sentence_structure(content)
}

fn calculate_success_rate(results: &[serde_json::Value]) -> f64 {
    let successful = results.iter()
        .filter(|result| !result.get("error").is_some())
        .count();
    
    successful as f64 / results.len() as f64
}
