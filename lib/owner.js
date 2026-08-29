const { OWNER_SUDO } = require('../config')

const OWNER_ONLY_MSG = '_Only owner can do this._'

function digits(value) {
  return String(value || '').replace(/\D/g, '')
}

function splitNums(value) {
  return String(value || '')
    .split(/[,;|]/)
    .map((n) => digits(n))
    .filter((n) => n.length >= 6)
}

function numsMatch(a, b) {
  if (!a || !b) return false
  if (a === b) return true
  const min = Math.min(a.length, b.length)
  if (min < 10) return false
  return a.endsWith(b) || b.endsWith(a)
}

function jidDigits(jid) {
  if (!jid) return ''
  return digits(String(jid).split('@')[0].split(':')[0])
}

function getConfigOwners() {
  return splitNums(OWNER_SUDO)
}

function isConfigOwner(message) {
  const owners = getConfigOwners()
  if (!owners.length) return true
  const key = (message.data && message.data.key) || message.key || {}
  const candidates = [
    message.participant,
    message.sender,
    message.participantPn,
    key.participant,
    key.participantPn,
    key.remoteJidAlt,
    message.isGroup ? null : message.jid,
    message.isGroup ? null : key.remoteJid,
  ]
  const senderNums = candidates.map(jidDigits).filter(Boolean)
  return senderNums.some((s) => owners.some((o) => numsMatch(s, o)))
}

async function assertOwner(message) {
  if (isConfigOwner(message)) return true
  await message.send(OWNER_ONLY_MSG)
  return false
}

function withConfigOwners(sudoStr) {
  const owners = getConfigOwners()
  const extra = splitNums(sudoStr)
  const merged = [...owners]
  for (const n of extra) {
    if (!merged.some((o) => numsMatch(o, n))) merged.push(n)
  }
  return merged.join(',')
}

function isConfigOwnerNumber(num) {
  const n = digits(num)
  return getConfigOwners().some((o) => numsMatch(o, n))
}

module.exports = {
  getConfigOwners,
  isConfigOwner,
  assertOwner,
  withConfigOwners,
  isConfigOwnerNumber,
  OWNER_ONLY_MSG,
}
