import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Building } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Free Trial",
      price: "K0",
      period: "per file",
      description: "Perfect for testing our platform",
      icon: <Star className="h-6 w-6" />,
      features: ["1 file upload", "Basic dashboard", "AI insights", "Export to Excel/PDF", "Email support"],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "K99",
      period: "lifetime",
      description: "Best for small businesses and professionals",
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Unlimited file uploads",
        "Advanced dashboards",
        "AI chat with data",
        "All export formats",
        "Priority support",
        "Data history",
        "Custom branding",
      ],
      cta: "Get Lifetime Access",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "K3,000+",
      period: "per organization",
      description: "For NGOs and large organizations",
      icon: <Building className="h-6 w-6" />,
      features: [
        "Everything in Professional",
        "White-label solution",
        "Private cloud deployment",
        "Custom integrations",
        "Dedicated support",
        "Training sessions",
        "Multi-language support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your needs. Start free, upgrade when you're ready.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative ${
              plan.popular ? "border-2 border-blue-500 shadow-xl scale-105" : "border border-gray-200 shadow-lg"
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">Most Popular</Badge>
            )}

            <CardHeader className="text-center">
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                  plan.popular ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                }`}
              >
                {plan.icon}
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600 ml-2">{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-gray-800"}`}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">🇵🇬 Proudly serving Papua New Guinea and the world</p>
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <span>✓ 30-day money-back guarantee</span>
          <span>✓ No hidden fees</span>
          <span>✓ Cancel anytime</span>
        </div>
      </div>
    </section>
  )
}
