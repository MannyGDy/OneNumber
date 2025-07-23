import PaymentGateway from "@/components/payment-gateway/payment";
import { generateSEOConfig } from "@/utils/seo";


export const metadata = generateSEOConfig({
  title: "Payment Gateway",
  description: "Payment Gateway On OneNumber Web app",
  keywords: "payment, gateway, OneNumber",
  path: "/",
});

export default function PaymentGatewayPage() {
  return <PaymentGateway />;
}
