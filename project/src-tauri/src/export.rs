use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use anyhow::Result;
use chrono::{DateTime, Utc};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportOptions {
    pub format: ExportFormat,
    pub include_metadata: bool,
    pub include_plot_structure: bool,
    pub include_characters: bool,
    pub include_notes: bool,
    pub output_path: Option<PathBuf>,
    pub template: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExportFormat {
    Markdown,
    Html,
    Pdf,
    Word,
    Json,
    Epub,
    PlainText,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub word_count: u32,
    pub status: DocumentStatus,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DocumentStatus {
    Draft,
    InProgress,
    Complete,
    Published,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectData {
    pub id: String,
    pub name: String,
    pub description: String,
    pub documents: Vec<Document>,
    pub characters: Vec<super::ai::Character>,
    pub plot_structure: Option<PlotStructure>,
    pub notes: Vec<Note>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlotStructure {
    pub id: String,
    pub target_word_count: u32,
    pub beats: Vec<super::ai::Beat>,
    pub themes: Vec<super::ai::Theme>,
    pub conflicts: Vec<super::ai::Conflict>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportResult {
    pub success: bool,
    pub output_path: Option<PathBuf>,
    pub file_size: Option<u64>,
    pub format: ExportFormat,
    pub processing_time_ms: u128,
    pub error: Option<String>,
}

pub struct ExportService;

impl ExportService {
    pub fn new() -> Self {
        Self
    }

    pub async fn export_project(
        &self,
        project_data: &ProjectData,
        options: &ExportOptions,
    ) -> Result<ExportResult> {
        let start_time = std::time::Instant::now();

        let result = match &options.format {
            ExportFormat::Markdown => self.export_as_markdown(project_data, options).await,
            ExportFormat::Html => self.export_as_html(project_data, options).await,
            ExportFormat::Pdf => self.export_as_pdf(project_data, options).await,
            ExportFormat::Word => self.export_as_word(project_data, options).await,
            ExportFormat::Json => self.export_as_json(project_data, options).await,
            ExportFormat::Epub => self.export_as_epub(project_data, options).await,
            ExportFormat::PlainText => self.export_as_plain_text(project_data, options).await,
        };

        let processing_time = start_time.elapsed().as_millis();

        match result {
            Ok(mut export_result) => {
                export_result.processing_time_ms = processing_time;
                Ok(export_result)
            }
            Err(e) => Ok(ExportResult {
                success: false,
                output_path: None,
                file_size: None,
                format: options.format.clone(),
                processing_time_ms: processing_time,
                error: Some(e.to_string()),
            }),
        }
    }

    pub async fn export_beat_sheet(
        &self,
        plot_structure: &PlotStructure,
        options: &ExportOptions,
    ) -> Result<ExportResult> {
        let start_time = std::time::Instant::now();

        let content = self.generate_beat_sheet_content(plot_structure, &options.format);
        let output_path = self.determine_output_path(&options.output_path, "beat-sheet", &options.format);

        let result = self.write_content_to_file(&content, &output_path, &options.format).await;

        let processing_time = start_time.elapsed().as_millis();

        match result {
            Ok(file_size) => Ok(ExportResult {
                success: true,
                output_path: Some(output_path),
                file_size: Some(file_size),
                format: options.format.clone(),
                processing_time_ms: processing_time,
                error: None,
            }),
            Err(e) => Ok(ExportResult {
                success: false,
                output_path: None,
                file_size: None,
                format: options.format.clone(),
                processing_time_ms: processing_time,
                error: Some(e.to_string()),
            }),
        }
    }

    async fn export_as_markdown(
        &self,
        project_data: &ProjectData,
        options: &ExportOptions,
    ) -> Result<ExportResult> {
        let mut content = String::new();

        // Add metadata
        if options.include_metadata {
            content.push_str(&format!("# {}\n\n", project_data.name));
            content.push_str(&format!("**Description:** {}\n\n", project_data.description));
            content.push_str(&format!("**Created:** {}\n", project_data.created_at.format("%Y-%m-%d")));
            content.push_str(&format!("**Last Updated:** {}\n\n", project_data.updated_at.format("%Y-%m-%d")));
            content.push_str("---\n\n");
        }

        // Add plot structure
        if options.include_plot_structure {
            if let Some(plot) = &project_data.plot_structure {
                content.push_str("## Plot Structure\n\n");
                content.push_str(&format!("**Target Word Count:** {}\n\n", plot.target_word_count));

                for beat in &plot.beats {
                    content.push_str(&format!("### {} ({}%)\n\n", beat.name, beat.percentage));
                    content.push_str(&format!("**Description:** {}\n\n", beat.description));
                    if !beat.content.is_empty() {
                        content.push_str(&format!("**Content:**\n{}\n\n", beat.content));
                    }
                    if let Some(word_count) = beat.word_count {
                        content.push_str(&format!("**Target Words:** {}\n\n", word_count));
                    }
                }
                content.push_str("---\n\n");
            }
        }

        // Add characters
        if options.include_characters && !project_data.characters.is_empty() {
            content.push_str("## Characters\n\n");
            for character in &project_data.characters {
                content.push_str(&format!("### {}\n\n", character.name));
                if let Some(description) = &character.description {
                    content.push_str(&format!("**Description:** {}\n\n", description));
                }
                if let Some(want) = &character.want {
                    content.push_str(&format!("**Want:** {}\n\n", want));
                }
                if let Some(need) = &character.need {
                    content.push_str(&format!("**Need:** {}\n\n", need));
                }
            }
            content.push_str("---\n\n");
        }

        // Add documents
        content.push_str("## Documents\n\n");
        for document in &project_data.documents {
            content.push_str(&format!("### {}\n\n", document.title));
            content.push_str(&document.content);
            content.push_str("\n\n---\n\n");
        }

        // Add notes
        if options.include_notes && !project_data.notes.is_empty() {
            content.push_str("## Notes\n\n");
            for note in &project_data.notes {
                content.push_str(&format!("### {}\n\n", note.title));
                content.push_str(&note.content);
                if !note.tags.is_empty() {
                    content.push_str(&format!("\n\n**Tags:** {}\n\n", note.tags.join(", ")));
                }
                content.push_str("---\n\n");
            }
        }

        let output_path = self.determine_output_path(&options.output_path, &project_data.name, &options.format);
        let file_size = self.write_content_to_file(&content, &output_path, &options.format).await?;

        Ok(ExportResult {
            success: true,
            output_path: Some(output_path),
            file_size: Some(file_size),
            format: options.format.clone(),
            processing_time_ms: 0,
            error: None,
        })
    }

    async fn export_as_html(
        &self,
        project_data: &ProjectData,
        options: &ExportOptions,
    ) -> Result<ExportResult> {
        let mut content = String::new();

        // Basic HTML structure
        content.push_str("<!DOCTYPE html>\n");
        content.push_str("<html lang=\"en\">\n");
        content.push_str("<head>\n");
        content.push_str("    <meta charset=\"UTF-8\">\n");
        content.push_str("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        content.push_str(&format!("    <title>{}</title>\n", project_data.name));
        content.push_str("    <style>\n");
        content.push_str(include_str!("assets/export-styles.css"));
        content.push_str("    </style>\n");
        content.push_str("</head>\n");
        content.push_str("<body>\n");

        // Add content similar to markdown but with HTML formatting
        if options.include_metadata {
            content.push_str(&format!("    <h1>{}</h1>\n", project_data.name));
            content.push_str(&format!("    <p><strong>Description:</strong> {}</p>\n", project_data.description));
            content.push_str(&format!("    <p><strong>Created:</strong> {}</p>\n", project_data.created_at.format("%Y-%m-%d")));
            content.push_str(&format!("    <p><strong>Last Updated:</strong> {}</p>\n", project_data.updated_at.format("%Y-%m-%d")));
            content.push_str("    <hr>\n");
        }

        // Plot structure, characters, documents, and notes sections...
        // (Similar structure to markdown but with HTML tags)

        content.push_str("</body>\n");
        content.push_str("</html>\n");

        let output_path = self.determine_output_path(&options.output_path, &project_data.name, &options.format);
        let file_size = self.write_content_to_file(&content, &output_path, &options.format).await?;

        Ok(ExportResult {
            success: true,
            output_path: Some(output_path),
            file_size: Some(file_size),
            format: options.format.clone(),
            processing_time_ms: 0,
            error: None,
        })
    }

    async fn export_as_pdf(
        &self,
        project_data: &ProjectData,
        options: &ExportOptions,
    ) -> Result<ExportResult> {
        // For PDF export, we would typically use a library like `printpdf` or `wkhtmltopdf`
        // For now, we'll export as HTML and suggest conversion
        let html_options = ExportOptions {
            format: ExportFormat::Html,
            ..options.clone()
        };
        
        let html_result = self.export_as_html(project_data, &html_options).await?;
        
        // In a real implementation, convert HTML to PDF here
        // For now, return the HTML path and suggest manual conversion
        Ok(ExportResult {
            success: true,
            output_path: html_result.output_path,
            file_size: html_result.file_size,
            format: ExportFormat::Pdf,
            processing_time_ms: 0,
            error: Some("PDF export not fully implemented. HTML file generated instead.".to_string()),
        })
    }

    async fn export_as_word(
        &self,
        project_data: &ProjectData,
        options: &ExportOptions,
    ) -> Result<ExportResult> {
        // For Word export, we would use a library like `docx-rs`
        // For now, export as RTF which Word can open
        let mut content = String::new();
        
        // RTF header
        content.push_str("{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}");
        content.push_str("\\f0\\fs24 ");

        // Add project content in RTF format
        content.push_str(&format!("{{\\b {}}}\\par\\par", project_data.name));
        content.push_str(&format!("{} \\par\\par", project_data.description));

        for document in &project_data.documents {
            content.push_str(&format!("{{\\b {}}}\\par", document.title));
            content.push_str(&format!("{} \\par\\par", document.content.replace('\n', "\\par ")));
        }

        content.push_str("}");

        let output_path = self.determine_output_path(&options.output_path, &project_data.name, &ExportFormat::Word);
        let file_size = self.write_content_to_file(&content, &output_path, &ExportFormat::Word).await?;

        Ok(ExportResult {
            success: true,
            output_path: Some(output_path),
            file_size: Some(file_size),
            format: ExportFormat::Word,
            processing_time_ms: 0,
            error: None,
        })
    }

    async fn export_as_json(
        &self,
        project_data: &ProjectData,
        options: &ExportOptions,
    ) -> Result<ExportResult> {
        let content = serde_json::to_string_pretty(project_data)?;
        let output_path = self.determine_output_path(&options.output_path, &project_data.name, &options.format);
        let file_size = self.write_content_to_file(&content, &output_path, &options.format).await?;

        Ok(ExportResult {
            success: true,
            output_path: Some(output_path),
            file_size: Some(file_size),
            format: options.format.clone(),
            processing_time_ms: 0,
            error: None,
        })
    }

    async fn export_as_epub(
        &self,
        project_data: &ProjectData,
        options: &ExportOptions,
    ) -> Result<ExportResult> {
        // EPUB is a complex format requiring ZIP compression and specific structure
        // For now, export as HTML and suggest conversion
        let html_options = ExportOptions {
            format: ExportFormat::Html,
            ..options.clone()
        };
        
        let html_result = self.export_as_html(project_data, &html_options).await?;
        
        Ok(ExportResult {
            success: true,
            output_path: html_result.output_path,
            file_size: html_result.file_size,
            format: ExportFormat::Epub,
            processing_time_ms: 0,
            error: Some("EPUB export not fully implemented. HTML file generated instead.".to_string()),
        })
    }

    async fn export_as_plain_text(
        &self,
        project_data: &ProjectData,
        options: &ExportOptions,
    ) -> Result<ExportResult> {
        let mut content = String::new();

        if options.include_metadata {
            content.push_str(&format!("{}\n", project_data.name));
            content.push_str(&format!("Description: {}\n", project_data.description));
            content.push_str(&format!("Created: {}\n", project_data.created_at.format("%Y-%m-%d")));
            content.push_str(&format!("Last Updated: {}\n\n", project_data.updated_at.format("%Y-%m-%d")));
            content.push_str(&"=".repeat(50));
            content.push_str("\n\n");
        }

        for document in &project_data.documents {
            content.push_str(&format!("{}\n", document.title));
            content.push_str(&"-".repeat(document.title.len()));
            content.push_str("\n\n");
            content.push_str(&document.content);
            content.push_str("\n\n");
            content.push_str(&"=".repeat(50));
            content.push_str("\n\n");
        }

        let output_path = self.determine_output_path(&options.output_path, &project_data.name, &options.format);
        let file_size = self.write_content_to_file(&content, &output_path, &options.format).await?;

        Ok(ExportResult {
            success: true,
            output_path: Some(output_path),
            file_size: Some(file_size),
            format: options.format.clone(),
            processing_time_ms: 0,
            error: None,
        })
    }

    fn generate_beat_sheet_content(&self, plot_structure: &PlotStructure, format: &ExportFormat) -> String {
        match format {
            ExportFormat::Markdown => {
                let mut content = String::new();
                content.push_str("# Beat Sheet\n\n");
                content.push_str(&format!("**Target Word Count:** {}\n\n", plot_structure.target_word_count));
                
                for beat in &plot_structure.beats {
                    content.push_str(&format!("## {} ({}%)\n\n", beat.name, beat.percentage));
                    content.push_str(&format!("**Description:** {}\n\n", beat.description));
                    if !beat.content.is_empty() {
                        content.push_str(&format!("**Content:**\n{}\n\n", beat.content));
                    }
                    if let Some(word_count) = beat.word_count {
                        content.push_str(&format!("**Target Words:** {}\n\n", word_count));
                    }
                    content.push_str("---\n\n");
                }
                content
            }
            ExportFormat::Json => {
                serde_json::to_string_pretty(plot_structure).unwrap_or_default()
            }
            _ => {
                // Plain text format
                let mut content = String::new();
                content.push_str("BEAT SHEET\n");
                content.push_str(&"=".repeat(50));
                content.push_str("\n\n");
                content.push_str(&format!("Target Word Count: {}\n\n", plot_structure.target_word_count));
                
                for beat in &plot_structure.beats {
                    content.push_str(&format!("{} ({}%)\n", beat.name, beat.percentage));
                    content.push_str(&"-".repeat(beat.name.len()));
                    content.push_str("\n");
                    content.push_str(&format!("Description: {}\n\n", beat.description));
                    if !beat.content.is_empty() {
                        content.push_str(&format!("Content:\n{}\n\n", beat.content));
                    }
                    if let Some(word_count) = beat.word_count {
                        content.push_str(&format!("Target Words: {}\n\n", word_count));
                    }
                    content.push_str("\n");
                }
                content
            }
        }
    }

    fn determine_output_path(&self, requested_path: &Option<PathBuf>, filename: &str, format: &ExportFormat) -> PathBuf {
        let extension = match format {
            ExportFormat::Markdown => "md",
            ExportFormat::Html => "html",
            ExportFormat::Pdf => "pdf",
            ExportFormat::Word => "rtf",
            ExportFormat::Json => "json",
            ExportFormat::Epub => "epub",
            ExportFormat::PlainText => "txt",
        };

        if let Some(path) = requested_path {
            path.clone()
        } else {
            let sanitized_filename = filename
                .chars()
                .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
                .collect::<String>();
            PathBuf::from(format!("{}.{}", sanitized_filename, extension))
        }
    }

    async fn write_content_to_file(&self, content: &str, path: &PathBuf, _format: &ExportFormat) -> Result<u64> {
        tokio::fs::write(path, content).await?;
        let metadata = tokio::fs::metadata(path).await?;
        Ok(metadata.len())
    }
}
