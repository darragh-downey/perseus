//! Core types for the AI service module.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub traits: HashMap<String, serde_json::Value>,
    pub description: Option<String>,
    pub want: Option<String>,
    pub need: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Beat {
    pub id: String,
    pub name: String,
    pub percentage: u8,
    pub description: String,
    pub content: String,
    pub word_count: Option<u32>,
    pub scene_ids: Vec<String>,
    pub is_completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    pub id: String,
    pub name: String,
    pub description: String,
    pub scene_ids: Vec<String>,
    pub intensity: HashMap<String, u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conflict {
    pub id: String,
    pub conflict_type: String, // "internal" or "external"
    pub description: String,
    pub intensity: u8,
    pub scene_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AISettings {
    pub provider: AIProvider,
    pub api_key: Option<String>,
    pub model: Option<String>,
    pub temperature: f32,
    pub max_tokens: u32,
    pub timeout_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AIProvider {
    OpenAI,
    Anthropic,
    Local,
    Custom { endpoint: String },
}

impl Default for AISettings {
    fn default() -> Self {
        Self {
            provider: AIProvider::OpenAI,
            api_key: None,
            model: Some("gpt-4".to_string()),
            temperature: 0.7,
            max_tokens: 2000,
            timeout_seconds: 30,
        }
    }
}

/// Beat content suggestion from AI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BeatSuggestion {
    pub content: String,
    pub scene_ideas: Vec<String>,
    pub conflicts: Vec<String>,
    pub character_moments: HashMap<String, String>,
    pub themes: Vec<String>,
}

/// Character arc analysis and suggestions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterArcSuggestion {
    pub character_name: String,
    pub beat_suggestions: Vec<BeatArcPoint>,
    pub overall_arc: CharacterArcOverall,
}

/// Character development at specific beat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BeatArcPoint {
    pub beat_id: String,
    pub beat_name: String,
    pub emotional_state: HashMap<String, u8>,
    pub key_moment: String,
    pub growth_opportunity: String,
    pub thematic_connection: String,
}

/// Overall character arc structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterArcOverall {
    pub want: String,
    pub need: String,
    pub lie_they_believe: String,
    pub truth_they_need: String,
    pub ghost: String,
    pub arc_type: CharacterArcType,
}

/// Types of character arcs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CharacterArcType {
    Positive,
    Negative,
    Flat,
    Corruption,
}

/// Theme coherence analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeAnalysis {
    pub theme_consistency: HashMap<String, f32>,
    pub weak_points: Vec<ThemeWeakPoint>,
    pub suggestions: Vec<String>,
    pub overall_score: f32,
}

/// Weak point in theme development
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeWeakPoint {
    pub theme_id: String,
    pub beat_id: String,
    pub issue: String,
    pub suggestion: String,
}

/// Character creation suggestions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterSuggestion {
    pub name: String,
    pub archetype: String,
    pub role: String,
    pub traits: Vec<String>,
    pub backstory_elements: Vec<String>,
    pub relationships: Vec<String>,
    pub potential_conflicts: Vec<String>,
}

/// Plot development suggestions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlotSuggestion {
    pub beat_name: String,
    pub description: String,
    pub plot_points: Vec<String>,
    pub character_actions: HashMap<String, String>,
    pub themes_explored: Vec<String>,
    pub conflicts_introduced: Vec<String>,
    pub pacing_notes: String,
}

/// Writing style analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleAnalysis {
    pub tone: String,
    pub pace: String,
    pub voice_strength: f32,
    pub readability_score: f32,
    pub suggestions: Vec<StyleSuggestion>,
    pub comparative_analysis: Option<ComparativeStyleAnalysis>,
}

/// Individual style suggestion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleSuggestion {
    pub category: String,
    pub issue: String,
    pub suggestion: String,
    pub example: Option<String>,
}

/// Comparative analysis against target style
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComparativeStyleAnalysis {
    pub target_style: String,
    pub similarity_score: f32,
    pub differences: Vec<String>,
    pub improvements: Vec<String>,
}
