let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    // Prepnutie ikony na 'X' pri otvorení (boxicons má bx-x)
    menuIcon.classList.toggle('bx-x');
    // Zobrazenie menu
    navbar.classList.toggle('active');
};// JavaScript Document
const textElement = document.querySelector('.multiple-text');
// Sem môžeš dopísať akékoľvek ďalšie roly, ktoré chceš striedať
const words = ['Grafický Dizajnér', 'Web Developer', 'Python Vývojár', 'UI/UX Dizajnér'];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        // Mazanie textu
        textElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // Písanie textu
        textElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    // Rýchlosť písania (100ms) a mazania (50ms)
    let typeSpeed = isDeleting ? 50 : 100;

    // Ak dopísal celé slovo
    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000; // Čas, po ktorom slovo zostane zobrazené (2 sekundy)
        isDeleting = true;
    } 
    // Ak vymazal celé slovo
    else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length; // Prechod na ďalšie slovo
        typeSpeed = 500; // Pauza pred začatím písania nového slova
    }

    setTimeout(typeEffect, typeSpeed);
}

// Spustenie animácie po načítaní stránky
document.addEventListener('DOMContentLoaded', typeEffect);



// --- FUNKCIONALITA PRE TLAČIDLO ČÍTAŤ VIAC ---
const readMoreBtn = document.querySelector('.read-more-btn');
const moreText = document.querySelector('.more-text');

if (readMoreBtn && moreText) {
    readMoreBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Zabráni skoku stránky, ak je tlačidlo odkaz (<a>)
        
        // Prepne triedu .show na skrytom texte
        moreText.classList.toggle('show');
        
        // Zmena textu na tlačidle podľa toho, či je text zobrazený
        if (moreText.classList.contains('show')) {
            readMoreBtn.textContent = 'Čítať menej';
        } else {
            readMoreBtn.textContent = 'Čítať viac';
        }
    });
}



document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.project-card');
    const lightbox = document.getElementById('project-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');
    
    let currentIndex = 0;

    // Načítanie projektu podľa indexu
    function showProject(index) {
        const activeCard = cards[index];
        const imgSrc = activeCard.querySelector('img').src;
        const titleText = activeCard.querySelector('h3').textContent;
        
        lightboxImg.src = imgSrc;
        lightboxTitle.textContent = titleText;
        currentIndex = index;
    }

    // Naviazanie kliknutia na tlačidlá "Pozrieť projekt"
    cards.forEach((card, index) => {
        const viewBtn = card.querySelector('.btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showProject(index);
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Zákaz scrollovania webu na pozadí
            });
        }
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Povolenie scrollovania
    }

    closeBtn.addEventListener('click', closeLightbox);

    // Zatvorenie kliknutím na tmavé okolitú plochu
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Listovanie doľava
    function navigateLeft() {
        let index = currentIndex - 1;
        if (index < 0) index = cards.length - 1;
        showProject(index);
    }

    // Listovanie doprava
    function navigateRight() {
        let index = currentIndex + 1;
        if (index >= cards.length) index = 0;
        showProject(index);
    }

    prevBtn.addEventListener('click', navigateLeft);
    nextBtn.addEventListener('click', navigateRight);

    // Podpora klávesnice (Esc, Šípky)
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLeft();
        if (e.key === 'ArrowRight') navigateRight();
    });
});