(function () {
  const { OBJ, n, B, T, TX, KP, CARD, ROWS, R, HP, BIG, OPTS, INPUT, SEG, BRK, BAN, SLOT, COVER, CHIPS, SIGN, BTNS, NOTE, DAYS, UP, SP, sigScreen } = window.KK;
  const S = [
    // K · Create a Bounty
    { id: 'K1', name: 'Basics', nav: { steps: [1, 5], close: 1 }, blocks: [
      T('Set the challenge.', 'Public, free to join. Miss a day and you\'re out.', { pt: 4 }),
      INPUT({ id: 'btitle', lab: 'Title', pre: '', sug: ['Dawn Pages', 'Hydrate Week', 'Iron Month'], max: 32 }),
      OPTS('bobj', OBJ.map(([t, ic]) => ({ t, ic })), { mode: 'tile', cols: 4, small: 1 }),
      OPTS('blen', [{ t: '3', s: 'days' }, { t: '7', s: 'days' }, { t: '14', s: 'days' }], { mode: 'big', cols: 3, small: 1 }),
      TX('JOINS CLOSE', { mono: 1 }), SEG(['12 h', '24 h', '48 h', 'Day 1 ends'], { id: 'bdl', def: 1 })],
      pin: [B('Next', 'K2')] },
    { id: 'K2', name: 'Pool', nav: { steps: [2, 5] }, blocks: s => { const pool = [10000, 25000, 50000, 100000][s.bpool ?? 2]; return [
      T('Fund the pool.', 'Survivors split it equally at the end.', { pt: 4 }),
      BIG(n(pool), 'SKR in the pool', { fs: 64, c: '#C5F25C' }),
      OPTS('bpool', [{ t: '10k' }, { t: '25k' }, { t: '50k' }, { t: '100k' }], { mode: 'chip', cols: 4 }),
      BRK([['Pool', n(pool) + ' SKR'], ['KEPT fee (10%)', n(pool / 10) + ' SKR'], ['You pay', n(pool * 1.1) + ' SKR', '#fff', 1]])]; },
      pin: [B('Next', 'K3')] },
    { id: 'K3', name: 'Branding', nav: { steps: [3, 5] }, blocks: [
      T('Make it yours.', 'Shown on the Bounty card and detail page.', { pt: 4 }),
      UP('Add a cover', '1200 × 600 · JPG or PNG'),
      INPUT({ id: 'bmsg', lab: 'Message', pre: '', sug: ['Read before your phone. 14 mornings.', 'Prove it before breakfast.'], max: 80 }),
      INPUT({ id: 'blink', lab: 'One link', pre: '', sug: ['dawnpages.xyz'], max: 60, mono: 1 })],
      pin: [B('Next', 'K4')] },
    { id: 'K4', name: 'Requirements', nav: { steps: [4, 5] }, blocks: [
      T('Who can join?', 'Optional. Every entrant needs a verified Seeker either way.', { pt: 4 }),
      ROWS([R('Minimum kept rate', 'Filters out flaky entrants', '', { ic: 'shield-check-outline', tg: 'req1', on: 1 })]),
      OPTS('kr', [{ t: '60%' }, { t: '70%' }, { t: '80%' }, { t: '90%' }], { mode: 'chip', cols: 4, def: 1 }),
      ROWS([R('Token held', 'e.g. hold 1 PAGES', '', { ic: 'key-outline', tg: 'req2', on: 0 })])],
      pin: [B('Next', 'K5')] },
    { id: 'K5', name: 'Review & fund', nav: { steps: [5, 5] }, blocks: [
      T('Review and fund.', '', { pt: 4 }),
      COVER({ brand: 'You', logo: 'S', ic: 'book-open-variant', bg: 'linear-gradient(135deg,#A78BFA,#4C1D95)', msg: 'Dawn Pages\nRead before your phone.', h: 140 }),
      BRK([['Object', 'Book'], ['Length', '14 days'], ['Joins close', '24 h after launch'], ['Requirements', '70%+ kept rate'], ['Pool', '20,000 SKR', '#C5F25C'], ['Fee', '2,000 SKR'], ['You pay', '22,000 SKR', '#fff', 1]])],
      pin: [B('Sign & fund', 'K5·p', 'l', 'draw-pen')] },
    sigScreen('K5·p', 'Fund · signing', 'Fund Dawn Pages', '22,000 SKR into the pool and fee.', 'K5·ok', [['Rejected', 'C7·no'], ['Not enough SKR', 'M4']]),
    { id: 'K5·ok', name: 'Bounty live', nav: { close: 1 }, blocks: [SP(60), SIGN('success', '20,000 SKR pool'),
      T('Dawn Pages is live.', 'It\'s in Discover now. Joins close in 24 hours.', { al: 'center', pt: 26 }),
      BTNS([B('Share', 'toast:Share sheet opened', 's', 'share-variant')])],
      pin: [B('Open stats', 'H6')] },

    // L · Results
    { id: 'L1', name: 'Kept every day', nav: { close: 1 }, fx: 'coins', tone: 'lime', beam: 1, pops: [['+186 SKR', 'sack'], ['7 of 7', 'check-bold']], blocks: [
      KP('shades', 'Seven for seven.\nPay the Keeper.', { prop: 'sack', anim: 'jump', size: 170, side: 'c', h: 260, orbs: [['sack', 288, 40, 46, 'lime', 0, 'c'], ['sack', 304, 124, 28, 'lime', 0, 'c'], ['trophy-outline', 12, 176, 44, 'amber', -12]] }),
      T('Iron Week, kept.', '', { al: 'center', fs: 36, pt: 0 }),
      BIG('1,186', 'SKR · up 186', { fs: 56, c: '#C5F25C' }),
      BRK([['Start', '1,000'], ['Lost', '0'], ['Won', '+186', '#C5F25C'], ['Final', '1,186 SKR', '#C5F25C', 1]])],
      pin: [B('Claim 1,186 SKR', 'J1', 'l', 'hand-coin-outline')] },
    { id: 'L2', name: 'Missed some days', nav: { close: 1 }, blocks: [
      KP('wink', 'Two slips.\nStill walked out up.', { prop: 'coin', size: 140, side: 'c', h: 230 }),
      T('Iron Week is over.', 'You missed days 4 and 6.', { al: 'center', pt: 0 }),
      BIG('1,029', 'SKR · up 29', { fs: 52 }),
      BRK([['Start', '1,000'], ['Lost (2 misses)', '−357', '#F87171'], ['Won from others', '+386', '#C5F25C'], ['Final', '1,029 SKR', '#fff', 1]])],
      pin: [B('Claim 1,029 SKR', 'J1', 'p', 'hand-coin-outline')] },
    { id: 'L3', name: 'Oath broken', nav: { close: 1 }, fx: 'embers', tone: 'ember', blocks: [
      KP('stern', 'The pot burns.\nNobody eats.', { prop: 'scythe', size: 150, side: 'c', h: 240 }),
      T('Broken.', 'Guitar Days hit 0 HP on day 6.', { al: 'center', fs: 48, pt: 0, hc: '#F2E9E7' }),
      BIG('−1,000', 'SKR · your whole stake', { fs: 44, c: '#F87171' }),
      ROWS([R('Dev', 'missed day 5', '−20 HP', { p: 'D', rc: '#F87171' }), R('Arjun', 'missed days 2 and 6', '−40 HP', { p: 'A', rc: '#F87171' })], 'WHO MISSED')],
      pin: [B('Rematch · win back 500', 'R1', 'l', 'sword-cross'), B('Start a new Oath', 'C1', 't')] },
    { id: 'L4', name: 'Solo kept', nav: { close: 1 }, fx: 'coins', blocks: [
      KP('happy', 'Fourteen days.\nNo witnesses needed.', { prop: 'ledger', anim: 'thumbs', size: 140, side: 'c', h: 230 }),
      T('Read 20 pages, kept.', '14 of 14 days.', { al: 'center', pt: 0 }),
      CHIPS([['500 SKR back', 'sack', 'l', -2], ['HP 100', 'heart-pulse', 'l', 2], ['Streak 14', 'fire', 'o', -1]], { jc: 'center' })],
      pin: [B('Claim 500 SKR', 'J1', 'l', 'hand-coin-outline')] },
    { id: 'L4·m', name: 'Solo missed some', g: 'L', nav: { close: 1 }, blocks: [
      KP('soft', 'Two off days.\nYou still finished.', { size: 130, side: 'c', h: 220 }),
      T('Read 20 pages is over.', 'Missed days 5 and 11.', { al: 'center', pt: 0 }),
      BRK([['Start', '500'], ['Lost (2 misses)', '−89', '#F87171'], ['HP at the end', '65'], ['Final', '411 SKR', '#fff', 1]])],
      pin: [B('Claim 411 SKR', 'J1', 'p', 'hand-coin-outline')] },
    { id: 'L4·b', name: 'Solo broken', g: 'L', nav: { close: 1 }, fx: 'embers', tone: 'ember', blocks: [
      KP('stern', 'Solo burns too.', { prop: 'scythe', size: 130, side: 'c', h: 220 }),
      T('Read 20 pages broke\non day 9.', 'Three misses at −35 HP each. Your 500 SKR burned.', { al: 'center', pt: 0 }),
      HP(0, { note: 'Solo Oaths take heavier damage per miss.' })],
      pin: [B('Solo Rematch · win back 250', 'R1', 'l', 'sword-cross'), B('Start a new Oath', 'C1', 't')] },
    { id: 'L6', name: 'Rematch kept', nav: { close: 1 }, fx: 'coins', tone: 'lime', beam: 1, pops: [['+500 back', 'sack']], blocks: [
      KP('shades', 'The comeback.\nTheatrical, even.', { prop: 'sack', anim: 'jump', size: 170, side: 'c', h: 260 }),
      T('You ran it back.', 'Seven days kept. The Rematch held.', { al: 'center', pt: 0 }),
      BIG('+500', 'SKR recovered from Guitar Days', { fs: 56, c: '#C5F25C' }),
      BRK([['Rematch final', '1,129'], ['Recovered', '+500', '#C5F25C'], ['Claim', '1,629 SKR', '#C5F25C', 1]])],
      pin: [B('Claim 1,629 SKR', 'J1', 'l', 'hand-coin-outline')] },
    { id: 'L5', name: 'Bounty survived / out', nav: { close: 1 }, blocks: [
      T('Bounty results live with the Bounty.', '', { fs: 26, pt: 10 }),
      ROWS([R('Survived', 'Sol Strings · +1,666 SKR', '', { ic: 'trophy-outline', lfg: '#C5F25C', to: 'H5', chev: 1 }), R('Eliminated', 'Hydrate Week · out on day 3', '', { ic: 'close-circle-outline', lfg: '#F87171', to: 'H4', chev: 1 })])] },

    // M · Notifications and errors
    { id: 'M1', name: 'Notifications', nav: { close: 1 }, lock: 1, blocks: [
      T('9:41', 'Wednesday 8 October', { al: 'center', fs: 84, pt: 0, ls: -4 }),
      ROWS(['Riya nudged you. Your move.|now', 'Iron Week: 2 hours to midnight.|19:58', 'Dev wants your vote on a photo.|18:10', 'Iron Week started. Day 1 is today.|Mon', 'Daily recap ready: +43 SKR.|00:01', 'Guitar Days broke. Rematch is open.|Sun', 'Rematch closes tomorrow.|Sat', 'Riya joined the Rematch.|Sat', '1,186 SKR ready to claim.|Fri', 'Hydrate Week starts tomorrow.|Thu', 'Drift posted a new Bounty.|Thu']
        .map(x => { const [t, r] = x.split('|'); return R(t, '', r, { mk: 1, lbg: '#C5F25C', lfg: '#131313', bg: 'rgba(40,40,46,.92)', h: 56 }); }))] },
    { id: 'M2', name: 'No internet', nav: { close: 1 }, blocks: [SP(30),
      KP('bored', 'Can\'t reach the table.', { prop: 'cup', size: 130, side: 'c', h: 220 }),
      T('You\'re offline.', 'Photos need a connection to be checked. Reconnect before midnight.', { al: 'center' })],
      pin: [B('Retry', 'toast:Still offline', 'p', 'wifi-refresh')] },
    { id: 'M3', name: 'Not enough SOL', sheet: 'Sign', blocks: [
      KP('shocked', 'No gas in the tank.', { size: 90, side: 'l', h: 104 }),
      T('Not enough SOL for fees.', 'Signing costs about 0.000005 SOL. Your wallet has 0.', { fs: 26, pt: 0 }),
      BTNS([B('Get devnet SOL', 'toast:+1 devnet SOL', 'p', 'water-outline'), B('Cancel', '<', 's')], 'col')] },
    { id: 'M4', name: 'Not enough SKR', sheet: 'Stake', blocks: [
      T('You need 1,000 SKR.', 'You have 620 SKR. Pick a smaller stake, or grab test SKR from the faucet.', { fs: 26, pt: 4 }),
      BTNS([B('Open the faucet', 'I4', 'p', 'water-outline'), B('Pick a smaller stake', 'C4', 's')], 'col')] },
  ];
  window.KS.push(...S.map(s => ({ ...s, g: s.g || s.id[0] })));
})();
