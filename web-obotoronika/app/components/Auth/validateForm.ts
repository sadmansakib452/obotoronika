function validateForm(state: any) {
  const errorMessages: any = {}

  // Validate first name
  if (!state.firstName) {
    errorMessages.firstName = 'Please enter your first name'
  }
  else if (state.firstName.length < 2) {
    errorMessages.firstName = 'First name must be at least 2 characters'
  }
  else {
    errorMessages.firstName = ''
  }

  // Validate last name
  if (!state.lastName) {
    errorMessages.lastName = 'Please enter your last name'
  }
  else if (state.lastName.length < 2) {
    errorMessages.lastName = 'Last name must be at least 2 characters'
  }
  else {
    errorMessages.lastName = ''
  }

  // Validate password
  if (!state.password) {
    errorMessages.password = 'Please enter a password'
  }
  else if (state.password.length < 8) {
    errorMessages.password = 'Password must be at least 8 characters long'
  }
  else {
    errorMessages.password = ''
  }

  // Confirm password
  if (state.password !== state.confirmPassword) {
    errorMessages.confirmPassword = 'Passwords do not match'
  }
  else {
    errorMessages.confirmPassword = ''
  }

  return errorMessages
}

export default validateForm
