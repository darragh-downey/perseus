//! Analytics module for comprehensive text, character, plot, and research analysis.
//! 
//! This module provides powerful analytics capabilities for fiction and non-fiction writing,
//! including sentiment analysis, narrative structure detection, character relationship analysis,
//! and research validation tools.

pub mod types;
pub mod service;

// Re-export main types and service for convenient access
pub use types::*;
pub use service::AnalyticsService;

/// Default analytics service instance
pub fn new_analytics_service() -> AnalyticsService {
    AnalyticsService::new()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::analytics::types::*;

    #[test]
    fn test_analytics_service_creation() {
        let service = new_analytics_service();
        assert_eq!(std::mem::size_of_val(&service), 0); // Zero-sized struct
    }

    #[test]
    fn test_character_analytics() {
        let service = new_analytics_service();
        let characters = vec![
            Character {
                id: "char1".to_string(),
                name: "Alice".to_string(),
                description: "A brave hero".to_string(),
                traits: vec!["brave".to_string(), "kind".to_string()],
                color: Some("#3b82f6".to_string()),
            },
            Character {
                id: "char2".to_string(),
                name: "Bob".to_string(),
                description: "A wise mentor".to_string(),
                traits: vec!["wise".to_string(), "patient".to_string()],
                color: Some("#10b981".to_string()),
            },
        ];
        
        let relationships = vec![
            Relationship {
                from: "char1".to_string(),
                to: "char2".to_string(),
                r#type: "mentor".to_string(),
                strength: 85.0,
            },
        ];

        let analytics = service.analyze_characters(&characters, &relationships);
        
        assert_eq!(analytics.total_characters, 2);
        assert_eq!(analytics.total_relationships, 1);
        assert!(analytics.strong_relationships_percentage > 0.0);
    }

    #[test]
    fn test_text_analytics() {
        let service = new_analytics_service();
        let sample_text = "This is a sample text for testing. It has multiple sentences! And various punctuation?";
        
        let analytics = service.analyze_text(sample_text);
        
        assert!(analytics.word_count > 0);
        assert!(analytics.sentence_count >= 3);
        assert!(analytics.reading_time_minutes > 0.0);
    }

    #[test]
    fn test_force_graph_generation() {
        let service = new_analytics_service();
        let characters = vec![
            Character {
                id: "char1".to_string(),
                name: "Alice".to_string(),
                description: "A brave hero".to_string(),
                traits: vec!["brave".to_string()],
                color: Some("#3b82f6".to_string()),
            },
        ];
        
        let relationships = vec![];
        
        let graph_data = service.generate_force_graph(&characters, &relationships);
        
        assert_eq!(graph_data.nodes.len(), 1);
        assert_eq!(graph_data.links.len(), 0);
        assert_eq!(graph_data.metrics.node_count, 1);
    }
}
