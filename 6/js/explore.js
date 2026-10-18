"use strict";

// Load the JSON when the explorer page is ready.
document.addEventListener("DOMContentLoaded", initializeExplorer);

// Coordinate page navigation and externally fetched animal information.
function initializeExplorer() {
    const categoryChoices = document.getElementById("category-choices");
    const interactiveContent = document.getElementById("interactive-content");
    const loadMessage = document.getElementById("load-message");
    const categoryDescriptions = {
        Mammals: "Select a mammal below to learn more about the species, the threats they face, and the efforts being made to protect them.",
        Birds: "Select a bird below to learn more about the species, the threats they face, and the efforts being made to protect them.",
        Reptiles: "Select a reptile below to learn more about the species, the threats they face, and the efforts being made to protect them.",
        Amphibians: "Select an amphibian below to learn more about the species, the threats they face, and the efforts being made to protect them."
    };
    const choiceClasses = {
        Mammals: "mammal-choice",
        Birds: "bird-choice",
        Reptiles: "reptile-choice",
        Amphibians: "amphibian-choice"
    };
    const accentClasses = {
        "black-rhino": "black-rhino-choice",
        "ground-pangolin": "pangolin-choice",
        "red-wolves": "red-wolf-choice",
        "saola": "saola-choice",
        "red-crowned-amazon": "amazon-choice",
        "california-condor": "condor-choice",
        "kakapo": "kakapo-choice",
        "kagu": "kagu-choice",
        "blue-iguana": "blue-iguana-choice",
        "central-american-river-turtle": "cart-choice",
        "darys-burrowing-snake": "dary-snake-choice",
        "red-bellied-racer": "red-belly-choice",
        "axolotl": "axolotl-choice",
        "berry-cave-salamander": "berry-cave-choice",
        "hickory-nut-gorge-green-salamander": "gorge-green-choice",
        "lemur-leaf-frog": "lemur-leaf-choice"
    };
    let animals = [];
    let hasLoaded = false;
    let loadingError = false;
    let activeCategory = null;
    let activeAnimalId = null;

    // Build a text-only status message and an optional retry button.
    function displayLoadingMessage(message, allowRetry = false) {
        loadMessage.replaceChildren();
        loadMessage.hidden = false;
        const paragraph = document.createElement("p");
        paragraph.textContent = message;
        loadMessage.append(paragraph);
        if (allowRetry) {
            const retryButton = document.createElement("button");
            retryButton.type = "button";
            retryButton.className = "retry-button";
            retryButton.textContent = "Try Loading Again";
            retryButton.addEventListener("click", loadAnimals);
            loadMessage.append(retryButton);
        }
    }

    // Fetch the external JSON and validate its basic structure before use.
    async function loadAnimals() {
        loadingError = false;
        displayLoadingMessage("Loading animal information...");
        try {
            const response = await fetch("data/animals.json");
            if (!response.ok) {
                throw new Error("Failed to load animal data.");
            }
            const data = await response.json();
            if (!data || !Array.isArray(data.animals) || data.animals.length === 0) {
                throw new Error("The animal data file has an invalid format.");
            }
            animals = data.animals;
            hasLoaded = true;
            loadMessage.hidden = true;
            if (activeAnimalId) {
                displayAnimal(activeAnimalId);
            } else if (activeCategory) {
                displayCategory(activeCategory);
            }
        } catch (error) {
            hasLoaded = false;
            loadingError = true;
            displayLoadingMessage("Animal information could not be loaded. Check your connection and try again.", true);
        }
    }

    // Create an ordinary button with a click event handler.
    function makeButton(label, className, clickHandler) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = label;
        button.addEventListener("click", clickHandler);
        return button;
    }

    // Return to the original four-category selection without reloading the page.
    function displayCategories() {
        activeCategory = null;
        activeAnimalId = null;
        interactiveContent.replaceChildren();
        interactiveContent.hidden = true;
        categoryChoices.hidden = false;
        categoryChoices.previousElementSibling.hidden = false;
        if (hasLoaded) {
            loadMessage.hidden = true;
        }
    }

    // After step one, replace the category choices with that category's four animals.
    function displayCategory(category) {
        if (!Object.hasOwn(categoryDescriptions, category)) {
            return;
        }
        activeCategory = category;
        activeAnimalId = null;
        categoryChoices.hidden = true;
        categoryChoices.previousElementSibling.hidden = true;
        interactiveContent.hidden = false;
        interactiveContent.replaceChildren();

        const actions = document.createElement("div");
        actions.className = "stage-actions";
        actions.append(makeButton("← All Categories", "stage-back", displayCategories));
        interactiveContent.append(actions);

        const headingSection = document.createElement("section");
        headingSection.className = "category-introduction";
        const heading = document.createElement("h1");
        heading.textContent = category;
        const description = document.createElement("p");
        description.textContent = categoryDescriptions[category];
        headingSection.append(heading, description);
        interactiveContent.append(headingSection);

        if (!hasLoaded) {
            displayLoadingMessage(loadingError ? "Animal information could not be loaded. Try again below." : "Loading animal information...", loadingError);
            return;
        }

        loadMessage.hidden = true;
        const speciesGrid = document.createElement("section");
        speciesGrid.className = "animal-choice-cards";
        speciesGrid.setAttribute("aria-label", "Choose an animal");
        animals.filter(animal => animal.category === category).forEach(animal => {
            const card = makeButton("", "animal-choice-card " + (accentClasses[animal.id] || choiceClasses[category]), () => displayAnimal(animal.id));
            const animalName = document.createElement("h2");
            animalName.textContent = animal.name;
            const teaser = document.createElement("p");
            teaser.textContent = animal.teaser;
            card.append(animalName, teaser);
            speciesGrid.append(card);
        });
        interactiveContent.append(speciesGrid);
    }

    // Display animal information stored as text lines or as original HTML.
    function insertAnimalParagraph(section, content) {
        if (Array.isArray(content)) {
            const paragraph = document.createElement("p");
            paragraph.textContent = content.join(" ");
            section.append(paragraph);
        } else if (typeof content === "string") {
            const container = document.createElement("div");
            container.innerHTML = content;
            section.append(...container.childNodes);
        } else {
            const paragraph = document.createElement("p");
            paragraph.textContent = "Information is currently unavailable.";
            section.append(paragraph);
        }
    }

    // After step two, display all information for the selected animal on this same page.
    function displayAnimal(id) {
        const animal = animals.find(entry => entry.id === id);
        if (!animal) {
            return;
        }
        activeCategory = animal.category;
        activeAnimalId = id;
        categoryChoices.hidden = true;
        categoryChoices.previousElementSibling.hidden = true;
        loadMessage.hidden = true;
        interactiveContent.hidden = false;
        interactiveContent.replaceChildren();

        const actions = document.createElement("div");
        actions.className = "stage-actions";
        actions.append(
            makeButton("← " + animal.category, "stage-back", () => displayCategory(animal.category)),
            makeButton("All Categories", "stage-back", displayCategories)
        );
        interactiveContent.append(actions);

        const banner = document.createElement("section");
        banner.className = "animal-image-section";
        const image = document.createElement("img");
        image.className = "animal-image";
        image.src = animal.image;
        image.alt = animal.imageAlt;
        const titleOverlay = document.createElement("div");
        titleOverlay.className = "animal-title";
        const title = document.createElement("h1");
        title.textContent = animal.name;
        titleOverlay.append(title);
        banner.append(image, titleOverlay);
        interactiveContent.append(banner);

        const information = document.createElement("div");
        information.className = "animal-information";
        Object.entries(animal.colors).forEach(([label, color]) => {
            information.style.setProperty("--" + label + "-color", color);
        });
        const intro = document.createElement("section");
        intro.className = "animal-introduction";
        insertAnimalParagraph(intro, animal.introduction);
        information.append(intro);

        animal.sections.forEach(sectionData => {
            const section = document.createElement("section");
            section.className = "animal-" + sectionData.heading.toLowerCase() + "-card";
            const subheading = document.createElement("h2");
            subheading.textContent = sectionData.heading;
            section.append(subheading);
            insertAnimalParagraph(section, sectionData.text ?? sectionData.html);
            information.append(section);
        });
        const sources = document.createElement("section");
        sources.className = "animal-sources";
        const sourcesHeading = document.createElement("h2");
        sourcesHeading.textContent = "Sources";
        const sourceList = document.createElement("ul");
        animal.sources.forEach(source => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = source.url;
            link.textContent = source.name;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            item.append(link);
            sourceList.append(item);
        });
        sources.append(sourcesHeading, sourceList);
        information.append(sources);
        interactiveContent.append(information);
        interactiveContent.scrollIntoView({behavior: "auto", block: "start"});
    }

    // Attach category click events once, even before data has finished loading.
    categoryChoices.querySelectorAll("[data-category]").forEach(button => {
        button.addEventListener("click", () => displayCategory(button.dataset.category));
    });
    loadAnimals();
}
