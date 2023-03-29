// Code to generate a random password based on user-selected criteria
// The user must select a password length between 8 and 128 characters (set in global variables if this needs to change in the future)
// and select at least one of the following character types:
// special characters, numbers, lowercase letters, uppercase letters
// The password is generated randomly from the selected character types
// and displayed to the user, or if there is an error, an error message is displayed to the user

// Globals

// Select elements and add event listeners for user interaction
// ---------------------------------------------------------------------------------------------------
// select the generate button
var generateBtn = document.querySelector('#generate');
// Add event listener to generate button to fire the application up
generateBtn.addEventListener('click', writePassword);

// select the copy button
var copyPasswordBtn = document.querySelector('#copy-button');
// Add event listener to copy button to run the copy to clipboard code
copyPasswordBtn.addEventListener('click', copyPassword);
// hide the copy button on form load, as it is only relevant when there is a password to copy
copyPasswordBtn.style.display = 'none';

// toggle visibility of the instructions: select the instructions toggle button and the instructions block
// experimenting with different element selectors here to learn the syntax
const toggleButton = document.querySelector('#toggle-button');
const instructions = document.getElementById('instructions');
// action the instructions toggle button click
toggleButton.addEventListener('click', toggleInstructions);
// ---------------------------------------------------------------------------------------------------


// Define global variables
// ---------------------------------------------------------------------------------------------------
// the possible password characters are stored in string constants, in 4 different categories
const passwordNumbers = '0123456789';
const passwordLowercase = 'abcdefghijklmnopqrstuvwxyz';
const passwordUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const passwordSpecialCharacters = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
// The list of special password characters obtained from OWASP Foundation:
// https://www.owasp.org/index.php/Password_special_characters

// define the min, max and default password lengths
// define in case these need to be changed in the future.
const passwordDefaultLength = 12;
const passwordMinLength = 8;
const passwordMaxLength = 128;
// ---------------------------------------------------------------------------------------------------

// Add special characters and min max password lengths to the instructions on page load
// ---------------------------------------------------------------------------------------------------
// add the special characters to the instructions here so they are not hard-coded in html
// otherwise the special characters would need to be escaped in the html
// and the special characters would not be displayed correctly
// Gives an opportunity to add more special characters in the future without having to update the HTML instructions
addSpecialCharactersToInstructions();
// ---------------------------------------------------------------------------------------------------

// The Main function for getting user input, generating and displaying the password (or errors)
// ---------------------------------------------------------------------------------------------------
function writePassword() {
  // clear the UI. This doesn't actually update the screen until after the routine has finished
  // but still worth doing.
  const passwordText = document.querySelector('#password');
  const feedbackText = document.getElementById('#feedback');
  generateBtn.disabled=true;
  passwordText.value = '';
  feedbackText.innerHTML = '';
  copyPasswordBtn.style.display = 'none';

  // create CharacterTypes class instances to hold the valid password characters,
  // and to hold whether the character type is selected by the user
  const specialCharacters = new CharacterTypes(passwordSpecialCharacters, 'special characters', false);
  const numbers = new CharacterTypes(passwordNumbers, 'numbers', false);
  const lowercase = new CharacterTypes(passwordLowercase, 'lowercase letters', false);
  const uppercase = new CharacterTypes(passwordUppercase, 'uppercase letters', false);

  // create an array to hold the character options to pass to the PasswordGenerator class, and for easy iteration through the character types
  // keeping this flexible as an array so that other character types (I don't know, maybe emoji?) get added in the future
  const characterOptions = [specialCharacters, numbers, lowercase, uppercase];

  // create a new PasswordGenerator class; pass it the default password length, min and max password lengths, and the character options
  // this class gathers all the data and generates the new password, summarises the input,
  // or creates an error message for feedback to the user
  const passwordMaker = new PasswordGenerator(passwordDefaultLength, passwordMinLength, passwordMaxLength, characterOptions);

  // now get the user input and generate the password
  passwordMaker.generatePassword();

  // if the passwordMaker class instance has an error condition, display the error condition to the user
  // otherwise display the generated password to the user.
  if (!passwordMaker.errorCondition.length > 0) {
    passwordText.value = passwordMaker.password;
    // show the copy button if there is a valid password
    copyPasswordBtn.style.display = 'block';
  };

  // display the user feedback: error or list the selections for the user to review
  feedbackText.innerHTML= passwordMaker.userFeedbackHTML();

  // enable the generate button again
  generateBtn.disabled=false;
}
// ---------------------------------------------------------------------------------------------------


// define the PasswordGenerator class
// ---------------------------------------------------------------------------------------------------
class PasswordGenerator {
  /**
   * Creates a new PasswordGenerator. This class generates a password based on user choices and set rules.
   * Here are the input parameters:
   * @param {number} pwdDefaultLength - a suggested password length
   * @param {number} pwdMinLength - the minimum password length allowed
   * @param {number} pwdMaxLength - the maximum password length allowed
   * @param {array} passwordCharacterOptions - an array of CharacterTypes objects that hold the possible characters and the user selection
   */
  constructor(pwdDefaultLength, pwdMinLength, pwdMaxLength, passwordCharacterOptions) {
    this.passwordDefaultLength = pwdDefaultLength;
    this.passwordMinLength = pwdMinLength;
    this.passwordMaxLength = pwdMaxLength;
    this.passwordCharacterOptions=passwordCharacterOptions;
    this.passwordLength = 0; // the user-chosen password length
    this.specialCharactersUsed = []; // an array to hold the title (eg 'lowercase letters') of the special characters to be used the password
    this.errorCondition =''; // a string to hold any error messages. If this is empty, there is no error
    this.password = ''; // the generated password
    this.passwordCharacters =[]; // an array to hold the actual characters to be used in the password, selected by the user
  }

  // The main method to generate the password
  generatePassword() {
    // prompt the user to enter a password length and check for validity
    this.promptUserForPasswordLength();
    console.log('user selected a password length of ' + this.passwordLength );

    // bail out if the user did not enter a valid password length
    if (this.errorCondition.length > 0) {
      console.log('error getting password length: ' + this.errorCondition);
      return;
    };

    // iterate through the character options to ask the user if they want to include each character type
    // and check if the user selected at least one character type
    let userSelectedAtLeastOneCharacterType = false;
    for (const characterType of this.passwordCharacterOptions) {
      // check that there is enough data to run the methods
      if (!characterType.checkData()) {
        this.errorCondition = 'There is not enough data to run the program, this is a bug. Please contact the developer, Rene Malingre';
        return;
      };

      // use the method in the CharacterTypes class to ask the user if they want to include this character type
      characterType.askUser();

      // check if the user selected at least one character type
      if (characterType.isSelected) {
        userSelectedAtLeastOneCharacterType = true;
        this.passwordCharacters = this.passwordCharacters.concat(characterType.characterArray);
        // add the character type to the specialCharactersUsed array for user feedback
        this.specialCharactersUsed.push(characterType.characterType);
      };
    };

    // if the user has not selected at least one character type, return an error
    if (!userSelectedAtLeastOneCharacterType) {
      this.errorCondition = 'You must select at least one character type in order to generate a password';
      return;
    };

    // generate the password
    // create new passwords until the password is validly containing at least one character from each character type
    // This could be done more efficiently, such as  but this is a simple way to ensure that the password is valid
    // without introducing a level of determinism that can make the password less secure.
    // set up a flag for the do while loop to check if the password is valid
    let isValidPassword=true;
    do {
      this.generatePasswordFromSelectedCharacters();
      isValidPassword=true;
      // ensure that the password contains at least one of the chosen characters of each selected type
      // as this could occur by chance, invalidating the password
      for (const characterType of this.passwordCharacterOptions) {
        if (!characterType.passwordIsValidForThisCharacterType(this.password)) {
          isValidPassword=false;
          break;
        }
      }
    } while (!isValidPassword);
    return;
  }

  // This method checks that the chosen password length is valid
  // it takes a password length as input and returns an error string if an error occurs,
  // or an empty string if the password length is valid
  checkPasswordLength() {
    // check that the password is not empty
    if (this.passwordLength === '') {
      return 'Empty response. You must enter a password length between '+ passwordMinLength + ' and ' + passwordMaxLength + ' characters';
    }
    // check that the password length is a number
    else if (isNaN(this.passwordLength)) {
      return 'Not a number. The password length must be a number';
    }
    // check that the password length is not null
    else if (this.passwordLength === null) {
      return 'No response. You must enter a password length between '+ passwordMinLength + ' and ' + passwordMaxLength + ' characters';
    }
    // check that the password length is an integer
    else if (this.passwordLength % 1 !== 0) {
      return 'Not an integer. The password length must be an integer between '+ passwordMinLength + ' and ' + passwordMaxLength + ' characters';
    }
    // check that the password length is between (could vary depending on global variables) 8 and 128 characters
    else if (this.passwordLength < this.passwordMinLength || this.passwordLength > this.passwordMaxLength) {
      return 'Outside range. The password length must be between '+ passwordMinLength + ' and ' + passwordMaxLength + ' characters';
    }
    // if the password length is valid, return an empty string (which indicates no error)
    else {
      return '';
    }
  }

  // This method asks the user for password length, then check that the password length is valid.
  // stores the password length in the passwordLength property
  // stores the error condition in the errorCondition property
  // or if no error, the errorCondition property will be an empty string
  promptUserForPasswordLength() {
    this.passwordLength = prompt('Please select a password length between ' + this.passwordMinLength + ' and ' + this.passwordMaxLength + ' characters', this.passwordDefaultLength);
    this.errorCondition = this.checkPasswordLength();
  }

  // This method creates the password based on the user's selections and the input parameters of possible characters
  generatePasswordFromSelectedCharacters() {
    this.password='';
    // these two error checks are not necessary because the normal calling function already checks for valid input
    // but they are included here for completeness in case the class is reused in a different context
    if (this.errorCondition.length > 0) {
      this.errorCondition = 'No password generated because the password length was zero';
      return;
    };
    if (this.passwordCharacters.length === 0) {
      this.errorCondition = 'No password generated because there are no characters to choose from';
      return;
    };
    // iterate through the password characters array to generate the password randomly
    for (let i = 0; i < this.passwordLength; i++) {
      // get a random character from the passwordCharacters array
      // and add the character at the random index to the password
      this.password += this.getRandomCharacter();
    };
    return;
  }

  // This method generates a random character from the list of characters provided
  // it takes an array of characters as input
  // it returns a random character from the array
  getRandomCharacter() {
    // get a random index from the characters array
    const randomIndex = Math.floor(Math.random() * this.passwordCharacters.length);
    // return the character at the random index
    return this.passwordCharacters[randomIndex];
  };

  // this method returns HTML used for letting the user know the length of password and
  // what character types were used in their password, or the error message if there was an error
  userFeedbackHTML() {
    if (this.errorCondition.length > 0) {
      return '<p class=' + '"error-message"' + '>' + this.errorCondition + '</p>';
    } else {
      let feedback ='';
      if (this.specialCharactersUsed.length>0) {
        // return an unordered list of the character types used in the password
        feedback = '<p id="selection-header">This password was created from your selections:</p>';
        feedback += '<ul>';
        for (const charType of this.specialCharactersUsed) {
          feedback += '<li>include ' + charType + ' \u2713</li>';
        }
        feedback += '<li>a password length of ' + this.passwordLength + ' characters. \u2713</li>';
        feedback += '</ul>';
      } else {
        // this should never happen with the current code, but is included for completeness
        // in case the class is reused in a different context
        feedback = '<p id="selection-header">You did not make valid selections.</p>';
        feedback += '<p>You selected a password length of ' + this.passwordLength + ' characters.</p>';
      };
      return feedback;
    };
  };
};
// End of PasswordGenerator class --------------------------------------------------------------------


// define the CharacterTypes class to hold and select the different types of characters that can be used in a password
// ---------------------------------------------------------------------------------------------------
class CharacterTypes {
  /**
   * Creates a new CharacterTypes. This class represents the type of character (eg 'uppercase letters' and the list of character used to seed the password,
   * and whether the user selected this character type to be included in their password.
   * It has methods to check that there is sufficient data to run the methods,
   * generate the confirm prompt string based on the properties of this class,
   * and ask the user via a confirm popup if they want to include this character type in their password.
   * It also has a method to check that the password contains at least one of the selected character type.
   * Here are the input parameters:
   * @param {string} characters - a string of characters to be potentially included in the password
   * @param {string} characterType - a description of the character type (eg 'uppercase letters')
   * @param {boolean} isSelected - user selection result from the confirm popup
   */
  constructor(characters, characterType, isSelected) {
    // convert the input string to an array of characters for easier manipulation
    this.characterArray = characters.split('');
    this.characterType = characterType;
    this.isSelected = isSelected;
  }

  // check that there is enough data to run the methods
  // this should never be false if the class is used correctly
  checkData() {
    if (this.characterArray === undefined || this.characterType === undefined || this.isSelected === undefined) {
      return false;
    } else {
      if (this.characterArray.length===0 || this.characterType.length===0) {
        return false;
      } else {
        return true;
      }
    }
  }
  // generate the confirm prompt string based on the properties of this class
  constructConfirmPrompt() {
    return 'Do you want to include ' + this.characterType + ' in your password?';
  }
  // ask the user if they want to include this character type in their password
  askUser() {
    // ask the user if they want to include this character type in their password
    const prompt = this.constructConfirmPrompt();
    const userSelection = confirm(prompt);
    // if the user selects OK, update the character type to selected
    if (userSelection === true) {
      this.isSelected=true;
    }
    // if the user does not select OK, return false
    else {
      this.isSelected=false;
    }
    return;
  }

  // confirm that the password contains at least one of the selected character type
  passwordIsValidForThisCharacterType(password) {
    console.log('password: ' + password);
    if (this.isSelected) {
      // password must include at least one of these characters
      for (const char of this.characterArray) {
        if (password.includes(char)) {
          return true;
        }
      };
      console.log('<' + password + '> password does not contain any of the ' + this.characterType + ' characters');
      return false;
    } else {
      // password mus not include any of these characters
      for (const char of this.characterArray) {
        if (password.includes(char)) {
          // this should never happen with the current code, but is included for completeness/debugging purposes
          console.log('Bug Alert! <' + password + '> contains <' + char + '> but it should not include any of the ' + this.characterType + ' characters');
          return false;
        }
      };
      return true;
    }
  }
};
// End of CharacterTypes class ----------------------------------------------------------------------

// UI functions
// Function to add the special characters to the displayed instructions
// ---------------------------------------------------------------------------------------------------
// add the special characters to the displayed instructions for clarity around what the characters actually are
function addSpecialCharactersToInstructions() {
  // relies on the global variable passwordSpecialCharacters being available
  // hard-coded to the particular element id #special-characters
  const specialCharactersLI = document.querySelector('#special-characters');
  const specialCharactersText = specialCharactersLI.textContent + ': <' + passwordSpecialCharacters + '>';
  specialCharactersLI.textContent = specialCharactersText;

  // insert the min and max password length into the instructions
  const instructionsMessage = document.querySelector('#instructions-min-max');
  let instructionsMessageText = instructionsMessage.textContent.replace('!!min!!', passwordMinLength);
  instructionsMessageText = instructionsMessageText.replace('!!max!!', passwordMaxLength);
  instructionsMessage.textContent = instructionsMessageText;

  return;
}
// ---------------------------------------------------------------------------------------------------

// Function to show or hide the user instructions
// ---------------------------------------------------------------------------------------------------
function toggleInstructions() {
  // the initial state of the element is set by inline style only, not by the CSS file
  // so use getComputedStyle instead of just element.style.display. getComputedStyle factors in the css styling.
  // Once the script sets the display value, getComputedStyle is no longer necessary, so this method of checking style
  // is used only to fix the very first click, but it works for subsequent clicks anyway.
  if (window.getComputedStyle(instructions).display == 'none') {
    instructions.style.display = 'block';
    toggleButton.textContent = 'Hide Instructions';
  } else {
    instructions.style.display = 'none';
    toggleButton.textContent = 'Show Instructions';
  }
};
// ---------------------------------------------------------------------------------------------------

// Function to select the password in the TextArea to the clipboard
// ---------------------------------------------------------------------------------------------------
function copyPassword() {
  // select the password text and copy it to the clipboard with the helper function copyToClipboard
  const passwordElement = document.querySelector('#password');
  const passwordText = passwordElement.value;
  if (passwordText.length>0) {
    if (copyToClipboard(passwordText)) {
      // alert the user that the password has been copied to the clipboard
      alert('Your password has been copied to the clipboard');
    } else {
      // alert the user that the password has not been copied to the clipboard
      alert('Your password could not copied to the clipboard');
      return;
    };
  };
};

// Function to copy a string to the clipboard. Uses modern browser API.
// ---------------------------------------------------------------------------------------------------
async function copyToClipboard(myString) {
  try {
    // fancy! asynchronous clipboard API
    await navigator.clipboard.writeText(myString);
    console.log('Text copied to clipboard');
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  };
};
// ---------------------------------------------------------------------------------------------------
