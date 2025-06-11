
//! Export-related Tauri commands.

use crate::export::{ExportService, ExportOptions, ProjectData, ExportResult};
use crate::commands::state::AppState;
use tauri::State;

/// Export project data to various formats
#[tauri::command]
pub async fn export_project(
    state: State<'_, AppState>,
    project_data: ProjectData,
    options: ExportOptions,
) -> Result<ExportResult, String> {
    state
        .services()
        .export_service()
        .export_project(&project_data, &options)
        .await
        .map_err(|e| e.to_string())
}

/// Export beat sheet as standalone document
#[tauri::command]
pub async fn export_beat_sheet(
    state: State<'_, AppState>,
    plot_structure: crate::export::PlotStructure,
    options: ExportOptions,
) -> Result<ExportResult, String> {
    state
        .services()
        .export_service()
        .export_beat_sheet(&plot_structure, &options)
        .await
        .map_err(|e| e.to_string())
}

/// Export character profiles
#[tauri::command]
pub async fn export_characters(
    state: State<'_, AppState>,
    characters: Vec<crate::ai::Character>,
    options: ExportOptions,
) -> Result<ExportResult, String> {
    // Create a simplified project data with just characters
    let project_data = ProjectData {
        id: "characters-export".to_string(),
        name: "Character Profiles".to_string(),
        description: "Exported character profiles".to_string(),
        documents: vec![],
        characters,
        plot_structure: None,
        notes: vec![],
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    let export_options = ExportOptions {
        include_metadata: false,
        include_plot_structure: false,
        include_characters: true,
        include_notes: false,
        ..options
    };

    state
        .services()
        .export_service()
        .export_project(&project_data, &export_options)
        .await
        .map_err(|e| e.to_string())
}

/// Export research notes
#[tauri::command]
pub async fn export_research_notes(
    state: State<'_, AppState>,
    notes: Vec<crate::export::Note>,
    options: ExportOptions,
) -> Result<ExportResult, String> {
    // Create a simplified project data with just notes
    let project_data = ProjectData {
        id: "research-export".to_string(),
        name: "Research Notes".to_string(),
        description: "Exported research notes".to_string(),
        documents: vec![],
        characters: vec![],
        plot_structure: None,
        notes,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    let export_options = ExportOptions {
        include_metadata: false,
        include_plot_structure: false,
        include_characters: false,
        include_notes: true,
        ..options
    };

    state
        .services()
        .export_service()
        .export_project(&project_data, &export_options)
        .await
        .map_err(|e| e.to_string())
}
