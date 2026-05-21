// #region Global variables and configuration

const overrideResponse = await fetch("/assets/data/override-tags.json");
const overrideTags = await overrideResponse.json();
const response = await fetch("/assets/data/icons.json");
const iconsData = await response.json();
const version = iconsData.version;
const icons = iconsData.icons;
addOverrideTags();
const styles = getUniqueStyles();
const categories = getUniqueCategories();

const brandCategory = "brand";
const defaultStyle = "outline";

const resultsPerPage = 100;
let currentPage = 1;
let results = JSON.parse(JSON.stringify(icons));

let colorValue = "currentColor";

const exportOptions = [
    {
        name: "SVG",
        getValue: getSvgForExport,
        displayValue: false,
        allowDownload: true,
        fileExtension: "svg"
    },
    {
        name: "Hex",
        getValue: getHexForExport,
        displayValue: true,
        allowDownload: false
    },
    {
        name: "HTML Char",
        getValue: getHtmlCharacterForExport,
        displayValue: true,
        allowDownload: false
    },
    {
        name: "HTML Classes",
        getValue: getHtmlClassesForExport,
        displayValue: true,
        allowDownload: false
    },
    {
        name: "Webfont Element",
        getValue: getWebfontElementForExport,
        displayValue: false,
        allowDownload: false
    },
    {
        name: "React Name",
        getValue: getReactNameForExport,
        displayValue: true,
        allowDownload: false
    },
    {
        name: "React Element",
        getValue: getReactElementForExport,
        displayValue: false,
        allowDownload: false
    },
    {
        name: "Icon Name",
        getValue: getIconNameForExport,
        displayValue: true,
        allowDownload: false
    },
    {
        name: "Data URI",
        getValue: getDataUriForExport,
        displayValue: false,
        allowDownload: false
    },
    {
        name: "Base64 Data URI",
        getValue: getBase64DataUriForExport,
        displayValue: false,
        allowDownload: false
    }
];

const storageKeys = {
    preferences: {
        theme: "preferences.theme"
    },
    export: {
        format: "export.format",
        strokeWidth: "export.strokeWidth",
        color: "export.color",
        whitespace: "export.whitespace",
        styles: "export.styles",
        xmlns: "export.xmlns",
        iconClass: "export.iconClass",
        tablerClasses: "export.tablerClasses",
        customClassesEnabled: "export.customClassesEnabled",
        customClasses: "export.customClasses"
    }
}

/*
Example icon object structure:
{
    "name": "accessible",
    "category": "health",
    "tags": [
        "low-vision",
        "blind",
        "disability",
        "handicapped",
        "accessible",
        "accessibility",
        "inclusive",
        "barrier-free"
    ],
    "styles": {
        "outline": {
            "version": "1.4",
            "unicode": "eba9",
            "svg": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" />\n  <path d=\"M10 16.5l2 -3l2 3m-2 -3v-2l3 -1m-6 0l3 1\" />\n  <path d=\"M11.5 7.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0\" fill=\"currentColor\" />\n</svg>"
        },
        "filled": {
            "version": "2.3",
            "unicode": "f6ea",
            "svg": "<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"currentColor\"\n>\n  <path d=\"M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.051 6.844a1 1 0 0 0 -1.152 -.663l-.113 .03l-2.684 .895l-2.684 -.895l-.113 -.03a1 1 0 0 0 -.628 1.884l.109 .044l2.316 .771v.976l-1.832 2.75l-.06 .1a1 1 0 0 0 .237 1.21l.1 .076l.101 .06a1 1 0 0 0 1.21 -.237l.076 -.1l1.168 -1.752l1.168 1.752l.07 .093a1 1 0 0 0 1.653 -1.102l-.059 -.1l-1.832 -2.75v-.977l2.316 -.771l.109 -.044a1 1 0 0 0 .524 -1.221zm-3.949 -4.184a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0 -3\" />\n</svg>"
        }
    }
}
*/

// #endregion

// #region DOM element references

const tablerIconsVersionElement = document.getElementById("tabler-icons-version");

const searchInput = document.getElementById("search-input");
const styleFilter = document.getElementById("style-filter");
const categoryFilter = document.getElementById("category-filter");
const brandFilter = document.getElementById("brand-filter");
const resultsContainer = document.getElementById("results");

const pagination = document.getElementById("pagination");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const pageStatus = document.getElementById("page-status");

const detailsModal = document.getElementById("details-modal");
const detailsCloseButton = document.getElementById("details-close-button");
const detailsModalBackground = document.getElementById("details-modal-background");
const detailsIcon = document.getElementById("details-icon");
const detailsName = document.getElementById("details-name");
const detailsCategory = document.getElementById("details-category");
const detailsVersion = document.getElementById("details-version");
const detailsTags = document.getElementById("details-tags");
const detailsLink = document.getElementById("details-link");

const exportFormat = document.getElementById("export-format");
const copyButton = document.getElementById("copy-button");
const downloadButton = document.getElementById("download-button");

const exportStyle = document.getElementById("export-style");
const exportStrokeWidthContainer = document.getElementById("export-stroke-width-container");
const exportStrokeWidth = document.getElementById("export-stroke-width");
const exportStrokeWidthOutput = document.getElementById("export-stroke-width-output");
const exportColor = document.getElementById("export-color");
const exportColorValue = document.getElementById("export-color-value");
const exportColorReset = document.getElementById("export-color-reset");

const exportSvgOptionsContainer = document.getElementById("export-svg-options-container");
const exportSvgWhitespace = document.getElementById("export-svg-whitespace");
const exportSvgStyles = document.getElementById("export-svg-styles");
const exportSvgXmlns = document.getElementById("export-svg-xmlns");
const exportSvgIconClass = document.getElementById("export-svg-icon-class");
const exportSvgTablerClasses = document.getElementById("export-svg-tabler-classes");
const exportSvgCustomClassesEnabled = document.getElementById("export-svg-custom-classes-enabled");
const exportSvgCustomClassesContainer = document.getElementById("export-svg-custom-classes-container");
const exportSvgCustomClasses = document.getElementById("export-svg-custom-classes");

// #endregion

// #region Initialization

// Update the Tabler Icons version in the footer
if (tablerIconsVersionElement) {
    if (version) {
        tablerIconsVersionElement.textContent = version;
    } else {
        tablerIconsVersionElement.textContent = "ERROR";
        console.error("Version not found in icons.json");
    }
}

// Initialize style filter options
styles.forEach(style => {
    const option = document.createElement("option");
    option.value = style;
    option.textContent = capitalize(style);
    styleFilter.appendChild(option);
});

// Initialize category filter options
categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = capitalize(category);
    categoryFilter.appendChild(option);
});

// Initialize event listeners
detailsModalBackground.addEventListener("click", hideDetails);
detailsCloseButton.addEventListener("click", hideDetails);
searchInput.addEventListener("input", searchIcons);
styleFilter.addEventListener("change", searchIcons);
categoryFilter.addEventListener("change", searchIcons);
brandFilter.addEventListener("change", searchIcons);
previousButton.addEventListener("click", (() => goToPage(currentPage - 1, true)));
nextButton.addEventListener("click", (() => goToPage(currentPage + 1, true)));

window.addEventListener("popstate", () => {
    init();
});

// Initialize results
init();

/**
 * Initializes the page by applying search and page state from the URL and updating the search results. This is called on page load and when navigating with the back and forward buttons to ensure the UI reflects the state in the URL.
 */
function init() {
    applySearchStateFromUrl();
    searchIcons(false);
    applyPageStateFromUrl();
}

// #endregion

// #region Search and display - these functions manage the searching, filtering, scoring, and displaying of icons based on user input and selected filters

/**
 * Updates and displays the search results based on the current filters and query. This function is called whenever the search input or any of the filters change. It updates the URL with the current search parameters, resets to the first page of results if necessary, applies the selected filters, scores the results based on how well they match the query, and then displays the results.
 * @param {boolean} changePage If the page should be reset to 1 when performing the search. This should be true when the search query or filters change, but false when just updating the results without changing the search parameters (e.g. on page load or when navigating with back/forward buttons). Defaults to true.
 */
function searchIcons(changePage = true) {
    addSearchToUrl();

    // Reset to first page on new search
    if (changePage) {
        currentPage = 1;
        addPageToUrl(false);
    }

    // Reset results before applying filters and scoring
    results = JSON.parse(JSON.stringify(icons));

    // Add base score to maintain original order for icons with the same score
    results.forEach((icon, index) => {
        // Supports up to 100,000 icons
        icon.score = 1 - (index * 0.00001);
    });

    // Filter out icons that don't match the selected style
    const selectedStyle = styleFilter.value;
    if (selectedStyle) {
        results = results.filter(icon => icon.styles && icon.styles[selectedStyle]);
    }

    // Filter out icons that don't match the selected category
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
        results = results.filter(icon => icon.category === selectedCategory);
    }

    // If the brand filter is checked, filter out icons in the "Brand" category
    const isBrandFilterChecked = brandFilter.checked;
    if (isBrandFilterChecked) {
        results = results.filter(icon => icon.category !== brandCategory);
    }

    // Score each icon based on how well it matches the query
    const query = searchInput.value;
    const lowerQueryParts = query.toLowerCase().split(" ").filter(part => part);
    lowerQueryParts.forEach(part => {
        results.forEach(icon => {
            let score = icon.score || 0;
            if (score < 0) {
                // Skip icons that have already been marked as not matching
                return;
            }

            let isMatch = false;

            // Check name
            let allPartsAreExactMatches = true;

            let nameParts = [];
            if (part.includes("-") && part !== "-") {
                nameParts = [icon.name];
            } else {
                nameParts = icon.name.split("-");
            }

            nameParts.forEach(namePart => {
                if (namePart === part) {
                    // Exact match in name
                    score += 10000;
                    isMatch = true;
                } else if (namePart.includes(part)) {
                    // Partial match in name
                    score += 1000;
                    isMatch = true;
                    allPartsAreExactMatches = false;
                } else {
                    allPartsAreExactMatches = false;
                }
            });

            if (allPartsAreExactMatches) {
                // Bonus for all parts of the query being exact matches in the name
                score += 50000;
            }

            // Check tags
            icon.tags.forEach(tag => {
                let tagParts = [];
                if (part.includes("-") && part !== "-") {
                    tagParts = [tag];
                } else if (tag === "-") {
                    tagParts = [tag];
                } else {
                    tagParts = tag.split("-");
                }

                tagParts.forEach(tagPart => {
                    if (tagPart === part) {
                        // Exact match in tag
                        score += 20;
                        isMatch = true;
                    } else if (tagPart.includes(part)) {
                        // Partial match in tag
                        score += 10;
                        isMatch = true;
                    }
                });
            });
            icon.overrideTags?.forEach(tag => {
                let tagParts = [];
                if (part.includes("-") && part !== "-") {
                    tagParts = [tag];
                } else if (tag === "-") {
                    tagParts = [tag];
                } else {
                    tagParts = tag.split("-");
                }

                tagParts.forEach(tagPart => {
                    if (tagPart === part) {
                        // Exact match in tag
                        score += 20;
                        isMatch = true;
                    } else if (tagPart.includes(part)) {
                        // Partial match in tag
                        score += 10;
                        isMatch = true;
                    }
                });
            });

            // Check category
            if (icon.category.toLowerCase() === part) {
                // Exact match in category
                score += 3;
                isMatch = true;
            } else if (icon.category.toLowerCase().includes(part)) {
                // Partial match in category
                score += 2;
                isMatch = true;
            }

            if (isMatch === false) {
                // Filter out icons that don't match a part of the query
                score = -1;
            }

            icon.score = score;
        });
    });

    // Filter out icons that don't match
    results = results.filter(icon => icon.score > 0);

    // Search for alternate icons (e.g. "ghost", "ghost-2", and "ghost-3")
    results.forEach(icon => {
        const regex = /^(.*)-(\d+)$/;
        const match = icon.name.match(regex);
        if (match) {
            const baseName = match[1];
            const alternateNumber = parseInt(match[2], 10);

            const baseIcon = results.find(i => i.name === baseName);
            if (baseIcon) {
                // Make this alternate icon show up right after the base icon
                icon.score = (baseIcon.score || 0) - (alternateNumber * 0.00000001);
            }
        }
    });

    // Sort results by score
    results.sort((a, b) => b.score - a.score);

    showResults();
}

/**
 * Displays the search results based on the current filters and query. This function is called after the results have been scored and filtered.
 */
function showResults() {
    const displayResults = getDisplayResults();

    if (displayResults.length === 0) {
        showNoResults();
        return;
    }

    resultsContainer.innerHTML = "";

    let pageResults;
    if (displayResults.length <= resultsPerPage) {
        pageResults = displayResults;
    } else {
        const start = (currentPage - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        pageResults = displayResults.slice(start, end);
    }

    pageResults.forEach(result => {
        // Create a result item element
        // <button type="button" class="result-item tooltip-hover-container" aria-label="{Icon Name} Icon">
        //     <svg class="icon icon-{Icon Style}" viewBox="0 0 24 24">...</svg>
        //     <div class="tooltip">{Icon Name}</div>
        // </button>
        const resultItem = document.createElement("button");
        resultItem.type = "button";
        resultItem.classList.add("result-item");
        resultItem.classList.add("tooltip-hover-container");
        resultItem.setAttribute("aria-label", `${result.displayName} Icon`);

        resultItem.innerHTML = prepareSvgForDisplay(result.svg, result.style);

        resultItem.addEventListener("click", () => showDetails(result.icon, result.style));

        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.textContent = result.displayName;
        resultItem.appendChild(tooltip);

        resultsContainer.appendChild(resultItem);
    });

    // Update pagination buttons
    updatePaginationButtons();
}

/**
 * Displays a "No results found" message. This function is called by showResults() when the filtered and scored results array is empty.
 */
function showNoResults() {
    resultsContainer.innerHTML = "";
    const noIconsMessage = document.createElement("div");
    noIconsMessage.textContent = "No results found.";
    noIconsMessage.style.gridColumn = "1 / -1";
    resultsContainer.appendChild(noIconsMessage);

    updatePaginationButtons();
}

/**
 * Converts the results array into a format suitable for display by separating each style of an icon into its own item and adding a display name that includes the style if it's not the default style.
 * @returns {Array} An array of objects representing the displayable results, each containing the display name, SVG, style, and original icon object.
 */
function getDisplayResults() {
    if (results.length === 0) {
        return [];
    }

    const items = [];
    results.forEach(icon => {
        const styles = styleFilter.value ? [styleFilter.value] : Object.keys(icon.styles);
        styles.forEach(style => {
            if (icon.styles[style]) {
                items.push({
                    displayName: style === defaultStyle ? icon.name : `${icon.name} (${style})`,
                    svg: icon.styles[style].svg,
                    style: style,
                    icon: icon
                });
            }
        });
    });

    return items;
}

/**
 * Prepares an SVG string for display by removing inline styles and adding a class for CSS styling.
 * @param {string} svg The SVG string to prepare.
 * @param {string} style The style of the icon.
 * @returns {string} The prepared SVG string.
 */
function prepareSvgForDisplay(svg, style) {
    // Remove inline styles
    let preparedSvg = svg;
    preparedSvg = removeXmlnsFromSvg(preparedSvg);

    // Add class for CSS styling
    preparedSvg = preparedSvg.replace("<svg", `<svg class="icon icon-${style}"`);

    return preparedSvg;
}

// #endregion

// #region Details modal - these functions manage the display of the details modal, including showing it, hiding it, and responding to user interactions within it

/**
 * Populates and shows the details modal for a given icon and style.
 * @param {Icon} icon The icon object to show details for.
 * @param {string} style The style of the icon to show details for (e.g. "outline", "filled", etc.). This is used to determine which SVG to display and which metadata to show in the modal.
 */
function showDetails(icon, style) {
    // Icon
    detailsIcon.innerHTML = prepareSvgForDisplay(icon.styles[style].svg, style);

    // Metadata
    detailsName.textContent = icon.name;

    detailsCategory.textContent = capitalize(icon.category);
    detailsVersion.textContent = `v${icon.styles[style].version}`;

    detailsTags.innerHTML = "";
    icon.tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.classList.add("tag");
        tagElement.textContent = tag;
        detailsTags.appendChild(tagElement);
    });

    detailsLink.href = `https://tabler.io/icons/icon/${icon.name}`;

    // Format
    exportFormat.innerHTML = "";
    exportOptions.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.name;
        
        if (option.displayValue) {
            optionElement.textContent = `${option.name} (${option.getValue(icon, style)})`;
        } else {
            optionElement.textContent = option.name;
        }

        exportFormat.appendChild(optionElement);
    });

    exportFormat.value = localStorage.getItem(storageKeys.export.format) || exportOptions[0].name;
    onFormatChange();

    exportFormat.onchange = onFormatChange;

    // Copy and download buttons
    copyButton.onclick = () => {
        const selectedOption = exportOptions.find(option => option.name === exportFormat.value);
        if (selectedOption) {
            const value = selectedOption.getValue(icon, style);
            copyToClipboard(value);

            // Show tooltip
            copyButton.classList.add("show-tooltip");
            setTimeout(() => {
                copyButton.classList.remove("show-tooltip");
            }, 1000);
        }
    };

    downloadButton.onclick = () => {
        const selectedOption = exportOptions.find(option => option.name === exportFormat.value);
        if (selectedOption && selectedOption.allowDownload) {
            const value = selectedOption.getValue(icon, style);
            const filename = `${getReactNameForExport(icon, style)}.${selectedOption.fileExtension}`;
            downloadFile(filename, value);

            // Show tooltip
            downloadButton.classList.add("show-tooltip");
            setTimeout(() => {
                downloadButton.classList.remove("show-tooltip");
            }, 1000);
        }
    };

    // Style
    const existingStyles = icon.styles ? Object.keys(icon.styles) : [];

    exportStyle.innerHTML = "";
    const legend = document.createElement("legend");
    legend.textContent = "Style";
    exportStyle.appendChild(legend);

    if (existingStyles.length <= 1) {
        exportStyle.style.display = "none";
    } else {
        exportStyle.style.display = "";

        existingStyles.forEach(existingStyle => {
            const label = document.createElement("label");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "style";
            radio.value = existingStyle;
            radio.checked = existingStyle === style;
            radio.onchange = () => {
                if (radio.checked) {
                    const newStyle = radio.value;
                    showDetails(icon, newStyle);
                }
            };
            label.appendChild(radio);
            label.appendChild(document.createTextNode(` ${capitalize(existingStyle)}`));
            exportStyle.appendChild(label);
        });
    }

    // Stroke width
    if (icon.styles[style].svg.includes('stroke-width="')) {
        exportStrokeWidthContainer.style.display = "";
    } else {
        exportStrokeWidthContainer.style.display = "none";
    }

    const previewSvg = detailsIcon.querySelector("svg");
    exportStrokeWidth.value = localStorage.getItem(storageKeys.export.strokeWidth) || "2";
    exportStrokeWidthOutput.textContent = exportStrokeWidth.value;
    previewSvg.style.strokeWidth = exportStrokeWidth.value;
    exportStrokeWidth.oninput = () => {
        exportStrokeWidthOutput.textContent = exportStrokeWidth.value;
        previewSvg.style.strokeWidth = exportStrokeWidth.value;
        localStorage.setItem(storageKeys.export.strokeWidth, exportStrokeWidth.value);
    };

    // Color
    const savedColor = localStorage.getItem(storageKeys.export.color) || "currentColor";
    setColor(savedColor);

    exportColor.oninput = () => {
        setColor(exportColor.value);
    };

    exportColorReset.onclick = () => {
        setColor("currentColor");
    };

    // SVG export options
    exportSvgWhitespace.checked = localStorage.getItem(storageKeys.export.whitespace) === "true";
    exportSvgWhitespace.onchange = () => {
        localStorage.setItem(storageKeys.export.whitespace, exportSvgWhitespace.checked);
    };

    exportSvgStyles.checked = localStorage.getItem(storageKeys.export.styles) === "true";
    exportSvgStyles.onchange = () => {
        localStorage.setItem(storageKeys.export.styles, exportSvgStyles.checked);
    };

    exportSvgXmlns.checked = localStorage.getItem(storageKeys.export.xmlns) === "true";
    exportSvgXmlns.onchange = () => {
        localStorage.setItem(storageKeys.export.xmlns, exportSvgXmlns.checked);
    };

    exportSvgIconClass.checked = localStorage.getItem(storageKeys.export.iconClass) === "true";
    exportSvgIconClass.onchange = () => {
        localStorage.setItem(storageKeys.export.iconClass, exportSvgIconClass.checked);
    };

    exportSvgTablerClasses.checked = localStorage.getItem(storageKeys.export.tablerClasses) === "true";
    exportSvgTablerClasses.onchange = () => {
        localStorage.setItem(storageKeys.export.tablerClasses, exportSvgTablerClasses.checked);
    };

    exportSvgCustomClassesEnabled.checked = localStorage.getItem(storageKeys.export.customClassesEnabled) === "true";
    exportSvgCustomClassesContainer.style.display = exportSvgCustomClassesEnabled.checked ? "" : "none";
    exportSvgCustomClassesEnabled.onchange = () => {
        localStorage.setItem(storageKeys.export.customClassesEnabled, exportSvgCustomClassesEnabled.checked);
        exportSvgCustomClassesContainer.style.display = exportSvgCustomClassesEnabled.checked ? "" : "none";
    };

    exportSvgCustomClasses.value = localStorage.getItem(storageKeys.export.customClasses) || "";
    exportSvgCustomClasses.oninput = () => {
        localStorage.setItem(storageKeys.export.customClasses, exportSvgCustomClasses.value);
    };

    // Show modal
    detailsModal.style.display = "block";
    detailsModal.hidden = false;

    document.body.style.overflow = "hidden";
}

/**
 * Hides the details modal and restores the ability to scroll the main page. This function is called when the user clicks the close button or the background overlay of the modal.
 */
function hideDetails() {
    detailsModal.style.display = "none";
    detailsModal.hidden = true;

    document.body.style.overflow = "";
}

/**
 * Handles changes to the export format selection in the details modal. This function updates the local storage with the selected format, updates the display of the download button based on whether the selected format allows downloading, and shows or hides additional SVG export options if the selected format is SVG.
 */
function onFormatChange() {
    localStorage.setItem(storageKeys.export.format, exportFormat.value);
    const selectedOption = exportOptions.find(option => option.name === exportFormat.value);
    if (selectedOption) {
        if (selectedOption.allowDownload) {
            downloadButton.style.display = "";
            downloadButton.disabled = false;
        } else {
            downloadButton.style.display = "none";
            downloadButton.disabled = true;
        }

        if (exportFormat.value === "SVG") {
            exportSvgOptionsContainer.style.display = "";
        } else {
            exportSvgOptionsContainer.style.display = "none";
        }
    }
}

/**
 * Sets the color for the icon export and preview in the details modal. This function updates the local storage with the selected color, updates the export color input and display value, and applies the color to the icon preview.
 * @param {string} newColor The new color to set for the icon export and preview.
 */
function setColor(newColor) {
    const currentTheme = getTheme();
    colorValue = newColor;
    localStorage.setItem(storageKeys.export.color, colorValue);

    if (colorValue.toLowerCase() === "currentcolor") {
        exportColor.value = currentTheme === 'dark' ? "#ffffff" : "#000000";
        exportColorValue.textContent = "CurrentColor";
        detailsIcon.style.color = null;

        detailsIcon.classList.add(currentTheme);
        detailsIcon.classList.remove(currentTheme === 'dark' ? 'light' : 'dark');
    } else {
        exportColor.value = colorValue;
        exportColorValue.textContent = colorValue;
        detailsIcon.style.color = colorValue;

        if (getRelativeLuminance(colorValue) < 0.179) {
            detailsIcon.classList.add("light");
            detailsIcon.classList.remove("dark");
        } else {
            detailsIcon.classList.add("dark");
            detailsIcon.classList.remove("light");
        }
    }
}

// #endregion

// #region Pagination - these functions manage the pagination of search results, including updating the URL and enabling/disabling buttons based on the current page and total pages

/**
 * Navigates to a specific page of search results. This function updates the current page, optionally updates the URL, and displays the results for the specified page.
 * @param {number} page The page number to navigate to.
 * @param {boolean} [updateUrl=true] Whether to update the URL with the new page number.
 */
function goToPage(page, updateUrl = true) {
    const displayResults = getDisplayResults();
    if (page >= 1 && ((page - 1) * resultsPerPage) < displayResults.length) {
        currentPage = page;
        if (updateUrl) {
            addPageToUrl(true);
        }
        showResults();
    }
}

/**
 * Updates the state of the pagination buttons (Previous, Next, and page number buttons) based on the current page and total number of pages.
 */
function updatePaginationButtons() {
    const displayResults = getDisplayResults();
    // totalPages is still 1 even if there are no results
    const totalPages = displayResults.length === 0 ? 1 : Math.ceil(displayResults.length / resultsPerPage);

    // Enable or disable Previous and Next buttons based on the current page and total pages
    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    // Update page status text
    pageStatus.textContent = `${currentPage} / ${totalPages}`;

    // Get existing page number items
    const existingPageItems = pagination.querySelectorAll(".page-item");

    // Remove existing page number items that are higher than totalPages
    existingPageItems.forEach(item => {
        const page = parseInt(item.getAttribute("data-page"), 10);
        if (page > totalPages) {
            item.remove();
        }

        const button = item.querySelector("button");
        if (page === currentPage) {
            item.classList.add("active");
            button.ariaCurrent = "page";
            button.disabled = true;
        } else {
            item.classList.remove("active");
            button.ariaCurrent = null;
            button.disabled = false;
        }
    });

    // Add page number items for any missing pages up to totalPages
    for (let i = 1; i <= totalPages; i++) {
        if (!pagination.querySelector(`.page-item[data-page="${i}"]`)) {
            const pageItem = document.createElement("li");
            pageItem.classList.add("page-item");
            pageItem.setAttribute("data-page", i);
            if (i === currentPage) {
                pageItem.classList.add("active");
            }

            const pageButton = document.createElement("button");
            pageButton.type = "button";
            pageButton.textContent = i;
            pageButton.setAttribute("aria-label", `Page ${i}`);
            if (i === currentPage) {
                pageButton.ariaCurrent = "page";
                pageButton.disabled = true;
            }
            pageButton.addEventListener("click", () => goToPage(i));
            pageItem.appendChild(pageButton);

            // Insert the page item before the i+1 page item, or before the Next button if it's the last page
            const nextPageItem = pagination.querySelector(`.page-item[data-page="${i + 1}"]`);
            if (nextPageItem) {
                pagination.insertBefore(pageItem, nextPageItem);
            } else {
                pagination.insertBefore(pageItem, nextButton.parentElement);
            }
        }
    }

    // Update sizing classes on all pagination buttons
    const paginationDisplayRanges = getPaginationDisplayRanges(currentPage, totalPages);

    const pageItems = pagination.querySelectorAll(".page-item");
    pageItems.forEach(item => {
        const page = parseInt(item.getAttribute("data-page"), 10);

        Object.keys(paginationDisplayRanges).forEach(size => {
            if (paginationDisplayRanges[size].includes(page)) {
                item.classList.add(`size-${size}`);
            } else {
                item.classList.remove(`size-${size}`);
            }
        });
    });
}

/**
 * Calculates the display ranges for different pagination sizes based on the current page and total pages.
 * @param {number} currentPage The current page number.
 * @param {number} totalPages The total number of pages.
 * @returns {Object} An object containing the display ranges for different pagination sizes.
 */
function getPaginationDisplayRanges(currentPage, totalPages) {
    // Examples:
    // currentPage: 1, totalPages: 20:
    //     extra-small: [1, 2, 20]
    //     small: [1, 2, 3, 4, 20]
    //     medium: [1, 2, 3, 4, 5, 6, 20]
    //     large: [1, 2, 3, 4, 5, 6, 7, 8, 20]
    // currentPage: 10, totalPages: 20:
    //     extra-small: [1, 10, 20]
    //     small: [1, 9, 10, 11, 20]
    //     medium: [1, 8, 9, 10, 11, 12, 20]
    //     large: [1, 7, 8, 9, 10, 11, 12, 13, 20]
    // currentPage: 20, totalPages: 20:
    //     extra-small: [1, 19, 20]
    //     small: [1, 17, 18, 19, 20]
    //     medium: [1, 15, 16, 17, 18, 19, 20]
    //     large: [1, 13, 14, 15, 16, 17, 18, 19, 20]

    const result = {};
    const sizes = {
        "large": 9,
        "medium": 7,
        "small": 5,
        "extra-small": 3
    }

    Object.keys(sizes).forEach(size => {
        if (totalPages <= sizes[size]) {
            result[size] = getIncrementingArray(1, totalPages);
        } else if (currentPage <= Math.floor(sizes[size] / 2)) {
            result[size] = [...getIncrementingArray(1, sizes[size] - 1), totalPages];
        } else if (currentPage >= totalPages - Math.floor(sizes[size] / 2)) {
            result[size] = [1, ...getIncrementingArray(totalPages - sizes[size] + 2, sizes[size] - 1)];
        } else {
            const half = Math.floor((sizes[size]) / 2);
            result[size] = [1, ...getIncrementingArray(currentPage - (half - 1), sizes[size] - 2), totalPages];
        }
    });

    return result;
}

/**
 * Generates an array of incrementing numbers starting from a given value. Used for generating page number ranges for pagination display.
 * @param {number} start The starting number of the array.
 * @param {number} length The number of elements in the array.
 * @returns {number[]} An array of incrementing numbers.
 */
function getIncrementingArray(start, length) {
    const result = [];
    for (let i = start; i < start + length; i++) {
        result.push(i);
    }
    return result;
}

// #endregion

// #region URL state management - these functions read from and write to the URL query parameters to maintain state across page reloads and navigation

/**
 * Updates the URL query parameters to reflect the current search input and filter selections.
 */
function addSearchToUrl() {
    const params = new URLSearchParams(window.location.search);
    
    if (searchInput.value) {
        params.set("query", searchInput.value);
    } else {
        params.delete("query");
    }

    if (styleFilter.value) {
        params.set("style", styleFilter.value);
    } else {
        params.delete("style");
    }

    if (categoryFilter.value) {
        params.set("category", categoryFilter.value);
    } else {
        params.delete("category");
    }

    if (brandFilter.checked) {
        params.set("filterOutBrandIcons", "true");
    } else {
        params.delete("filterOutBrandIcons");
    }

    const paramsString = params.toString();
    const newUrl = `${window.location.pathname}${paramsString ? "?" + paramsString : ""}`;
    window.history.replaceState({}, "", newUrl);
}

/**
 * Updates the URL query parameters to reflect the current page number.
 * @param {boolean} [pushState=false] Whether to push a new state to the history or replace the current state.
 */
function addPageToUrl(pushState = false) {
    const params = new URLSearchParams(window.location.search);
    
    if (currentPage > 1) {
        params.set("page", currentPage);
    } else {
        params.delete("page");
    }

    const paramsString = params.toString();
    const newUrl = `${window.location.pathname}${paramsString ? "?" + paramsString : ""}`;

    if (pushState) {
        window.history.pushState({}, "", newUrl);
    } else {
        window.history.replaceState({}, "", newUrl);
    }
}

/**
 * Reads the URL query parameters and applies the search input, filter selections, and page number to the UI.
 */
function applySearchStateFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("query");
    searchInput.value = queryParam || "";
    const styleParam = urlParams.get("style");
    styleFilter.value = styleParam && styles.includes(styleParam) ? styleParam : "";
    const categoryParam = urlParams.get("category");
    categoryFilter.value = categoryParam && categories.includes(categoryParam) ? categoryParam : "";
    const brandParam = urlParams.get("filterOutBrandIcons");
    brandFilter.checked = brandParam === "true";
}

/**
 * Reads the URL query parameters to get the current page number and updates the UI to display that page of results.
 */
function applyPageStateFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get("page");

    const displayResults = getDisplayResults();
    // totalPages is still 1 even if there are no results
    const totalPages = displayResults.length === 0 ? 1 : Math.ceil(displayResults.length / resultsPerPage);

    if (pageParam) {
        const pageNumber = parseInt(pageParam, 10);
        if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
            currentPage = pageNumber;
            goToPage(pageNumber, false);
        } else {
            currentPage = 1;
            goToPage(1, true);
        }
    } else {
        currentPage = 1;
        showResults();
    }
}

// #endregion

// #region Icon data functions - these functions read from and add to the icons data during the startup process

/**
 * Adds override tags to icons based on the overrideTags object. This allows for additional search terms to be associated with icons without modifying the original icons data.
 */
function addOverrideTags() {
    Object.keys(overrideTags).forEach(iconName => {
        const icon = icons.find(i => i.name === iconName);
        if (icon) {
            icon.overrideTags = overrideTags[iconName];
        } else {
            console.warn(`Icon with name "${iconName}" not found for override tags.`);
        }
    });
}

/**
 * Gets a list of unique styles from the icons data.
 * @returns {string[]} An array of unique styles sorted alphabetically
 */
function getUniqueStyles() {
    const styles = new Set();
    for (let i = 0; i < icons.length; i++) {
        const iconStyles = icons[i].styles;
        if (!iconStyles) continue;

        for (const key in iconStyles) {
            if (Object.prototype.hasOwnProperty.call(iconStyles, key)) {
                styles.add(key);
            }
        }
    }
    return Array.from(styles).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

/**
 * Gets a list of unique categories from the icons data.
 * @returns {string[]} An array of unique categories sorted alphabetically
 */
function getUniqueCategories() {
    const categories = new Set();
    for (let i = 0; i < icons.length; i++) {
        const iconCategory = icons[i].category;
        if (!iconCategory) continue;

        categories.add(iconCategory);
    }
    return Array.from(categories).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// #endregion

// #region General utilities

/**
 * Gets the current theme (dark or light) based on user preference stored in localStorage or system preference.
 * @returns {string} The current theme, either 'dark' or 'light'.
 */
function getTheme() {
    let theme = localStorage.getItem('preferences.theme')?.replaceAll('"', '')?.trim()?.toLowerCase() ?? '';
    if (theme !== 'dark' && theme !== 'light') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
}

/**
 * Converts a HEX color string to an RGB object.
 * @param {string} hex The HEX color string (e.g., "#ff0000" or "#f00")
 * @returns {{r: number, g: number, b: number}} The RGB representation of the color
 */
function hexToRgb(hex) {
    // Remove the hash if present
    hex = hex.replace(/^#/, '');

    // Parse the hex string into RGB components
    let bigint = parseInt(hex, 16);
    if (hex.length === 6) {
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    } else if (hex.length === 3) {
        return {
            r: parseInt(hex[0] + hex[0], 16),
            g: parseInt(hex[1] + hex[1], 16),
            b: parseInt(hex[2] + hex[2], 16)
        };
    }
    throw new Error("Invalid HEX color.");
}

/**
 * Calculates the relative luminance of a color given its HEX representation.
 * @param {string} hex The HEX color string (e.g., "#ff0000" or "#f00")
 * @returns {number} The relative luminance of the color
 */
function getRelativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);

    // Convert RGB to sRGB
    const srgb = [r, g, b].map(value => {
        const normalized = value / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    // Calculate relative luminance
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 * @param {string} string The string to be capitalized
 * @returns {string} The capitalized string
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Copies the given text to the clipboard.
 * @param {string} text The text to be copied to the clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

/**
 * Downloads a text file with the given filename and content.
 * @param {string} filename The name of the file to be downloaded
 * @param {string} content The content of the file to be downloaded
 */
function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// #endregion

// #region SVG export modification functions - these functions modify the SVG string for export

/**
 * Removes extra whitespace from the SVG string.
 * @param {string} svg The SVG string to be modified
 * @returns {string} The SVG string with extra whitespace removed
 */
function removeExtraWhitespaceFromSvg(svg) {
    return svg.replace(/\s*\n\s*/g, " ").replace(/> </g, "><").replace(/\s*>/g, ">").trim();
}

/**
 * Removes inline styles from the SVG string (e.g. width, height, fill, stroke, etc.).
 * @param {string} svg The SVG string to be modified
 * @returns {string} The SVG string with inline styles removed
 */
function removeInlineStylesFromSvg(svg) {
    return svg.replace(/\s*(width|height|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|style)="[^"]*"(\\n)?/g, "");
}

/**
 * Removes the xmlns attribute from the SVG string.
 * @param {string} svg The SVG string to be modified
 * @returns {string} The SVG string with the xmlns attribute removed
 */
function removeXmlnsFromSvg(svg) {
    return svg.replace(/\s+xmlns="[^"]*"/, "");
}

/**
 * Adds the "icon" class to the SVG string. Adds the class to the SVG element, and preserves any existing classes on the SVG element.
 * @param {string} svg The SVG string to be modified
 * @returns {string} The SVG string with the "icon" class added
 */
function addIconClassToSvg(svg) {
    return addClassesToSvg(svg, "icon");
}

/**
 * Adds the Tabler classes to the SVG string. Adds the classes to the SVG element, and preserves any existing classes on the SVG element.
 * @param {string} svg The SVG string to be modified
 * @param {Icon} icon The icon object containing the icon's name and styles
 * @param {string} style The style of the icon (e.g. "outline", "filled")
 * @returns {string} The SVG string with the Tabler classes added
 */
function addTablerClassesToSvg(svg, icon, style) {
    const classes = `icon icon-tabler icons-tabler-${style} icon-tabler-${icon.name}`;
    return addClassesToSvg(svg, classes);
}

/**
 * Adds custom classes to the SVG string. Adds the classes to the SVG element, and preserves any existing classes on the SVG element.
 * @param {string} svg The SVG string to be modified
 * @param {Icon} icon The icon object containing the icon's name and styles
 * @param {string} style The style of the icon (e.g. "outline", "filled")
 * @returns {string} The SVG string with the custom classes added
 */
function addCustomClassesToSvg(svg, icon, style) {
    const customClasses = exportSvgCustomClasses.value.trim()
        .replace(/\{style\}/g, style)
        .replace(/\{name\}/g, icon.name);
    if (customClasses === "") {
        return svg;
    }
    return addClassesToSvg(svg, customClasses);
}

/**
 * Adds the provided classes to the SVG string. Adds the classes to the SVG element, and preserves any existing classes on the SVG element. Deduplicates classes.
 * @param {string} svg The SVG string to be modified
 * @param {string} classes The space-separated string of classes to add to the SVG element
 * @return {string} The SVG string with the provided classes added
 */
function addClassesToSvg(svg, classes) {
    const allClasses = new Set();
    classes.split(" ").forEach(cls => allClasses.add(cls));

    const existingClassesMatch = svg.match(/class="([^"]*)"/);
    if (existingClassesMatch) {
        existingClassesMatch[1].split(" ").forEach(cls => allClasses.add(cls));

        return svg.replace(/class="[^"]*"/, `class="${Array.from(allClasses).join(" ")}"`);
    } else {
        return svg.replace("<svg", `<svg class="${Array.from(allClasses).join(" ")}"`);
    }
}

// #endregion

// #region Export format value generators - these functions generate the value to be copied or downloaded for each export format option

/**
 * Gets the SVG string for export, applying any selected export options such as removing whitespace, adjusting the stroke width, and applying the selected color.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The SVG string for export
 */
function getSvgForExport(icon, style) {
    let outputSvg = icon.styles[style].svg;

    if (exportSvgWhitespace.checked) {
        outputSvg = removeExtraWhitespaceFromSvg(outputSvg);
    }
    if (exportSvgStyles.checked) {
        outputSvg = removeInlineStylesFromSvg(outputSvg);
    }
    if (exportSvgXmlns.checked) {
        outputSvg = removeXmlnsFromSvg(outputSvg);
    }
    if (exportSvgIconClass.checked) {
        outputSvg = addIconClassToSvg(outputSvg);
    }
    if (exportSvgTablerClasses.checked) {
        outputSvg = addTablerClassesToSvg(outputSvg, icon, style);
    }
    if (exportSvgCustomClassesEnabled.checked) {
        outputSvg = addCustomClassesToSvg(outputSvg, icon, style);
    }

    // If the SVG uses currentColor, replace it with the selected color for export
    outputSvg = outputSvg.replace(/currentColor/g, colorValue);
    // If the SVG includes a stroke-width attribute, replace it with the value from the export options
    if (outputSvg.includes('stroke-width="')) {
        const strokeWidth = exportStrokeWidth.value || "2";
        outputSvg = outputSvg.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
    }

    return outputSvg;
}

/**
 * Gets the hex code for export.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The hex code for export
 */
function getHexForExport(icon, style) {
    return icon.styles[style].unicode;
}

/**
 * Gets the HTML character for export.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The HTML character for export
 */
function getHtmlCharacterForExport(icon, style) {
    return `&#x${icon.styles[style].unicode};`;
}

/**
 * Gets the HTML classes for export.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The HTML classes for export
 */
function getHtmlClassesForExport(icon, style) {
    return `ti ti-${icon.name}${style === defaultStyle ? "" : `-${style}`}`;
}

/**
 * Gets the webfont element for export.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The webfont element for export
 */
function getWebfontElementForExport(icon, style) {
    return `<i class="${getHtmlClassesForExport(icon, style)}"></i>`;
}

/**
 * Gets the React component name for export.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The React component name for export
 */
function getReactNameForExport(icon, style) {
    let parts = icon.name.toLowerCase().split("-");
    parts = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1));
    return "Icon" + parts.join("") + (style === defaultStyle ? "" : capitalize(style));
}

/**
 * Gets the React element for export.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The React element for export
 */
function getReactElementForExport(icon, style) {
    if (icon.styles[style].svg.includes('stroke-width="')) {
        const strokeWidth = exportStrokeWidth.value || "2";
        return `<${getReactNameForExport(icon, style)} stroke={${strokeWidth}} />`;
    } else {
        return `<${getReactNameForExport(icon, style)} />`;
    }
}

/**
 * Gets the icon name for export.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The icon name for export
 */
function getIconNameForExport(icon, style) {
    return icon.name;
}

/**
 * Gets the data URI for export, applying any selected export options such as adjusting the stroke width and applying the selected color.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The data URI for export
 */
function getDataUriForExport(icon, style) {
    let svg = removeExtraWhitespaceFromSvg(icon.styles[style].svg);

    svg = svg.replace(/currentColor/g, colorValue);
    if (svg.includes('stroke-width="')) {
        const strokeWidth = exportStrokeWidth.value || "2";
        svg = svg.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
    }

    let encodedSvg = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");

    // Don't encode characters that don't need to be encoded
    encodedSvg = encodedSvg
        .replace(/%3A/g, ':')   // colon
        .replace(/%2F/g, '/')   // slash
        .replace(/%3D/g, '=');  // equals

    return `data:image/svg+xml,${encodedSvg}`;
}

/**
 * Gets the base64 data URI for export, applying any selected export options such as adjusting the stroke width and applying the selected color.
 * @param {Icon} icon The icon to be exported
 * @param {string} style The style of the icon to be exported (e.g. "outline", "filled")
 * @returns {string} The base64 data URI for export
 */
function getBase64DataUriForExport(icon, style) {
    let svg = removeExtraWhitespaceFromSvg(icon.styles[style].svg);

    svg = svg.replace(/currentColor/g, colorValue);
    if (svg.includes('stroke-width="')) {
        const strokeWidth = exportStrokeWidth.value || "2";
        svg = svg.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
    }

    const utf8Bytes = new TextEncoder().encode(svg);
    let binary = '';

    for (const byte of utf8Bytes) {
        binary += String.fromCharCode(byte);
    }

    const base64 = btoa(binary);
    return `data:image/svg+xml;base64,${base64}`;
}

// #endregion
