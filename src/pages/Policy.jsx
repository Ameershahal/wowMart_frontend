import SEO from '../components/SEO'

function Policy() {
  return (
    <div className="bg-transparent">
      <SEO
        title="Privacy Policy & Terms - WowMart"
        description="Read our privacy policy, terms of service, return policy, and shipping information."
        type="website"
      />
      
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-4">
            Privacy Policy & Terms
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Your trust is important to us. Please review our policies below.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-8">
          {/* Privacy Policy Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black text-black mb-4">Privacy Policy</h2>
            <p className="text-gray-600 mb-4">Last updated: January 23, 2026</p>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Information We Collect</h3>
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Name, email address, phone number, and shipping address</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                  <li>Order history and preferences</li>
                  <li>Account credentials and profile information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">How We Use Your Information</h3>
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Process and fulfill your orders</li>
                  <li>Send you order confirmations and updates</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Data Security</h3>
                <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Your Rights</h3>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Terms of Service Section */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl md:text-3xl font-black text-black mb-4">Terms of Service</h2>
            <p className="text-gray-600 mb-4">Last updated: January 23, 2026</p>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Acceptance of Terms</h3>
                <p>By accessing and using WowMart, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Use of Website</h3>
                <p>You agree to use our website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the website.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Product Information</h3>
                <p>We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Pricing</h3>
                <p>All prices are subject to change without notice. We reserve the right to modify prices at any time. In the event of a pricing error, we reserve the right to cancel orders.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Limitation of Liability</h3>
                <p>WowMart shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
              </div>
            </div>
          </section>

          {/* Return Policy Section */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl md:text-3xl font-black text-black mb-4">Return Policy</h2>
            <p className="text-gray-600 mb-4">Last updated: January 23, 2026</p>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Return Eligibility</h3>
                <p>Items must be returned within 7 days of delivery in their original condition, unopened, and with all original packaging and tags attached.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Non-Returnable Items</h3>
                <p>The following items cannot be returned:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Personalized or customized products</li>
                  <li>Items damaged by misuse or normal wear</li>
                  <li>Items without original packaging</li>
                  <li>Digital products or gift cards</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Return Process</h3>
                <p>To initiate a return:</p>
                <ol className="list-decimal list-inside ml-4 space-y-1 mt-2">
                  <li>Contact our customer service team</li>
                  <li>Provide your order number and reason for return</li>
                  <li>Receive a return authorization and shipping instructions</li>
                  <li>Ship the item back using the provided instructions</li>
                  <li>Once received and inspected, we'll process your refund</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Refunds</h3>
                <p>Refunds will be processed to the original payment method within 5-10 business days after we receive and inspect the returned item. Shipping costs are non-refundable unless the return is due to our error.</p>
              </div>
            </div>
          </section>

          {/* Shipping Policy Section */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl md:text-3xl font-black text-black mb-4">Shipping Policy</h2>
            <p className="text-gray-600 mb-4">Last updated: January 23, 2026</p>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Shipping Methods</h3>
                <p>We offer various shipping options to meet your needs. Shipping times and costs vary based on your location and selected method.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Processing Time</h3>
                <p>Orders are typically processed within 1-2 business days. Processing may take longer during peak seasons or for custom items.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Shipping Costs</h3>
                <p>Shipping costs are calculated at checkout based on your location and selected shipping method. Free shipping may be available for orders above a certain amount.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">Delivery</h3>
                <p>Once your order ships, you'll receive a tracking number via email. Delivery times vary by location and shipping method selected.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-2">International Shipping</h3>
                <p>We currently ship within India. International shipping may be available for select items. Please contact us for more information.</p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl md:text-3xl font-black text-black mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these policies, please contact us:
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Email:</strong> wowmart.asia@gmail.com<br />
                <strong>Phone:</strong> Available through our WhatsApp contact<br />
                <strong>Address:</strong> Visit our physical stores in Kondotty or Tirurangadi
              </p>
            </div>
          </section>
        </div>

        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            These policies may be updated from time to time. We encourage you to review this page periodically.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Policy
