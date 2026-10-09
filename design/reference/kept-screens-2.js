(function () {
  const { P, OBJ, GEST, n, B, T, TX, KP, CARD, ROWS, R, HP, GRID, BIG, CAM, SHUT, OPTS, INPUT, SEG, QR, BRK, BAN, SLOT, COVER, CHIPS, SIGN, BARS, BTNS, NOTE, RING, ID, DAYS, UP, SP, sigScreen } = window.KK;
  const crewRows = (o) => ROWS([
    R('You', '91% · 64 days', o.Y || '1,043 SKR', { p: 'Y', rc: '#C5F25C', rs: o.Ys || 'live balance' }),
    R('Riya', '94% · 71 days', o.R || '1,043 SKR', { p: 'R', to: 'I2', rs: o.Rs || 'live balance', chev: 1 }),
    R('Arjun', '78% · 40 days', o.A || '857 SKR', { p: 'A', to: 'I2', rc: o.Ac || '#F87171', rs: o.As || 'missed day 2', chev: 1 }),
    R('Dev', '88% · 52 days', o.D || '1,043 SKR', { p: 'D', to: 'I2', rs: o.Ds || 'live balance', chev: 1 })], 'KEEPERS');
  const S = [
    // D · Oaths tab + detail
    { id: 'D0', name: 'Oaths list', g: 'D', tab: 'oaths', head: 'Oaths', blocks: [
      KP('side', '', { prop: 'whisper', size: 76, side: 'l', h: 92, lines: ['Iron Week needs\nyour photo 2.', "Arjun's wobbling.\n3-to-1 he misses.", 'Two Oaths, one empty seat.\nFill it.'] }),
      TX('ACTIVE · 2', { mono: 1 }),
      CARD({ ic: 'dumbbell', name: 'Iron Week', meta: 'Group · Day 3/7', to: 'D2', sm: 1, hp: 90, tags: [['1,043 SKR', 'sack', 'lime'], ['Arjun pending', 'timer-sand', 'ora']] }),
      CARD({ ic: 'book-open-variant', name: 'Read 20 pages', meta: 'Solo · Day 9/14', to: 'D2', sm: 1, tilt: 1, hp: 100, tags: [['500 SKR', 'sack', 'lime'], ['Kept today', 'check', 'lime']] }),
      ROWS([R('Iron Week (draft)', 'Waiting to start · 2 of 4 in', 'Open', { ic: 'timer-sand', to: 'D1', chev: 1 })], 'WAITING TO START'),
      ROWS([R('Hydra 14', 'Ended Sun · claim ready', '+186', { ic: 'trophy-outline', lfg: '#C5F25C', rc: '#C5F25C', to: 'D4', chev: 1 }),
        R('Guitar Days', 'Broke on day 6 · Rematch open', '−1,000', { ic: 'fire', lfg: '#F87171', rc: '#F87171', to: 'D3', chev: 1 })], 'RECENTLY FINISHED'),
      ROWS([R('All history', '50 Oaths · 41 kept · 9 broken', '', { ic: 'history', to: 'D5', chev: 1 })])] },
    { id: 'D1', name: 'Open · creator', nav: { t: 'Iron Week' }, blocks: [
      CHIPS([['Waiting to start', 'timer-sand', 'vio', -2], ['7 days', 'calendar-blank', 'g', 1], ['1,000 SKR each', 'sack', 'lime', -1], ['AI + group review', 'account-group-outline', 'g', 2]]),
      T('Every day I will\nlift for 20 minutes.', 'Dumbbell + a hand gesture, two photos a day.', { fs: 28, pt: 0 }),
      TX('JOINED · 3 OF 4', { mono: 1 }),
      SLOT([['Y', '91%'], ['R', '94%'], ['D', '88%'], [null]]),
      ROWS([R('Copy invite link', 'kept.app/o/IRON-7K2Q', '', { ic: 'link-variant', to: 'toast:Link copied' }), R('Show QR code', 'Friends scan to join', '', { ic: 'qrcode', to: 'C8', chev: 1 })])],
      pin: [B('Start Iron Week', 'D1·go', 'l', 'play'), B('Cancel Oath', 'D1·x', 't')], sim: [['View as a member', 'D1·m']] },
    { id: 'D1·m', name: 'Open · member', nav: { t: 'Iron Week' }, blocks: [
      CHIPS([['Waiting to start', 'timer-sand', 'vio', -2], ['7 days', 'calendar-blank', 'g', 1], ['1,000 SKR staked', 'sack', 'lime', -1]]),
      T('Every day I will\nlift for 20 minutes.', '', { fs: 28, pt: 0 }),
      BAN('vio', 'crown-outline', 'Riya starts it', 'Day 1 begins when she presses Start. You\'ll get a notification.'),
      SLOT([['R', '94%'], ['Y', '91%'], ['D', '88%'], [null]])],
      pin: [B('Leave · get 1,000 SKR back', 'toast:You left. 1,000 SKR returned', 'd', 'logout')] },
    { id: 'D1·x', name: 'Cancel confirm', sheet: 'Iron Week', blocks: [
      T('Cancel Iron Week?', 'Riya and Dev get their 1,000 SKR back. So do you. This can\'t be undone.', { fs: 26, pt: 4 }),
      BTNS([B('Cancel Oath', 'D1·xs', 'd', 'close'), B('Keep it', '<', 's')], 'col')] },
    sigScreen('D1·xs', 'Cancel · signing', 'Confirm the cancel', 'Refunding 3,000 SKR to 3 Keepers.', 'D0', [['Rejected', 'C7·no']]),
    sigScreen('D1·go', 'Start · signing', 'Start Iron Week', 'Locks 4,000 SKR. Day 1 begins now.', 'D2', [['Failed', 'C7·fail']]),
    { id: 'D2', name: 'Active', nav: { t: 'Iron Week', right: 'Day 3/7' }, blocks: [
      HP(90, { note: 'Arjun missed day 2: −20, then +10 heal.' }),
      TX('<m>9h 18m</m> left today · first miss −143 SKR'),
      KP('side', 'Arjun\'s still on the couch.\n3-to-1 he misses.', { prop: 'whisper', size: 92, side: 'r', h: 106 }),
      GRID(7, 3, { Y: 'kkh', R: 'kkk', A: 'kmp', D: 'kkr' }),
      CHIPS([['Riya 1-to-9', 'cards-playing-outline', 'g', -2], ['Arjun 3-to-1 to miss', 'cards-playing-outline', 'ora', 2], ['Dev in review', 'eye-outline', 'vio', -1]]),
      s => s['n:rev1'] ? null : BAN('vio', 'eye-outline', 'Dev asked for a review', 'Photo 2 failed 3 times. Your vote counts.', { to: 'G1' }),
      crewRows({}),
      BAN('grey', 'chart-line', 'If Arjun misses today', 'You +43 · Riya +43 · Dev +43 · fee 14 SKR')],
      pin: [B('Take photo 2', 'F4', 'p', 'camera'), B('Nudge Arjun', 'toast:Nudged Arjun', 's', 'bell-ring-outline')],
      sim: [['HP low', 'D2·low'], ['HP hits 0', 'D3'], ['Oath ends', 'D4']] },
    { id: 'D2·low', name: 'Active · HP low', nav: { t: 'Iron Week', right: 'Day 5/7' }, tone: 'red', blocks: [
      HP(20, { lost: 2, warn: 'One more miss breaks it. Everyone loses everything.' }),
      KP('stern', 'Don\'t look at me.\nLook at Arjun.', { prop: 'scythe', size: 100, side: 'l', h: 120 }),
      GRID(7, 5, { Y: 'kkkkh', R: 'kkkkk', A: 'kmkmp', D: 'kkmkp' }),
      crewRows({ A: '642 SKR', As: '2 misses', D: '900 SKR', Ds: 'missed day 3', Dc: '#F87171' })],
      pin: [B('Take photo 2', 'F4', 'l', 'camera'), B('Nudge Arjun and Dev', 'toast:Nudged 2 Keepers', 's', 'bell-ring-outline')] },
    { id: 'D3', name: 'Broken', nav: { t: 'Guitar Days' }, tone: 'ember', fx: 'embers', blocks: [
      HP(0, { note: 'Broke at midnight after day 6.' }),
      T('The Oath is broken.', 'Dev missed day 5. Arjun missed day 6. HP hit 0, and the whole pot burned.', { fs: 30, pt: 0 }),
      GRID(7, 7, { Y: 'kkkkkkf', R: 'kkkkkkf', A: 'kmkkkxf', D: 'kkkkmkf' }),
      BRK([['You', '−1,000 SKR', '#F87171'], ['Riya', '−1,000 SKR', '#F87171'], ['Arjun', '−1,000 SKR', '#F87171'], ['Dev', '−1,000 SKR', '#F87171']], 'STAKES LOST'),
      CARD({ ic: 'sword-cross', name: 'Rematch available', meta: 'Same goal · same object · 7 days', icbg: '#C5F25C', line: 'Keep every day and it doesn\'t break: win back 500 SKR, half of what you lost.', tags: [['6d 23h left', 'alarm', 'red'], ['Riya joined', 'check', 'lime']], to: 'R1', lime: 1 })],
      pin: [B('Rematch · win back 500', 'R1', 'l', 'sword-cross'), B('Start a new Oath', 'C1', 't')] },
    { id: 'D4', name: 'Ended', nav: { t: 'Hydra 14' }, blocks: [
      CHIPS([['Ended Sun 5 Oct', 'flag-checkered', 'g', -2], ['HP 70', 'heart-pulse', 'lime', 2]]),
      T('Kept by 3 of 4.', 'Arjun slipped twice. His SKR went to everyone who kept.', { fs: 30, pt: 0 }),
      GRID(14, 15, { Y: 'kkkkkkkkkkkkkk', R: 'kkkkkkkkkkkkkk', A: 'kkmkkkkkmkkkkk', D: 'kkkkkkkkkkkkkk' }),
      ROWS([R('You', 'start 1,000 · lost 0 · won +186', '1,186', { p: 'Y', rc: '#C5F25C', rs: 'SKR' }),
        R('Riya', 'start 1,000 · lost 0 · won +186', '1,186', { p: 'R', rc: '#C5F25C', rs: 'SKR' }),
        R('Dev', 'start 1,000 · lost 0 · won +186', '1,186', { p: 'D', rc: '#C5F25C', rs: 'SKR' }),
        R('Arjun', 'start 1,000 · lost −179 · fee −18', '821', { p: 'A', rc: '#F87171', rs: 'SKR' })], 'FINAL BALANCES')],
      pin: [B('Claim 1,186 SKR', 'J1', 'l', 'hand-coin-outline')] },

    // E · Join
    { id: 'E1', name: 'Enter invite', nav: { t: 'Join an Oath', close: 1 }, blocks: [
      T('Got an invite?', 'Paste the code, scan the QR, or open the link.', { pt: 4 }),
      CAM({ ic: 'qrcode-scan', h: 230, state: 'scan', label: 'Point at the QR code' }),
      INPUT({ id: 'code', lab: 'Or type the code', pre: '', sug: ['IRON-7K2Q'], val0: 'IRON-7K2Q', mono: 1 }),
      BTNS([B('Paste', 'toast:Pasted IRON-7K2Q', 's', 'content-paste')])],
      pin: [B('Find Oath', 'E2')], sim: [['Invalid code', 'E3·code'], ['Already started', 'E3·late'], ['Already joined', 'E3·in'], ['Not eligible', 'E3·elig'], ['Not enough SKR', 'E3·skr']] },
    { id: 'E2', name: 'Oath preview', nav: { t: 'Invite' }, blocks: [
      TX('RIYA INVITED YOU', { mono: 1 }),
      CARD({ ic: 'dumbbell', name: 'Iron Week', meta: 'by Riya · 7 days · AI + group review', line: 'Every day I will lift for 20 minutes.', tags: [['1,000 SKR each', 'sack', 'lime'], ['Starts when Riya says', 'timer-sand', 'vio']], stack: 1, mt: 24, tilt: -1, fl: ['94% kept rate', 'R'] }),
      ROWS([R('Riya', 'Creator', '94%', { p: 'R', rs: '71 days', to: 'I2' }), R('Dev', 'Joined', '88%', { p: 'D', rs: '52 days', to: 'I2' }), R('Arjun', 'Joined', '78%', { p: 'A', rs: '40 days', to: 'I2' })], 'KEEPERS · KEPT RATE'),
      BRK([['HP', '100 · −20 per miss · +10 a day'], ['First miss', '−143 SKR, then 1.5×'], ['At 0 HP', 'Everyone loses the pot', '#F87171'], ['Fee', '10% of lost SKR']], 'THE RULES')],
      pin: [B('Join & stake 1,000 SKR', 'do:inv1|E2·s', 'l', 'draw-pen')] },
    sigScreen('E2·s', 'Join · signing', 'Join Iron Week', 'Staking 1,000 SKR alongside Riya, Dev and Arjun.', 'D1·m', [['Rejected', 'C7·no'], ['Not enough SKR', 'E3·skr']]),
    ...[['E3·code', 'Invalid code', 'That code doesn\'t exist.', 'Check for typos. Codes look like IRON-7K2Q.', [B('Try again', 'E1'), B('Start your own', 'C1', 't')]],
      ['E3·late', 'Already started', 'Too late. Iron Week started.', 'Oaths lock on day 1 so nobody joins halfway. Start your own.', [B('Start your own', 'C1'), B('Back', 'E1', 't')]],
      ['E3·in', 'Already joined', 'You\'re already in.', 'You staked 1,000 SKR on Iron Week on Monday.', [B('Open the Oath', 'D2'), B('Back', 'E1', 't')]],
      ['E3·elig', 'Not eligible', 'Group Oaths need a verified Seeker.', 'Your wallet has no Genesis token. Solo Oaths are still yours.', [B('Start a solo Oath', 'C1'), B('Back', 'E1', 't')]],
      ['E3·skr', 'Not enough SKR', 'You need 1,000 SKR.', 'You have 620 SKR. Grab test SKR from the faucet in Profile.', [B('Open the faucet', 'I4'), B('Start your own', 'C1', 't')]]]
      .map(([id, name, h, sub, pin], i) => ({ id, name, g: 'E', nav: { t: 'Join an Oath' }, blocks: [SP(30), KP(['shocked', 'side', 'wink', 'soft', 'bored'][i], ['Nice try.', 'You snooze, you watch.', 'Eager. I like it.', 'Rules are rules, friend.', 'Pockets a bit light.'][i], { anim: 'shrug', size: 130, side: 'c', h: 220 }), T(h, sub, { al: 'center' })], pin })),
  ];
  window.KS.push(...S.map(s => ({ ...s, g: s.g || s.id[0] })));
})();
