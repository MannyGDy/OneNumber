
import DataPrivacyPolicy from '@/components/protection-policy/ProtectionPolicy';

import { generateSEOConfig } from '@/utils/seo';
export const metadata = generateSEOConfig({
  title: 'Protection Policy',
  description: 'Protection Policy On OneNumber Web app',
  keywords: 'protection policy, OneNumber', 
  path: '/privacy-policy',
});

export default function ProtectionPolicy() {
  return (
    <DataPrivacyPolicy />
  )
}