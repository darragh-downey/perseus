# Features By User

Below is a comprehensive list of all features discussed for Ulysses, a smart writing assistant built with SvelteKit, Tauri, Rust, SurrealDB, D3.js, and Ollama. Each feature is tagged with the primary user types—**Fiction Writers** (e.g., novelists, screenwriters, RPG designers) and **Non-Fiction Writers** (e.g., memoirists, journalists, academics)—who would benefit from it, based on the context of prior conversations. Some features overlap and are tagged for both, reflecting their versatility across genres. The list includes existing features, proposed enhancements for non-fiction, and plot structure devices inspired by Save the Cat!. The current date and time is 04:58 PM AEST, June 10, 2025.

---

### Features and User Tags

#### Core Writing Features

1. **Markdown-Based Writing Editor**  
   - **Description**: A distraction-free text editor with markdown support and live preview.  
   - **Users**:  
     - **Fiction Writers**: For drafting chapters, dialogue, and scenes.  
     - **Non-Fiction Writers**: For writing articles, memoirs, or research papers.  
   - **Notes**: Toggle for genre-specific formatting hints (e.g., dialogue vs. citations).

2. **Note-Taking and Idea Organization**  
   - **Description**: A system to capture, tag, and search notes, with export options.  
   - **Users**:  
     - **Fiction Writers**: For character backstories, worldbuilding ideas.  
     - **Non-Fiction Writers**: For research notes, source references.  
   - **Notes**: Expanded into a research management system for non-fiction.

3. **Outline and Structure Planning**  
   - **Description**: A tool to create and visualize story or document structure with word count targets.  
   - **Users**:  
     - **Fiction Writers**: For plotting beats (e.g., Save the Cat! framework).  
     - **Non-Fiction Writers**: For outlining chapters or sections.  
   - **Notes**: Adapts to fiction (beats) or non-fiction (chapters) modes.

#### Fiction-Specific Features

4. **AI-Powered Character Relationship Graphing**  
   - **Description**: Visualizes character relationships with AI suggestions, using D3.js.  
   - **Users**:  
     - **Fiction Writers**: To manage complex character dynamics in novels or scripts.  
   - **Notes**: Can be repurposed for non-fiction concept relationships.

5. **Save the Cat! Beat Sheet Planner**  
   - **Description**: Maps a 15-beat plot structure with percentage-based timelines.  
   - **Users**:  
     - **Fiction Writers**: For structuring narratives in commercial genres.  
   - **Notes**: Includes a timeline graph for visualization.

6. **Character Arc Tracker**  
   - **Description**: Tracks character emotional growth across beats (e.g., want vs. need).  
   - **Users**:  
     - **Fiction Writers**: To ensure believable character development.  
   - **Notes**: Uses a radar chart for visualization.

7. **Theme Visualizer**  
   - **Description**: Tracks and visualizes thematic elements across the story.  
   - **Users**:  
     - **Fiction Writers**: To maintain thematic coherence in narratives.  
   - **Notes**: Uses a bubble chart for visualization.

8. **Conflict Progression Tracker**  
   - **Description**: Maps internal and external conflict intensity across beats.  
   - **Users**:  
     - **Fiction Writers**: To escalate stakes and tension.  
   - **Notes**: Uses a line chart for visualization.

9. **B Story Integration Tool**  
   - **Description**: Tracks secondary plots (e.g., love interest) and their thematic impact.  
   - **Users**:  
     - **Fiction Writers**: To weave subplots into the main narrative.  
   - **Notes**: Uses a scatter plot for visualization.

#### Non-Fiction-Specific Features

10. **Research Management**  
    - **Description**: Organizes sources, citations, and research notes with import/export options.  
    - **Users**:  
      - **Non-Fiction Writers**: For managing interviews, books, or articles.  
    - **Notes**: Includes bubble chart for topic visualization.

11. **Fact-Checking and Source Validation**  
    - **Description**: AI-driven tool to verify claims against research or external data.  
    - **Users**:  
      - **Non-Fiction Writers**: To ensure accuracy in journalism or academia.  
    - **Notes**: Uses a heat map for unverified sections.

12. **Audience Engagement Analyzer**  
    - **Description**: Analyzes readability, tone, and engagement for target audiences.  
    - **Users**:  
      - **Non-Fiction Writers**: To adjust style for academic or general readers.  
    - **Notes**: Uses a line chart for visualization.

13. **Collaboration with Source Attribution**  
    - **Description**: Real-time co-editing with source-linked comments.  
    - **Users**:  
      - **Non-Fiction Writers**: For co-authoring papers or articles.  
    - **Notes**: Uses a scatter plot for activity tracking.

14. **Export and Publishing Tools**  
    - **Description**: Exports in formats like PDF or ePub, with citations or tables of contents.  
    - **Users**:  
      - **Non-Fiction Writers**: For academic papers or eBooks.  
    - **Notes**: Uses a pie chart for format distribution.

#### Cross-Genre Support Features

15. **Text Analysis and Readability Tools**  
    - **Description**: AI-driven analysis for prose quality and suggestions.  
    - **Users**:  
      - **Fiction Writers**: For pacing and dialogue flow.  
      - **Non-Fiction Writers**: For clarity and audience fit.  
    - **Notes**: Shared implementation with genre-specific tweaks.

16. **Collaboration Features**  
    - **Description**: Real-time co-editing with comment threads and version tracking.  
    - **Users**:  
      - **Fiction Writers**: For co-writing scripts or novels.  
      - **Non-Fiction Writers**: For team projects or edits.  
    - **Notes**: Enhanced with source attribution for non-fiction.

17. **Export and Publishing Options**  
    - **Description**: Customizable exports for various formats.  
    - **Users**:  
      - **Fiction Writers**: For novels or screenplays.  
      - **Non-Fiction Writers**: For articles or academic works.  
    - **Notes**: Includes genre-specific formatting options.

18. **AI-Assisted Writing Suggestions**  
    - **Description**: AI provides content or structure suggestions.  
    - **Users**:  
      - **Fiction Writers**: For plot twists or dialogue.  
      - **Non-Fiction Writers**: For summaries or arguments.  
    - **Notes**: Limited to 5 free queries/day, with premium credits.

19. **Visual Data Representation**  
    - **Description**: Graphs (e.g., D3.js) for progress, relationships, or analysis.  
    - **Users**:  
      - **Fiction Writers**: For character or plot dynamics.  
      - **Non-Fiction Writers**: For research topics or section balance.  
    - **Notes**: Shared graph types with genre-specific labels.

#### Technical and Support Features

20. **Local-First Storage with Export**  
    - **Description**: Stores data locally in SurrealDB with export options.  
    - **Users**:  
      - **Fiction Writers**: For offline writing and backups.  
      - **Non-Fiction Writers**: For secure research storage.  
    - **Notes**: Export compatibility with Obsidian.

21. **Monetization (AI Credits and Subscription)**  
    - **Description**: Free tier (Ollama), BYO API keys, and premium credits ($1 = 100 credits) or subscriptions ($2–$3/month).  
    - **Users**:  
      - **Fiction Writers**: For AI plot tools or graphing.  
      - **Non-Fiction Writers**: For fact-checking or analysis.  
    - **Notes**: Gates advanced features across genres.

---

### Summary by User Type

- **Fiction Writers** (9 unique features):  
  - Markdown Editor, Note-Taking, Outline Planning, Character Relationship Graphing, Beat Sheet Planner, Character Arc Tracker, Theme Visualizer, Conflict Progression Tracker, B Story Integration Tool.  
  - Plus 6 shared features: Text Analysis, Collaboration, Export Options, AI Suggestions, Visual Data, Local Storage.  
- **Non-Fiction Writers** (9 unique features):  
  - Markdown Editor, Note-Taking, Outline Planning, Research Management, Fact-Checking, Audience Engagement Analyzer, Collaboration with Attribution, Export and Publishing Tools, Local Storage.  
  - Plus 6 shared features: Text Analysis, Collaboration, Export Options, AI Suggestions, Visual Data, Local Storage.  
- **Overlap (6 shared features)**:  
  - Markdown Editor, Note-Taking, Outline Planning, Text Analysis, Collaboration, Export Options, AI Suggestions, Visual Data, Local Storage.

This breakdown ensures Ulysses caters to both audiences, with overlapping features providing a strong foundation and genre-specific tools adding depth. The tech stack supports all features, with SurrealDB handling data, D3.js enabling graphs, and Ollama driving AI. Let me know if you’d like to prioritize or refine any features further! (Current time: 04:58 PM AEST, June 10, 2025.)
