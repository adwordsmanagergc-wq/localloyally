/** Which wallets are set up. Each needs its own keys in the environment (see README). */
export const appleWalletEnabled = () =>
  !!(process.env.APPLE_PASS_TYPE_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_PASS_CERT && process.env.APPLE_PASS_KEY && process.env.APPLE_WWDR_CERT);
export const googleWalletEnabled = () =>
  !!(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SA_EMAIL && process.env.GOOGLE_WALLET_SA_KEY);
export const walletEnabled = () => ({ apple: appleWalletEnabled(), google: googleWalletEnabled() });
