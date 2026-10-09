(function () {
  const { n, B, T, TX, KP, CARD, ROWS, R, HP, GRID, BIG, CAM, SHUT, BRK, BAN, SLOT, CHIPS, SIGN, BTNS, NOTE, DAYS, SP, sigScreen } = window.KK;
  const S = [
    // R · Rematch
    { id: 'R1', name: 'Rematch offer', nav: { t: 'Rematch', close: 1 }, tone: 'ember', blocks: [
      KP('smug', 'Run it back?', { prop: 'flip', anim: 'flip', size: 150, side: 'c', h: 220, chips: [['+500 SKR', 'sack', 228, 150, 6, 'l'], ['6d 23h left', 'alarm', 4, 168, -5, 'd']], orbs: [['sack', 296, 26, 44, 'lime', 0, 'c'], ['sack', 262, 0, 28, 'lime', 0, 'c']] }),
      T('Win back 500 SKR.', 'Keep every day of the Rematch, and don\'t let it break. You get back half of what Guitar Days cost you.', { fs: 30, pt: 0 }),
      BRK([['Original', 'Guitar Days · 7 days · Guitar'], ['You lost', '−1,000 SKR', '#F87171'], ['You can win back', '+500 SKR', '#C5F25C'], ['New stake', '1,000 SKR'], ['Window', '6d 23h to start']]),
      TX('IN THE REMATCH · 2 OF 4', { mono: 1 }),
      SLOT([['R', 'joined'], ['D', 'joined'], ['Y', 'you?', 1], ['A', 'not yet', 1]]),
      NOTE('One Rematch per broken Oath. A Rematch can\'t be rematched.', 'information-outline')],
      pin: [B('Join Rematch', 'do:rm1|R2', 'l', 'sword-cross'), B('Not now', '<', 't')] },
    sigScreen('R2', 'Rematch · signing', 'Stake again', '1,000 SKR into the Guitar Days Rematch.', 'R3', [['Rejected', 'C7·no']]),
    { id: 'R3', name: 'Rematch lobby', nav: { t: 'Rematch lobby' }, blocks: [
      CHIPS([['Rematch', 'sword-cross', 'w', -3], ['Guitar Days · 7 days', 'guitar-acoustic', 'g', 2]]),
      T('3 of 4 back\nat the table.', 'Anyone can start once 2 or more have joined.', { fs: 30, pt: 0 }),
      SLOT([['R', 'in'], ['D', 'in'], ['Y', 'in'], ['A', 'waiting', 1]]),
      ROWS([R('Arjun', 'Hasn\'t joined · window 6d 22h', 'Nudge', { p: 'A', to: 'toast:Nudged Arjun', rc: '#C5F25C' })], 'STILL OUT')],
      pin: [B('Start the Rematch', 'R·act', 'l', 'play'), B('Invite the rest', 'toast:Invite sent to Arjun', 't')] },
    { id: 'R·act', name: 'Rematch, active', nav: { t: 'Guitar Days', right: 'Day 3/7' }, blocks: [
      CHIPS([['Rematch', 'sword-cross', 'w', -2], ['No more rematches', 'lock-outline', 'g', 1]]),
      HP(90, { note: 'Riya missed day 2: −20, then +10 heal.' }),
      KP('side', 'Riya burned her recovery.\nDon\'t be Riya.', { prop: 'whisper', size: 90, side: 'r', h: 104 }),
      GRID(7, 3, { Y: 'kkp', R: 'kmk', D: 'kkk' }),
      ROWS([R('You', 'Recovery: 500 SKR on the line', '1,043', { p: 'Y', rc: '#C5F25C', rs: 'SKR' }),
        R('Riya', 'Recovery lost · missed day 2', '857', { p: 'R', rc: '#F87171', rs: 'SKR' }),
        R('Dev', 'Recovery: 500 SKR on the line', '1,043', { p: 'D', rs: 'SKR' })], 'KEEPERS')],
      pin: [B('Prove today', 'F1', 'p', 'camera')], sim: [['Rematch kept', 'L6'], ['Result: recovery lost', 'R4·lost']] },
    { id: 'R4', name: 'Rematch result', nav: { t: 'Rematch result', close: 1 }, blocks: [
      T('Rematch kept.', 'You kept all 7 days. The Rematch held.', { fs: 32, pt: 6 }),
      BRK([['Start', '1,000'], ['Lost', '0'], ['Won from Riya', '+129', '#C5F25C'], ['Fee', '0'], ['Recovered from Guitar Days', '+500', '#C5F25C'], ['Final', '1,629 SKR', '#C5F25C', 1]]),
      BAN('lime', 'sword-cross', '+500 SKR recovered from your broken Oath', 'Half of what Guitar Days cost you.')],
      pin: [B('Claim 1,629 SKR', 'J1', 'l', 'hand-coin-outline')] },
    { id: 'R4·lost', name: 'Rematch result · recovery lost', g: 'R', nav: { t: 'Rematch result', close: 1 }, blocks: [
      T('Rematch survived.\nRecovery didn\'t.', '', { fs: 30, pt: 6 }),
      BRK([['Start', '1,000'], ['Lost (day 2)', '−143', '#F87171'], ['Won', '+86', '#C5F25C'], ['Fee', '−14'], ['Recovered', '0'], ['Final', '929 SKR', '#fff', 1]]),
      BAN('red', 'close-circle-outline', 'Recovery lost: you missed day 2', 'Only Keepers who keep every day of a Rematch get the 50% back.')],
      pin: [B('Claim 929 SKR', 'J1', 'p', 'hand-coin-outline')] },

    // F · Daily proof
    { id: 'F1·perm', name: 'Camera permission', g: 'F', nav: { close: 1 }, blocks: [SP(30),
      CAM({ ic: 'camera-off-outline', h: 260, state: 'off', label: 'Camera is off' }),
      T('KEPT needs your camera.', 'Two photos a day. Checked by AI on our server, then deleted. Only a fingerprint is kept.', { al: 'center', pt: 10 })],
      pin: [B('Allow camera', 'F1', 'p', 'camera'), B('Not now', '<', 't')] },
    { id: 'F1', name: 'Photo 1 of 2', nav: { t: 'Iron Week · photo 1 of 2', close: 1 }, blocks: [
      CAM({ obj: 'dumbbell', g: 'peace', state: 'idle', label: 'Dumbbell + victory sign', n: 1 }),
      CHIPS([['Challenge expires 4:52', 'timer-outline', 'g', 0]], { jc: 'center' }),
      SHUT('F2')], sim: [['First time: permission', 'F1·perm'], ['Challenge expired', 'F2c']] },
    { id: 'F2', name: 'Checking', nav: { t: 'Iron Week · photo 1 of 2' }, auto: { to: 'F3', ms: 2000 }, blocks: [
      CAM({ obj: 'dumbbell', g: 'peace', state: 'check', label: 'Checking…', n: 1 }),
      KP('neutral', 'Hold still.\nI\'m judging.', { prop: 'lens', size: 100, side: 'l', h: 118 })],
      sim: [['Fails', 'F2a'], ['Checker down', 'F2b'], ['Expired', 'F2c']] },
    { id: 'F2a', name: 'Failed', nav: { t: 'Iron Week · photo 1 of 2', close: 1 }, blocks: [
      CAM({ obj: 'dumbbell', g: 'peace', state: 'fail', label: 'Couldn\'t see a victory sign', n: 1 }),
      KP('soft', 'Close. Two fingers,\nlike you mean it.', { anim: 'shrug', size: 100, side: 'l', h: 118 })],
      pin: [B('Try again', 'F1', 'p', 'camera-retake-outline')] },
    { id: 'F2b', name: 'Check unavailable', nav: { t: 'Iron Week', close: 1 }, blocks: [SP(20),
      KP('bored', 'The checker\'s napping.\nNot your fault.', { prop: 'cup', size: 130, side: 'c', h: 220 }),
      T('We can\'t check photos\nright now.', 'Your photo is saved. Retry in a minute. You still have time.', { al: 'center' }),
      BIG('14:41:52', 'left today', { fs: 44 })],
      pin: [B('Retry check', 'F2', 'p', 'refresh')] },
    { id: 'F2c', name: 'Challenge expired', nav: { t: 'Iron Week', close: 1 }, blocks: [
      T('That challenge expired.', 'Challenges last 5 minutes, so nobody reuses old photos. Here\'s a fresh one.', { pt: 4 }),
      CAM({ obj: 'dumbbell', g: 'thumb', state: 'idle', label: 'New: dumbbell + thumbs up', n: 1, h: 300 })],
      pin: [B('Use new challenge', 'F1', 'p', 'refresh')] },
    { id: 'F3', name: 'Photo 1 done', nav: { t: 'Iron Week', close: 1 }, blocks: [SP(30),
      SIGN('success', 'Photo 1 passed'),
      T('Photo 1 is in.', 'Do your 20 minutes, then come back for photo 2. No timer. Any time before midnight.', { al: 'center', pt: 26 }),
      DAYS(2, 1, 1, { labels: ['Photo 1', 'Photo 2'] }),
      NOTE('Today shows "In progress" until photo 2.', 'information-outline')],
      pin: [B('Take photo 2', 'F4', 'p', 'camera'), B('Back to Today', 'B1', 't')] },
    { id: 'F4', name: 'Photo 2 of 2', nav: { t: 'Iron Week · photo 2 of 2', close: 1 }, blocks: [
      CAM({ obj: 'dumbbell', g: 'palm', state: 'idle', label: 'Dumbbell + open palm', n: 2 }),
      CHIPS([['Different gesture this time', 'hand-back-right', 'g', 0]], { jc: 'center' }),
      SHUT('F4·chk')] },
    { id: 'F4·chk', name: 'Checking photo 2', nav: { t: 'Iron Week · photo 2 of 2' }, auto: { to: 'F5', ms: 2000 }, blocks: [
      CAM({ obj: 'dumbbell', g: 'palm', state: 'check', label: 'Checking…', n: 2 }),
      KP('neutral', 'Last look.', { prop: 'lens', size: 100, side: 'l', h: 118 })],
      sim: [['Fails (1 of 3)', 'F2a'], ['3 fails · AI only', 'F4a'], ['3 fails · group review', 'F4a·g']] },
    { id: 'F4a', name: '3 fails · AI only', nav: { t: 'Iron Week', close: 1 }, tone: 'red', blocks: [SP(20),
      KP('soft', 'It happens.\nEven to you.', { size: 130, side: 'c', h: 220 }),
      T('Today\'s proof didn\'t pass.', 'Iron Week is AI only, so 3 failed checks is final. Today counts as missed.', { al: 'center' }),
      BRK([['Your stake', '−143 SKR', '#F87171'], ['Oath HP', '−20 at midnight', '#F87171'], ['Streak', 'resets to 0']])],
      pin: [B('Back to Today', 'B1')] },
    { id: 'F4a·g', name: '3 fails · group review', nav: { t: 'Iron Week', close: 1 }, blocks: [
      CAM({ obj: 'dumbbell', g: 'palm', state: 'fail', label: '3 of 3 checks failed', n: 2, h: 260 }),
      T('Let the group decide.', 'Send photo 2 to Riya, Arjun and Dev. Majority approves; a tie rejects. The photo is deleted after the vote, 48 hours at most.', { fs: 28, pt: 4 })],
      pin: [B('Ask your group to review', 'G2', 'p', 'account-group-outline'), B('Accept the miss', 'B1', 't')] },
    { id: 'F5', name: 'Day kept', nav: { close: 1 }, fx: 'coins', tone: 'lime', beam: 1, pops: [['Kept', 'check-bold'], ['Streak 13', 'fire']], blocks: [
      KP('happy', 'Clean. Your 1,000\nsleeps safe tonight.', { anim: 'thumbs', size: 150, side: 'c', h: 236 }),
      T('Day 3 kept.', '', { al: 'center', fs: 40, pt: 0 }),
      DAYS(7, 3, 3),
      CHIPS([['HP 90', 'heart-pulse', 'lime', -2], ['1,043 SKR safe', 'sack', 'lime', 2], ['Streak 13', 'fire', 'o', -1]], { jc: 'center' }),
      ROWS([R('Arjun', 'Hasn\'t proved today', 'Nudge', { p: 'A', to: 'toast:Nudged Arjun', rc: '#C5F25C' })], 'STILL PENDING')],
      pin: [B('Done', 'B2')] },

    // G · Group review
    { id: 'G1', name: 'Review a photo', nav: { t: 'Review', close: 1 }, blocks: [
      T('Dev wants your vote.', 'Iron Week · day 3 · photo 2 needs a dumbbell and an open palm.', { fs: 28, pt: 4 }),
      CAM({ obj: 'dumbbell', g: 'palm', state: 'review', label: 'Dev\'s photo · AI failed 3 times', h: 300 }),
      CHIPS([['1 of 3 votes', 'vote-outline', 'g', -2], ['Riya approved', 'check', 'lime', 1], ['41h left', 'timer-outline', 'ora', -1]]),
      KP('side', 'Looks like a palm to me.\nMostly.', { prop: 'lens', size: 84, side: 'r', h: 98 })],
      pin: [B('Approve', 'do:rev1|D2|Vote sent · approved', 'l', 'check'), B('Reject', 'do:rev1|D2|Vote sent · rejected', 'd', 'close')] },
    { id: 'G2', name: 'Waiting for review', nav: { t: 'Review', close: 1 }, blocks: [SP(20),
      BIG('2 of 3', 'votes in', { fs: 64 }),
      T('Waiting for your group.', 'Majority approves. A tie rejects.', { al: 'center', pt: 0 }),
      SLOT([['R', 'approve'], ['A', 'reject', 0, 'r'], ['D', 'waiting', 1]]),
      NOTE('Your photo is deleted after the decision, 48 hours at most.', 'delete-clock-outline')],
      sim: [['Approved', 'G3'], ['Rejected', 'G3·no']] },
    { id: 'G3', name: 'Review approved', nav: { close: 1 }, tone: 'lime', pops: [['Approved', 'check-bold']], blocks: [SP(60), SIGN('success', 'Approved 2–1'),
      T('Day 3 counts as kept.', 'Riya and Dev backed you. Your 1,000 SKR is safe tonight.', { al: 'center', pt: 26 })],
      pin: [B('Back to Iron Week', 'D2')] },
    { id: 'G3·no', name: 'Review rejected', nav: { close: 1 }, blocks: [SP(30),
      KP('soft', 'Tough crowd.', { size: 120, side: 'c', h: 200 }),
      T('Rejected 1–2.\nDay 3 counts as missed.', '', { al: 'center' }),
      BRK([['Your stake', '−143 SKR', '#F87171'], ['Oath HP', '−20 at midnight', '#F87171']])],
      pin: [B('Back to Iron Week', 'D2')] },
  ];
  window.KS.push(...S.map(s => ({ ...s, g: s.g || s.id[0] })));
})();
