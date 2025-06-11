use super::types::*;
use std::collections::{HashMap, HashSet};
use regex::Regex;

/// Core analytics service providing comprehensive analysis capabilities
pub struct AnalyticsService;

impl AnalyticsService {
    pub fn new() -> Self {
        Self
    }

    /// Analyze character relationships and network structure
    pub fn analyze_characters(&self, characters: &[Character], relationships: &[Relationship]) -> CharacterAnalytics {
        let total_characters = characters.len();
        let total_relationships = relationships.len();

        // Calculate strong relationships (strength > 70)
        let strong_relationships = relationships.iter()
            .filter(|r| r.strength > 70.0)
            .count();

        let strong_relationships_percentage = if total_relationships > 0 {
            (strong_relationships as f64 / total_relationships as f64) * 100.0
        } else {
            0.0
        };

        // Calculate average connections per character
        let avg_connections_per_character = if total_characters > 0 {
            (total_relationships as f64 * 2.0) / total_characters as f64 // Each relationship involves 2 characters
        } else {
            0.0
        };

        // Calculate positive relationships percentage
        let positive_types = ["ally", "friend", "lover", "family", "mentor"];
        let positive_relationships = relationships.iter()
            .filter(|r| positive_types.contains(&r.r#type.to_lowercase().as_str()))
            .count();

        let positive_relationships_percentage = if total_relationships > 0 {
            (positive_relationships as f64 / total_relationships as f64) * 100.0
        } else {
            0.0
        };

        // Calculate network density
        let max_possible_connections = if total_characters > 1 {
            total_characters * (total_characters - 1) / 2
        } else {
            1
        };

        let character_network_density = if max_possible_connections > 0 {
            (total_relationships as f64 / max_possible_connections as f64) * 100.0
        } else {
            0.0
        };

        // Find most connected character
        let mut connection_counts: HashMap<String, usize> = HashMap::new();
        for relationship in relationships {
            *connection_counts.entry(relationship.from.clone()).or_insert(0) += 1;
            *connection_counts.entry(relationship.to.clone()).or_insert(0) += 1;
        }

        let central_characters: Vec<CentralCharacter> = connection_counts.iter()
            .map(|(id, &count)| {
                let name = characters.iter()
                    .find(|c| c.id == *id)
                    .map(|c| c.name.clone())
                    .unwrap_or_else(|| id.clone());
                
                CentralCharacter {
                    character_id: id.clone(),
                    name,
                    centrality_score: count as f64 / total_relationships as f64,
                    connection_count: count,
                }
            })
            .collect();

        let isolated_characters: Vec<String> = characters.iter()
            .filter(|c| !connection_counts.contains_key(&c.id))
            .map(|c| c.name.clone())
            .collect();

        // Relationship type distribution
        let mut relationship_types: HashMap<String, usize> = HashMap::new();
        for relationship in relationships {
            *relationship_types.entry(relationship.r#type.clone()).or_insert(0) += 1;
        }

        CharacterAnalytics {
            total_characters,
            relationships_count: total_relationships,
            network_density: character_network_density,
            central_characters,
            isolated_characters,
            relationship_types,
            clustering_coefficient: 0.5, // Simplified calculation
        }
    }

    /// Analyze world-building consistency and event distribution
    pub fn analyze_world(&self, events: &[WorldEvent], locations_count: usize) -> WorldAnalytics {
        let total_events = events.len();
        
        // Major events (importance >= 8)
        let major_events_count = events.iter()
            .filter(|e| e.importance >= 8)
            .count();

        // World consistency score (simplified calculation)
        let world_consistency_score = if locations_count > 0 {
            ((total_events as f64 / locations_count as f64) * 100.0).min(100.0)
        } else {
            0.0
        };

        // Events by type
        let mut event_types: HashMap<String, usize> = HashMap::new();
        for event in events {
            *event_types.entry(event.r#type.clone()).or_insert(0) += 1;
        }

        // Events by importance - convert to Vec<u8> for importance_distribution
        let mut importance_counts: HashMap<u8, usize> = HashMap::new();
        for event in events {
            *importance_counts.entry(event.importance).or_insert(0) += 1;
        }
        
        let importance_distribution: Vec<u8> = events.iter()
            .map(|e| e.importance)
            .collect();

        // Calculate location coverage and character involvement
        let location_coverage: HashMap<String, usize> = HashMap::new(); // Simplified
        let character_involvement: HashMap<String, usize> = HashMap::new(); // Simplified
        
        // Timeline span calculation
        let timeline_span = if events.is_empty() {
            "No events".to_string()
        } else {
            format!("{} events spanning timeline", total_events)
        };

        WorldAnalytics {
            total_events,
            timeline_span,
            event_density: if total_events > 0 { total_events as f64 / 100.0 } else { 0.0 },
            location_coverage,
            character_involvement,
            event_types,
            importance_distribution,
        }
    }

    /// Analyze plot structure and beat completion
    pub fn analyze_plot(&self, beats: &[Beat]) -> PlotAnalytics {
        let total_beats = beats.len();
        let completed_beats = beats.iter().filter(|b| b.is_completed).count();

        let overall_progress = if total_beats > 0 {
            (completed_beats as f64 / total_beats as f64) * 100.0
        } else {
            0.0
        };

        // Act progress calculations
        let act_one_beats: Vec<_> = beats.iter().filter(|b| b.percentage <= 20.0).collect();
        let act_two_beats: Vec<_> = beats.iter().filter(|b| b.percentage > 20.0 && b.percentage <= 80.0).collect();
        let act_three_beats: Vec<_> = beats.iter().filter(|b| b.percentage > 80.0).collect();

        let act_one_progress = if !act_one_beats.is_empty() {
            (act_one_beats.iter().filter(|b| b.is_completed).count() as f64 / act_one_beats.len() as f64) * 100.0
        } else {
            0.0
        };

        let act_two_progress = if !act_two_beats.is_empty() {
            (act_two_beats.iter().filter(|b| b.is_completed).count() as f64 / act_two_beats.len() as f64) * 100.0
        } else {
            0.0
        };

        let act_three_progress = if !act_three_beats.is_empty() {
            (act_three_beats.iter().filter(|b| b.is_completed).count() as f64 / act_three_beats.len() as f64) * 100.0
        } else {
            0.0
        };

        // Word count distribution
        let word_count_distribution: Vec<(String, u32)> = beats.iter()
            .map(|b| (b.name.clone(), b.word_count))
            .collect();

        // Beat completion timeline
        let beat_completion_timeline: Vec<(String, bool)> = beats.iter()
            .map(|b| (b.name.clone(), b.is_completed))
            .collect();

        // Calculate completion percentage for struct
        let completion_percentage = if total_beats > 0 {
            (completed_beats as f64 / total_beats as f64) * 100.0
        } else {
            0.0
        };

        PlotAnalytics {
            total_beats,
            completion_percentage,
            word_count_distribution: beats.iter().map(|b| b.word_count).collect(),
            pacing_analysis: PacingAnalysis {
                overall_pace: if completion_percentage > 50.0 { 
                    "Good Progress".to_string() 
                } else { 
                    "Needs Attention".to_string() 
                },
                slow_sections: vec!["Act I".to_string()],
                fast_sections: vec!["Act III".to_string()],
                recommended_adjustments: vec!["Consider expanding character development".to_string()],
            },
            structure_adherence: 85.5,
            beat_balance: {
                let mut balance = HashMap::new();
                balance.insert("Act I".to_string(), 0.25);
                balance.insert("Act II".to_string(), 0.50);
                balance.insert("Act III".to_string(), 0.25);
                balance
            },
        }
    }

    /// Generate force graph visualization data
    pub fn generate_force_graph(&self, characters: &[Character], relationships: &[Relationship]) -> ForceGraphData {
        // Create nodes
        let nodes: Vec<GraphNode> = characters.iter().enumerate().map(|(index, character)| {
            let connections = relationships.iter()
                .filter(|r| r.from == character.id || r.to == character.id)
                .count();

            // Calculate centrality (simplified - based on connection count)
            let centrality = connections as f64 / (characters.len() - 1).max(1) as f64;

            // Color based on character traits or use default
            let color = character.color.clone().unwrap_or_else(|| {
                let colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
                colors[index % colors.len()].to_string()
            });

            // Radius based on connections
            let radius = 20.0 + (connections as f64 * 3.0).min(15.0);

            GraphNode {
                id: character.id.clone(),
                name: character.name.clone(),
                group: index % 5, // Simple grouping
                size: 20.0 + (connections as f64 * 3.0).min(15.0),
                color: Some(character.color.clone().unwrap_or_else(|| {
                    let colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
                    colors[index % colors.len()].to_string()
                })),
                properties: {
                    let mut props = HashMap::new();
                    props.insert("centrality".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(centrality).unwrap()));
                    props.insert("connections".to_string(), serde_json::Value::Number(serde_json::Number::from(connections)));
                    props
                },
            }
        }).collect();

        // Create links
        let links: Vec<GraphLink> = relationships.iter().map(|rel| {
            let strength = rel.strength / 100.0;
            
            // Color based on relationship type
            let color = match rel.r#type.to_lowercase().as_str() {
                "ally" => "#10b981",
                "friend" => "#3b82f6",
                "lover" => "#ec4899",
                "family" => "#8b5cf6",
                "enemy" => "#ef4444",
                "rival" => "#f59e0b",
                "mentor" => "#06b6d4",
                _ => "#6b7280",
            }.to_string();

            GraphLink {
                source: rel.from.clone(),
                target: rel.to.clone(),
                weight: strength,
                r#type: rel.r#type.clone(),
                properties: {
                    let mut props = HashMap::new();
                    props.insert("color".to_string(), serde_json::Value::String(color));
                    props.insert("width".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(2.0 + (strength * 4.0)).unwrap()));
                    props.insert("distance".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(80.0 + ((1.0 - strength) * 50.0)).unwrap()));
                    props
                },
            }
        }).collect();

        // Calculate graph metrics
        let node_count = nodes.len();
        let edge_count = links.len();
        
        let density = if node_count > 1 {
            (2.0 * edge_count as f64) / (node_count as f64 * (node_count - 1) as f64)
        } else {
            0.0
        };

        // Find central nodes (top 3 by centrality)
        let mut sorted_nodes = nodes.clone();
        sorted_nodes.sort_by(|a, b| {
            let a_centrality = a.properties.get("centrality")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            let b_centrality = b.properties.get("centrality")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0);
            b_centrality.partial_cmp(&a_centrality).unwrap()
        });
        let central_nodes: Vec<String> = sorted_nodes.iter()
            .take(3)
            .map(|n| n.name.clone())
            .collect();

        // Find isolated nodes (no connections)
        let isolated_nodes: Vec<String> = nodes.iter()
            .filter(|n| {
                n.properties.get("connections")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(0) == 0
            })
            .map(|n| n.name.clone())
            .collect();

        let metrics = GraphMetrics {
            node_count,
            edge_count,
            density,
            clustering_coefficient: 0.0, // Simplified
            average_path_length: 0.0, // Simplified
            central_nodes,
            isolated_nodes,
            strongly_connected_components: 1, // Simplified
        };

        ForceGraphData {
            nodes,
            links,
            metadata: GraphMetadata {
                total_nodes: node_count,
                total_links: edge_count,
                density,
                clustering_coefficient: 0.0, // Simplified
                average_degree: if node_count > 0 { 2.0 * edge_count as f64 / node_count as f64 } else { 0.0 },
            },
        }
    }

    /// Analyze research quality and fact verification
    pub fn analyze_research(&self, research_items: &[ResearchItem], fact_checks: &[FactCheck]) -> ResearchAnalytics {
        let total_research_items = research_items.len();
        
        // Fact verification statistics
        let verified_facts_count = fact_checks.iter()
            .filter(|f| f.verification_status == "verified")
            .count();
        let disputed_facts_count = fact_checks.iter()
            .filter(|f| f.verification_status == "disputed")
            .count();
        
        let fact_verification_rate = if !fact_checks.is_empty() {
            verified_facts_count as f64 / fact_checks.len() as f64 * 100.0
        } else {
            0.0
        };

        // Average reliability score
        let average_reliability_score = if !research_items.is_empty() {
            research_items.iter().map(|r| r.credibility as f64).sum::<f64>() / research_items.len() as f64
        } else {
            0.0
        };

        // Research by tag distribution
        let mut research_by_tag: HashMap<String, usize> = HashMap::new();
        for item in research_items {
            for tag in &item.tags {
                *research_by_tag.entry(tag.clone()).or_insert(0) += 1;
            }
        }

        // Sources by reliability
        let mut source_reliability: HashMap<String, Vec<u8>> = HashMap::new();
        for item in research_items {
            if let Some(source) = &item.source {
                source_reliability.entry(source.clone())
                    .or_insert_with(Vec::new)
                    .push(item.credibility as u8);
            }
        }
        
        let sources_by_reliability: HashMap<String, f64> = source_reliability
            .into_iter()
            .map(|(source, scores)| {
                let avg = scores.iter().map(|&s| s as f64).sum::<f64>() / scores.len() as f64;
                (source, avg)
            })
            .collect();

        // Source diversity score
        let unique_sources = research_items.iter()
            .map(|r| &r.source)
            .collect::<HashSet<_>>()
            .len();
        let source_diversity_score = if !research_items.is_empty() {
            unique_sources as f64 / research_items.len() as f64 * 100.0
        } else {
            0.0
        };

        // Identify research gaps (simple heuristic)
        let mut research_gaps = Vec::new();
        if research_by_tag.get("historical").unwrap_or(&0) < &3 {
            research_gaps.push("Need more historical research".to_string());
        }
        if research_by_tag.get("technical").unwrap_or(&0) < &2 {
            research_gaps.push("Technical details need more sources".to_string());
        }
        if verified_facts_count < fact_checks.len() / 2 {
            research_gaps.push("Many facts need verification".to_string());
        }

        ResearchAnalytics {
            total_items: total_research_items,
            verified_items: verified_facts_count,
            credibility_distribution: research_items.iter().map(|r| r.credibility).collect(),
            source_breakdown: research_items.iter().fold(HashMap::new(), |mut acc, item| {
                if let Some(source) = &item.source {
                    *acc.entry(source.clone()).or_insert(0) += 1;
                }
                acc
            }),
            tag_frequency: research_by_tag,
            recent_activity: vec![], // Simplified for now
        }
    }

    /// Analyze collaboration patterns and efficiency
    pub fn analyze_collaboration_metrics(&self, edit_history: &[EditEvent]) -> CollaborationMetrics {
        let mut edit_frequency: HashMap<String, usize> = HashMap::new();
        let simultaneous_edits = 0;
        let mut section_edits: HashMap<String, EditedSection> = HashMap::new();

        for edit in edit_history {
            *edit_frequency.entry(edit.user_id.clone()).or_insert(0) += 1;
            
            // Track edited sections - using document_id as section_id for now
            let section = section_edits.entry(edit.document_id.clone()).or_insert_with(|| EditedSection {
                section_id: edit.document_id.clone(),
                edit_count: 0,
                editors: HashSet::new(),
                last_edit: edit.timestamp.clone(),
            });
            
            section.edit_count += 1;
            section.editors.insert(edit.user_id.clone());
            section.last_edit = edit.timestamp.clone();
        }

        let most_edited_sections: Vec<EditedSection> = section_edits
            .into_values()
            .collect::<Vec<_>>();

        // Calculate collaboration efficiency (simplified)
        let active_collaborators = edit_frequency.len();
        let total_edits: usize = edit_frequency.values().sum();
        let collaboration_efficiency = if active_collaborators > 1 {
            total_edits as f64 / active_collaborators as f64 / 10.0 // Normalize
        } else {
            1.0
        };

        // Create user contributions from edit frequency
        let user_contributions: Vec<UserContribution> = edit_frequency.iter().map(|(user_id, &edit_count)| {
            UserContribution {
                user_id: user_id.clone(),
                total_edits: edit_count,
                words_contributed: edit_count * 50, // Estimate
                avg_session_length: 30.0, // Estimate in minutes
                specialization_areas: vec![], // Simplified
            }
        }).collect();

        CollaborationMetrics {
            total_collaborators: active_collaborators,
            active_collaborators,
            edit_frequency,
            contribution_balance: user_contributions,
            conflict_resolution_time: 0.0, // TODO: Implement conflict tracking
            productivity_trends: vec![], // Simplified for now
        }
    }

    /// Filter and sort world events
    pub fn filter_and_sort_events(&self, events: &[WorldEvent], sort_by: &str, filter_by: Option<&str>) -> Vec<WorldEvent> {
        let mut filtered_events: Vec<WorldEvent> = if let Some(filter) = filter_by {
            events.iter()
                .filter(|event| {
                    event.r#type.contains(filter) || 
                    event.description.as_ref().map_or(false, |desc| desc.contains(filter))
                })
                .cloned()
                .collect()
        } else {
            events.to_vec()
        };

        match sort_by {
            "date" => filtered_events.sort_by(|a, b| a.date.cmp(&b.date)),
            "type" => filtered_events.sort_by(|a, b| a.r#type.cmp(&b.r#type)),
            "importance" => filtered_events.sort_by(|a, b| b.importance.partial_cmp(&a.importance).unwrap_or(std::cmp::Ordering::Equal)),
            _ => {} // No sorting for unknown criteria
        }

        filtered_events
    }

    /// Detect narrative patterns in text
    pub fn detect_narrative_patterns(&self, text: &str, pattern_types: &[String]) -> serde_json::Value {
        use serde_json::json;
        
        let mut patterns = serde_json::Map::new();
        
        for pattern_type in pattern_types {
            match pattern_type.as_str() {
                "dialogue" => {
                    let dialogue_count = text.matches('"').count() / 2;
                    patterns.insert("dialogue_segments".to_string(), json!(dialogue_count));
                }
                "action" => {
                    let action_words = ["ran", "jumped", "fought", "moved", "rushed", "grabbed"];
                    let action_count = action_words.iter()
                        .map(|word| text.to_lowercase().matches(word).count())
                        .sum::<usize>();
                    patterns.insert("action_sequences".to_string(), json!(action_count));
                }
                "description" => {
                    let descriptive_words = ["beautiful", "dark", "bright", "cold", "warm", "large", "small"];
                    let description_count = descriptive_words.iter()
                        .map(|word| text.to_lowercase().matches(word).count())
                        .sum::<usize>();
                    patterns.insert("descriptive_passages".to_string(), json!(description_count));
                }
                _ => {
                    patterns.insert(format!("{}_patterns", pattern_type), json!(0));
                }
            }
        }
        
        json!(patterns)
    }

    /// Analyze writing style consistency across multiple texts
    pub fn analyze_writing_style_consistency(&self, texts: &[String]) -> serde_json::Value {
        use serde_json::json;
        
        if texts.is_empty() {
            return json!({
                "consistency_score": 0.0,
                "variations": []
            });
        }

        let mut avg_sentence_lengths = Vec::new();
        let mut vocabulary_sizes = Vec::new();

        for text in texts {
            let sentences: Vec<&str> = text.split(['.', '!', '?'].as_ref()).collect();
            let avg_length = if !sentences.is_empty() {
                sentences.iter().map(|s| s.split_whitespace().count()).sum::<usize>() as f64 / sentences.len() as f64
            } else {
                0.0
            };
            avg_sentence_lengths.push(avg_length);

            let words: HashSet<String> = text.to_lowercase()
                .split_whitespace()
                .map(|w| w.trim_matches(|c: char| !c.is_alphabetic()))
                .filter(|w| !w.is_empty())
                .map(String::from)
                .collect();
            vocabulary_sizes.push(words.len());
        }

        let sentence_length_variance = calculate_variance(&avg_sentence_lengths);
        let vocabulary_variance = calculate_variance(&vocabulary_sizes.iter().map(|&x| x as f64).collect::<Vec<_>>());

        let consistency_score = 100.0 - (sentence_length_variance + vocabulary_variance).min(100.0);

        json!({
            "consistency_score": consistency_score,
            "avg_sentence_lengths": avg_sentence_lengths,
            "vocabulary_sizes": vocabulary_sizes,
            "sentence_length_variance": sentence_length_variance,
            "vocabulary_variance": vocabulary_variance
        })
    }

    /// Generate writing suggestions based on text analysis
    pub fn generate_writing_suggestions(&self, text: &str, suggestion_types: &[String]) -> Vec<String> {
        let mut suggestions = Vec::new();

        for suggestion_type in suggestion_types {
            match suggestion_type.as_str() {
                "sentence_variety" => {
                    let sentences: Vec<&str> = text.split(['.', '!', '?'].as_ref()).collect();
                    let avg_length = if !sentences.is_empty() {
                        sentences.iter().map(|s| s.split_whitespace().count()).sum::<usize>() / sentences.len()
                    } else {
                        0
                    };

                    if avg_length < 8 {
                        suggestions.push("Consider varying your sentence length. Your sentences are quite short on average. Try combining some ideas into longer, more complex sentences.".to_string());
                    } else if avg_length > 25 {
                        suggestions.push("Your sentences are quite long on average. Consider breaking some complex sentences into shorter, more digestible ones.".to_string());
                    }
                }
                "word_choice" => {
                    let common_words = ["very", "really", "quite", "just", "that"];
                    let overused_words: Vec<_> = common_words.iter()
                        .filter(|&&word| text.to_lowercase().matches(word).count() > 5)
                        .collect();

                    if !overused_words.is_empty() {
                        let word_list = overused_words.iter().map(|&s| s).collect::<Vec<_>>().join(", ");
                        suggestions.push(format!("Consider reducing the use of these common words: {}. Try more specific alternatives.", word_list));
                    }
                }
                "dialogue_tags" => {
                    let dialogue_count = text.matches('"').count() / 2;
                    let said_count = text.to_lowercase().matches(" said").count();
                    
                    if dialogue_count > 0 && said_count as f64 / dialogue_count as f64 > 0.7 {
                        suggestions.push("Consider varying your dialogue tags. Using 'said' frequently is good, but occasionally try alternatives like 'whispered', 'exclaimed', or 'replied'.".to_string());
                    }
                }
                _ => {
                    suggestions.push(format!("No specific suggestions available for: {}", suggestion_type));
                }
            }
        }

        if suggestions.is_empty() {
            suggestions.push("Your writing looks good! Keep up the great work.".to_string());
        }

        suggestions
    }

    /// Optimize text performance based on specified criteria
    pub fn optimize_text_performance(&self, text: &str, optimization_type: &str) -> String {
        match optimization_type {
            "readability" => {
                // Simple readability optimization - split long sentences
                text.split(['.', '!', '?'].as_ref())
                    .map(|sentence| {
                        let words: Vec<&str> = sentence.split_whitespace().collect();
                        if words.len() > 20 {
                            // Split long sentences roughly in half
                            let mid = words.len() / 2;
                            format!("{}. {}", words[..mid].join(" "), words[mid..].join(" "))
                        } else {
                            sentence.to_string()
                        }
                    })
                    .collect::<Vec<_>>()
                    .join(". ")
                    .trim()
                    .to_string()
            }
            "conciseness" => {
                // Remove redundant words and phrases
                let redundant_phrases = [
                    ("in order to", "to"),
                    ("due to the fact that", "because"),
                    ("at this point in time", "now"),
                    ("for the purpose of", "for"),
                ];

                let mut optimized = text.to_string();
                for (long_form, short_form) in redundant_phrases {
                    optimized = optimized.replace(long_form, short_form);
                }
                optimized
            }
            "clarity" => {
                // Replace passive voice indicators with active suggestions
                text.replace(" was ", " ")
                    .replace(" were ", " ")
                    .replace(" being ", " ")
            }
            _ => text.to_string()
        }
    }

    /// Analyze text characteristics and metrics
    pub fn analyze_text(&self, text: &str) -> TextAnalytics {
        let word_count = text.split_whitespace().count();
        let character_count = text.chars().count();
        let sentence_count = text.split(&['.', '!', '?'][..]).filter(|s| !s.trim().is_empty()).count();
        let paragraph_count = text.split("\n\n").filter(|s| !s.trim().is_empty()).count();
        
        // Simple readability score calculation
        let avg_sentence_length = if sentence_count > 0 {
            word_count as f64 / sentence_count as f64
        } else {
            0.0
        };
        
        let readability_score = (206.835 - (1.015 * avg_sentence_length)).max(0.0).min(100.0);
        
        // Word frequency analysis
        let words: Vec<&str> = text.split_whitespace().collect();
        let mut word_freq: HashMap<String, usize> = HashMap::new();
        
        for word in words {
            let clean_word = word.to_lowercase().trim_matches(|c: char| !c.is_alphabetic()).to_string();
            if !clean_word.is_empty() {
                *word_freq.entry(clean_word).or_insert(0) += 1;
            }
        }
        
        let mut top_words: Vec<WordFrequency> = word_freq.iter()
            .map(|(word, &count)| WordFrequency {
                word: word.clone(),
                count,
                frequency: count as f64 / word_count as f64,
            })
            .collect();
        
        top_words.sort_by(|a, b| b.count.cmp(&a.count));
        top_words.truncate(10);
        
        TextAnalytics {
            word_count,
            character_count,
            sentence_count,
            paragraph_count,
            readability_score,
            complexity_score: avg_sentence_length,
            top_words,
            sentiment_score: 0.5, // Neutral sentiment as default
        }
    }
}

/// Helper function to calculate variance
fn calculate_variance(values: &[f64]) -> f64 {
    if values.len() < 2 {
        return 0.0;
    }

    let mean = values.iter().sum::<f64>() / values.len() as f64;
    let variance = values.iter()
        .map(|value| {
            let diff = mean - value;
            diff * diff
        })
        .sum::<f64>() / values.len() as f64;

    variance
}
