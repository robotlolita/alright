// Copyright (c) 2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var spec    = require('hifive')()
var alright = require('../../lib')
var claire  = require('claire')
var k       = require('core.lambda').constant
var deepEq  = require('deep-equal')
var extend  = require('boo').extend

// Aliases
var _       = alright
var t       = claire.data
var forAll  = claire.forAll
var classOf = Function.call.bind(Object.prototype.toString)

// Data types
var Any  = claire.sized(k(10), t.Any)
var List = function(a){ return claire.sized(k(10), t.Array(a)) }
var Map  = function(a){ return claire.sized(k(10), t.Object(a)) }

// Helpers
function notEmpty(as){ return as.length > 0 }
function pick(as){ return as[Math.floor(Math.random() * as.length)] }
function shuffle(a){ return a.sort(function(x,y){ return Math.random() - 0.5 })}

// Specification
module.exports = spec('Validations', function(it, spec) {

  spec('assert()', function(it) {
    var divergence = _.divergence.Divergence

    it( 'Should create a successful validation if the assertion is true.'
      , function() {
          _.assert(true, divergence).isSuccess => true
          _.assert(true, divergence).get()     => divergence
        })

    it( 'Should create a failed validation if the assertion fails.'
      , function() {
          _.assert(false, divergence).isFailure    => true
          _.assert(false, divergence).swap().get() => divergence
        })
  })

  it( 'equals(α, β) should succeed if α and β are structurally equal'
    , forAll(Any, Any).satisfy(function(a, b) {
        return (
          _.equals(a)(a).isSuccess => true,
          _.equals(b)(b).isSuccess => true,
          _.equals(a)(b).isSuccess => deepEq(a, b)
        )
      }).asTest())
      
  it( 'ok(α) should succeed whenever α is truthy'
    , forAll(Any).satisfy(function(a) {
        return _.ok(a).isSuccess => !!a
      }).asTest())

  it( 'strictEquals(α, β) should succeed if α and β are strict equal'
    , forAll(Any, Any).satisfy(function(a, b) {
        return (
          _.strictEquals(a)(a).isSuccess => a === a,
          _.strictEquals(b)(b).isSuccess => b === b,
          _.strictEquals(a)(b).isSuccess => a === b
        )
      }).asTest())

  it( 'isOfType(α, β) should succeed whenever β is of type α'
    , forAll(Any).satisfy(function(a) {
        return _.isOfType(typeof a)(a).isSuccess => true
      }).asTest())

  it( 'isOfClass(α, β) should succeed whenever β has class α'
    , forAll(Any).satisfy(function(a) {
        return _.isOfClass(classOf(a).slice(8, -1))(a).isSuccess => true
      }).asTest())

  it( 'contains(α, β) should succeed whenever β contains α'
    , forAll(List(Any)).given(notEmpty).satisfy(function(as) {
        return (
          _.contains(pick(as))(as).isSuccess => true,
          _.contains({})(as).isFailure       => true
        )
      }).asTest())

  it( 'matches(α)(β) should succeed whenever α successfully matches β'
    , forAll(t.Str).satisfy(function(a) {
        // TODO
      }).asTest()
    ).disable()

  it( 'has(α)(β) should succeed whenever β has a property α'
    , forAll(Map(t.Int), List(t.Id)).satisfy(function(a, bs) {
        var keys = shuffle(Object.keys(a).concat(bs))
        var key  = pick(keys)

        return _.has(key)(a).isSuccess => key in a
      }).asTest())


})