
import { ControllerManager } from './ControllerManager.js';
import { Alert } from './Alert.js';
import './utils.js';

window.onload = () => {
    window.alert = new Alert();
    const app = new ControllerManager();
    app.init();
}