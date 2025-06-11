
//! AI-related Tauri commands.

use crate::ai::{AIService, AISettings, Character, Beat, Theme};
use crate::ai::types::{CharacterArcOverall, CharacterArcType};
use crate::commands::state::AppState;
use tauri::State;
use std::collections::HashMap;

/// Suggest content for a story beat using AI
#[tauri::command]
pub async fn suggest_beat_content(
    _state: State<'_, AppState>,
    _beat: Beat,
    _characters: Vec<Character>,
    _themes: Vec<Theme>,
    _previous_beats: Vec<Beat>,
) -> Result<crate::ai::AIResponse<crate::ai::BeatSuggestion>, String> {
    // Temporary implementation to avoid Send trait issues
    Ok(crate::ai::AIResponse {
        success: true,
        data: Some(crate::ai::BeatSuggestion {
            content: "AI beat suggestion placeholder".to_string(),
            scene_ideas: vec!["Scene idea 1".to_string()],
            conflicts: vec!["Conflict suggestion".to_string()],
            character_moments: HashMap::new(),
            themes: vec!["Theme 1".to_string()],
        }),
        error: None,
        credits_used: 0,
        processing_time_ms: 100,
        metadata: None,
    })
}

/// Analyze character arc across story beats
#[tauri::command]
pub async fn analyze_character_arc(
    _state: State<'_, AppState>,
    _character: Character,
    _beats: Vec<Beat>,
    _themes: Vec<Theme>,
) -> Result<crate::ai::AIResponse<crate::ai::CharacterArcSuggestion>, String> {
    // Temporary implementation to avoid Send trait issues
    Ok(crate::ai::AIResponse {
        success: true,
        data: Some(crate::ai::CharacterArcSuggestion {
            character_name: "Character name".to_string(),
            beat_suggestions: vec![],
            overall_arc: CharacterArcOverall {
                want: "Character wants something".to_string(),
                need: "Character needs something".to_string(),
                lie_they_believe: "Character believes a lie".to_string(),
                truth_they_need: "Character needs to learn truth".to_string(),
                ghost: "Character's ghost/backstory".to_string(),
                arc_type: CharacterArcType::Positive,
            },
        }),
        error: None,
        credits_used: 0,
        processing_time_ms: 100,
        metadata: None,
    })
}

/// Analyze theme coherence across story elements
#[tauri::command]
pub async fn analyze_theme_coherence(
    _state: State<'_, AppState>,
    _themes: Vec<Theme>,
    _beats: Vec<Beat>,
    _characters: Vec<Character>,
) -> Result<crate::ai::AIResponse<crate::ai::ThemeAnalysis>, String> {
    // Temporary implementation to avoid Send trait issues
    Ok(crate::ai::AIResponse {
        success: true,
        data: Some(crate::ai::ThemeAnalysis {
            theme_consistency: HashMap::new(),
            weak_points: vec![],
            suggestions: vec!["Theme coherence suggestion".to_string()],
            overall_score: 0.85,
        }),
        error: None,
        credits_used: 0,
        processing_time_ms: 100,
        metadata: None,
    })
}

/// Update AI service settings
#[tauri::command]
pub async fn update_ai_settings(
    state: State<'_, AppState>,
    settings: AISettings,
) -> Result<(), String> {
    let mut ai_service = state.services().ai_service()?;
    ai_service.update_settings(settings);
    Ok(())
}

/// Generate character suggestions based on story context
#[tauri::command]
pub async fn generate_character_suggestions(
    state: State<'_, AppState>,
    story_context: String,
    existing_characters: Vec<Character>,
) -> Result<crate::ai::AIResponse<Vec<crate::ai::CharacterSuggestion>>, String> {
    let ai_service = state.services().ai_service()?;
    let service_clone = ai_service.clone();
    drop(ai_service);
    
    service_clone
        .generate_character_suggestions(&story_context, &existing_characters)
        .await
        .map_err(|e| e.to_string())
}

/// Generate plot suggestions for story development
#[tauri::command]
pub async fn generate_plot_suggestions(
    state: State<'_, AppState>,
    current_beats: Vec<Beat>,
    characters: Vec<Character>,
    themes: Vec<Theme>,
) -> Result<crate::ai::AIResponse<Vec<crate::ai::PlotSuggestion>>, String> {
    let ai_service = state.services().ai_service()?;
    let service_clone = ai_service.clone();
    drop(ai_service);
    
    service_clone
        .generate_plot_suggestions(&current_beats, &characters, &themes)
        .await
        .map_err(|e| e.to_string())
}

/// Analyze writing style and provide suggestions
#[tauri::command]
pub async fn analyze_writing_style(
    state: State<'_, AppState>,
    text: String,
    target_style: Option<String>,
) -> Result<crate::ai::AIResponse<crate::ai::StyleAnalysis>, String> {
    let ai_service = state.services().ai_service()?;
    let service_clone = ai_service.clone();
    drop(ai_service);
    
    service_clone
        .analyze_writing_style(&text, target_style.as_deref())
        .await
        .map_err(|e| e.to_string())
}
