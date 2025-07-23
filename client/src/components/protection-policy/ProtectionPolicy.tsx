"use client";
import React, { useState } from 'react';

const DataPrivacyPolicy = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const policySections = [
    {
      title: "1. Introduction",
      content: (
        <div>
          <p>CedarView Communications Limited respects your privacy and is committed to protecting your data. This Data Privacy and Protection Policy describes your privacy rights regarding our policies and procedures on the collection, use storage, sharing and protection of your personal identifiers, electronic network activity information, professional information, location information, and other types of information.</p>
          <p className="mt-2">This policy applies to all forms of systems, operations, and processes within our environment that involve the collection, storage, use, transmission, and disposal of Personal Information. It is strictly restricted to our Service and does not apply to third-party platforms or websites.</p>
        </div>
      )
    },
    {
      title: "2. Consent",
      content: (
        <div>
          <p>By accessing or using the Service in any manner, you indicate that you have read and accepted this Data Privacy and Protection Policy and consent to the data practices described herein.</p>
          <p className="mt-2">You agree that upon granting consent, you have the legal capacity to do so and are aware of your privacy rights and option to withdraw consent at any time. If you do not accept this policy or do not comply with its provisions, you may not use our Service.</p>
        </div>
      )
    },
    {
      title: "3. Interpretation and Definitions",
      content: (
        <div>
          <h3 className="font-bold mb-2">3.1 Interpretation</h3>
          <p>Words with capitalized initial letters have specific defined meanings.</p>

          <h3 className="font-bold mt-4 mb-2">3.2 Key Definitions</h3>
          <ul className="list-disc pl-5">
            <li><strong>Account:</strong> A unique account created for you to access our Service</li>
            <li><strong>Affiliate:</strong> An entity with 50% or more ownership/control</li>
            <li><strong>Application:</strong> One Number software program</li>
            <li><strong>Company:</strong> CedarView Communications Limited</li>
            <li><strong>Device:</strong> Any device that can access the Service</li>
            <li><strong>Personal Data:</strong> Information relating to an identifiable individual</li>
            <li><strong>Service Provider:</strong> Third-party processors of data on behalf of the Company</li>
            <li><strong>Usage Data:</strong> Automatically collected data about service usage</li>
          </ul>
        </div>
      )
    },
    {
      title: "4. Collecting and Using Your Personal Data",
      content: (
        <div>
          <h3 className="font-bold mb-2">Types of Data Collected:</h3>
          <div>
            <h4 className="font-semibold">Personal Data</h4>
            <p>We may collect personally identifiable information such as:</p>
            <ul className="list-disc pl-5">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Address, State, Province, ZIP/Postal code, City</li>
            </ul>

            <h4 className="font-semibold mt-4">Usage Data</h4>
            <p>Automatically collected information including:</p>
            <ul className="list-disc pl-5">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited</li>
              <li>Time and date of visit</li>
              <li>Unique device identifiers</li>
              <li>Mobile device information</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "5. Information Collected while Using the Application",
      content: (
        <div>
          <p>With your prior permission, we may collect location information to provide service features and improve our Service.</p>
          <h3 className="font-bold mt-2 mb-2">5.1 Purpose Limitation</h3>
          <p>We collect Personal Data only for identified purposes with obtained consent. Data cannot be reused for incompatible purposes without additional consent.</p>

          <h3 className="font-bold mt-2 mb-2">5.2 Data Minimization</h3>
          <p>We limit data collection to information that is relevant, adequate, and necessary. Where possible, we use anonymized data.</p>
        </div>
      )
    },
    {
      title: "6. Use of Your Personal Data",
      content: (
        <div>
          <h3 className="font-bold mb-2">Purposes of Data Use:</h3>
          <ul className="list-disc pl-5">
            <li>Provide and maintain Service</li>
            <li>Manage Your Account</li>
            <li>Perform contract obligations</li>
            <li>Contact You via various communication channels</li>
            <li>Provide marketing content and special offers</li>
            <li>Manage Your Requests</li>
            <li>Business transfers and restructuring</li>
            <li>Data analysis and service improvement</li>
          </ul>

          <h3 className="font-bold mt-4 mb-2">Sharing of Personal Information:</h3>
          <ul className="list-disc pl-5">
            <li>With Service Providers</li>
            <li>During business transfers</li>
            <li>With Affiliates</li>
            <li>With business partners</li>
            <li>With Your explicit consent</li>
          </ul>
        </div>
      )
    },
    {
      title: "7. Retention of Your Personal Data",
      content: (
        <div>
          <p>We will retain Your Personal Data only for as long as necessary for the purposes outlined in this Privacy Policy.</p>
          <h3 className="font-bold mt-2 mb-2">Retention Considerations:</h3>
          <ul className="list-disc pl-5">
            <li>Compliance with legal and statutory obligations</li>
            <li>Processing transactions and settlements</li>
            <li>Identifying fraud</li>
            <li>Periodic review of retained data</li>
          </ul>
          <p className="mt-2">The length of storage will be determined by contract terms, statutory requirements, data subject requests, and other lawful bases for retention.</p>
        </div>
      )
    },
    {
      title: "8. Data Subject Rights",
      content: (
        <div>
          <h3 className="font-bold mb-2">Your Rights Include:</h3>
          <ul className="list-disc pl-5">
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of data processing</li>
            <li>Request transfer of your personal data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="mt-2">You can exercise these rights by contacting our customer care. Some restrictions may apply based on legal obligations.</p>
        </div>
      )
    },
    {
      title: "9. Transfer of Your Personal Data",
      content: (
        <div>
          <p>Your information may be processed and transferred to computers located outside your jurisdiction.</p>
          <h3 className="font-bold mt-2 mb-2">Transfer Conditions:</h3>
          <ul className="list-disc pl-5">
            <li>With your consent</li>
            <li>Necessary for contract performance</li>
            <li>Necessary for legal claims</li>
            <li>To protect vital interests</li>
          </ul>
          <p className="mt-2">We ensure adequate protection and security measures are in place for any international data transfers.</p>
        </div>
      )
    },
    {
      title: "10. Lawful Basis for Processing Personal Data",
      content: (
        <div>
          <h3 className="font-bold mb-2">Legal Bases for Processing:</h3>
          <ul className="list-disc pl-5">
            <li>With your consent</li>
            <li>Necessary for contract performance</li>
            <li>Compliance with legal obligations</li>
            <li>Protecting vital interests</li>
            <li>Public interest or official mandate</li>
          </ul>
          <p className="mt-2">Consent means freely given, specific, informed, and unambiguous agreement to data processing.</p>
        </div>
      )
    },
    {
      title: "11. Security of Your Personal Data",
      content: (
        <div>
          <p>We strive to use commercially acceptable means to protect your Personal Data, though no method of transmission over the Internet is 100% secure.</p>
          <h3 className="font-bold mt-2 mb-2">Age Restriction</h3>
          <p>Our Service is not directed to persons under 18. We do not knowingly collect personally identifiable information from anyone under 18.</p>
        </div>
      )
    },
    {
      title: "12. Links to Other Websites",
      content: (
        <div>
          <p>Our Service may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of any third-party sites.</p>
          <p className="mt-2">We strongly advise you to review the Privacy Policy of every site you visit.</p>
        </div>
      )
    },
    {
      title: "13. Updates, Modifications and Amendments",
      content: (
        <div>
          <p>We may update our Data Privacy and Protection Policy from time to time.</p>
          <h3 className="font-bold mt-2 mb-2">Update Process:</h3>
          <ul className="list-disc pl-5">
            <li>Check this page for updates</li>
            <li>Notifications via email or service notice</li>
            <li>Changes are effective when posted</li>
          </ul>
          <p className="mt-2">Continuing to use our Services after changes indicates acceptance of the revised policy.</p>
        </div>
      )
    },
    {
      title: "14. Dispute Resolution",
      content: (
        <div>
          <p>Any dispute shall be referred to the Lagos Court of Arbitration.</p>
          <h3 className="font-bold mt-2 mb-2">Arbitration Details:</h3>
          <ul className="list-disc pl-5">
            <li>Number of arbitrators: One</li>
            <li>Seat of arbitration: Lagos State, Nigeria</li>
            <li>Language: English</li>
            <li>Decision is final and binding</li>
          </ul>
        </div>
      )
    },
    {
      title: "15. Questions and Inquiries",
      content: (
        <div>
          <p>Contact us for any questions about this Data Privacy and Protection Policy:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Email: customercare@onenumber.africa</li>
            <li>Phone: +2348034722472</li>
          </ul>
        </div>
      )
    }
  ];



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white  ">
      <h1 className="text-3xl font-bold text-center mt-10 text-secondary">
        Data Privacy and Protection Policy
      </h1>

      <div className="space-y-4 mt-10">
        {policySections.map((section, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection(index)}
              className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition-colors font-semibold text-lg flex justify-between items-center"
            >
              {section.title}
              <span className="text-xl">
                {expandedSections[index] ? '−' : '+'}
              </span>
            </button>

            {expandedSections[index] && (
              <div className="p-4 text-gray-700">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="my-10 text-center">
        <p className="text-sm text-gray-600">
          Last Updated: March 2025
        </p>
        <p className="text-sm text-gray-600 mt-2">
          For any questions or concerns, please contact us at:{' '}
          <a
            href="mailto:customercare@onenumber.africa"
            className="text-blue-600 hover:underline"
          >
            customercare@onenumber.africa
          </a>
        </p>
      </div>
    </div>
  );
};

export default DataPrivacyPolicy;
