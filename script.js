document.getElementById('zipcode-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const zipcode = document.getElementById('zipcode').value.trim();
    clearResults();
    if (zipcode.length === 5 && !isNaN(zipcode)) {
        loadCSVAndFindDistrict(zipcode);
    } else {
        displayResult("Please enter a valid 5-digit zip code.", 'red');
    }
});

// Load the ZIP code CSV and search for the district
function loadCSVAndFindDistrict(zipcode) {
    Papa.parse('zipcodes.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const matchedRow = findDistrictByZipcode(results.data, zipcode);
            if (matchedRow) {
                if (matchedRow.cd.length === 1){
                    matchedRow.cd = "0"+matchedRow.cd;
                }
                const stateDistrict = `${matchedRow.state_abbr}-${matchedRow.cd}`;
                console.log(stateDistrict);
                clearResults();  // Clear previous results before displaying new reps
                displayHouseRep(stateDistrict);  // Show House Representative
                displaySenateReps(getStateFullName(matchedRow.state_abbr));  // Show both Senate Representatives
            } else {
                displayResult("No matching district found for this ZIP code.", 'red');
            }
        },
        error: function(err) {
            console.error("Error loading ZIP code CSV: ", err);
            displayResult("Error loading ZIP code data.", 'red');
        }
    });
}

// Function to search for the district by ZIP code in the ZIP code CSV data
function findDistrictByZipcode(data, zipcode) {
    return data.find(row => row.zcta === zipcode);
}

// Function to display the result for each representative with its own color
function displayResult(message, color) {
    const resultDiv = document.getElementById('result');
    const repDiv = document.createElement('div');  // Create a new div for each representative
    repDiv.innerHTML = message.replace('\n', '<br>');  // Add the message with line breaks
    repDiv.style.color = color;  // Apply the color specific to the representative
    resultDiv.appendChild(repDiv);  // Append this div to the result container
}

// Clear previous results
function clearResults() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';  // Clear any existing results
}

// Fetch House representative and score from scoreSheetHouse.csv
function displayHouseRep(stateDistrict) {
    Papa.parse('scoreSheetHouse.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const matchedRep = findRepresentativeByStateDistrict(results.data, stateDistrict);
            if (matchedRep) {
                const score = parseFloat(matchedRep.totalScore.replace('%', ''));
                let color;
            
                if (score > 80) {
                    color = 'green';
                } else if (score > 60) {
                    color = 'amber';
                } else {
                    color = 'red';
                }
            
                const message = `House Representative: ${matchedRep.RepFirst}, ${matchedRep.RepLast}<br>Total Score: ${matchedRep.totalScore}`;
                displayResult(message, color);
            } else {
                displayResult("No matching House representative found for this district.", 'red');
            }
            
        },
        error: function(err) {
            console.error("Error loading scoreSheetHouse CSV: ", err);
            displayResult("Error loading House representative data.", 'red');
        }
    });
}

// Fetch Senate representatives and their scores from scoreSheetSenate.csv
function displaySenateReps(state) {
    Papa.parse('scoreSheetSenate.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const matchedReps = findSenatorsByState(results.data, state);

            if (matchedReps && matchedReps.length > 0) {
                matchedReps.forEach((matchedRep) => {
                    const score = parseFloat(matchedRep.totalScore.replace('%', ''));
                    let color;
                
                    if (score > 80) {
                        color = 'green';
                    } else if (score > 60) {
                        color = 'amber';
                    } else {
                        color = 'red';
                    }
                
                    const message = `Senator: ${matchedRep.RepFirst}, ${matchedRep.RepLast}<br>Total Score: ${matchedRep.totalScore}`;
                    displayResult(message, color);
                });
            } else {
                displayResult("No matching Senate representatives found for this state.", 'red');
            }
            
        },
        error: function(err) {
            console.error("Error loading scoreSheetSenate CSV: ", err);
            displayResult("Error loading Senate representative data.", 'red');
        }
    });
}

// Function to search for senators by state in scoreSheetSenate.csv
function findSenatorsByState(data, state) {
    const stateLowerCase = state.toLowerCase();
    return data.filter(row => row['State'].toLowerCase() === stateLowerCase);
}

// Function to search for the House representative by district in scoreSheetHouse.csv
function findRepresentativeByStateDistrict(data, stateDistrict) {
    return data.find(row => row['DistrictNumber'] === stateDistrict);
}

// Function to convert state abbreviation to full name
function getStateFullName(stateAbbr) {
    const states = {
        "AL": "Alabama",
        "AK": "Alaska",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "FL": "Florida",
        "GA": "Georgia",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PA": "Pennsylvania",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming",
        "DC": "District of Columbia",
        "AS": "American Samoa",
        "GU": "Guam",
        "MP": "Northern Mariana Islands",
        "PR": "Puerto Rico",
        "VI": "U.S. Virgin Islands"
    };

    return states[stateAbbr.toUpperCase()] || "Unknown State";
}
