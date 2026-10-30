function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active-view');
    });
    document.getElementById(viewId).classList.add('active-view');
    window.scrollTo(0, 0);
}

function sendWhatsAppOrder() {
    var name = document.getElementById('cust-name').value;
    var addr = document.getElementById('cust-addr').value;
    var phone = document.getElementById('cust-phone').value;

    if(!name || !addr || !phone) {
        alert('कृपया अपने डिलीवरी का नाम, पता और फोन नंबर भरें!');
        return;
    }

    var message = "Hello SOMACA, I want to place an order:%0A%0A*Product:* Botanical Facial Kit (₹199)%0A*Name:* " + encodeURIComponent(name) + "%0A*Address:* " + encodeURIComponent(addr) + "%0A*Phone:* " + encodeURIComponent(phone);
    
    // अपना WhatsApp नंबर यहाँ डालें (91 के साथ)
    var whatsappUrl = "https://wa.me/91XXXXXXXXXX?text=" + message;
    window.open(whatsappUrl, '_blank');
}