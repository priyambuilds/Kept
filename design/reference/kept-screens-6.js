(function () {
  const K = window.KK, { n, B, T, TX, KP, CARD, ROWS, R, BIG, OPTS, INPUT, SEG, QR, BRK, BAN, SIGN, BTNS, NOTE, RING, SP, CHIPS, sigScreen, NT, HS, SEARCH, PROF, AVB } = K;
  const S = [
    { id: 'A4', name: 'Pick a look', g: 'A', nav: { steps: [3, 3] }, blocks: [
      T('Pick a look.', "No face needed. It's how friends spot you in an Oath.", { pt: 6 }),
      AVB({ quick: 1 }),
      s => K.avQuip(s, 1),
      NOTE('You can change it any time from your Profile.', 'information-outline')],
      pin: [B('Looks like me', 'cont:B3'), B('Customize it', 'I9', 't')] },

    { id: 'N1', name: 'Inbox', g: 'N', nav: { t: 'Inbox' }, blocks: s => {
      const I = K.INBOX, dn = x => !!s['n:' + x.id], need = I.filter(x => x.need && !dn(x)), upd = I.filter(x => !x.need && !dn(x)), old = I.filter(dn), out = [];
      if (!need.length && !upd.length) out.push(SP(10), KP('shades', 'All caught up.\nGo keep something.', { anim: 'thumbs', size: 130, side: 'c', h: 210 }), T('Nothing needs you.', 'Invites, votes and payouts land here.', { al: 'center', pt: 0 }));
      if (need.length) out.push(KP('side', '', { size: 76, side: 'r', h: 92, lines: [need.length + ' things on the table.\nClaim first.', "Dev needs your vote.\nBe fair. Or don't.", "I sort these so\nyou don't have to."] }));
      if (need.length) out.push(NT(need.map(x => ({ ...x, unread: 1 })), 'NEEDS YOU · ' + need.length));
      if (upd.length) out.push(NT(upd.map(x => ({ ...x, unread: 1 })), 'NEW', ['Mark all read', 'do:' + upd.map(x => x.id).join(',') + '|']));
      if (old.length) out.push(NT(old.map(x => ({ ...x, dim: 1, btns: null, to: x.to.startsWith('do:') ? x.to.split('|')[1] : x.to })), 'EARLIER'));
      out.push(NOTE('Only what needs you, or happened since you last looked.', 'information-outline'));
      return out; }, sim: [['Clear everything', 'do:inv1,rev1,clm1,rm1,ng1,rc1,st1,fl1|']] },

    { id: 'W1', name: 'Wallet', g: 'W', nav: { t: 'Wallet' }, blocks: s => { const bal = K.bal(s); return [
      KP(s['n:clm1'] ? 'shades' : 'smug', '', { prop: 'sack', size: 80, side: 'r', h: 96, lines: s['n:clm1'] ? ['Paid out.\nPleasure, as always.', "Don't spend it all.\nActually, stake it."] : ['You left 1,186\non my table.', "Claim it. I don't\nhold chips forever."] }),
      BIG(n(bal), 'SKR available · ≈ $' + (bal / 100).toFixed(2), { fs: 60 }),
      BTNS([B('Add SKR', 'W2', 'l', 'plus'), B('Receive', 'W4', 's', 'qrcode')]),
      s['n:clm1'] ? null : CARD({ ic: 'hand-coin-outline', name: '1,186 SKR to claim', meta: 'Hydra 14 ended Sunday', to: 'J1', sm: 1, lime: 1, btn: B('Claim now', 'J1', 'l', 'hand-coin-outline') }),
      BRK([['Available', n(bal) + ' SKR'], ['Locked in Oaths', '1,500 SKR · 2 Oaths'], ['In a Rematch', '1,000 SKR'], ['SOL for fees', '0.84 SOL']], 'BALANCES'),
      ROWS([R("+43 SKR from Arjun's miss", 'Iron Week · yesterday', '+43', { ic: 'arrow-bottom-left', lfg: '#C5F25C', rc: '#C5F25C' }), R('Staked into Iron Week', 'Mon 6 Oct', '−1,000', { ic: 'arrow-top-right' }), R('All activity', '', '', { ic: 'history', to: 'I5', chev: 1 })], 'RECENT')]; } },
    { id: 'W2', name: 'Add SKR', g: 'W', sheet: 'Wallet', blocks: [
      T('Add SKR.', 'Pick how you want to top up.', { fs: 26, pt: 4 }),
      ROWS([R('Swap SOL for SKR', 'Right here, in a few seconds', '', { ic: 'swap-horizontal', lbg: '#C5F25C', lfg: '#131313', to: 'W3', chev: 1 }),
        R('Receive from another wallet', 'Show your address or QR', '', { ic: 'qrcode', to: 'W4', chev: 1 }),
        R('Test SKR faucet', 'Devnet only · free', '+5,000', { ic: 'water-outline', rc: '#C5F25C', to: 'do:fc1||+5,000 test SKR added' })]),
      NOTE('Devnet SKR has no real value.', 'flask-outline'), BTNS([B('Close', '<', 's')])] },
    { id: 'W3', name: 'Swap SOL → SKR', g: 'W', nav: { t: 'Swap' }, blocks: s => { const sol = [0.1, 0.25, 0.5, 1][s.swp ?? 2], skr = Math.round(sol * 9900); return [
      T('Swap SOL for SKR.', 'Pick an amount.', { pt: 4 }),
      OPTS('swp', [{ t: '0.1', s: 'SOL' }, { t: '0.25', s: 'SOL' }, { t: '0.5', s: 'SOL' }, { t: '1', s: 'SOL' }], { mode: 'chip', cols: 4, def: 2 }),
      BIG('+' + n(skr), "SKR you'll get", { fs: 56, c: '#C5F25C' }),
      BRK([['You pay', sol + ' SOL'], ['Rate', '1 SOL ≈ 9,900 SKR'], ['Network fee', '0.000005 SOL'], ['You have', '0.84 SOL']]),
      NOTE('Devnet rate. Swaps route through a public exchange.', 'information-outline')]; },
      pin: [B('Swap', 'do:sw1|W3·s', 'l', 'swap-horizontal')] },
    { ...sigScreen('W3·s', 'Swap · signing', 'Confirm the swap', 'Swapping SOL for SKR.', 'W3·ok', [['Rejected', 'C7·no'], ['Not enough SOL', 'M3']]), g: 'W' },
    { id: 'W3·ok', name: 'Swap done', g: 'W', nav: { close: 1 }, fx: 'coins', tone: 'lime', beam: 1, pops: [['SKR added', 'sack']], blocks: s => [SP(50), SIGN('success', 'Swap confirmed'),
      T('SKR added.', 'Your balance is now ' + n(K.bal(s)) + ' SKR.', { al: 'center', pt: 26 })],
      pin: [B('Back to wallet', 'W1'), B('Start an Oath', 'C1', 't')] },
    { id: 'W4', name: 'Receive', g: 'W', nav: { t: 'Receive' }, blocks: [
      T('Your address.', 'Send SKR or SOL here from any Solana wallet.', { pt: 4 }),
      QR('7xKp…3F9q', '7xKpZ1a9Lw2QmR4vT8yN3F9q'),
      BTNS([B('Copy address', 'toast:Address copied', 's', 'content-copy'), B('Share', 'toast:Share sheet opened', 's', 'share-variant')]),
      NOTE('Devnet only. Mainnet tokens sent here will be lost.', 'alert-outline')] },

    { id: 'D5', name: 'Oath history', g: 'D', nav: { t: 'Oath history' }, blocks: s => {
      const f = s.hf ?? 0, G = {};
      K.HIST.filter(h => f === 0 || ['', 'kept', 'broken', 'rematch'][f] === h.k).forEach(h => (G[h.m] = G[h.m] || []).push(h));
      return [SEARCH({ t: 'Search 50 Oaths', to: 'toast:Search opened' }), SEG(['All', 'Kept', 'Broken', 'Rematch'], { id: 'hf' }),
        BAN('grey', 'chart-box-outline', '50 finished · 41 kept · 9 broken', '+3,420 SKR won · −2,600 SKR lost, all time'),
        ...Object.entries(G).map(([m, it]) => ROWS(it.map(h => R(h.n, h.s, h.r, { ic: h.ic, rc: h.r.startsWith('−') ? '#F87171' : h.r.startsWith('+') ? '#C5F25C' : '#8A8A8A', to: h.to, chev: 1 })), m.toUpperCase())),
        ROWS([R('Load older', 'August and earlier · 42 more', '', { ic: 'chevron-down', to: 'toast:Loading August…' })])]; } },

    { id: 'H7', name: 'Browse Bounties', g: 'H', nav: { t: 'Browse' }, blocks: s => {
      const cats = K.CATS, CN = [1240, 412, 188, 96, 141, 157, 86], c = s.bcat ?? 0, so = s.bsort ?? 0, el = s['tg:bel'] ?? 0;
      const L = K.BOUNTIES.filter(b => (c === 0 || b.cat === cats[c]) && (!el || b.el)).sort((a, b) => so === 0 ? a.close - b.close : so === 1 ? b.pool - a.pool : b.in - a.in);
      return [SEARCH({ t: 'Search by name, brand or habit' }),
        HS(cats.map((t, i) => ({ t, i })), { chips: 1, id: 'bcat' }),
        SEG(['Closing soon', 'Biggest pool', 'Most joined'], { id: 'bsort' }),
        ROWS([R('Only ones I can join', el ? 'On · hiding ones you can\'t join' : 'Off', '', { ic: 'shield-check-outline', tg: 'bel', on: 0 })]),
        TX('<m>' + n(el ? Math.round(CN[c] * .7) : CN[c]) + '</m> live Bounties' + (c ? ' in ' + cats[c] : '')),
        L.length ? ROWS(L.map(b => R(b.n, b.by + ' · ' + n(b.in) + ' in · ' + K.closes(b.close), n(b.pool), { lbg: K.grad(b.pal), lfg: K.ink(b.pal), ic: b.ic, rc: '#C5F25C', rs: 'SKR', to: b.to }))) : BAN('grey', 'magnify-close', 'Nothing here yet', 'Try another category.'),
        NOTE('Scroll for more. New Bounties land every day.', 'arrow-down')]; } },

    { id: 'I2·me', name: 'How others see you', g: 'I', nav: { t: 'Preview' }, blocks: s => { const pv1 = s.pv1 ?? 1, pv2 = s.pv2 ?? 0, pv3 = s.pv3 ?? 0; return [
      BAN('grey', 'eye-outline', 'This is how others see you', 'Change it in Who sees what.', { to: 'I7' }),
      PROF({ p: 'Y', n: K.NAMES[s.nm ?? 0], h: '7xKp…3F9q', v: 1, bio: K.BIOS[s.bio ?? 0], soc: pv3 === 2 ? [] : K.mySoc(s), ban: K.BANS[s.ban ?? 0] }),
      RING('91%', '64 days · kept rate', .91, '#C5F25C'),
      pv1 === 0 ? ROWS([R('Iron Week', 'Day 3/7 · 4 Keepers', 'Public', { ic: 'dumbbell' }), R('Read 20 pages', 'Solo · Day 9/14', 'Public', { ic: 'book-open-variant' })], 'OATHS')
        : BAN('grey', 'lock-outline', pv1 === 1 ? 'Oaths: only Oath partners' : 'Oaths: only you', pv1 === 1 ? 'People you share an Oath with see them.' : 'Nobody else sees your Oaths.'),
      pv2 === 2 ? BAN('grey', 'lock-outline', 'Bounties: only you', '') : ROWS([R('Hydrate Week', 'In · Day 3/7', '', { ic: 'bottle-soda-outline' })], 'BOUNTIES')]; } },
    { id: 'I2·p', name: 'Private profile', g: 'I', nav: { t: 'Arjun' }, blocks: [
      PROF({ p: 'A', n: 'arjun.skr', h: '9Tz2…Qe41', bio: '', ban: 'linear-gradient(135deg,#FB923C,#FDE68A)', banIc: 'dumbbell' }),
      RING('78%', '40 days · kept rate', .78, '#C5F25C'),
      BAN('grey', 'lock-outline', 'Arjun keeps his Oaths private', 'You only see the ones you share.'),
      ROWS([R('Iron Week', 'With you · Day 3/7', 'Shared', { ic: 'dumbbell', to: 'D2', chev: 1 })], 'SHARED WITH YOU')],
      pin: [B('Invite to an Oath', 'C1', 'p', 'account-plus-outline')] },
    { id: 'I5', name: 'Your activity', g: 'I', nav: { t: 'Your activity' }, blocks: s => { const f = s.af ?? 0, G = {};
      K.ACT.filter(a => f === 0 || a.c === f).forEach(a => (G[a.d] = G[a.d] || []).push(a));
      return [SEG(['All', 'Money', 'Proof', 'Oaths'], { id: 'af' }),
        ...Object.entries(G).map(([d, it]) => ROWS(it.map(a => R(a.t, a.s, a.r || '', { ic: a.ic, rc: (a.r || '').startsWith('−') ? '#F87171' : '#C5F25C', h: 56 })), d)),
        NOTE('Older activity loads as you scroll.', 'history')]; } },
    { id: 'I7', name: 'Who sees what', g: 'I', nav: { t: 'Who sees what' }, blocks: [
      BAN('lime', 'shield-check-outline', 'Your kept rate is always public', "It's how people decide who to trust. The rest is up to you."),
      TX('YOUR OATHS', { mono: 1 }), SEG(['Everyone', 'Oath partners', 'Only me'], { id: 'pv1', def: 1 }),
      TX('YOUR BOUNTIES', { mono: 1 }), SEG(['Everyone', 'Oath partners', 'Only me'], { id: 'pv2', def: 0 }),
      TX('YOUR SOCIALS', { mono: 1 }), SEG(['Everyone', 'Oath partners', 'Only me'], { id: 'pv3', def: 0 }),
      ROWS([R('Find me by name', 'People can search for you', '', { ic: 'magnify', tg: 'pfind', on: 1 }), R('Let anyone invite me', "Off: only people you've shared an Oath with", '', { ic: 'email-outline', tg: 'pinv', on: 1 })]),
      ROWS([R('See how others see you', '', '', { ic: 'eye-outline', to: 'I2·me', chev: 1 })])] },
    { id: 'I8', name: 'Edit profile', g: 'I', nav: { t: 'Edit profile', close: 1 }, blocks: s => [
      AVB({ edit: 1 }),
      INPUT({ id: 'nm', lab: 'Name', pre: '', sug: K.NAMES, max: 24 }),
      INPUT({ id: 'bio', lab: 'Bio', pre: '', sug: K.BIOS, max: 80 }),
      ROWS([R('X', (s['tg:sx'] ?? 1) ? '@samkeeps · on your profile' : 'Hidden', '', { ic: 'alpha-x-box-outline', tg: 'sx', on: 1 }),
        R('Telegram', (s['tg:stg'] ?? 0) ? '@sam_k · on your profile' : 'Tap to connect', '', { ic: 'send-outline', tg: 'stg', on: 0 }),
        R('Discord', (s['tg:sdc'] ?? 0) ? 'sam#0420 · on your profile' : 'Tap to connect', '', { ic: 'forum-outline', tg: 'sdc', on: 0 }),
        R('Farcaster', (s['tg:sfc'] ?? 0) ? '@sam · on your profile' : 'Tap to connect', '', { ic: 'arch', tg: 'sfc', on: 0 })], 'SOCIALS · SO PEOPLE CAN REACH YOU'),
      NOTE("Your wallet address can't be changed here. Who sees socials: Who sees what.", 'information-outline')],
      pin: [B('Save', 'do:pt1|I1|Profile saved')] },
    { id: 'I9', name: 'Avatar builder', g: 'I', nav: { t: 'Your avatar', close: 1 }, blocks: s => [K.avQuip(s), AVB({ full: 1 })], pin: [B('Done', '<', 'p', 'check')] },
  ];
  window.KS.push(...S);
})();
