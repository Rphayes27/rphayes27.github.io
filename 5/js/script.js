
const changeButton = document.getElementById("changeThemeBtn");
const backgroundSection = document.getElementById("heroSection");

let showingSnowboarding = false;
let snowboardingData = null;

function readCards(gridId) {
    const cards = document.querySelectorAll(`#${gridId} .card`);

    return Array.from(cards, card => ({
        title: card.querySelector("h3").textContent,
        description: card.querySelector("p").textContent
    }));
}

const skiingData = {
    title: document.title,
    header: document.getElementById("styleName").textContent,
    headline: document.getElementById("heroTitle").textContent,
    description: document.getElementById("heroDesc").textContent,
    sections: {
        overview: {
            title: document.getElementById("sec1Title").textContent,
            subtitle: document.getElementById("sec1Subtitle").textContent,
            cards: readCards("sec1Grid")
        },
        equipment: {
            title: document.getElementById("sec2Title").textContent,
            subtitle: document.getElementById("sec2Subtitle").textContent,
            cards: readCards("sec2Grid")
        }
    }
};

function changeCards(gridId, cards) {
    const elements = document.querySelectorAll(`#${gridId} .card`);

    cards.forEach((card, index) => {
        if (elements[index]) {
            elements[index].querySelector("h3").textContent = card.title;
            elements[index].querySelector("p").textContent = card.description;
        }
    });
}

function changePage(data, image) {
    document.title = data.title;
    document.getElementById("styleName").textContent = data.header;
    document.getElementById("heroTitle").textContent = data.headline;
    document.getElementById("heroDesc").textContent = data.description;

    document.getElementById("sec1Title").textContent = data.sections.overview.title;
    document.getElementById("sec1Subtitle").textContent = data.sections.overview.subtitle;
    changeCards("sec1Grid", data.sections.overview.cards);

    document.getElementById("sec2Title").textContent = data.sections.equipment.title;
    document.getElementById("sec2Subtitle").textContent = data.sections.equipment.subtitle;
    changeCards("sec2Grid", data.sections.equipment.cards);

    backgroundSection.style.setProperty("--hero-img", `url("${image}")`);
}

async function changeTheme() {
    if (showingSnowboarding) {
        changePage(skiingData, "../img/alpineSki.jpeg");
        showingSnowboarding = false;
        return;
    }

    try {
        if (!snowboardingData) {
            const response = await fetch("js/boardingData.json");

            if (!response.ok) {
                throw new Error("Could not load JSON file.");
            }

            snowboardingData = await response.json();
        }

        const boardingInfo = {
            ...snowboardingData,
            headline: snowboardingData.hero.headline,
            description: snowboardingData.hero.description
        };

        changePage(boardingInfo, snowboardingData.hero.image);
        showingSnowboarding = true;

    } catch (error) {
        console.error("Error loading information:", error);
    }
}

changeButton.addEventListener("click", changeTheme);
