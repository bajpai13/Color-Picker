// Event Listeners Setup:
// These lines set up variables to reference these HTML elements.

const pickerBtn = document.querySelector("#picker-btn"); /* Selects the "Pick Color" button. */
const exportBtn = document.querySelector("#export-btn"); /* Selects the "Export Color" button.
*/
const clearBtn = document.querySelector("#clear-btn"); /* Selects the "Clear All" button */
const colorList = document.querySelector(".all-colors"); /* Selects the container for displaying picked colors. */


// Local Storage Initialization:

let pickedColors = JSON.parse(localStorage.getItem("color-list")) || [];  //Retrieves the previously picked colors from local storage, or initializes an empty array if none exist.


// Color Popup Variable:

let currentPopUp = null; // Initializes a variable to keep track of the currently displayed color popup (if any).



//copyToClipboard Function:
const copyToClipboard = async (text, element) => {
    try {
        await navigator.clipboard.writeText(text);
        element.innerText = "Copied!";
        setTimeout(() => {
            element.innerText = text;
        }, 1000);
    }
    catch (err) {
        alert("Failed to copy text! 1")
    }
}



// exportColor Function:
//export the picked colors as a text file.
// Converts the array into a newline-separated string.
// Creates a Blob (Binary Large Object) with the text data and sets it as a downloadable link.
// Simulates a click on the link to trigger the download and then removes the link.
const exportColor = () => {
    const colorText = pickedColors.join("\n");
    const blob = new Blob([colorText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); //<a></a>
    a.href = url;
    a.download = 'Colors.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}




// createColorPopup Function:
// create a popup displaying color information.
// dynamic generation of HTML
// Event listeners are set up
const createColorPopup = (color) => {
    const popup = document.createElement("div");
    popup.classList.add("color-popup");
    popup.innerHTML = `
        <div class="color-popup-content">
            <span class="close-popup">x</span>
            <div class="color-info">
                <div class="color-preview" style="background: ${color};"></div>
                    <div class="color-details">
                        <div class="color-value">
                            <span class="label">Hex:</span>
                            <span class="value hex" data-color="${color}">${color}</span>
                        </div>
                        <div class="color-value">
                            <span class="label">RGB:</span>
                            <span class="value rgb" data-color="${color}">${hexToRgb(color)}</span>
                        </div>
                </div>
            </div>
        </div>
    `;

    // Close button inside the popup
    const closePopup = popup.querySelector(".close-popup");
    closePopup.addEventListener('click', () => {
        document.body.removeChild(popup);
        currentPopUp = null;
    });

    // Event listeners to copy color values to clipboard
    const colorValues = popup.querySelectorAll(".value");
    colorValues.forEach((value) => {
        value.addEventListener('click', (e) => {
            const text = e.currentTarget.innerText;
            copyToClipboard(text, e.currentTarget);
        });
    });

    return popup;
};


// showColors Function:
// Updates the displayed list 
// Dynamically generates HTML for each color entry
// Sets up event listeners
// Toggles the visibility
const showColors = () => {
    colorList.innerHTML = pickedColors.map((color) =>
        `
            <li class="color">
                <span class="rect" style="background: ${color}; border: 1px solid ${color === "#ffffff" ? "#ccc" : color}"></span>
                <span class="value hex" data-color="${color}">${color}</span>
            </li>
        `
    ).join("");

    const colorElements = document.querySelectorAll(".color");
    colorElements.forEach((li) => {
        const colorHex = li.querySelector(".value.hex");
        colorHex.addEventListener('click', (e) => {
            const color = e.currentTarget.dataset.color;
            if (currentPopUp) {
                document.body.removeChild(currentPopUp);
            }
            const popup = createColorPopup(color);
            document.body.appendChild(popup);
            currentPopUp = popup;
        });
    });

    const pickedColorsContainer = document.querySelector(".color-list");
    pickedColorsContainer.classList.toggle("hide", pickedColors.length === 0);
};


// hexToRgb Function:
// To convert a hex color value to an RGB color value.

const hexToRgb = (hex) => {
    const bigInt = parseInt(hex.slice(1), 16);
    const r = (bigInt >> 16) & 255;
    const g = (bigInt >> 8) & 255;
    const b = bigInt & 255;
    return `rgb(${r}, ${g}, ${b})`;
}


// activateEyeDropper Function:
const activateEyeDropper = async () => {
    document.body.style.display = "none";
    try {
        const { sRGBHex } = await new EyeDropper().open();

        if (!pickedColors.includes(sRGBHex)) {
            pickedColors.push(sRGBHex);
            localStorage.setItem("colors-list", JSON.stringify(pickedColors));
        }

        showColors();
    } catch (error) {
        alert(error);
    } finally {
        document.body.style.display = "block";
    }
};


// clearAll Function:
const clearAll = () => {
    pickedColors = [];
    localStorage.removeItem("colors-list");
    showColors();
}

// Event Listeners:
pickerBtn.addEventListener('click', activateEyeDropper);
clearBtn.addEventListener('click', clearAll);
exportBtn.addEventListener('click', exportColor);

showColors(); // Initially displays any previously picked colors when the page loads.
