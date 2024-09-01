// /*
const form = document.forms["heartDiseaseRiskForm"];
const formGroups = form.querySelectorAll('.vdp-form-group');

// Function to validate an individual field in real time
function validateField(field) {
    if (!field) return false; 

    const errorMessage = field.closest('.vdp-form-group').querySelector('.vdp-error-message');
    if (field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "radio") {
        if (field.value.trim() === '' || (field.type === "radio" && !field.checked)) {
            field.closest('.vdp-form-group').classList.add('error');
            errorMessage.style.display = 'block';
            return false;
        } else {
            field.closest('.vdp-form-group').classList.remove('error');
            errorMessage.style.display = 'none';
            return true;
        }
    }
    
}

// Function to validate required radio options
function validateRequiredOptions() {
    let isValid = true;
    
    formGroups.forEach(group => {
        const radioButtons = group.querySelectorAll('input[type="radio"]');
        const isChecked = Array.from(radioButtons).some(radio => radio.checked);
        const errorMessage = group.querySelector('.vdp-error-message');

        if (radioButtons.length > 0 && !isChecked) {
            group.classList.add('error');
            errorMessage.style.display = 'block';
            isValid = false;
        } else if(errorMessage) {
            group.classList.remove('error');
            errorMessage.style.display = 'none';
        }
    });

    return isValid;
}

// Function to validate the entire form
function validateForm() {
    let isValid = true;
    let firstErrorField = null;

    formGroups.forEach(group => {
        const inputField = group.querySelector('input[type="radio"]:checked') || 
                            group.querySelector('input[type="text"]') ||
                            group.querySelector('input[type="email"]') ||
                            group.querySelector('input[type="tel"]');

        if (inputField && !validateField(inputField)) {
            isValid = false;
            if (!firstErrorField) {
                firstErrorField = inputField;
            }
        }
    });

    if (!validateRequiredOptions()) {
        isValid = false;
        if (!firstErrorField) {
            firstErrorField = form.querySelector('.error input[type="radio"], .error input[type="text"], .error input[type="email"], .error input[type="tel"]');
        }
    }

    if (isValid) {
        calculateRisk(); 
        form.style.display = 'none'; 
        document.getElementById('vdp-display-output-container').style.display = 'block'; 
    } else {
        if (firstErrorField) {
            const errorGroup = firstErrorField.closest('.vdp-form-group');
            errorGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }
        alert('Please complete all required fields.');
    }
}

// Function to calculate risk and display results
function calculateRisk() {
    let totalPoints = 0;
    let riskFactors = [];
    const inputs = form.querySelectorAll('input[type="radio"]:checked');

    inputs.forEach(input => {
        totalPoints += parseInt(input.value);
        if (+input.value >= 6) {
            const questionLabel = input.closest('.vdp-form-group').querySelector('.vdp-form-group-label').textContent.trim().slice(3,-1);
            const option = input.closest('label').querySelector('.opt').textContent;
            riskFactors.push(`${questionLabel}: ${option}`);
        }
    });

    // Display the results
    const resultDiv = document.getElementById('vdp-display-output-id');
    const fullName = form.elements['lastName'].value + ', ' + form.elements['firstName'].value;
    const riskLevel = 
        totalPoints >= 72 ? 
            'Your heart disease risk is very high. You should talk to your healthcare professional as soon as possible and discuss reducing your risk.' : 
            totalPoints >= 58 && totalPoints <= 70 ? 
                'Your heart disease risk is high. You need to work with your healthcare professional on a plan to reduce your risk.' : 
                totalPoints >= 34 && totalPoints <= 56 ? 
                    'Your heart disease risk is average. Talk to your healthcare professional about ways you can lower your risk.' :
                    totalPoints <= 32 ? 
                        'Your heart disease risk is low. Keep up the good work.' : 
                        '';

    resultDiv.innerHTML = `
        <h2>${fullName}'s Heart Disease Risk Score</h2>
        <h3>Total Score: <i>${totalPoints}</i></h3>
        <h3>Summary</h3>
        <p>${riskLevel}</p>
        <h3>Some Contributing Risk Factors are:</h3>
        <ul>
            ${riskFactors.map(factor => `<li>${factor}</li>`).join('')}
        </ul>
    `;

    // prepare the data to send
    const userData = {
        firstName: form.elements['firstName'].value,
        lastName: form.elements['lastName'].value,
        email: form.elements['email'].value,
        phoneNumber: form.elements['phoneNumber'].value,
        totalPoints,
        riskLevel,

    };

    const radioInput = form.querySelectorAll('input[type="radio"]:checked');    
    const selectedOptions = [];
    radioInput.forEach(group => {
       let question = group.closest('.vdp-form-group').querySelector('.label-text.radio').textContent.trim().slice(3);
       let answer = group.nextElementSibling.textContent;
       selectedOptions.push(`${question}: ${answer}`);
    });
    alert(selectedOptions.join("\n"));


    const formInputElements = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    formInputElements.forEach(formInputElement => {
        userData[formInputElement.name] = formInputElement.value;
    });


console.log(userData)
    // Send data to Google Sheets
    sendDataToGoogleSheets(userData);
    }
    
    
// }




// Function to send form data to Google Sheets
function sendDataToGoogleSheets(data) {
    // const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // Replace with your Google Apps Script URL
    /*
    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('Success:', result);
    })
    .catch(error => console.error('Error:', error));
    */
}

// Attach event listeners for real-time validation
const inputFields = form.querySelectorAll('input[type="radio"], input[type="text"], input[type="email"], input[type="tel"]');

inputFields.forEach(field => {
    // field.addEventListener('input', () => validateField(field)); 
    field.addEventListener('change', () => validateField(field)); 
    field.addEventListener('blur', () => validateField(field));  
});

// Prevent default form submission and validate the form
form.addEventListener("submit", function(event) {
    event.preventDefault();
    validateForm();
});


// Function to reset validation state
function resetValidationState() {
    // Remove error classes and hide error messages
    formGroups.forEach(group => {
        group.classList.remove('error');
        const errorMessage = group.querySelector('.vdp-error-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    });
}

// Attach event listener for the "Clear" button
document.querySelector('button[type="reset"]').addEventListener('click', () => {
    resetValidationState();
});
document.querySelector('.vdp-frm-btn.clear').addEventListener('click', () => {
    // resetValidationState();
    form.reset()
    form.style.display = 'block'; 
    document.querySelector('.vdp-display-output-container').style.display = 'none'; 
});

    // */


