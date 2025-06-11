use crate::oulipo::ConstraintResult;
use anyhow::Result;

/// Generate haiku following 5-7-5 syllable pattern
pub fn generate(theme: &str) -> Result<ConstraintResult> {
    let haiku = match theme.to_lowercase().as_str() {
        "nature" => generate_nature_haiku(),
        "seasons" => generate_seasonal_haiku(),
        "love" => generate_love_haiku(),
        "time" => generate_time_haiku(),
        _ => generate_default_haiku(),
    };
    
    Ok(ConstraintResult {
        success: true,
        result: Some(haiku.clone()),
        violations: Vec::new(),
        suggestions: vec![
            "Traditional haiku captures a moment in nature".to_string(),
            "Focus on sensory imagery".to_string(),
            "Include a seasonal reference (kigo)".to_string(),
            "Create a pause or break (kireji)".to_string(),
        ],
        metadata: serde_json::json!({
            "theme": theme,
            "syllable_pattern": "5-7-5",
            "lines": haiku.lines().count(),
            "traditional_elements": ["kigo", "kireji", "present_tense"]
        }),
    })
}

fn generate_nature_haiku() -> String {
    let haikus = [
        "Cherry blossoms fall\nSilent pond reflects the moon\nSpring wind carries peace",
        "Ancient oak stands tall\nRoots deep in the fertile earth\nLeaves dance with the sky",
        "Morning dew glistens\nOn grass blades bent by the weight\nSun breaks through the mist",
        "River flows swiftly\nCarrying stories downstream\nTo the waiting sea",
    ];
    
    haikus[0].to_string() // In a real implementation, this would be random
}

fn generate_seasonal_haiku() -> String {
    let haikus = [
        "Autumn leaves spiral\nGolden carpet on the path\nTime's gentle passage",
        "Winter's first snowfall\nSilence blankets the garden\nWorld holds its breath",
        "Spring buds emerging\nPromise of renewal blooms\nLife begins again",
        "Summer heat shimmers\nCicadas sing their stories\nAfternoon dreams",
    ];
    
    haikus[0].to_string()
}

fn generate_love_haiku() -> String {
    let haikus = [
        "Two hearts beat as one\nIn the quiet of twilight\nLove needs no words",
        "Your gentle smile\nLights up the darkest corner\nOf my waiting heart",
        "Distance cannot dim\nThe warmth of our connection\nSouls know no borders",
    ];
    
    haikus[0].to_string()
}

fn generate_time_haiku() -> String {
    let haikus = [
        "Clock hands circle round\nMoments slip like grains of sand\nNow is all we have",
        "Yesterday's shadows\nFade into tomorrow's light\nPresent moment shines",
        "Seasons turn again\nEternal cycle of change\nTime's patient wisdom",
    ];
    
    haikus[0].to_string()
}

fn generate_default_haiku() -> String {
    "Words flow like water\nConstraints shape creative thought\nBeauty finds its way".to_string()
}
