# Mastermind Code Breaker

A beautiful, responsive web-based implementation of the classic Mastermind game with an intelligent hint system.

## Features

- **Beautiful UI**: Stunning gradient design with smooth animations
- **Intelligent Hints**: Advanced logic-based hint system that analyzes your attempts and provides strategic guidance
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Statistics Tracking**: Keeps track of your games, average attempts, and best scores
- **Keyboard Support**: Use number keys 1-6 to select colors, Enter to submit
- **Local Storage**: Your statistics are saved automatically

## How to Play

1. The computer generates a secret code of 4 colored pegs
2. You have 10 attempts to guess the correct colors and positions
3. After each guess, you receive feedback:
   - **Black peg**: Correct color in the correct position
   - **White peg**: Correct color but in the wrong position
4. Use the hint system when you're stuck for logical analysis of your attempts

## Deployment

### Quick Start (Local Development)

1. Open `index.html` directly in your browser, or
2. Use npm to run a local server:
   ```bash
   npm install
   npm start
   ```
   Then visit http://localhost:3000

### Deploy to Vercel (Recommended)

1. Create a [Vercel account](https://vercel.com) (free)
2. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Deploy:
   ```bash
   vercel
   ```
4. Follow the prompts - Vercel will automatically detect the settings and deploy your game

### Alternative Deployment Options

You can also deploy this static site to:
- **GitHub Pages**: Push to a GitHub repo and enable Pages in settings
- **Netlify**: Drag and drop the folder to [Netlify](https://netlify.com)
- **Surge.sh**: Run `npx surge` in the project directory

## Files Structure

- `index.html` - Main HTML structure
- `styles.css` - All styling and animations
- `script.js` - Game logic and hint system
- `package.json` - Node.js configuration
- `vercel.json` - Vercel deployment configuration

## Game Controls

- **Mouse**: Click colors to select, click slots to place
- **Keyboard**: 
  - `1-6`: Select colors
  - `Enter`: Submit guess
- **Buttons**:
  - `Get Hint`: Receive logical analysis of your attempts
  - `New Game`: Start a fresh game
  - `Rules`: View game instructions

## Technical Details

- Pure JavaScript (no frameworks required)
- CSS3 animations and gradients
- LocalStorage for statistics persistence
- Mobile-responsive design
- Zero external dependencies for production

Enjoy breaking codes!
