const { bot, lang, sleep } = require('../lib/')
const { restartInstance } = require('../lib/pm2')
const { assertOwner } = require('../lib/owner')
bot(
  {
    pattern: 'reboot ?(.*)',
    desc: lang.plugins.reboot.desc,
    type: 'misc',
  },
  async (message) => {
    if (!(await assertOwner(message))) return
    await message.send(lang.plugins.reboot.starting)
    await sleep(3000)
    restartInstance()
  }
)
