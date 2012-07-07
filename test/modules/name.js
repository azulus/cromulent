module.exports = function (graph) {

  graph.registry.defineNode().outputs('firstName').with(function () {
    var names = [
      'Adam',
      'Bob',
      'Chris',
      'David',
      'Eric'
    ]

    return names[Math.floor(Math.random() * names.length)]
  }).build()

  graph.registry.defineNode().outputs('lastName').with(function () {
    var names = [
      'Alexander',
      'Barry',
      'Cole',
      'Diaz',
      'Elwes'
    ]

    return names[Math.floor(Math.random() * names.length)]
  })

  graph.registry.defineNode().given('firstName', 'lastName').with(function (firstName, lastName) {
    return firstName + ' ' + lastName
  })

}