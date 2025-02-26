export class Alert {
    constructor() {
    }

    show(text) {
        // TODO my own div for alerts
        const alertDiv = document.getElementById('alert');
        alertDiv.innerText = text;
        alertDiv.classList.toggle('show');
        setTimeout(() => {
            alertDiv.classList.toggle('show');
        }, 4000);
    }
}