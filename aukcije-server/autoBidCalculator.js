"use strict";

const BID_INCREMENT = 1;

function normalizeMoney(value) {
  return Number(Number(value).toFixed(2));
}

/**
 * Pure proxy-bidding calculation — no DB access, fully testable.
 *
 * Rules:
 *  - Winner = highest maksimalni_iznos; ties broken by earliest vrijeme_postavljanja.
 *  - Winning bid = min(secondBest.max + increment, winner.max).
 *    If winner is alone, winning bid = min(currentBid + increment, winner.max).
 *  - All non-winners whose max <= winningBid become losers (limit reached).
 *
 * @param {Array}  autoBids         Active competitive auto-bids (max > currentBidAmount).
 * @param {number} currentBidAmount Highest bid in ponuda at time of call.
 * @param {number} [increment]      Bid step size (default: BID_INCREMENT).
 * @returns {{ winner: object|null, winningBid: number|null, losers: Array }}
 */
function calculateAutoBidWinner(autoBids, currentBidAmount, increment = BID_INCREMENT) {
  if (autoBids.length === 0) {
    return { winner: null, winningBid: null, losers: [] };
  }

  // Defensive sort: highest max first; tie-break by earliest posting time.
  // (DB query already orders this way, but sort here for pure-function safety.)
  const sorted = [...autoBids].sort((a, b) => {
    const diff =
      normalizeMoney(b.maksimalni_iznos) - normalizeMoney(a.maksimalni_iznos);
    if (diff !== 0) return diff;
    return new Date(a.vrijeme_postavljanja) - new Date(b.vrijeme_postavljanja);
  });

  const winner = sorted[0];
  const secondBest = sorted[1] || null;

  // Winner only needs to out-bid the second-best max (or the current manual bid if alone).
  const competingAmount = secondBest
    ? normalizeMoney(secondBest.maksimalni_iznos)
    : normalizeMoney(currentBidAmount);

  const rawNext = normalizeMoney(competingAmount + increment);
  const winningBid = normalizeMoney(
    Math.min(rawNext, normalizeMoney(winner.maksimalni_iznos)),
  );

  // Winning bid must strictly exceed the current bid — otherwise no auto-bid fires.
  if (winningBid <= normalizeMoney(currentBidAmount)) {
    return { winner: null, winningBid: null, losers: [] };
  }

  // Non-winners whose maximum is no longer competitive.
  const losers = sorted
    .slice(1)
    .filter((ab) => normalizeMoney(ab.maksimalni_iznos) <= winningBid);

  return { winner, winningBid, losers };
}

module.exports = { calculateAutoBidWinner, normalizeMoney, BID_INCREMENT };
