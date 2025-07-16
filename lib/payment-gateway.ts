export interface PaymentDetails {
  amount: number;
  currency: string;
  studentId: string;
  studentFeeId: string;
  studentName: string;
  studentEmail: string;
  onSuccess: (paymentInfo: any) => Promise<void>;
}

export interface PaymentGateway {
  pay(details: PaymentDetails): Promise<void>;
}

// Razorpay implementation
export class RazorpayGateway implements PaymentGateway {
  async pay(details: PaymentDetails) {
    // Load Razorpay script if not already loaded
    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    // You should create an order on your backend or Firebase Function and get order_id
    // For demo, we'll skip order_id
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID",
      amount: details.amount * 100, // in paise
      currency: details.currency,
      name: "Doppler Coaching Center",
      description: "Fee Payment",
      // order_id: "order_id_from_backend",
      handler: async function (response: any) {
        await details.onSuccess({
          paymentMethod: "razorpay",
          transactionId: response.razorpay_payment_id,
          amount: details.amount,
        });
      },
      prefill: {
        name: details.studentName,
        email: details.studentEmail,
      },
      theme: { color: "#3399cc" },
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  }
}

// Stripe implementation (pseudo-code, you need to add real logic)
export class StripeGateway implements PaymentGateway {
  async pay(details: PaymentDetails) {
    // Integrate Stripe Checkout or Elements here
    // On success, call details.onSuccess with payment info
    alert('Stripe integration goes here');
  }
}

// Add more gateways as needed... 