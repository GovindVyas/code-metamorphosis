# Code Metamorphosis - GitHub Repository Visualization Tool

A web application that visualizes GitHub repository evolution through an organic, interactive visualization. The app transforms repository data into living, breathing visual elements where code and its changes are represented as growing organisms.

## Features

### 1. GitHub Repository Input
- Input field for GitHub repository URL
- Parsing and validation of repository URLs
- Error handling for invalid URLs
- Support for public repositories
- Real-time validation feedback

### 2. Data Visualization
- Interactive D3.js visualization showing repository structure
- Different colored nodes representing various file types
- Size of nodes based on file changes/activity
- Smooth animations for transitions
- Force-directed graph layout
- Zoom and pan capabilities
- Tooltips with file information
- Click interactions for detailed view

### 3. Time Travel
- Slider control to move through repository history
- Date display showing current timeline position
- Smooth transitions between states
- Real-time updates of visualization
- Play/pause functionality
- Speed control for animations

### 4. Repository Analytics
- File type distribution
- Commit frequency
- Code growth over time
- Active files and directories
- Contributor statistics
- Commit patterns
- Language distribution

## Technical Stack

### Frontend
- React 18 (Create React App)
- TypeScript for type safety
- D3.js v7 for visualizations
- Framer Motion for animations
- Tailwind CSS for styling
- Lucide React for icons
- React Query for data management

### API Integration
- GitHub REST API v3
- Axios for API calls
- Rate limiting handling
- Error management

### State Management
- React Query for API data caching
- React hooks for local state
- Context API for theme management

### Performance Optimizations
- Debounced/throttled events
- Memoized calculations
- Optimized D3 rendering
- Lazy loading of components
- Code splitting

### Styling
- Tailwind CSS with custom configuration
- Dark/Light mode support
- Responsive design for all devices
- Smooth transitions
- Professional, clean UI
- Accessible color schemes

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/GovindVyas/code-metamorphosis.git
```
2. Install dependencies:
```bash
cd code-metamorphosis
npm install
```
3. Create a `.env` file with your GitHub token:
```env
REACT_APP_GITHUB_TOKEN=your_token_here
```
4. Start the development server:
```bash
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built during the GitHub 1-day challenge
- Inspired by organic visualization techniques
- Thanks to the D3.js and React communities

## Author

Govind Vyas
- GitHub: [@GovindVyas](https://github.com/GovindVyas)