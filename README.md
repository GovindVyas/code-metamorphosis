Title: Code Metamorphosis - GitHub Repository Visualization Tool

Description:
A web application that visualizes GitHub repository evolution through an organic, interactive visualization. The app transforms repository data into living, breathing visual elements where code and its changes are represented as growing organisms.

Core Features:
1. GitHub Repository Input
- Input field for GitHub repository URL
- Parsing and validation of repository URLs
- Error handling for invalid URLs

2. Data Visualization
- Interactive D3.js visualization showing repository structure
- Different colored nodes representing various file types
- Size of nodes based on file changes/activity
- Smooth animations for transitions
- Force-directed graph layout
- Zoom and pan capabilities

3. Time Travel
- Slider control to move through repository history
- Date display showing current timeline position
- Smooth transitions between states
- Real-time updates of visualization

4. Repository Analytics
- File type distribution
- Commit frequency
- Code growth over time
- Active files and directories

Technical Requirements:

1. Frontend:
- React (Create React App)
- D3.js for visualizations
- Framer Motion for animations
- Tailwind CSS for styling

2. API Integration:
- GitHub REST API
- Axios for API calls

3. State Management:
- React Query for API data caching
- React hooks for local state

4. Performance:
- Debounced/throttled events
- Memoized calculations
- Optimized D3 rendering

Component Structure:
1. App.js (Main container)
2. components/
   - RepoInput.js
   - VisualizationArea.js
   - TimeTravel.js
   - ControlPanel.js
3. utils/
   - githubAPI.js
   - dataTransformers.js
   - animations.js

Styling:
- Use Tailwind CSS
- Dark/Light mode support
- Responsive design
- Smooth transitions
- Professional, clean UI
