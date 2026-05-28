"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/hooks/useLang";

export default function PrivacyPage() {
  const { lang } = useLang();

  const sections = [
    {
      titleEn: "1. Information We Collect",
      titleSi: "1. අපි එකතු කරන තොරතුරු",
      contentEn:
        "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, phone number, and payment information. We also collect information about your device and how you interact with our platform through cookies and similar technologies.",
      contentSi:
        "ඔබ ගිණුම සාදන විට, ගිණුම් ක්‍රිස්ගිණුම් කරන විට, හෝ සහයෝගීතාව සඳහා අපට සම්බන්ධ වන විට ඔබ සরාসරිව ඔබට ලබා දුන් තොරතුරු අපි එකතු කරමු.",
    },
    {
      titleEn: "2. How We Use Your Information",
      titleSi: "2. අපි ඔබගේ තොරතුරු භාවිතා කරන ආකාරය",
      contentEn:
        "We use the information we collect to provide, improve, and personalize our services. This includes processing transactions, sending service updates, responding to your inquiries, and improving our platform's functionality. We may also use your information to send you promotional content, but you can opt out at any time.",
      contentSi:
        "අපි එකතු කරන තොරතුරු අපගේ සේවා සැපයීමට, සහතිකරණ සහ පුද්ගලකරණ සඳහා භාවිතා කරමු.",
    },
    {
      titleEn: "3. Information Sharing",
      titleSi: "3. තොරතුරු හුවමාරුව",
      contentEn:
        "We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, but only to the extent necessary to provide the service. We may also disclose information when required by law or to protect our rights.",
      contentSi:
        "අපි ඔබගේ පෞද්ගලික තොරතුරු තෙවන පුද්ගලයින්ට විකිණීමට, වෙළඳ කිරීමට හෝ ඉතුරු කිරීමට නොකරමු.",
    },
    {
      titleEn: "4. Data Security",
      titleSi: "4. දත්ත ආරක්ෂාව",
      contentEn:
        "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and limited employee access. However, no method of transmission over the internet is 100% secure.",
      contentSi:
        "අපි ඔබගේ පෞද්ගලික තොරතුරු අননුවැසි පිවිසුම, ඉතිරු කිරීම, හෙළිවීම හෝ විනාශයට pitched විරුද්ධවිය සඳහා සුදුසු තාක්ෂණික සහ සাංගનික පියවර හරි කරමු.",
    },
    {
      titleEn: "5. Cookies and Tracking",
      titleSi: "5. දත්ත සහ ධාවනය",
      contentEn:
        "We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us understand how you use our service and improve its functionality. You can control cookie settings in your browser, but some features may not work properly if cookies are disabled.",
      contentSi:
        "අපි වේදිකාවලින් තේරුම් ගැනීමේ අভිজ්ঞතා සඳහා දත්ත සහ සමාන ධාවන තාක්ෂණ භාවිතා කරමු.",
    },
    {
      titleEn: "6. Your Rights",
      titleSi: "6. ඔබගේ අයිතිවාසිකම්",
      contentEn:
        "You have the right to access, update, or delete your personal information at any time by logging into your account or contacting us. You may also have other rights under applicable data protection laws, such as the right to data portability or to object to certain processing activities.",
      contentSi:
        "ඔබගේ ගිණුමට ලඔබගී වීමෙන් හෝ අපට සම්බන්ධ වීමෙන් ඕනෑම වේලාවක ඔබගේ පෞද්ගලික තොරතුරු ප්‍රවේශ කිරීමට, යාවත්කාල කිරීමට හෝ මකා දැමීමට ඔබට අයිතිවාසිකම් ඇත.",
    },
    {
      titleEn: "7. Children's Privacy",
      titleSi: "7. දරුවાගේ රහස්‍යතාව",
      contentEn:
        "Our service is not intended for children under 13 years old. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13 without parental consent, we will take steps to delete such information and terminate the child's account.",
      contentSi:
        "අපගේ සේවා 13 සිටින දරුවා වයස් කුඩා දරුවා සඳහා අදහස් නොකරයි.",
    },
    {
      titleEn: "8. Changes to This Privacy Policy",
      titleSi: "8. මෙම රහස්‍යතා ප්‍රතිපත්තිවලට වෙනස්කිරීම්",
      contentEn:
        "We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the 'Last Updated' date. Your continued use of our service constitutes acceptance of the updated Privacy Policy.",
      contentSi:
        "අපගේ ඉතිරු පිටපතිකරණ අනුමත කිරීම යාවත්කාල කිරීම සඳහා අපි මෙම රහස්‍යතා ප්‍රතිපත්තිය වේලාවට යාවත්කාල කිරීමට මට්ටම්.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-neutral-50/50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl">
              {lang === "en" ? "Privacy Policy" : "රහස්‍යතා ප්‍රතිපත්තිය"}
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              {lang === "en"
                ? "Last updated: March 2024"
                : "අවසාන වරට යාවත්කාල කරන ලද: 2024 මාර්තු"}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-12"
          >
            <div className="prose max-w-none space-y-8 text-stone-600">
              {sections.map((section, i) => (
                <motion.section
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <h2 className="mb-4 text-2xl font-bold text-neutral-900">
                    {lang === "en" ? section.titleEn : section.titleSi}
                  </h2>
                  <p className="leading-relaxed">
                    {lang === "en" ? section.contentEn : section.contentSi}
                  </p>
                </motion.section>
              ))}

              <motion.section
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: sections.length * 0.05 }}
                className="mt-12 border-t border-stone-200 pt-8"
              >
                <h2 className="mb-4 text-2xl font-bold text-neutral-900">
                  {lang === "en"
                    ? "Contact Us"
                    : "අපට සම්බන්ධ කරන්න"}
                </h2>
                <p className="mb-6">
                  {lang === "en"
                    ? "If you have any questions about our Privacy Policy or our privacy practices, please contact us at:"
                    : "ඔබගේ රහස්‍යතා ප්‍රතිපත්තිය හෝ අපගේ රහස්‍යතා ඉතිරු පිටපතිකරණ ගැන ඕනෑම ප්‍රශ්ණ ඇත්තේ නම්, කරුණාකර අපට සම්බන්ධ කරන්න:"}
                </p>
                <div className="space-y-2">
                  <p className="font-semibold text-neutral-900">
                    Email:{" "}
                    <a
                      href="mailto:hello@tap2buy.lk"
                      className="text-primary hover:underline"
                    >
                      hello@tap2buy.lk
                    </a>
                  </p>
                  <p className="font-semibold text-neutral-900">
                    WhatsApp:{" "}
                    <a
                      href="https://wa.me/94XXXXXXXXX"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      +94 XX XXX XXXX
                    </a>
                  </p>
                </div>
              </motion.section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
