
import { App } from './App.js';
import { Alert } from './Alert.js';
import './utils.js';

window.onload = () => {
    const alert = new Alert();
    window.alert = alert;
    const app = new App();
    window.app = app; // TODO - for tests
    app.init();
}