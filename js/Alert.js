export class Alert {

    show(text) {
        const alertDiv = document.getElementById('alert');
        alertDiv.innerText = text;
        alertDiv.classList.toggle('show');
        setTimeout(() => {
            alertDiv.classList.toggle('show');
        }, 4000);
    }
}