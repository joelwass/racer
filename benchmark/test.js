'use strict'

var request = require('request')
var async = require('async')
var reqfast = require('req-fast')
var fetch = require('node-fetch');


let mod = {
  request,
  reqfast,
  fetch
}
let max = -10000
let min = -max
let total = 0
const attempts = 1000

// ignoring network issues, using local site for testing.
console.log(`A sample of ${attempts} cases:\n`)
console.log('module\tavg\tmin\tmax')
async.waterfall([
  async.apply(test, 'request'),
  async.apply(test, 'reqfast'),
  async.apply(test, 'fetch')
], () => {
  console.log('\ncompleted')
})

function test (module, fn) {
  let waterfalls = []
  for (let i = 0; i < attempts; i++) {
    waterfalls.push((next) => {
      if (module === 'fetch') {
        mod[module](`http://localhost:9002/?t=${Math.random()}`).then(() => {
          took(process.hrtime()[1], next)
        })
      } else {
        mod[module](`http://localhost:9002/?t=${Math.random()}`, () => {
          took(process.hrtime()[1], next)
        })
      }
    })
  }
  async.waterfall(waterfalls, () => {
    let avg = total / attempts
    console.log('%s\t%dns\t%dns\t%dns', module, avg.toFixed(2), min.toFixed(2), max.toFixed(2))
    min = 0
    max = 0
    total = 0
    fn()
  })
}

function took (start, fn) {
  let spent = process.hrtime()[1] - start
  total += spent
  max = Math.max(spent, max)
  min = Math.min(spent, min)

  // setTimeout makes server have no stick(there have too much socket connections).
  setTimeout(fn, 10)
}