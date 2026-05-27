export const BADGE_CONTRACT   = process.env.NEXT_PUBLIC_BADGE_CONTRACT   as `0x${string}`;
export const CHECKIN_CONTRACT = process.env.NEXT_PUBLIC_CHECKIN_CONTRACT as `0x${string}`;

export const BADGE_ABI = [
  { name:"getUserBadges",    type:"function", stateMutability:"view",
    inputs:[{name:"user",type:"address"}], outputs:[{name:"badges",type:"bool[7]"}] },
  { name:"getUserStats",     type:"function", stateMutability:"view",
    inputs:[{name:"user",type:"address"}],
    outputs:[{name:"points",type:"uint256"},{name:"badges",type:"uint256"},{name:"earned",type:"bool[7]"}] },
  { name:"hasBadge",         type:"function", stateMutability:"view",
    inputs:[{name:"",type:"address"},{name:"",type:"uint8"}], outputs:[{type:"bool"}] },
  { name:"totalPoints",      type:"function", stateMutability:"view",
    inputs:[{name:"",type:"address"}], outputs:[{type:"uint256"}] },
  { name:"checkEligibility", type:"function", stateMutability:"view",
    inputs:[{name:"user",type:"address"},{name:"badgeId",type:"uint8"}],
    outputs:[{name:"eligible",type:"bool"},{name:"reason",type:"string"}] },
  { name:"claimBadge",       type:"function", stateMutability:"nonpayable",
    inputs:[{name:"badgeId",type:"uint8"}], outputs:[] },
  { name:"BadgeClaimed",     type:"event",
    inputs:[
      {name:"user",    type:"address", indexed:true},
      {name:"badgeId", type:"uint8",   indexed:true},
      {name:"tokenId", type:"uint256", indexed:false},
      {name:"points",  type:"uint256", indexed:false},
    ]},
] as const;

// ── DailyCheckIn ABI — must match contract exactly ─────────────
// Contract functions: checkIn(), canCheckIn(address), getUserData(address)
// getUserData returns: (lastCheckIn, streak, totalCheckIns, canCheckInNow)
// NOTE: contract does NOT have getStreak() — use getUserData instead
export const CHECKIN_ABI = [
  { name:"checkIn",     type:"function", stateMutability:"nonpayable",
    inputs:[], outputs:[] },
  { name:"canCheckIn",  type:"function", stateMutability:"view",
    inputs:[{name:"user",type:"address"}], outputs:[{type:"bool"}] },
  { name:"getUserData", type:"function", stateMutability:"view",
    inputs:[{name:"user",type:"address"}],
    outputs:[
      {name:"lastCheckIn",   type:"uint256"},
      {name:"streak",        type:"uint256"},
      {name:"totalCheckIns", type:"uint256"},
      {name:"canCheckInNow", type:"bool"},
    ]},
  { name:"users",       type:"function", stateMutability:"view",
    inputs:[{name:"",type:"address"}],
    outputs:[
      {name:"lastCheckIn",   type:"uint256"},
      {name:"streak",        type:"uint256"},
      {name:"totalCheckIns", type:"uint256"},
    ]},
  { name:"CheckedIn",   type:"event",
    inputs:[
      {name:"user",          type:"address", indexed:true},
      {name:"streak",        type:"uint256", indexed:false},
      {name:"totalCheckIns", type:"uint256", indexed:false},
      {name:"timestamp",     type:"uint256", indexed:false},
    ]},
] as const;

export const BADGES = [
  { id:0, key:"beginner", name:"BEGINNER",         criteria:"Connect wallet first time",            pts:10 },
  { id:1, key:"tx10",     name:"10 TX MILESTONE",  criteria:"10+ transactions on Ritual",           pts:10 },
  { id:2, key:"tx50",     name:"50 TX VETERAN",    criteria:"50+ transactions on Ritual",           pts:10 },
  { id:3, key:"balance",  name:"5+ RITUAL HOLDER", criteria:"Hold 5+ Ritual ETH in wallet",         pts:10 },
  { id:4, key:"streak",   name:"30-DAY STREAK",    criteria:"30 consecutive daily check-ins",       pts:10 },
  { id:5, key:"x",        name:"X CONNECTED",      criteria:"Link X / Twitter account",             pts:10 },
  { id:6, key:"discord",  name:"DISCORD LINKED",   criteria:"Link Discord account",                 pts:10 },
] as const;
