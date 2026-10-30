// Particle Canvas Animation
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.5 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(232, 200, 114, ${p.alpha})`; // Gold dust effect
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

document.addEventListener('DOMContentLoaded', initParticles);

function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active-view');
    });
    document.getElementById(viewId).classList.add('active-view');
    window.scrollTo(0, 0);
}

function toggleAuth(type) {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-section').forEach(sec => sec.style.display = 'none');

    if (type === 'signin') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('signin-section').style.display = 'block';
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('signup-section').style.display = 'block';
    }
}

// Scroll Reveal Animation Observer
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });
});

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