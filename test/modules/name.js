module.exports = function (moduleLoader) {

  moduleLoader.registry.defineNode().given('first_names').outputs('first_name').with(function (firstNames) {
    firstNames = firstNames.get()
    return firstNames[Math.floor(Math.random() * firstNames.length)]
  }).build()

  moduleLoader.registry.defineNode().given('last_names').outputs('last_name').with(function (lastNames) {
    lastNames = lastNames.get()
    return lastNames[Math.floor(Math.random() * lastNames.length)]
  }).build()

  moduleLoader.registry.defineNode().outputs('full_name').given('first_name', 'last_name').with(function (firstName, lastName) {
    return firstName.get() + ' ' + lastName.get()
  }).build()

}