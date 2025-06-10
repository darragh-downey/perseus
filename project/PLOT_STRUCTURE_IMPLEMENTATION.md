# Save the Cat! Beat Sheet Implementation

## Overview

This implementation adds comprehensive plot structure tools inspired by the Save the Cat! Beat Sheet methodology to Ulysses, transforming it into a powerful fiction writing application. The implementation includes five core components designed to help writers structure their stories using proven storytelling frameworks.

## Features Implemented

### 1. Beat Sheet Planner (`/src/components/Plot/BeatSheetPlanner.tsx`)

**Purpose**: Interactive planning tool for the 15-beat Save the Cat! structure with genre variations.

**Key Features**:
- Pre-configured Save the Cat! beats with descriptions and percentages
- Genre-specific templates (Romance, Mystery, Thriller)
- Automatic word count calculation based on target manuscript length
- Progress tracking with visual indicators for each act
- Beat completion status with color-coded progress bar

**Technical Implementation**:
- Uses utility functions from `/src/utils/plotStructure.ts`
- Integrates with storage services for persistence
- Provides real-time word count calculations

**Beat Structure**:
- **Opening Image** (0%) - Hero's "before" world
- **Theme Stated** (5%) - Story's moral lesson
- **Setup** (10%) - Hero's ordinary world
- **Catalyst** (10%) - Inciting incident
- **Debate** (20%) - Hero's hesitation
- **Break into Two** (20%) - Commitment to adventure
- **B Story** (22%) - Love interest/helper introduction
- **Fun and Games** (30%) - Promise of premise
- **Midpoint** (50%) - False victory/defeat
- **Bad Guys Close In** (60%) - Opposition regroups
- **All Is Lost** (75%) - Hero's lowest point
- **Dark Night of the Soul** (80%) - Moment of despair
- **Break into Three** (80%) - Solution discovered
- **Finale** (85%) - Climactic confrontation
- **Final Image** (100%) - Hero's "after" world

### 2. Character Arc Tracker (`/src/components/Plot/CharacterArcTracker.tsx`)

**Purpose**: Track character emotional development across story beats using radar chart methodology.

**Key Features**:
- Character want/need definition fields
- Emotional dimension tracking (8 dimensions: Confidence, Fear, Hope, Courage, Selflessness, Trust, Determination, Wisdom)
- Beat-specific character development notes
- Arc completion percentage tracking
- Integration with existing character data

**Emotional Tracking System**:
- 10-point scale for each emotional dimension
- Key beats tracked: Opening Image, Catalyst, Break into Two, Midpoint, All Is Lost, Final Image
- Visual representation ready for D3.js radar charts

### 3. Theme Visualizer (`/src/components/Plot/ThemeVisualizer.tsx`)

**Purpose**: Track thematic elements throughout the story with intensity mapping.

**Key Features**:
- Theme creation and management
- Scene-theme mapping with intensity levels (1-10 scale)
- Visual bubble chart placeholder for theme distribution
- Multiple theme support per project
- Theme-scene relationship tracking

**Theme System**:
- Named themes with descriptions
- Scene association with intensity ratings
- Automatic theme presence counting
- Integration with document/scene structure

### 4. Conflict Tracker (`/src/components/Plot/ConflictTracker.tsx`)

**Purpose**: Manage internal and external conflicts plus B-story subplots.

**Key Features**:
- Dual-tab interface for conflicts and B-stories
- Conflict categorization (Internal vs External)
- Intensity tracking with slider controls
- B-story character association
- Thematic impact measurement for subplots

**Conflict Management**:
- **Internal Conflicts**: Character vs. Self (purple theme)
- **External Conflicts**: Character vs. World (orange theme)
- **B-Stories**: Secondary plots reinforcing main theme (green theme)

### 5. Plot Structure Utilities (`/src/utils/plotStructure.ts`)

**Purpose**: Centralized utilities for plot structure generation and management.

**Key Features**:
- Default Save the Cat! beat generation
- Genre-specific templates (Romance, Mystery, Thriller)
- AI prompt templates for beat suggestions
- Configurable word count calculations

**Genre Templates**:
- **Romance**: 6 beats focusing on relationship development
- **Mystery**: 6 beats emphasizing investigation and revelation
- **Thriller**: 6 beats highlighting escalating danger

## Data Architecture

### Database Schema Extensions

```sql
-- Plot Structures
DEFINE TABLE plotStructures SCHEMALESS
    FIELDS project_id ID, target_word_count NUMBER, created_at DATETIME, updated_at DATETIME;

-- Beats
DEFINE TABLE beats SCHEMALESS
    FIELDS project_id ID, name STRING, percentage NUMBER, description STRING, 
           content STRING, word_count NUMBER, scene_ids ARRAY, is_completed BOOLEAN;

-- Themes
DEFINE TABLE themes SCHEMALESS
    FIELDS project_id ID, name STRING, description STRING, scene_ids ARRAY, intensity OBJECT;

-- Conflicts
DEFINE TABLE conflicts SCHEMALESS
    FIELDS project_id ID, type STRING, description STRING, intensity NUMBER, scene_ids ARRAY;

-- B Stories
DEFINE TABLE bStories SCHEMALESS
    FIELDS project_id ID, character_id ID, name STRING, description STRING, 
           scene_ids ARRAY, thematic_impact OBJECT;
```

### Enhanced Character Schema

```typescript
interface Character {
  id: string;
  name: string;
  traits: Record<string, any>;
  description?: string;
  color?: string;
  // New fields for character arc tracking
  want?: string; // External goal
  need?: string; // Internal lesson/growth
  arc?: CharacterArcPoint[];
}

interface CharacterArcPoint {
  beatId: string;
  emotionalState: Record<string, number>; // 8 emotional dimensions, 0-10 scale
  notes?: string;
}
```

## Integration Points

### Storage Services
- **Base Storage** (`/src/services/storage.ts`): IndexedDB operations for all plot data
- **Tauri Storage** (`/src/services/tauriStorage.ts`): Enhanced logging and Tauri-specific features

### Context Integration
- **AppContext** (`/src/contexts/AppContext.tsx`): State management for plot structure
- **New Actions**: SET_PLOT_STRUCTURE, ADD_BEAT, UPDATE_THEME, etc.
- **New View**: 'plot' added to currentView type

### UI Integration
- **Navigation**: New "Plot Structure" tab in sidebar with progress indicator
- **Layout**: Integrated into main Layout component with full-screen view
- **Theme**: Consistent with existing dark/light theme system

## AI Integration Ready

The implementation includes AI prompt templates for each beat, ready for integration with:
- **Ollama** (local AI)
- **OpenAI GPT** models
- **Anthropic Claude** models

Example AI prompts:
```typescript
const beatPrompts = {
  'Opening Image': 'Create an opening scene that establishes the tone and shows the protagonist\'s world before change',
  'Catalyst': 'Create the inciting incident that disrupts the protagonist\'s normal life',
  // ... 15 total prompts
};
```

## Visualization Framework

Ready for D3.js integration with placeholder components for:

1. **Timeline Chart**: Beat progression with act color-coding
2. **Radar Chart**: Character emotional development across beats
3. **Bubble Chart**: Theme intensity distribution throughout story
4. **Line Chart**: Conflict escalation tracking
5. **Scatter Plot**: B-story thematic impact visualization

## Usage Workflow

1. **Project Setup**: Create or select a project
2. **Structure Planning**: 
   - Set target word count
   - Choose genre template or use default Save the Cat!
   - Define story beats with descriptions
3. **Character Development**:
   - Define character wants and needs
   - Track emotional growth across key beats
4. **Theme Integration**:
   - Create thematic elements
   - Map themes to scenes with intensity
5. **Conflict Management**:
   - Define internal and external conflicts
   - Create B-story subplots
   - Track intensity and thematic relevance

## Benefits for Fiction Writers

### Structural Integrity
- **Proven Framework**: Based on Blake Snyder's successful Save the Cat! methodology
- **Pacing Guidance**: Percentage-based beats ensure proper story pacing
- **Genre Flexibility**: Templates for different fiction genres

### Character Development
- **Arc Tracking**: Visual representation of character growth
- **Emotional Consistency**: 8-dimension tracking prevents flat characters
- **Want vs Need**: Clear distinction between external goals and internal growth

### Thematic Coherence
- **Theme Reinforcement**: Systematic tracking ensures themes aren't forgotten
- **Intensity Mapping**: Visual representation of thematic presence
- **Scene Integration**: Direct connection between themes and story content

### Professional Standards
- **Industry Framework**: Aligns with Hollywood and publishing industry standards
- **Commercial Viability**: Structure proven to create engaging, sellable stories
- **Agent/Publisher Ready**: Stories structured according to industry expectations

## Future Enhancements

### Phase 2 Features
1. **AI Beat Generation**: Full integration with AI services for beat suggestions
2. **Visual Charts**: D3.js implementation of all chart placeholders
3. **Export Functionality**: PDF/Word export of complete beat sheets
4. **Collaboration**: Multi-author beat sheet sharing
5. **Template Library**: Expanded genre templates and custom templates

### Advanced Features
1. **Scene Integration**: Direct linking between beats and document scenes
2. **Timeline View**: Visual story timeline with drag-and-drop beat editing
3. **Analytics**: Story structure analysis and recommendations
4. **Templates**: Pre-built story templates for common genres
5. **Mobile Support**: Touch-optimized interface for tablets

## Technical Notes

### Performance Considerations
- Lazy loading of plot components
- Efficient state management with React context
- Optimized database queries with indexed fields

### Accessibility
- Full keyboard navigation support
- Screen reader compatible
- High contrast theme support
- Focus management for form interactions

### Testing Strategy
- Unit tests for utility functions
- Integration tests for storage operations
- E2E tests for complete workflow
- Performance tests for large datasets

This implementation transforms Ulysses from a general writing tool into a specialized fiction writing application that rivals dedicated plotting software like Plottr, while maintaining the clean, distraction-free interface that makes it perfect for serious fiction writers.
