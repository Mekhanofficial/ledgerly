import { normalizePlanId } from './subscription';

export const PLAN_FEATURES = {
  starter: {
    watermark: true,
    customLogo: false,
    customDomain: false,
    customEmail: false
  },
  professional: {
    watermark: false,
    customLogo: true,
    customDomain: false,
    customEmail: false
  },
  enterprise: {
    watermark: false,
    customLogo: true,
    customDomain: true,
    customEmail: true
  }
};

const DEFAULT_EMAIL_SENDERS = {
  starter: 'invoices@ledgerly.com',
  professional: 'billing@ledgerly.com',
  enterprise: 'billing@ledgerly.com'
};

const sanitizeDomain = (domainValue = '') => {
  const value = String(domainValue || '').trim();
  if (!value) return '';
  return value
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
};

export const resolveBrandingProfile = (userLike = {}) => {
  const plan = normalizePlanId(userLike?.plan);
  const incomingBranding = userLike?.brandingSettings || {};
  const incomingWhiteLabel = userLike?.whiteLabel || {};
  const customDomain = sanitizeDomain(incomingWhiteLabel.customDomain || userLike?.customDomain);
  const customEmailSender = String(
    incomingWhiteLabel.customEmailSender || userLike?.customEmailSender || ''
  ).trim();
  const isEnterprise = plan === 'enterprise';
  const resolvedLogoUrl = String(
    incomingBranding.logoUrl || userLike?.logoUrl || userLike?.business?.logo || ''
  ).trim();

  const brandingSettings = {
    removeWatermark: Boolean(
      incomingBranding.removeWatermark ?? (plan !== 'starter')
    ),
    logoUrl: resolvedLogoUrl,
    brandColor: incomingBranding.brandColor || userLike?.brandColor || ''
  };

  const whiteLabel = {
    enabled: Boolean(incomingWhiteLabel.enabled ?? isEnterprise),
    customDomain: isEnterprise ? customDomain : '',
    customEmailSender: isEnterprise ? customEmailSender : '',
    hideLedgerlyBrandingEverywhere: Boolean(
      incomingWhiteLabel.hideLedgerlyBrandingEverywhere ?? isEnterprise
    )
  };

  return {
    ...userLike,
    plan,
    logoUrl: resolvedLogoUrl,
    customDomain: whiteLabel.customDomain,
    customEmailSender: whiteLabel.customEmailSender,
    brandingSettings,
    whiteLabel,
    isWhiteLabelClient: Boolean(userLike?.isWhiteLabelClient)
  };
};

export const getPlanFeatures = (userLike = {}) => {
  const profile = resolveBrandingProfile(userLike);
  return PLAN_FEATURES[profile.plan] || PLAN_FEATURES.starter;
};

export const shouldHideLedgerlyBrandingEverywhere = (userLike = {}) => {
  const profile = resolveBrandingProfile(userLike);
  return Boolean(
    profile.isWhiteLabelClient ||
    profile.whiteLabel?.hideLedgerlyBrandingEverywhere
  );
};

export const shouldShowWatermark = (userLike = {}) => {
  const profile = resolveBrandingProfile(userLike);
  const features = getPlanFeatures(profile);
  if (!features.watermark) return false;
  if (shouldHideLedgerlyBrandingEverywhere(profile)) return false;
  return !profile.brandingSettings?.removeWatermark;
};

export const getWatermarkFooterText = (userLike = {}) => {
  if (!shouldShowWatermark(userLike)) return '';
  return 'Powered by Ledgerly';
};

export const canUseBusinessLogo = (userLike = {}) => {
  const profile = resolveBrandingProfile(userLike);
  const features = getPlanFeatures(profile);
  return Boolean(features.customLogo);
};

export const getBusinessLogoUrl = (userLike = {}) => {
  const profile = resolveBrandingProfile(userLike);
  if (!canUseBusinessLogo(profile)) return '';
  return String(profile.brandingSettings?.logoUrl || profile.logoUrl || '').trim();
};

export const getEmailSenderConfig = (userLike = {}) => {
  const profile = resolveBrandingProfile(userLike);
  const features = getPlanFeatures(profile);
  const customSender = profile.whiteLabel?.customEmailSender || profile.customEmailSender;

  let fromAddress = DEFAULT_EMAIL_SENDERS[profile.plan] || DEFAULT_EMAIL_SENDERS.starter;
  if (features.customEmail && customSender) {
    fromAddress = customSender;
  }

  let footerText = '';
  if (profile.plan === 'starter') {
    footerText = 'Sent via Ledgerly';
  }
  if (shouldHideLedgerlyBrandingEverywhere(profile)) {
    footerText = '';
  }

  return {
    fromAddress,
    footerText
  };
};

export const resolveInvoiceBaseUrl = (
  userLike = {},
  defaultBaseUrl = 'https://ledgerly.com'
) => {
  const profile = resolveBrandingProfile(userLike);
  const features = getPlanFeatures(profile);
  const domain = sanitizeDomain(profile.whiteLabel?.customDomain || profile.customDomain);

  if (features.customDomain && domain) {
    return `https://${domain}`;
  }
  return defaultBaseUrl;
};

export const buildBrandedEmailMessage = (message, userLike = {}) => {
  const profile = resolveBrandingProfile(userLike);
  const trimmed = String(message || '').trim();
  const senderConfig = getEmailSenderConfig(profile);
  const hideLedgerly = shouldHideLedgerlyBrandingEverywhere(profile);

  if (hideLedgerly) {
    return trimmed;
  }

  if (profile.plan === 'starter' && senderConfig.footerText) {
    const lower = trimmed.toLowerCase();
    if (lower.includes('sent via ledgerly')) {
      return trimmed;
    }
    return `${trimmed}\n\n${senderConfig.footerText}`.trim();
  }

  return trimmed;
};
