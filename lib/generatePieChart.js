const fs = require('fs')
const JSDOM = require('jsdom').JSDOM
const jsdom = new JSDOM('<body><div id="container"></div></body>', {runScripts: 'dangerously'})
const window = jsdom.window
const anychart = require('anychart')(window)
const anychartExport = require('anychart-nodejs')(anychart)

const generatePieChart = (data) => {
  let chart = anychart.bar(data)
  chart.bounds(0, 0, 800, 600)
  chart.container('container')
  chart.draw()
  chart.title("Top 21 EOS Block Producers")

  // generate JPG image and save it to a file
  anychartExport.exportTo(chart, 'pdf').then(function (image) {
    fs.writeFile('top21.pdf', image, function (fsWriteError) {
      if (fsWriteError) {
        console.log(fsWriteError)
      } else {
        console.log('Complete')
      }
    })
  }, function (generationError) {
    console.log(generationError)
  })
}

module.exports = generatePieChart
