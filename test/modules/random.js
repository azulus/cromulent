module.exports = function (moduleLoader) {

  // load the graph
  moduleLoader.registry.defineNode()
    .outputs("randomNum")
    .given("min", "max")
    .with(function (min, max) {
      return Math.floor(Math.random() * (max.get() - min.get())) + min.get()
    }).build()

}