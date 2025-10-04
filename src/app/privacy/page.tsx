
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-12 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: July 30, 2024</p>
      </div>
      <Card>
        <CardContent className="prose dark:prose-invert prose-sm sm:prose-base prose-a:text-primary p-6 space-y-4 text-muted-foreground">
          <p>
            Welcome to DreamyDesk ("we," "us," or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the "Service").
          </p>
          <p>
            By using our Service, you agree to the collection and use of information in accordance with this policy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at <a href="mailto:info@dreamydesk.co.in">info@dreamydesk.co.in</a>.
          </p>

          <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
          <p>We collect information in a few different ways to provide and improve our Service to you.</p>
          
          <h3 className="text-lg font-semibold text-foreground">A. Information You Provide to Us</h3>
          <ul className="list-disc pl-6">
              <li><strong>Account Information:</strong> When you create an account using email/password or a social provider like Google, we collect your name, email address, and a unique user identifier.</li>
              <li><strong>User Content:</strong> We store information related to your activity on our Service, such as the wallpapers you "like" (add to favorites) and your download history. This allows you to access this information from your profile.</li>
              <li><strong>Communications:</strong> If you contact us directly via email, we may receive additional information about you such as your name, email address, the contents of the message, and/or attachments you may send us.</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground">B. Information We Collect Automatically</h3>
          <ul className="list-disc pl-6">
              <li><strong>Log and Usage Data:</strong> Like most websites, we collect information that your browser sends whenever you visit our Service. This may include your IP address, browser type, browser version, the pages you visit, the time and date of your visit, and other statistics.</li>
              <li><strong>Analytics Data:</strong> We use third-party analytics services like Google Analytics to collect and analyze usage data. This helps us understand user behavior and improve our Service. This data is aggregated and does not typically identify you personally.</li>
              <li><strong>Push Notification Tokens:</strong> If you grant permission, we collect a Firebase Cloud Messaging (FCM) token to send you push notifications about new content or features. This token is associated with your device and can be revoked at any time by changing your browser settings.</li>
              <li><strong>Cookies and Local Storage:</strong> We use cookies and similar technologies to operate and personalize our Service. For users who do not create an account, we use local storage to create a "guest ID" to manage your liked wallpapers.</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes, including:</p>
           <ul className="list-disc pl-6">
                <li>To provide, operate, and maintain our Service.</li>
                <li>To manage your account, including your profile, favorites, and download history.</li>
                <li>To process payments and manage your premium subscription through our third-party payment processor (Razorpay).</li>
                <li>To send you push notifications, if you have opted in.</li>
                <li>To understand and analyze how you use our Service to improve user experience, features, and functionality.</li>
                <li>To display personalized and non-personalized advertisements to support our Service.</li>
                <li>To respond to your comments, questions, and provide customer support.</li>
                <li>To comply with legal obligations and enforce our terms.</li>
            </ul>

          <h2 className="text-xl font-bold text-foreground">3. How We Share Your Information</h2>
          <p>We do not sell your personal information. We may share your information with third parties in the following situations:</p>
           <ul className="list-disc pl-6">
                <li><strong>With Service Providers:</strong> We share information with third-party vendors that help us operate our Service, such as website hosting (Firebase), analytics (Google Analytics), payment processing (Razorpay), and advertising networks.</li>
                <li><strong>For Advertising:</strong> We partner with third-party advertising companies to serve ads when you visit our website. These companies may use cookies and other tracking technologies to collect information about your visits to this and other websites to provide relevant advertisements about goods and services of interest to you. We do not share your name, email, or other direct personal information with our ad partners.</li>
                <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
            </ul>

           <h2 className="text-xl font-bold text-foreground">4. Your Privacy Rights and Choices</h2>
             <ul className="list-disc pl-6">
                <li><strong>Account Information:</strong> You can review and update your account information at any time by logging into your profile.</li>
                <li><strong>Deleting Your Account:</strong> If you wish to delete your account and associated data, please contact us at <a href="mailto:info@dreamydesk.co.in">info@dreamydesk.co.in</a>.</li>
                <li><strong>Push Notifications:</strong> You can opt-out of receiving push notifications by changing the notification settings in your browser.</li>
                <li><strong>Cookies:</strong> Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject browser cookies.</li>
            </ul>

            <h2 className="text-xl font-bold text-foreground">5. Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

           <h2 className="text-xl font-bold text-foreground">6. Changes to This Privacy Policy</h2>
          <p>
           We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
