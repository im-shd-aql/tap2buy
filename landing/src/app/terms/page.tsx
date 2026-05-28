"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/hooks/useLang";

export default function TermsPage() {
  const { lang } = useLang();

  const sections = [
    {
      titleEn: "1. Acceptance of Terms",
      titleSi: "1. කොන්දේසි පිළිගැනීම",
      contentEn:
        "By accessing and using the Tap2Buy platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
      contentSi:
        "Tap2Buy වේදිකා වෙත ප්‍රවේශ වීමෙන් සහ භාවිතා කිරීමෙන්, ඔබ මෙම ගිණුමේ කොන්දේසි සහ විධිවිධාන පිළිගැනීමට සහ එයට බැඳී සිටිමට එකඟ වෙයි.",
    },
    {
      titleEn: "2. Use License",
      titleSi: "2. භාවිතා බලපත්‍ර",
      contentEn:
        "Permission is granted to temporarily download one copy of the materials (information or software) on Tap2Buy's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software contained on the website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or 'mirror' the materials on any other server.",
      contentSi:
        "Tap2Buy ගිණුමේ ස්ථානයේ ද්‍රව්‍ය (තොරතුරු හෝ මෘදුකාංග) තාවකාලිකව බාගත කිරීම සඳහා අවසර ලබා දෙනු ලැබේ. පෙර නිර්දේශ සඳහා, ඔබ විසින් මෙම බලපත්‍රය යටතේ: ද්‍රව්‍ය සංස්කරණ හෝ පිටපත් කරගත නොහැක;",
    },
    {
      titleEn: "3. Disclaimer",
      titleSi: "3. වඩාත් නිවේදන",
      contentEn:
        "The materials on Tap2Buy's website are provided on an 'as is' basis. Tap2Buy makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
      contentSi:
        "Tap2Buy ගිණුමේ ස්ථානයේ ද්‍රව්‍ය 'එසේ ය' ඉදිරිපත් කරනු ලැබේ. Tap2Buy කිසිදු ඉතුරු කිරීම, ප්‍රකාශිත හෝ ගර්භිත, සහ එතනින් අනෙකුත් සියලු ඉතුරු කිරීම් අවලංගු කරයි.",
    },
    {
      titleEn: "4. Limitations",
      titleSi: "4. සීමාවන්",
      contentEn:
        "In no event shall Tap2Buy or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Tap2Buy, even if Tap2Buy or a Tap2Buy authorized representative has been notified orally or in writing of the possibility of such damage.",
      contentSi:
        "කිසිම අවස්ථාවකදී Tap2Buy හෝ එහි සরবरાහකරුවින් Tap2Buy ස්ථානයේ ද්‍රව්‍ය භාවිතා කිරීමෙන් හෝ භාවිතා කිරීමට නොහැකි බවින් ඇතිවන ඉතිරුවිලෙස සාධනයට දී ඇති ක්ষතිවලට দොස්තර ගිණුම් ගිණුම්කරු නොවන බවින් උත්තරවාදී නොවන්න.",
    },
    {
      titleEn: "5. Accuracy of Materials",
      titleSi: "5. ද්‍රව්‍යවල නිරවද්‍යතা",
      contentEn:
        "The materials appearing on Tap2Buy's website could include technical, typographical, or photographic errors. Tap2Buy does not warrant that any of the materials on the website are accurate, complete, or current. Tap2Buy may make changes to the materials contained on its website at any time without notice.",
      contentSi:
        "Tap2Buy ගිණුමේ ස්ථානයේ පෙන්නුම් දෙන ද්‍රව්‍යවලට තාක්ෂණික, ටයිපිපුරාණ, හෝ ඡායාරූප දෝෂ ඇතුළත් විය හැකිය.",
    },
    {
      titleEn: "6. Modifications",
      titleSi: "6. වෙනස්කරණ",
      contentEn:
        "Tap2Buy may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.",
      contentSi:
        "Tap2Buy විසින් ඉතිරු කිරීම ගිණුම්වල නිවේදනයට ඕනෑම වේලාවක සංස්කරණ කළ හැකිය.",
    },
    {
      titleEn: "7. Governing Law",
      titleSi: "7. පාලක නීතිය",
      contentEn:
        "These terms and conditions of use are governed by and construed in accordance with the laws of Sri Lanka, and you irrevocably submit to the exclusive jurisdiction of the courts in Sri Lanka.",
      contentSi:
        "ඉතිරු කිරීම සහ වැඩි කිරීමවල ශ්‍රී ලංකා නීතිවලට අනුව පාලනය කරනු ලබන අතර, ඔබ ශ්‍රී ලංකාවේ උසස් අධිකරණ කටයුතු ගිණුම් ගිණුමවලට අපිරිවිසි ඉදිරිපත් කරන්න.",
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
              {lang === "en" ? "Terms of Service" : "සේවා නියම"}
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
                  {lang === "en" ? "Questions?" : "ප්‍රශ්ණ?"}
                </h2>
                <p className="mb-6">
                  {lang === "en"
                    ? "If you have any questions about our Terms of Service, please contact us at:"
                    : "ඔබගේ සේවා නියම පිළිබඳ ඕනෑම ප්‍රශ්ණ ඇත්තේ නම්, කරුණාකර අපට සම්බන්ධ කරන්න:"}
                </p>
                <p className="font-semibold text-neutral-900">
                  Email:{" "}
                  <a
                    href="mailto:hello@tap2buy.lk"
                    className="text-primary hover:underline"
                  >
                    hello@tap2buy.lk
                  </a>
                </p>
              </motion.section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
