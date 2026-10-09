//! Versioned Oath economics. Mirrored by `src/shared/payout.ts` in the backend; keep the two in step.
//!
//! Neither `Config` nor `Oath` changes its serialized layout. The new data lives in a tagged region
//! appended after each struct, so accounts written by earlier program versions still deserialize:
//! - An Oath account of exactly `OATH_BASE_LEN` bytes predates terms and settles under rules v1.
//! - Newer Oath accounts carry `OathTerms` at `OATH_BASE_LEN`, fixed when the Oath is created.
//! - `Economics` sits after `Config` once the admin runs `configure_economics`; that activates rules v2
//!   for Oaths created afterwards. Until then new Oaths record rules v1.
use anchor_lang::prelude::*;

use crate::state::{Config, Oath, MAX_MEMBERS};
use crate::KeptError;

pub const BPS_DENOMINATOR: u64 = 10_000;
/// Rules v1: no entry fee; a member who misses loses the whole stake (see `calculate_payouts`).
pub const RULES_LEGACY: u8 = 1;
/// Rules v2: fee charged on top of the stake at create/join, one freeze credit per member, and a 50% slash.
pub const RULES_V2: u8 = 2;
/// Share of an unsuccessful member's stake slashed under rules v2. Once per Oath, not per missed day.
pub const SLASH_BPS: u64 = 5_000;
pub const TERMS_TAG: [u8; 8] = *b"KEPTTRM1";
pub const ECONOMICS_TAG: [u8; 8] = *b"KEPTECO1";
pub const CARRYOVER_SEED: &[u8] = b"carryover";

pub const OATH_BASE_LEN: usize = 8 + Oath::INIT_SPACE;
pub const OATH_LEN: usize = OATH_BASE_LEN + OathTerms::INIT_SPACE;
pub const CONFIG_BASE_LEN: usize = 8 + Config::INIT_SPACE;
pub const CONFIG_LEN: usize = CONFIG_BASE_LEN + Economics::INIT_SPACE;

/// Terms an Oath was created under. Amounts are stake-mint base units.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace, Default, PartialEq, Eq, Debug)]
pub struct OathTerms {
    pub tag: [u8; 8],
    pub rules_version: u8,
    pub fee_bps: u16,
    /// Fee each staked member pays on top of the stake; every member pays the same amount.
    pub fee_per_member: u64,
    /// Price of the one freeze credit each member may buy, fixed at creation.
    pub freeze_price: u64,
    /// Fees held in the vault. Refunded on cancel, sent to the treasury at settlement.
    pub fees_collected: u64,
    /// Freeze purchases held in the vault, sent to the treasury at settlement.
    pub freeze_proceeds: u64,
    /// Bit i: member slot i bought its freeze credit.
    pub freeze_bought: u8,
    /// Bit i: member slot i used its freeze credit.
    pub freeze_used: u8,
    /// Per member slot, the day bit covered by a freeze.
    pub frozen_days: [u16; MAX_MEMBERS],
    /// Fees + freeze proceeds + rounding dust sent to the treasury at settlement.
    pub treasury_paid: u64,
    /// Slashed stake owed to the carryover reserve because no member succeeded.
    pub carryover: u64,
    pub carryover_swept: bool,
    /// Rounding remainder of the winners' share (included in `treasury_paid`).
    pub dust: u64,
    pub reserved: [u8; 32],
}

impl OathTerms {
    /// Terms for an account that predates the terms region.
    pub fn legacy() -> Self { Self { rules_version: RULES_LEGACY, ..Self::default() } }

    pub fn new(rules_version: u8, fee_bps: u16, fee_per_member: u64, freeze_price: u64) -> Self {
        Self { tag: TERMS_TAG, rules_version, fee_bps, fee_per_member, freeze_price, ..Self::default() }
    }
}

/// Rules v2 settings appended to `Config`. Its presence means rules v2 are active for new Oaths.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace, Default, PartialEq, Eq, Debug)]
pub struct Economics {
    pub tag: [u8; 8],
    pub fee_bps: u16,
    pub freeze_price: u64,
    /// Program-owned reserve (authority: the Config PDA). No instruction withdraws from it yet.
    pub carryover_vault: Pubkey,
    /// Total ever swept into the carryover reserve.
    pub carryover_total: u64,
    pub reserved: [u8; 32],
}

pub fn read_terms(data: &[u8]) -> Result<OathTerms> {
    if data.len() == OATH_BASE_LEN { return Ok(OathTerms::legacy()); }
    let mut tail = data.get(OATH_BASE_LEN..).ok_or(KeptError::BadOath)?;
    let terms = OathTerms::deserialize(&mut tail).map_err(|_| KeptError::BadOath)?;
    require!(terms.tag == TERMS_TAG && matches!(terms.rules_version, RULES_LEGACY | RULES_V2), KeptError::BadOath);
    Ok(terms)
}

pub fn write_terms(oath: &AccountInfo, terms: &OathTerms) -> Result<()> {
    let mut data = oath.try_borrow_mut_data()?;
    require!(data.len() >= OATH_LEN, KeptError::BadOath);
    let mut out: &mut [u8] = &mut data[OATH_BASE_LEN..];
    terms.serialize(&mut out).map_err(|_| KeptError::BadOath)?;
    Ok(())
}

/// The active rules v2 settings, or None while they have not been configured.
pub fn read_economics(data: &[u8]) -> Option<Economics> {
    let mut tail = data.get(CONFIG_BASE_LEN..)?;
    let economics = Economics::deserialize(&mut tail).ok()?;
    (economics.tag == ECONOMICS_TAG).then_some(economics)
}

pub fn write_economics(config: &AccountInfo, economics: &Economics) -> Result<()> {
    let mut data = config.try_borrow_mut_data()?;
    require!(data.len() >= CONFIG_LEN, KeptError::EconomicsNotConfigured);
    let mut out: &mut [u8] = &mut data[CONFIG_BASE_LEN..];
    economics.serialize(&mut out).map_err(|_| KeptError::EconomicsNotConfigured)?;
    Ok(())
}

/// Entry fee for one member, rounded down in the member's favour.
pub fn fee_for_stake(stake: u64, fee_bps: u16) -> Option<u64> {
    if u64::from(fee_bps) > BPS_DENOMINATOR { return None; }
    u64::try_from(u128::from(stake) * u128::from(fee_bps) / u128::from(BPS_DENOMINATOR)).ok()
}

/// Amount slashed from an unsuccessful member, rounded down in the member's favour.
pub fn slash_amount(stake: u64) -> u64 {
    // stake * 5000 / 10000 cannot exceed stake, so the narrowing is lossless.
    (u128::from(stake) * u128::from(SLASH_BPS) / u128::from(BPS_DENOMINATOR)) as u64
}

/// Days a member has satisfied: proofs recorded on chain plus any freeze-covered day.
pub fn effective_days(days_kept: u16, frozen_days: u16) -> u16 { days_kept | frozen_days }

#[derive(Debug, PartialEq, Eq)]
pub struct SettlementV2 {
    /// Per-member claimable amounts, in member order.
    pub payouts: Vec<u64>,
    /// Total slashed from unsuccessful members.
    pub slashed: u64,
    /// Fees + freeze proceeds + dust.
    pub to_treasury: u64,
    /// Slashed stake that no successful member could receive.
    pub carryover: u64,
    /// Remainder of splitting `slashed` among successful members.
    pub dust: u64,
}

/// Rules v2 settlement. Successful members get their stake back plus an equal share of the slashed
/// amount. Unsuccessful members get their stake minus one 50% slash. With no successful member the
/// slashed amount is carryover. Returns None on overflow or if the conservation check fails:
/// payouts + to_treasury + carryover = stake * members + fees + freeze proceeds.
pub fn calculate_payouts_v2(stake: u64, successes: &[bool], fees_collected: u64, freeze_proceeds: u64) -> Option<SettlementV2> {
    if successes.is_empty() { return None; }
    let members = successes.len() as u64;
    let keepers = successes.iter().filter(|v| **v).count() as u64;
    let slash = slash_amount(stake);
    let refund = stake.checked_sub(slash)?;
    let slashed = slash.checked_mul(members.checked_sub(keepers)?)?;
    let (share, carryover, dust) = if keepers == 0 {
        (0, slashed, 0)
    } else {
        let share = slashed / keepers;
        (share, 0, slashed.checked_sub(share.checked_mul(keepers)?)?)
    };
    let payouts = successes.iter().map(|won| if *won { stake.checked_add(share) } else { Some(refund) }).collect::<Option<Vec<u64>>>()?;
    let to_treasury = fees_collected.checked_add(freeze_proceeds)?.checked_add(dust)?;
    let collected = stake.checked_mul(members)?.checked_add(fees_collected)?.checked_add(freeze_proceeds)?;
    let paid = payouts.iter().try_fold(0u64, |sum, p| sum.checked_add(*p))?;
    if paid.checked_add(to_treasury)?.checked_add(carryover)? != collected { return None; }
    Some(SettlementV2 { payouts, slashed, to_treasury, carryover, dust })
}

#[cfg(test)]
mod tests {
    use super::*;

    // Same vectors as the rules v2 tests in test/payout.test.ts.
    fn settle(stake: u64, successes: &[bool], fees: u64, freeze: u64) -> (Vec<u64>, u64, u64, u64) {
        let s = calculate_payouts_v2(stake, successes, fees, freeze).unwrap();
        (s.payouts, s.to_treasury, s.carryover, s.dust)
    }

    #[test] fn fee_is_15_percent_rounded_down() {
        assert_eq!(fee_for_stake(1_000, 1_500), Some(150));
        assert_eq!(fee_for_stake(1_250, 1_500), Some(187));
        assert_eq!(fee_for_stake(1, 1_500), Some(0));
        assert_eq!(fee_for_stake(500_000_000, 1_500), Some(75_000_000));
        assert_eq!(fee_for_stake(u64::MAX, 10_000), Some(u64::MAX));
        assert_eq!(fee_for_stake(1_000, 10_001), None);
    }
    #[test] fn all_succeed() { assert_eq!(settle(1_000, &[true; 4], 600, 0), (vec![1_000; 4], 600, 0, 0)); }
    #[test] fn one_of_four_fails_with_dust() { assert_eq!(settle(1_000, &[true, true, true, false], 600, 0), (vec![1_166, 1_166, 1_166, 500], 602, 0, 2)); }
    #[test] fn two_of_four_fail() { assert_eq!(settle(1_000, &[true, true, false, false], 600, 0), (vec![1_500, 1_500, 500, 500], 600, 0, 0)); }
    #[test] fn nobody_succeeds_goes_to_carryover() { assert_eq!(settle(1_000, &[false; 4], 600, 0), (vec![500; 4], 600, 2_000, 0)); }
    #[test] fn odd_stake_slash_rounds_for_member() { assert_eq!(settle(1_001, &[true, false], 300, 0), (vec![1_501, 501], 300, 0, 0)); }
    #[test] fn freeze_proceeds_go_to_treasury() { assert_eq!(settle(1_000, &[true, false], 300, 50), (vec![1_500, 500], 350, 0, 0)); }
    #[test] fn zero_stake_solo() { assert_eq!(settle(0, &[false], 0, 50), (vec![0], 50, 0, 0)); }
    #[test] fn overflow_is_none() {
        assert!(calculate_payouts_v2(u64::MAX, &[true, false], 0, 0).is_none());
        assert!(calculate_payouts_v2(1, &[true], u64::MAX, 1).is_none());
        assert!(calculate_payouts_v2(1, &[], 0, 0).is_none());
    }
    #[test] fn conservation_for_every_outcome() {
        for stake in [0u64, 1, 7, 999, 1_001, 500_000_000, 1_000_000_000, 2_500_000_000] {
            let fee = fee_for_stake(stake, 1_500).unwrap();
            for n in 1..=MAX_MEMBERS {
                for mask in 0..(1u32 << n) {
                    let successes: Vec<bool> = (0..n).map(|i| mask & (1 << i) != 0).collect();
                    for freeze in [0u64, 3, 1_000] {
                        let s = calculate_payouts_v2(stake, &successes, fee * n as u64, freeze).unwrap();
                        let keepers = successes.iter().filter(|v| **v).count() as u64;
                        let paid: u64 = s.payouts.iter().sum();
                        assert_eq!(paid + s.to_treasury + s.carryover, stake * n as u64 + fee * n as u64 + freeze);
                        assert_eq!(s.slashed, slash_amount(stake) * (n as u64 - keepers));
                        assert!(s.dust < keepers.max(1));
                        if keepers == 0 { assert_eq!(s.carryover, s.slashed); } else { assert_eq!(s.carryover, 0); }
                        for (i, won) in successes.iter().enumerate() {
                            if *won { assert!(s.payouts[i] >= stake); } else { assert_eq!(s.payouts[i], stake - stake / 2); }
                        }
                    }
                }
            }
        }
    }
    #[test] fn freeze_counts_as_kept() { assert_eq!(effective_days(0b101, 0b010), 0b111); }
    #[test] fn terms_round_trip_after_the_oath_struct() {
        let terms = OathTerms::new(RULES_V2, 1_500, 150, 25);
        let mut data = vec![0u8; OATH_LEN];
        let mut out: &mut [u8] = &mut data[OATH_BASE_LEN..];
        terms.serialize(&mut out).unwrap();
        assert_eq!(read_terms(&data).unwrap(), terms);
        assert_eq!(read_terms(&data[..OATH_BASE_LEN]).unwrap(), OathTerms::legacy(), "pre-terms account is rules v1");
        data[OATH_BASE_LEN] ^= 1;
        assert!(read_terms(&data).is_err(), "bad tag is rejected, not read as legacy");
        assert_eq!(OATH_BASE_LEN, 316, "existing Oath layout is unchanged");
    }
}
