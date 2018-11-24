#!/usr/bin/env node

'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')

const prompt = require('prompt')
const _progress = require('cli-progress')
const download = require('cheetah-downloader')

const bar1 = new _progress.Bar({
  format: '[{bar}] {percentage}% | ETA: {remain} | Speed: {speed} kb/s'
}, _progress.Presets.shades_grey)

function milliToX (millis) {
  var hours = Math.floor(millis / 36e5)
  var mins = Math.floor((millis % 36e5) / 6e4)
  var secs = Math.floor((millis % 6e4) / 1000)
  return hours + ':' + mins + ':' + secs
}

const targetDir = process.argv[2] || path.join(os.homedir(), '/Downloads')
prompt.message = '>'
prompt.start()

try {
  fs.accessSync(targetDir, fs.W_OK)
} catch (e) {
  console.log('Target folder not accessible:', e.code, targetDir)
  return
}

prompt.get({
  properties: {
    url: {
      type: 'string',
      required: true,
      message: 'Please enter a valid URL'
    }
  }
}, function(err, res) {
  try {
    const tempDir = os.tmpdir() + '/cheetah-cli/'
    fs.mkdir(tempDir, {}, () => {})

    const cheetah = download(res.url, targetDir, { tempDir })

    cheetah
      .on('progress', function (progress) {
        var remain = milliToX(progress.timeRemaining * 1000)
        bar1.update(progress.percent, {
          remain: remain,
          speed: progress.speed
        })
      })
      .on('complete', function(res) {
        bar1.stop()
        console.log('Downloaded at:\n', res.path)
      })
      .start()

    bar1.start(100, 0, {
      remain: '0',
      speed: '0'
    })
  } catch (e) {
    console.log('Some error occurred', e)
  }
})