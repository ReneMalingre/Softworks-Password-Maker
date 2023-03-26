// Code to generate a random password based on user-selected criteria
// The user must select a password length between 8 and 128 characters
// and select at least one of the following character types:
// special characters, numbers, lowercase letters, uppercase letters
// The password is generated randomly from the selected character types
// and displayed to the user, or if there is an error, an error message is displayed to the user

// select the generate button
var generateBtn = document.querySelector('#generate');
// Add event listener to generate button
generateBtn.addEventListener('click', writePassword);

// store the password characters in string constants

// Write password to the #password input
function writePassword() {
  // set the min, max and default password lengths
  const passwordDefaultLength = 12;
  const passwordMinLength = 8;
  const passwordMaxLength = 128;

  // the possible password characters are stored in string constants, in 4 different categories
  const passwordSpecialCharacters = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
  const passwordNumbers = '0123456789';
  const passwordLowercase = 'abcdefghijklmnopqrstuvwxyz';
  const passwordUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // create class instances to hold the valid password characters
  // and whether the character type is selected by the user
  const specialCharacters = new CharacterTypes(passwordSpecialCharacters, 'special characters', false);
  const numbers = new CharacterTypes(passwordNumbers, 'numbers', false);
  const lowercase = new CharacterTypes(passwordLowercase, 'lowercase letters', false);
  const uppercase = new CharacterTypes(passwordUppercase, 'uppercase letters', false);

  // create an array to hold the character options to pass to the GeneratePasswordResult class, and for easy iteration through the character types
  const characterOptions = [specialCharacters, numbers, lowercase, uppercase];

  // create a new GeneratePasswordResult object to hold the password length, final password and error condition as set by the generatePassword function
  const passwordResult =new GeneratePasswordResult(passwordDefaultLength, passwordMinLength, passwordMaxLength, characterOptions);
  generatePassword(passwordResult);
  const passwordText = document.querySelector('#password');
  if (passwordResult.errorCondition.length > 0) {
    passwordText.value = passwordResult.errorCondition;
  } else {
    passwordText.value = passwordResult.password;
  };
}


// This is function to generate a password
// it needs a valid password length, and at least one character type chosen from 4 options
// then generate a password of the chosen length from the chosen character types randomly
// the user is prompted to choose a password length and which character types to include.
// it returns a string of the generated password to be displayed to the user
function generatePassword(generateResult) {
  // prompt the user to enter a password length and check for validity
  generateResult.promptUserForPasswordLength();
  console.log('user selected a password length of ' + generateResult.passwordLength );

  // bail out if the user did not enter a valid password length
  if (generateResult.errorCondition.length > 0) {
    console.log('error getting password length: ' + generateResult.errorCondition);
    return;
  };

  // iterate through the character options to ask the user if they want to include each character type
  // and check if the user selected at least one character type
  let userSelectedAtLeastOneCharacterType = false;
  for (const characterType of generateResult.passwordCharacterOptions) {
    console.log('pre checkUserSelection:');
    console.log(characterType);
    // check that there is enough data to run the methods
    if (!characterType.checkData()) {
      generateResult.errorCondition = 'There is not enough data to run the program, this is a bug. Please contact the Rene Malingre';
      return;
    };
    // use the method in the CharacterTypes class to ask the user if they want to include this character type
    characterType.askUser();
    // check if the user selected at least one character type
    if (characterType.isSelected) {
      userSelectedAtLeastOneCharacterType = true;
    };
    console.log('post checkUserSelection:');
    console.log(characterType);
  };

  // if the user has not selected at least one character type, return an error
  if (!userSelectedAtLeastOneCharacterType) {
    generateResult.errorCondition = 'You must select at least one character type in order to generate a password';
    return;
  };

  // now we can generate the password!
  // create an array to hold the password characters from the selected character types
  let passwordCharacters = [];
  // iterate through the selected character options
  for (const characterType of generateResult.passwordCharacterOptions) {
    // if the character type is selected, concatenate the characters to the passwordCharacters array
    if (characterType.isSelected) {
      passwordCharacters = passwordCharacters.concat(characterType.specialCharacters);
      // add the character type to the specialCharactersUsed array for user feedback
      generateResult.specialCharactersUsed.push(characterType.characterType);
    };
  };
  console.log('available password characters ' + passwordCharacters);

  // create the password based on the validated inputs
  generateResult.generatePassword(passwordCharacters);
  if (generateResult.errorCondition.length > 0) {
    console.log('error creating the password: ' + generateResult.errorCondition);
  } else {
    console.log('generated password ' + generateResult.password + ' of length ' + generateResult.password.length );
  };

  // all done!
  return;
}

// define a character types class
// input a string of special characters, a type of character used as a question prompt
// and a boolean for whether the character type is selected
// contains methods to check that there is sufficient data to run the methods,
// generate the confirm prompt string based on the properties of this class,
// and ask the user if they want to include this character type in their password
class CharacterTypes {
  constructor(specialCharacters, characterType, isSelected) {
    // convert the string to an array of characters for easier manipulation
    this.specialCharacters = specialCharacters.split('');
    this.characterType = characterType;
    this.isSelected = isSelected;
  }
  // check that there is enough data to run the methods
  checkData() {
    if (this.specialCharacters === undefined || this.characterType === undefined || this.isSelected === undefined) {
      return false;
    } else {
      if (this.specialCharacters.length===0 || this.characterType.length===0) {
        return false;
      } else {
        return true;
      }
    }
  }
  // generate the confirm prompt string based on the properties of this class
  constructConfirmPrompt() {
    return 'Do you want to include ' + this.characterType + ' (' + this.specialCharacters.join('') + ' ) in your password?';
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
};

// define a class to generate a password
class GeneratePasswordResult {
  constructor(pwdDefaultLength, pwdMinLength, pwdMaxLength, passwordCharacterOptions) {
    this.passwordDefaultLength = pwdDefaultLength;
    this.passwordMinLength = pwdMinLength;
    this.passwordMaxLength = pwdMaxLength;
    this.passwordCharacterOptions=passwordCharacterOptions;
    this.passwordLength = 0;
    this.specialCharactersUsed = [];
    this.errorCondition ='';
    this.password = '';
  }
  // create a method to check that the chosen password length is valid
  // it takes a password length as input and returns an error string if an error occurs,
  // or an empty string if the password length is valid
  checkPasswordLength() {
  // check that the password length is a number
    if (isNaN(this.passwordLength)) {
      return 'The password length must be a number';
    }
    // check that the password length is not null (eg if user clicks cancel)
    else if (this.passwordLength === null) {
      return 'You must enter a password length';
    }
    // check that the password length is an integer
    else if (this.passwordLength % 1 !== 0) {
      return 'The password length must be an integer';
    }
    // check that the password length is between 8 and 128 characters
    else if (this.passwordLength < this.passwordMinLength || this.passwordLength > this.passwordMaxLength) {
      return 'The password length must be between 8 and 128 characters';
    }
    // if the password length is valid, return true
    else {
      return '';
    }
  }

  // ask user for password length, then check that the password length is valid.
  // store the password length in the passwordLength property
  // store the error condition in the errorCondition property
  // or if no error, the errorCondition property will be an empty string
  promptUserForPasswordLength() {
    this.passwordLength = prompt('Please select a password length between ' + this.passwordMinLength + ' and ' + this.passwordMaxLength + ' characters', this.passwordDefaultLength);
    this.errorCondition = this.checkPasswordLength();
  }

  // create the password based on the user's selections and the input parameters of possible characters
  generatePassword(passwordCharacters) {
    this.password='';
    // these two error checks are not necessary because the normal calling function already checks for valid input
    // but they are included here for completeness in case the class is reused in a different context
    if (this.errorCondition.length>0) {
      this.errorCondition = 'No password generated because the password length was zero';
      return;
    };
    if (passwordCharacters.length===0) {
      this.errorCondition = 'No password generated because there are no characters to choose from';
      return;
    };
    // iterate through the password characters array to generate the password randomly
    for (let i = 0; i < this.passwordLength; i++) {
      // get a random character from the passwordCharacters array
      // and add the character at the random index to the password
      this.password += this.getRandomCharacter(passwordCharacters);
      console.log(this.password);
    };
    return;
  }
  // This method generates a random character from the list of characters provided
  // it takes an array of characters as input
  // it returns a random character from the array
  getRandomCharacter(validCharacters) {
    // get a random index from the characters array
    const randomIndex = Math.floor(Math.random() * validCharacters.length);
    // return the character at the random index
    return validCharacters[randomIndex];
  };
};


