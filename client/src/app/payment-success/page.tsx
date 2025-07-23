import PaymentSuccess from "@/components/payment-success/payment-success";
import { generateSEOConfig } from "@/utils/seo";
export const metadata = generateSEOConfig({
  title: "Payment Success",
  description: "Payment Success On OneNumber Web app",
  keywords: "payment, success, OneNumber",
  path: "/payment-success",  
});

export default function PaymentSuccessPage() {
  return <PaymentSuccess />;
}