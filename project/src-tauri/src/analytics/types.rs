//! Core types for the analytics module.

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use chrono::{DateTime, Utc};

/// Character representation for analytics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub description: String,
    pub traits: Vec<String>,
    pub color: Option<String>,
}

/// Character relationship
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
    pub from: String,
    pub to: String,
    pub r#type: String,
    pub strength: f64,
}

/// World-building event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldEvent {
    pub id: String,
    pub name: String,
    pub date: String,
    pub r#type: String,
    pub importance: u8,
    pub location_ids: Vec<String>,
    pub character_ids: Vec<String>,
    pub description: Option<String>,
}

/// Story beat for analytics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Beat {
    pub id: String,
    pub name: String,
    pub percentage: f64,
    pub description: String,
    pub content: String,
    pub word_count: u32,
    pub scene_ids: Vec<String>,
    pub is_completed: bool,
}

/// Document structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub title: String,
    pub content: String,
    pub word_count: u32,
    pub character_count: u32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Research item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchItem {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub source: Option<String>,
    pub credibility: f32,
    pub created_at: DateTime<Utc>,
}

/// Fact-checking result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FactCheck {
    pub id: String,
    pub claim: String,
    pub verification_status: VerificationStatus,
    pub confidence: f32,
    pub sources: Vec<String>,
    pub notes: Option<String>,
}

/// Verification status for fact checks
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum VerificationStatus {
    Verified,
    Disputed,
    Unverified,
    False,
}

impl PartialEq<&str> for VerificationStatus {
    fn eq(&self, other: &&str) -> bool {
        match (self, *other) {
            (VerificationStatus::Verified, "verified") => true,
            (VerificationStatus::Disputed, "disputed") => true,
            (VerificationStatus::Unverified, "unverified") => true,
            (VerificationStatus::False, "false") => true,
            _ => false,
        }
    }
}

/// Edit event for collaboration tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditEvent {
    pub id: String,
    pub user_id: String,
    pub document_id: String,
    pub action: EditAction,
    pub timestamp: DateTime<Utc>,
    pub changes: String,
}

/// Types of edit actions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EditAction {
    Create,
    Update,
    Delete,
    Comment,
}

/// Edited section tracking for collaboration metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditedSection {
    pub section_id: String,
    pub edit_count: usize,
    pub editors: HashSet<String>,
    pub last_edit: DateTime<Utc>,
}

/// Character analytics results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterAnalytics {
    pub total_characters: usize,
    pub relationships_count: usize,
    pub network_density: f64,
    pub central_characters: Vec<CentralCharacter>,
    pub isolated_characters: Vec<String>,
    pub relationship_types: HashMap<String, usize>,
    pub clustering_coefficient: f64,
}

/// Central character in network analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CentralCharacter {
    pub character_id: String,
    pub name: String,
    pub centrality_score: f64,
    pub connection_count: usize,
}

/// World analytics results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldAnalytics {
    pub total_events: usize,
    pub timeline_span: String,
    pub event_density: f64,
    pub location_coverage: HashMap<String, usize>,
    pub character_involvement: HashMap<String, usize>,
    pub event_types: HashMap<String, usize>,
    pub importance_distribution: Vec<u8>,
}

/// Plot analytics results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlotAnalytics {
    pub total_beats: usize,
    pub completion_percentage: f64,
    pub word_count_distribution: Vec<u32>,
    pub pacing_analysis: PacingAnalysis,
    pub structure_adherence: f64,
    pub beat_balance: HashMap<String, f64>,
}

/// Pacing analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PacingAnalysis {
    pub overall_pace: String,
    pub slow_sections: Vec<String>,
    pub fast_sections: Vec<String>,
    pub recommended_adjustments: Vec<String>,
}

/// Text analytics results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextAnalytics {
    pub word_count: usize,
    pub character_count: usize,
    pub sentence_count: usize,
    pub paragraph_count: usize,
    pub readability_score: f64,
    pub complexity_score: f64,
    pub top_words: Vec<WordFrequency>,
    pub sentiment_score: f64,
}

/// Word frequency data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordFrequency {
    pub word: String,
    pub count: usize,
    pub frequency: f64,
}

/// Force graph data for visualizations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForceGraphData {
    pub nodes: Vec<GraphNode>,
    pub links: Vec<GraphLink>,
    pub metadata: GraphMetadata,
}

/// Graph node representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphNode {
    pub id: String,
    pub name: String,
    pub group: usize,
    pub size: f64,
    pub color: Option<String>,
    pub properties: HashMap<String, serde_json::Value>,
}

/// Graph link representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphLink {
    pub source: String,
    pub target: String,
    pub weight: f64,
    pub r#type: String,
    pub properties: HashMap<String, serde_json::Value>,
}

/// Graph metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphMetadata {
    pub total_nodes: usize,
    pub total_links: usize,
    pub density: f64,
    pub clustering_coefficient: f64,
    pub average_degree: f64,
}

/// Graph metrics for network analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphMetrics {
    pub node_count: usize,
    pub edge_count: usize,
    pub density: f64,
    pub clustering_coefficient: f64,
    pub average_path_length: f64,
    pub central_nodes: Vec<String>,
    pub isolated_nodes: Vec<String>,
    pub strongly_connected_components: usize,
}

/// Research analytics results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchAnalytics {
    pub total_items: usize,
    pub verified_items: usize,
    pub credibility_distribution: Vec<f32>,
    pub source_breakdown: HashMap<String, usize>,
    pub tag_frequency: HashMap<String, usize>,
    pub recent_activity: Vec<ResearchActivity>,
}

/// Research activity tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResearchActivity {
    pub date: DateTime<Utc>,
    pub items_added: usize,
    pub items_verified: usize,
    pub average_credibility: f32,
}

/// Advanced text analytics with deeper insights
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdvancedTextAnalytics {
    pub basic_stats: TextAnalytics,
    pub linguistic_features: LinguisticFeatures,
    pub thematic_analysis: ThematicAnalysis,
    pub style_metrics: StyleMetrics,
    pub comparative_analysis: Option<ComparativeAnalysis>,
}

/// Linguistic features analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinguisticFeatures {
    pub average_sentence_length: f64,
    pub lexical_diversity: f64,
    pub pos_distribution: HashMap<String, f64>,
    pub named_entities: Vec<NamedEntity>,
    pub dialogue_ratio: f64,
}

/// Named entity recognition result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NamedEntity {
    pub text: String,
    pub entity_type: String,
    pub confidence: f64,
    pub start_pos: usize,
    pub end_pos: usize,
}

/// Thematic analysis results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThematicAnalysis {
    pub themes: Vec<Theme>,
    pub theme_coherence: f64,
    pub theme_distribution: HashMap<String, f64>,
    pub emotional_arc: Vec<EmotionalPoint>,
}

/// Theme identification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Theme {
    pub name: String,
    pub strength: f64,
    pub keywords: Vec<String>,
    pub prevalence: f64,
}

/// Emotional arc point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalPoint {
    pub position: f64,
    pub valence: f64,
    pub arousal: f64,
    pub dominant_emotion: String,
}

/// Style metrics analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleMetrics {
    pub formality_score: f64,
    pub tone: String,
    pub voice_consistency: f64,
    pub pacing_indicators: Vec<PacingIndicator>,
    pub style_fingerprint: StyleFingerprint,
}

/// Pacing indicator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PacingIndicator {
    pub section: String,
    pub pace_score: f64,
    pub indicators: Vec<String>,
}

/// Style fingerprint for comparison
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleFingerprint {
    pub features: HashMap<String, f64>,
    pub signature_elements: Vec<String>,
}

/// Comparative analysis against reference texts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComparativeAnalysis {
    pub reference_name: String,
    pub similarity_score: f64,
    pub differences: Vec<StyleDifference>,
    pub recommendations: Vec<String>,
}

/// Style difference identification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleDifference {
    pub aspect: String,
    pub current_value: f64,
    pub reference_value: f64,
    pub significance: f64,
}

/// Collaboration metrics for team projects
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollaborationMetrics {
    pub total_collaborators: usize,
    pub active_collaborators: usize,
    pub edit_frequency: HashMap<String, usize>,
    pub contribution_balance: Vec<UserContribution>,
    pub conflict_resolution_time: f64,
    pub productivity_trends: Vec<ProductivityPoint>,
}

/// User contribution tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserContribution {
    pub user_id: String,
    pub total_edits: usize,
    pub words_contributed: usize,
    pub avg_session_length: f64,
    pub specialization_areas: Vec<String>,
}

/// Productivity tracking point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductivityPoint {
    pub date: DateTime<Utc>,
    pub total_edits: usize,
    pub words_written: usize,
    pub active_users: usize,
    pub completion_rate: f64,
}
