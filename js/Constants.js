export const Constants = {
    // Screen/Rendering constants
    ZOOM_MAX: 2.2,
    ZOOM_MIN: 0.1,
    ZOOM_BTN_FACTOR: 0.4, // Zoom delta for buttons
    ZOOM_MOUSE_FACTOR: 0.2, // Zoom delta for mouse scroll
    FPS: 60,

    // Colors
    COLOR_CANVAS_BG: '#03c04a80',
    COLOR_TOWN_BORDER: '#505050',
    COLOR_ROAD: '#909090',
    COLOR_GOLD: 'gold',
    COLOR_RESIDENT: '#5adc5a', // greenish
    COLOR_COMMERCIAL: '#5a5adc', // blueish
    COLOR_FACTORY: '#dc8c3c', // darker-orange

    // Town Sizes
    SMALL_TOWN_SIZE: 2000,
    MEDIUM_TOWN_SIZE: 3000,
    LARGE_TOWN_SIZE: 5000,

    // Node Constants
    NODE_RANGE: 100, // Max range of node connections
    NODE_SIZE: 10, // Node radius
    CONNECTIONS_LIMIT: 5, // Connections limit for each node
    HAPPINESS_LIMIT: 100, // Happiness limitation
    CENTRAL_NODE_GAIN_COINS: false,
    CENTRAL_NODE_GAIN_DELAY: 4,

    // Areas / Ranges
    SHOPPING_RANGE: 160, // Initial range for resident to go shopping
    SHOPPING_CHAIN_RANGE: 60, // Next shopping hops
    RESIDENT_COMMUTE_RANGE: 240, // Resident searches for workplace here
    FACTORY_DISGUST_RANGE: 80, // Resident is disgust when close to factories
    FACTORY_DELIVERY_RANGE: 200, // Factory deliver to commercials in range

    // GameState constants
    STARTING_COINS: 100,
    COST_INCREASE_R: 10,
    COST_INCREASE_C: 20,
    COST_INCREASE_F: 20,

}