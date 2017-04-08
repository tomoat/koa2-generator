import test from 'ava'
import {execSync, spawn} from 'child_process'
import execa from 'execa'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import request from 'supertest'

const tempDir = path.join(__dirname, '../temp')
const binPath = path.join(__dirname, '../bin/koa2')
const cmd = `yarn install`

test.before('cleanup test code', t => {
  rimraf.sync(tempDir)
})

test.todo('no args test')
const noargsPath = path.join(tempDir, 'noargs')
test('should create basic app', async t => {
  const {stdout} = await execa(binPath, [noargsPath])
  console.log(stdout)
  t.is(stdout.split('\n').length, 34)
})
test('ava test', t => {
  // mkdirp(tempDir)

  // t.is((), '')
})


