document.addEventListener("DOMContentLoaded", function() {
    const screenTitle = document.getElementById("screen-title");
    const screenContent = document.getElementById("screen-content");
    const numberButtons = document.querySelectorAll(".keypad button[data-number]");
    const clearButton = document.getElementById("clear-button");
    const enterButton = document.getElementById("enter-button");
    const cancelButton = document.getElementById("cancel-button");
    const withdrawButton = document.getElementById("function1");
    const depositButton = document.getElementById("function2");
    const balanceButton = document.getElementById("function3");
    const exitButton = document.getElementById("function4");

    const pinEntryDiv = document.getElementById("pin-entry");
    const pinInput = document.getElementById("pin-input");
    const submitPinButton = document.getElementById("submit-pin");
    let enteredPin = "";

    let currentInput = "";
    let balance = 1000; // Initial balance (for demonstration)
    let isLoggedIn = false;

    // -- Text-to-Speech (TTS) --
    const synth = window.speechSynthesis;

    function speak(text) {
        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            return;
        }
        let utterThis = new SpeechSynthesisUtterance(text);
        utterThis.onend = function (event) {
            console.log('SpeechSynthesisUtterance.onend');
        }
        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror');
        }

        // Optional: Customize voice, pitch, rate
        // const voices = synth.getVoices();  // Get available voices
        // utterThis.voice = voices[0];        // Use the first voice
        utterThis.pitch = 1;  // Range: 0 to 2 (1 is normal)
        utterThis.rate = 0.9;   // Range: 0.1 to 10 (1 is normal)

        synth.speak(utterThis);
    }


    // -- Utility Functions --
    function updateScreen(title, content) {
        screenTitle.textContent = title;
        screenContent.innerHTML = content;
        speak(title + ". " + content); // Speak the text!
    }

    function clearInput() {
        currentInput = "";
        updateScreen(screenTitle.textContent, ""); // Clear only the content
    }

    function showPinEntry() {
        pinEntryDiv.style.display = "block";
        screenContent.style.display = "none";
        screenTitle.textContent = "Enter PIN";
        speak("Enter PIN"); // Speak the text!
        pinInput.value = ""; //Clear input when showing
        enteredPin = "";
    }

    function hidePinEntry() {
        pinEntryDiv.style.display = "none";
        screenContent.style.display = "block";
    }
    // -- ATM Flow Control --

    function mainMenu() {
        if (isLoggedIn) {
          screenTitle.textContent = "Date 13-03-2025";
          screenContent.innerHTML = `
            <p>Choose an option:</p>
            <ul>
                <li><button id="withdraw-option">Withdraw</button></li>
                <li><button id="deposit-option">Deposit</button></li>
                <li><button id="balance-option">View Balance</button></li>
            </ul>
          `;
          // Add event listeners for the new menu options
          document.getElementById("withdraw-option").addEventListener("click", withdrawButton.onclick);
          document.getElementById("deposit-option").addEventListener("click", depositButton.onclick);
          document.getElementById("balance-option").addEventListener("click", balanceButton.onclick);
          speak("ATM Options.  Choose an option.");
        } else {
          showPinEntry();
        }
    }


    function cardEject() {
        updateScreen("Take Your Card", "Thank you for banking with us.");
        setTimeout(() => {
            updateScreen("Welcome", "Please Insert Your Card");
            isLoggedIn = false;  // Reset login state
            currentInput = "";
            mainMenu();
        }, 3000);  // 3 second delay
    }

    // -- Event Listeners --

    numberButtons.forEach(button => {
        button.addEventListener("click", function() {
            if (pinEntryDiv.style.display === "block") {
                pinInput.value += this.dataset.number;
                enteredPin = pinInput.value; //This line is optional, the pin is already stored in the field's value.
            } else {
                currentInput += this.dataset.number;
                updateScreen(screenTitle.textContent, currentInput);
            }
        });
    });


    clearButton.addEventListener("click", clearInput);

    cancelButton.addEventListener("click", function() {
        if (pinEntryDiv.style.display === "block") {
             pinInput.value = ""; // Clear the input field
             enteredPin = "";
        }else{
            mainMenu(); // Go back to the main menu
        }

    });

   submitPinButton.addEventListener("click", function() {
        enteredPin = pinInput.value;
        if (enteredPin === "1234") { // Replace with actual PIN verification
            hidePinEntry();
            isLoggedIn = true;
            mainMenu(); //Go to main menu now logged in
        } else {
            alert("Incorrect PIN.");
            pinInput.value = "";  // Clear the input field
            enteredPin = "";
        }
    });

    withdrawButton.addEventListener("click", function() {
        screenTitle.textContent = "Withdraw Amount";
        screenContent.innerHTML = `<input type="number" id="withdraw-amount" placeholder="Enter Amount"><br><button id="withdraw-confirm">Confirm</button>`;
        speak("Withdraw Amount");

        const withdrawConfirmButton = document.getElementById("withdraw-confirm");
        withdrawConfirmButton.addEventListener("click", function() {
            const amount = parseFloat(document.getElementById("withdraw-amount").value);
            if (isNaN(amount) || amount <= 0) {
                alert("Invalid amount.");
                return;
            }
            if (amount > balance) {
                alert("Insufficient funds.");
                return;
            }

            // Confirmation Prompt
            const confirmation = confirm(`Withdraw $${amount}?`);
            if (confirmation) {
                balance -= amount;
                alert(`Withdrawn: $${amount}\nNew Balance: $${balance}`);
                updateScreen("Please Take Your Cash", "Thank you!");
                setTimeout(cardEject, 2000); // Simulate cash dispensing and card eject.
            } else {
                alert("Transaction cancelled.");
                mainMenu();
            }
        });
    });

    depositButton.addEventListener("click", function() {
        screenTitle.textContent = "Deposit Amount";
        screenContent.innerHTML = `<input type="number" id="deposit-amount" placeholder="Enter Amount"><br><button id="deposit-confirm">Confirm</button>`;
        speak("Deposit Amount");

        const depositConfirmButton = document.getElementById("deposit-confirm");
        depositConfirmButton.addEventListener("click", function() {
            const amount = parseFloat(document.getElementById("deposit-amount").value);
            if (isNaN(amount) || amount <= 0) {
                alert("Invalid amount.");
                return;
            }

            const confirmation = confirm(`Deposit $${amount}?`);
            if (confirmation) {
                balance += amount;
                alert(`Deposited: $${amount}\nNew Balance: $${balance}`);
                updateScreen("Deposit Successful", "Thank you!");
                setTimeout(mainMenu, 2000);  // Return to main menu after deposit
            } else {
                alert("Transaction cancelled.");
                mainMenu();
            }
        });
    });

    balanceButton.addEventListener("click", function() {
        updateScreen("Current Balance", `$${balance}`);
    });

    exitButton.addEventListener("click", function() {
        cardEject();
    });

    // Initial display
    mainMenu();  // Start at the PIN entry
});