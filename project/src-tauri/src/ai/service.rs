//! AI service implementation.

use crate::ai::{
    types::{AISettings, Character, Beat, Theme, Conflict, AIProvider as AIProviderEnum},
    responses::{AIResponse, BeatSuggestion, CharacterArcSuggestion, ThemeAnalysis, 
                CharacterSuggestion, PlotSuggestion, StyleAnalysis},
    providers::{self, AIProvider, OpenAIProvider, AnthropicProvider, LocalProvider}
};
use anyhow::Result;
use std::sync::Arc;

/// Main AI service that manages different providers
#[derive(Clone)]
pub struct AIService {
    provider: Arc<dyn AIProvider>,
    settings: AISettings,
}

impl AIService {
    /// Create a new AI service with default settings
    pub fn new() -> Self {
        Self {
            provider: Arc::new(LocalProvider::new()),
            settings: AISettings::default(),
        }
    }

    /// Create AI service with specific provider
    pub fn with_provider(provider: Arc<dyn AIProvider>) -> Self {
        Self {
            provider,
            settings: AISettings::default(),
        }
    }

    /// Update AI settings and switch providers if necessary
    pub fn update_settings(&mut self, settings: AISettings) {
        // Switch provider based on settings
        self.provider = match &settings.provider {
            AIProviderEnum::OpenAI => {
                if let Some(api_key) = &settings.api_key {
                    let mut provider = OpenAIProvider::new(api_key.clone());
                    if let Some(model) = &settings.model {
                        provider = provider.with_model(model.clone());
                    }
                    Arc::new(provider)
                } else {
                    Arc::new(LocalProvider::new())
                }
            }
            AIProviderEnum::Anthropic => {
                if let Some(api_key) = &settings.api_key {
                    Arc::new(AnthropicProvider::new(api_key.clone()))
                } else {
                    Arc::new(LocalProvider::new())
                }
            }
            AIProviderEnum::Local => Arc::new(LocalProvider::new()),
            AIProviderEnum::Custom { endpoint: _ } => {
                // For custom providers, would implement CustomProvider
                Arc::new(LocalProvider::new())
            }
        };

        self.settings = settings;
    }

    /// Get current settings
    pub fn settings(&self) -> &AISettings {
        &self.settings
    }

    /// Suggest content for a story beat
    pub async fn suggest_beat_content(
        &self,
        beat: &Beat,
        characters: &[Character],
        themes: &[Theme],
        previous_beats: &[Beat],
    ) -> Result<AIResponse<BeatSuggestion>> {
        self.provider
            .suggest_beat_content(beat, characters, themes, previous_beats)
            .await
    }

    /// Analyze character arc across story beats
    pub async fn analyze_character_arc(
        &self,
        character: &Character,
        beats: &[Beat],
        themes: &[Theme],
    ) -> Result<AIResponse<CharacterArcSuggestion>> {
        self.provider
            .analyze_character_arc(character, beats, themes)
            .await
    }

    /// Analyze theme coherence across story elements
    pub async fn analyze_theme_coherence(
        &self,
        themes: &[Theme],
        beats: &[Beat],
        characters: &[Character],
    ) -> Result<AIResponse<ThemeAnalysis>> {
        self.provider
            .analyze_theme_coherence(themes, beats, characters)
            .await
    }

    /// Generate character suggestions based on story context
    pub async fn generate_character_suggestions(
        &self,
        story_context: &str,
        existing_characters: &[Character],
    ) -> Result<AIResponse<Vec<CharacterSuggestion>>> {
        self.provider
            .generate_character_suggestions(story_context, existing_characters)
            .await
    }

    /// Generate plot suggestions for story development
    pub async fn generate_plot_suggestions(
        &self,
        current_beats: &[Beat],
        characters: &[Character],
        themes: &[Theme],
    ) -> Result<AIResponse<Vec<PlotSuggestion>>> {
        self.provider
            .generate_plot_suggestions(current_beats, characters, themes)
            .await
    }

    /// Analyze writing style and provide suggestions
    pub async fn analyze_writing_style(
        &self,
        text: &str,
        target_style: Option<&str>,
    ) -> Result<AIResponse<StyleAnalysis>> {
        self.provider
            .analyze_writing_style(text, target_style)
            .await
    }

    /// Check if the service is properly configured
    pub fn is_configured(&self) -> bool {
        match &self.settings.provider {
            AIProviderEnum::Local => true,
            AIProviderEnum::OpenAI | AIProviderEnum::Anthropic => {
                self.settings.api_key.is_some()
            }
            AIProviderEnum::Custom { endpoint } => !endpoint.is_empty(),
        }
    }

    /// Get provider name for display purposes
    pub fn provider_name(&self) -> &'static str {
        match &self.settings.provider {
            AIProviderEnum::OpenAI => "OpenAI",
            AIProviderEnum::Anthropic => "Anthropic",
            AIProviderEnum::Local => "Local",
            AIProviderEnum::Custom { .. } => "Custom",
        }
    }

    /// Estimate credit cost for an operation
    pub fn estimate_credits(&self, operation: &str, input_size: usize) -> u32 {
        let base_cost = match operation {
            "suggest_beat_content" => 10,
            "analyze_character_arc" => 15,
            "analyze_theme_coherence" => 12,
            "generate_character_suggestions" => 8,
            "generate_plot_suggestions" => 10,
            "analyze_writing_style" => 5,
            _ => 5,
        };

        // Adjust cost based on provider and input size
        let provider_multiplier = match &self.settings.provider {
            AIProviderEnum::OpenAI => 2.0,
            AIProviderEnum::Anthropic => 1.8,
            AIProviderEnum::Local => 0.1,
            AIProviderEnum::Custom { .. } => 1.0,
        };

        let size_multiplier = (input_size as f32 / 1000.0).max(1.0);

        (base_cost as f32 * provider_multiplier * size_multiplier) as u32
    }
}

impl Default for AIService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ai_service_creation() {
        let service = AIService::new();
        assert_eq!(service.provider_name(), "Local");
        assert!(service.is_configured());
    }

    #[test]
    fn test_settings_update() {
        let mut service = AIService::new();
        
        let mut settings = AISettings::default();
        settings.provider = AIProviderEnum::OpenAI;
        settings.api_key = Some("test-key".to_string());
        
        service.update_settings(settings);
        assert_eq!(service.provider_name(), "OpenAI");
        assert!(service.is_configured());
    }

    #[test]
    fn test_credit_estimation() {
        let service = AIService::new();
        
        let credits = service.estimate_credits("suggest_beat_content", 1000);
        assert!(credits > 0);
        
        let large_input_credits = service.estimate_credits("suggest_beat_content", 5000);
        assert!(large_input_credits > credits);
    }
}
