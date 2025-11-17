# Project Description

**Deployed Frontend URL:** https://program-hood-codivo.vercel.app/

**Solana Program ID:** HNVpWAQDDdAGq36gpHysc674pWhSv55nng9k9s55Pdqw

## Project Overview

### Description

A simple decentralized counter application built on Solana. Users can create personal counters, increment them, and reset them to zero. Each user has their own counter account derived from their wallet address, ensuring data isolation and ownership. This dApp demonstrates basic Solana program development concepts including PDAs, account creation, and state management.
The counter tracks not only the current count value but also maintains a record of total increments made (which persists through resets) and the creation timestamp. This provides users with historical context about their counter usage.

### Key Features

- **Create Counter**: Initialize a new counter account for your wallet with a starting value of 0
- **Increment Counter**: Add 1 to your personal counter value (unlimited increments)
- **Reset Counter**: Set your counter back to 0 while preserving total increment history
- **View Counter**: Display current counter value, owner information, total increments, and creation date
- **Personal Ownership**: Each user has their own counter that only they can modify
- **Data Persistence**: Counter data is permanently stored on-chain

### How to Use the dApp

1. **Connect Wallet** Click the "Connect Wallet" button and connect your Solana wallet (Phantom, Solflare, etc.)
2. **Initialize Counter** Click "Create Counter" to set up your personal counter account (one-time setup, costs ~0.002 SOL for rent)
3. **Increment** Use the "+ Increment" button to increase your counter value by 1
4. **Reset** Reset to set your counter back to 0 (total increments history is preserved)
5. **View Stats** see your current count, total increments made, and the date your counter was created

## Program Architecture

The Counter dApp uses a simple architecture with one main account type (Counter) and three core instructions (Initialize, Increment, Reset). The program leverages Program Derived Addresses (PDAs) to create unique counter accounts for each user, ensuring data isolation and preventing conflicts between different users' counters.

### PDA Usage

The program uses Program Derived Addresses to create deterministic counter accounts for each user without requiring separate keypair management.

**PDAs Used:**

- **Counter PDA**: Derived from seeds ["counter", user_wallet_pubkey] purpose to Creates a unique counter account address for each user.

### Program Instructions

**Instructions Implemented:**

- **Initialize**: Creates a new counter account for the user with initial values (count: 0, total_increments: 0, created_at: current timestamp). Uses PDA derivation to ensure one counter per user.
- **Increment**: Increases the counter value by 1 and increments the total_increments tracker. Includes overflow protection and owner validation.
- **Reset**: Sets the counter value back to 0 while preserving the owner information and total_increments history. Only the counter owner can reset their counter.

### Account Structure

[TODO: Describe your main account structures and their purposes]

```rust
#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub owner: Pubkey,           // 32 bytes - The wallet address that owns this counter
    pub count: u64,              // 8 bytes - Current counter value
    pub total_increments: u64,   // 8 bytes - Total number of times incremented (persists through resets)
    pub created_at: i64,         // 8 bytes - Unix timestamp when counter was created
}
```

## Testing

### Test Coverage

Comprehensive test suite covering all instructions with both successful operations and error conditions to ensure program security and reliability.

**Happy Path Tests:**

- **Initialize Counter**: Successfully creates a new counter account with correct initial values (count: 0, total_increments: 0, owner set, timestamp recorded)
- **Increment Counter**: Properly increases count and total_increments by 1 with single increment
- **Multiple Increments:**: Tests incrementing multiple times to verify counter state consistency
- **Reset Counter**: Sets count to 0 while preserving owner and total_increments data

**Unhappy Path Tests:**

- **Initialize Duplicate**: Fails appropriately when trying to initialize a counter that already exists (prevents double initialization)
- **Increment Unauthorized**: Fails when a non-owner attempts to increment someone else's counter (security check)
- **Increment Unauthorized:**: Tests incrementing multiple times to verify counter state consistency
- **Reset Unauthorized**: Fails when a non-owner attempts to reset someone else's counter (security check)
- **Account Not Found**: Fails when trying to increment/reset a non-existent counter (account validation)

### Running Tests

```bash
yarn install

anchor build

anchor test

anchor test -- --features "debug"
```

### Additional Notes for Evaluators

Implementation Highlights:

Used checked_add for increment operations to prevent overflow vulnerabilities
Implemented proper account validation with has_one constraint to ensure only owners can modify their counters
Used InitSpace derive macro for accurate space calculation
Included comprehensive error handling with custom error codes

Development Challenges:

Initially struggled with PDA derivation syntax but resolved it by carefully following Anchor documentation
Had to debug account space calculation - learned about the 8-byte discriminator that Anchor adds
Spent time understanding the difference between Signer and UncheckedAccount for the owner field

Testing Notes:

All tests pass successfully on localnet
Unhappy path tests properly catch and verify error messages
Used requestAirdrop for funding test accounts (works on devnet)

Deployment:

Program deployed to Devnet
Frontend deployed on Vercel with wallet adapter integration
Tested with Phantom wallet - all features working as expected
