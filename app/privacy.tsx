// Screen - Privacy Policy (public route, no auth gate)
// Source content: Vaine Privacy Policy (Effective 2026-07-02)
// Referenced from: Chrome Web Store submission privacy URL,
//                  store-listing.md privacy field.

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Markdown from "react-native-markdown-display";

const POLICY_MARKDOWN = String.raw`
# Vaine Privacy Policy

Effective Date: July 2, 2026

Vaine, Inc. (“Vaine,” “we,” “our,” or “us”) provides products and services that help users transform intents, thoughts, and text into clear AI instructions.

This Privacy Policy explains how we collect, use, disclose, store, and process user data when you use Vaine’s website, Chrome extension, mobile applications, and related services.

This Privacy Policy is available at:

[https://www.vaineai.com/privacy](https://www.vaineai.com/privacy)

## 1. Single Purpose of the Vaine Chrome Extension

The single purpose of the Vaine Chrome extension is to help users turn thoughts into clears into clear AI instructions.

The Vaine Chrome extension collects and processes user data only in direct support of this single purpose.

## 2. Collection of Personal Data

We collect the following categories of user data.

### Personal data you provide directly

When you use Vaine, you may provide information directly to us, including:

* Text you type into Vaine

If Vaine offers account-based features, we may also collect account information such as your name, email address, login information, subscription status, and related account details.

If Vaine offers paid plans, payment information may be collected and processed by Stripe. Vaine does not store full credit card numbers on its own systems.

### Data collected through the Chrome extension

When you use the Vaine Chrome extension, Vaine may process text you intentionally provide for transformation.

Vaine does not passively collect website content.

Vaine does not collect browsing history for advertising.

Vaine only processes website text you intentionally type into Vaine to transform to clear AI instruction.

### Technical and usage information

We may collect technical and usage information needed to operate, secure, debug, and improve Vaine, including:

* Browser type
* Device type
* Operating system
* Extension version
* App version
* Error logs
* Usage events
* Timestamps
* Connection and performance information

This information is used to maintain reliability, improve product performance, detect errors, prevent abuse, and secure the service.

## 3. Prominent Disclosure and User Consent

Before the Vaine Chrome extension collects or processes user-provided text, Vaine provides a prominent disclosure explaining what data is collected and how it is handled.

Vaine collects and processes user-provided text only after the user consents to the disclosure or intentionally uses the extension after the disclosure is shown.

Users may stop using Vaine at any time.

Users may uninstall the Chrome extension at any time through Chrome browser settings.

## 4. How We Use Personal Data

We use user data for the following purposes:

* To provide Vaine’s core functionality
* To transform user-provided text into clearer AI instructions
* To return generated outputs to the user
* To operate, maintain, and improve Vaine
* To secure the service and prevent abuse
* To debug errors and improve reliability
* To provide customer support
* To manage user accounts and subscriptions, if applicable
* To comply with legal obligations
* To enforce our terms and protect the rights, safety, and security of Vaine, users, and others

Vaine does not sell user data.

Vaine does not use user data for personalized advertising.

Vaine does not share user data with advertisers, data brokers, or ad networks.

## 5. AI Service Providers

To provide Vaine’s core functionality, user-provided text may be securely transmitted to AI service providers for processing.

Vaine may use the following AI service providers:

* OpenAI
* Anthropic
* Google
* xAI

These providers may process user-provided text only as needed to generate the requested result and provide Vaine’s functionality.

When you submit or select text for Vaine to transform, that text may be sent to one or more of these AI service providers to generate clearer AI instructions.

## 6. Recipients and Third Parties

We may disclose user data to the following categories of recipients only as needed to provide, operate, secure, debug, improve, or support Vaine:

### AI service providers

We may share user-provided text with OpenAI, Anthropic, Google, and xAI to process user requests and generate outputs.

### Cloud, hosting, database, and infrastructure providers

We may use third-party infrastructure providers to host Vaine’s backend systems, databases, storage, and related services.

### Analytics, logging, and error-monitoring providers

We may use analytics, logging, or error-monitoring tools to understand product reliability, detect bugs, improve performance, and secure the service.

### Payment processors

Vaine uses Stripe to handle billing, subscriptions, invoices, and transactions.

### Support and communication providers

If you contact us for support, we may use customer support or communication tools to respond to your request.

### Legal, compliance, and security parties

We may disclose information when we believe it is necessary to comply with law, respond to legal process, prevent fraud, investigate abuse, enforce our terms, protect users, or protect the rights, safety, and security of Vaine and others.

Vaine does not disclose user data to advertisers, data brokers, ad networks, or personalized advertising platforms.

## 7. Third-Party Services

Vaine may rely on third-party services to provide AI processing, infrastructure, payments, analytics, support, and security.

These third parties process data according to their own privacy policies and contractual obligations.

Vaine does not control the privacy practices of third-party services. Users should review the privacy policies of third-party services where appropriate.

## 8. Data Handling, Storage, and Retention

Vaine handles user data only as needed to provide, operate, secure, debug, improve, and support the service.

User-provided text may be transmitted to Vaine’s servers and AI service providers when the user requests a transformation.

Vaine retains user data only for as long as reasonably necessary for the purposes described in this Privacy Policy, including providing the service, maintaining security, debugging issues, improving reliability, complying with legal obligations, resolving disputes, and enforcing agreements.

If user-provided prompts, selected text, or generated outputs are stored, they are retained only for the period necessary to provide product functionality, support account history, improve reliability, maintain security, or comply with legal obligations.

Users may request deletion of their personal data by contacting Vaine using the contact information below.

## 9. Security

Vaine uses reasonable technical and organizational measures designed to protect user data from unauthorized access, loss, misuse, disclosure, alteration, or destruction.

User data is transmitted securely using modern cryptography, including HTTPS.

Vaine does not intentionally transmit user data over unsecured HTTP.

Access to user data is limited to systems and personnel that need access to operate, secure, debug, or support the service.

No online service can guarantee absolute security, but Vaine works to protect user data and limit unauthorized access.

## 10. Rights and Choices

Depending on where you live, you may have certain rights regarding your personal data.

These rights may include the right to:

* Request access to personal data we process about you
* Request correction of inaccurate personal data
* Request deletion of personal data
* Request a copy of your personal data
* Object to certain processing
* Withdraw consent where processing is based on consent

To exercise these rights, contact Vaine at:

[privacy@vaineai.com](mailto:privacy@vaineai.com)

We may need to verify your identity before completing your request.

## 11. Data Transfers

Vaine may process and store user data in the United States or other countries where Vaine, its service providers, or AI service providers operate.

By using Vaine, you understand that your data may be processed outside your state, province, or country of residence.

Where required by law, Vaine uses appropriate safeguards for international data transfers.

## 12. Aggregated or De-Identified Information

Vaine may process aggregated or de-identified information to understand product usage, improve reliability, analyze performance, and improve the service.

Aggregated or de-identified information does not identify an individual user.

Vaine does not attempt to re-identify de-identified information except where permitted by law for security, fraud prevention, or legal compliance.

## 13. Children

Vaine is not intended for children under 13.

Vaine does not knowingly collect personal information from children under 13.

If Vaine learns that it has collected personal information from a child under 13, Vaine will take reasonable steps to delete that information.

## 14. Changes to This Privacy Policy

Vaine may update this Privacy Policy from time to time.

If we make material changes, we will update the effective date above and may provide notice through the website, extension, application, or other appropriate means.

## 15. Contact Information

For privacy questions, requests, or concerns, contact:

Vaine, Inc.
Privacy Policy: [https://www.vaineai.com/privacy](https://www.vaineai.com/privacy)
Email: [privacy@vaineai.com](mailto:privacy@vaineai.com)

## 16. Legal Bases for Processing

Where applicable law requires a legal basis for processing personal data, Vaine relies on the following legal bases:

### To provide Vaine’s services

Types of data:

* User-provided text
* Prompts
* Instructions
* Selected text
* Generated outputs
* Account information
* Technical and usage information

Legal basis:

* Performance of a contract
* Legitimate interests
* Consent where required

### To operate, secure, debug, and improve Vaine

Types of data:

* Technical information
* Usage information
* Error logs
* Product interactions
* Security data

Legal basis:

* Legitimate interests
* Legal obligations where applicable

### To process payments and manage subscriptions

Types of data:

* Account information
* Billing information
* Subscription information
* Transaction information

Legal basis:

* Performance of a contract
* Legal obligations
* Legitimate interests

### To provide support and communicate with users

Types of data:

* Contact information
* Support messages
* Account information
* Relevant product usage information

Legal basis:

* Performance of a contract
* Legitimate interests
* Consent where required

### To comply with law and protect rights

Types of data:

* Account information
* Technical information
* Usage information
* Security logs
* Communications

Legal basis:

* Legal obligations
* Legitimate interests
`;

export default function Privacy() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Image
            source={require("../assets/logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={[styles.body, isWide && styles.bodyWide]}>
        <Markdown style={markdownStyles}>{POLICY_MARKDOWN}</Markdown>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Vaine, INC.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  logo: { width: 90, height: 28 },
  body: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 80,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  bodyWide: { paddingHorizontal: 0 },
  h1: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0a0a0a",
    marginBottom: 12,
  },
  h2: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0a0a0a",
    marginTop: 40,
    marginBottom: 16,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0a0a0a",
    marginTop: 24,
    marginBottom: 12,
  },
  p: {
    fontSize: 16,
    fontWeight: "300",
    lineHeight: 26,
    color: "#333",
    marginBottom: 16,
  },
  list: {
    marginBottom: 16,
  },
  listItem: {
    fontSize: 16,
    fontWeight: "300",
    lineHeight: 26,
    color: "#333",
  },
  bold: { fontWeight: "600" },
  link: { color: "#0066cc", textDecorationLine: "underline" },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#666",
  },
});

const markdownStyles = {
  body: styles.p,
  heading1: styles.h1,
  heading2: styles.h2,
  heading3: styles.h3,
  paragraph: styles.p,
  bullet_list: styles.list,
  ordered_list: styles.list,
  list_item: styles.listItem,
  link: styles.link,
  strong: styles.bold,
};
