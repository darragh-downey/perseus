mod ai;
mod export; 
mod commands;
mod analytics;
mod oulipo;

use commands::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AppState::new())
    .invoke_handler(tauri::generate_handler![
      commands::suggest_beat_content,
      commands::analyze_character_arc,
      commands::analyze_theme_coherence,
      commands::update_ai_settings,
      commands::export_project,
      commands::export_beat_sheet,
      commands::process_large_text_analysis,
      commands::generate_character_relationship_graph,
      commands::bulk_process_documents,
      commands::analyze_characters,
      commands::analyze_world,
      commands::analyze_plot,
      commands::analyze_text,
      commands::generate_character_force_graph,
      commands::calculate_word_count,
      commands::filter_and_sort_events,
      commands::calculate_beat_word_counts,
      commands::analyze_research,
      commands::analyze_advanced_text,
      commands::analyze_collaboration_metrics,
      commands::detect_narrative_patterns,
      commands::analyze_writing_style_consistency,
      commands::generate_writing_suggestions,
      commands::optimize_text_performance,
      // Oulipo constraint commands
      commands::lipogram_check,
      commands::n_plus_7_transform,
      commands::palindrome_check,
      commands::snowball_check,
      commands::generate_haiku,
      commands::prisoners_constraint_check,
      commands::univocalic_check,
      commands::sestina_check,
      commands::generate_anagrams,
      commands::check_anagram,
      commands::generate_combinatorial_poem,
      commands::validate_text_length,
      commands::validate_word_count,
      commands::check_character_frequency,
      commands::lipogram_suggestions,
      commands::palindrome_suggestions,
      // commands::get_user_credits,
      // commands::deduct_credits,
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
