# [Odkaz na hru](https://kaj-sytnyart-36dd05.pages.fel.cvut.cz/)

# Coin Town

Coin Town is a browser-based city-building simulation game in which the player places three types of buildings on a canvas map and manages a simple economic flow of residents, shops, and factories. The goal is to grow population and income by balancing housing, employment, production, and trade.

## About this project

- Built the game simulation loop and building interaction logic.
- Designed canvas-based map controls with zoom, pan, and drag-and-drop placement.
- Added save/load management with LocalStorage, import/export JSON support, and offline-aware UI behavior.

## Features

- Place residential, commercial, and factory buildings on a movable canvas map.
- Simulate residents finding jobs, buying products, and reacting to workplace/shop availability.
- Save and load game states using multiple slots stored in LocalStorage.
- Export and import save files as JSON.
- Support audio toggle, help overlay, restart, and speed controls.
- Offline detection disables random city-name generation and displays an offline indicator.

## Technologies

- HTML
- CSS
- JavaScript (ES modules)
- Canvas API
- jQuery
- LocalStorage
- Web Audio API

## Running locally

1. Open the project root in a browser, or serve it from a local static server.
2. If you have Python installed, run from the repository directory:

   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000/` in your browser.
4. Alternatively, open `index.html` directly in a browser.

## Project context

Created as a university project at ČVUT, Coin Town is a frontend-only prototype that demonstrates interactive browser-based game mechanics, state management, and modular JavaScript architecture. The code is organized as a single-page application with no backend server or database.

## Screenshots and documentation

The repository includes visual documentation in `docs/screenshots/` showcasing key gameplay and UI features:

- `animated_simulation.png` — gameplay simulation view and node animations.
- `placement.png` — building placement and valid placement indicators.
- `zoom_and_drag.png` — canvas pan and zoom controls.
- `create_new_save.png` — saving a new game state.
- `save_upload_download.png` — import/export save flow.
- `help_text.png` — in-game help overlay.

## Notes

- The app uses `index.html`, `styles.css`, and JavaScript modules under `js/`.
- Save state is persisted in browser LocalStorage and can be exported/imported as JSON.
- The game includes a help dialog, audio controls, and speed controls for simulation pacing.
- Random town-name generation uses an external API when the browser is online.

