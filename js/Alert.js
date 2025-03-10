import { removeItem } from "./utils.js";

export class Alert {
    constructor() {
        this.wrapper = document.getElementById('alert-wrapper');
        this.messages = [];
        this.maxMessages = 5;
        this.displayTime = 4000;
    }

    info(text) {
        this.showMessage(text, 'info');
    }

    success(text) {
        this.showMessage(text, 'success');
    }

    error(text) {
        this.showMessage(text, 'error');
    }

    showMessage(text, type) {
        if (this.messages.length >= this.maxMessages) {
            this.removeMessage(this.messages[0]);
        }

        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', type);
        alertDiv.innerText = text;

        this.wrapper.appendChild(alertDiv);
        this.messages.push(alertDiv);

        setTimeout(() => {
            this.removeMessage(alertDiv);
        }, this.displayTime);
    }

    removeMessage(alertDiv) {
        alertDiv.classList.add('fade-out');
        setTimeout(() => {
            this.wrapper.removeChild(alertDiv);
            this.messages = removeItem(this.messages, alertDiv);
        }, 300);
    }
}