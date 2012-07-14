{exec} = require 'child_process'
task 'build', 'Build project from coffee/*.coffee to js/*.js', ->
  console.log '---> Building project from coffee/*.coffee to js/*.js'
  exec 'node_modules/coffee-script/bin/coffee --compile --output js/ coffee/', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
