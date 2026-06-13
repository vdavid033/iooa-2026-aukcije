"use strict";

const {
  calculateAutoBidWinner,
  normalizeMoney,
  BID_INCREMENT,
} = require("../autoBidCalculator");

// Builds a minimal auto-bid object. timeOffset (seconds) controls tie-breaking:
// lower offset = earlier posting time = wins the tie.
function makeBid(id, max, timeOffset = 0) {
  return {
    id_auto_bid: id,
    id_korisnika: id,
    maksimalni_iznos: max,
    vrijeme_postavljanja: new Date(2024, 0, 1, 0, 0, timeOffset),
  };
}

describe("calculateAutoBidWinner", () => {
  // 1. Highest maximum wins
  test("auto-bid with highest maksimalni_iznos wins", () => {
    // Manual: 100 | User A max: 150 | User B max: 180
    // Expected: User B wins with bid 151 (beats A's max by one increment)
    const bids = [makeBid(1, 150), makeBid(2, 180)];
    const { winner, winningBid } = calculateAutoBidWinner(bids, 100);

    expect(winner.id_auto_bid).toBe(2);
    expect(winningBid).toBe(151);
  });

  // 2. Tie on maximum: earliest vrijeme_postavljanja wins
  test("tie on maksimalni_iznos resolved by earliest vrijeme_postavljanja", () => {
    // Both max 150; bid 1 was posted earlier (timeOffset 0 < 60)
    // Expected: bid 1 wins; winning bid = min(150+1, 150) = 150
    const bids = [
      makeBid(1, 150, 0),   // earlier
      makeBid(2, 150, 60),  // later
    ];
    const { winner, winningBid } = calculateAutoBidWinner(bids, 100);

    expect(winner.id_auto_bid).toBe(1);
    expect(winningBid).toBe(150); // capped at winner's max
  });

  // 3. Winning bid never exceeds winner's maximum
  test("winning bid never exceeds winner maksimalni_iznos", () => {
    const bids = [makeBid(1, 150), makeBid(2, 180)];
    const { winningBid } = calculateAutoBidWinner(bids, 100);

    expect(winningBid).toBeLessThanOrEqual(180);
    expect(winningBid).toBe(151);
  });

  // 4. Non-winning auto-bids whose max is beaten are identified as losers
  test("losing auto-bids are correctly identified", () => {
    // Manual: 100 | User A max: 150 | User B max: 180
    // Winning bid: 151 — User A's max (150) <= 151 → loser
    const bids = [makeBid(1, 150), makeBid(2, 180)];
    const { losers } = calculateAutoBidWinner(bids, 100);

    expect(losers).toHaveLength(1);
    expect(losers[0].id_auto_bid).toBe(1);
  });

  // 5. Disabled auto-bids are ignored (filtered before this function is called)
  test("only active bids are considered — disabled bids must not be passed in", () => {
    // Simulates correct usage: only active bid is provided
    const bids = [makeBid(1, 200)];
    const { winner, winningBid } = calculateAutoBidWinner(bids, 100);

    expect(winner.id_auto_bid).toBe(1);
    expect(winningBid).toBe(101);
  });

  // 6. Limit-reached auto-bids are ignored (filtered before this function is called)
  test("only non-limit-reached bids are considered — limit-reached bids must not be passed in", () => {
    const bids = [makeBid(1, 180)];
    const { winner, winningBid } = calculateAutoBidWinner(bids, 100);

    expect(winner.id_auto_bid).toBe(1);
    expect(winningBid).toBe(101);
  });

  // 7. No active auto-bids → no automatic bid
  test("returns no winner when auto-bids array is empty", () => {
    const { winner, winningBid, losers } = calculateAutoBidWinner([], 100);

    expect(winner).toBeNull();
    expect(winningBid).toBeNull();
    expect(losers).toHaveLength(0);
  });

  // 8. Decimal bid amounts are handled correctly
  test("decimal bid values are normalised correctly", () => {
    // Manual: 149.50 | User A max: 150 | User B max: 200
    // competing amount = User A max (150)
    // winning bid = min(150 + 1, 200) = 151
    // User A (150) <= 151 → loser
    const bids = [makeBid(1, 150), makeBid(2, 200)];
    const { winner, winningBid, losers } = calculateAutoBidWinner(bids, 149.5);

    expect(winner.id_auto_bid).toBe(2);
    expect(winningBid).toBe(151);
    expect(losers).toHaveLength(1);
    expect(losers[0].id_auto_bid).toBe(1);
  });

  // Extra: winner also hits limit when winningBid equals their max
  test("winner limit is signalled when winning bid equals their maksimalni_iznos", () => {
    // Both users have max 150; winner bids 150 which equals their max
    const bids = [makeBid(1, 150, 0), makeBid(2, 150, 60)];
    const { winner, winningBid } = calculateAutoBidWinner(bids, 100);

    expect(winningBid).toBe(normalizeMoney(winner.maksimalni_iznos));
  });

  // Extra: single auto-bid uses current bid as competing amount
  test("single auto-bid increments from current bid, not from its own max", () => {
    const bids = [makeBid(1, 150)];
    const { winningBid } = calculateAutoBidWinner(bids, 100);

    expect(winningBid).toBe(100 + BID_INCREMENT);
  });

  // Extra: no auto-bid fires when winning bid would not exceed current bid
  test("returns no winner when no auto-bid can beat the current bid", () => {
    // All competitive bids have the same max as current bid — this shouldn't happen
    // after the beaten-filter in processMultipleAutoBids, but the pure function
    // handles it gracefully.
    const bids = [makeBid(1, 100)]; // max == currentBid, filtered as beaten upstream
    const { winner } = calculateAutoBidWinner(bids, 100);

    // bids whose max == currentBid are passed to beaten[], not here — but if somehow
    // passed, winningBid would be <= currentBid and the function returns null winner.
    expect(winner).toBeNull();
  });
});

describe("normalizeMoney", () => {
  test("rounds to two decimal places", () => {
    // 100.005 is 100.0049... in IEEE 754, so it rounds down — use 100.006 instead.
    expect(normalizeMoney(100.006)).toBe(100.01);
    expect(normalizeMoney(149.999)).toBe(150);
    expect(normalizeMoney(150)).toBe(150);
  });

  test("handles string input", () => {
    expect(normalizeMoney("149.50")).toBe(149.5);
  });
});
