-- Premium subscriptions (temporary) and referral reward claiming
ALTER TABLE users ADD COLUMN premium_until TEXT;
ALTER TABLE referrals ADD COLUMN reward_type TEXT;
ALTER TABLE referrals ADD COLUMN claimed INTEGER NOT NULL DEFAULT 0;
