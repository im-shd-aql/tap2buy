"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/hooks/useLang";

export default function AboutPage() {
  const { t, lang } = useLang();

  const values = [
    {
      title: lang === "en" ? "Accessibility" : "접근성",
      description:
        lang === "en"
          ? "Making e-commerce accessible to every small business owner in Sri Lanka"
          : "모든 소상공인이 전자상거래에 접근할 수 있도록 함",
    },
    {
      title: lang === "en" ? "Simplicity" : "단순성",
      description:
        lang === "en"
          ? "Removing complexity and friction from selling online"
          : "온라인 판매의 복잡성과 마찰 제거",
    },
    {
      title: lang === "en" ? "Community" : "커뮤니티",
      description:
        lang === "en"
          ? "Building a network of successful small business owners"
          : "성공적인 소상공인 네트워크 구축",
    },
    {
      title: lang === "en" ? "Innovation" : "혁신",
      description:
        lang === "en"
          ? "Continuously improving our platform to serve you better"
          : "지속적으로 플랫폼을 개선하여 더 나은 서비스 제공",
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
              {lang === "en" ? "About Tap2Buy" : "Tap2Buy에 대해"}
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              {lang === "en"
                ? "Empowering Sri Lankan businesses to sell smarter, faster, and more profitably"
                : "스리랑카 비즈니스가 더 스마트하고 빠르고 수익성 있게 판매하도록 지원"}
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 rounded-xl bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-12"
          >
            <h2 className="mb-6 text-3xl font-bold text-neutral-900">
              {lang === "en" ? "Our Story" : "우리의 이야기"}
            </h2>
            <div className="space-y-4 text-stone-600">
              <p>
                {lang === "en"
                  ? "Tap2Buy was born from a simple observation: Small business owners in Sri Lanka were struggling with outdated e-commerce tools that were either too expensive, too complex, or both."
                  : "Tap2Buy는 간단한 관찰에서 비롯되었습니다: 스리랑카의 소상공인들은 너무 비싸거나 너무 복잡하거나 둘 다인 오래된 전자상거래 도구로 어려움을 겪고 있었습니다."}
              </p>
              <p>
                {lang === "en"
                  ? "We recognized a massive gap in the market—a solution designed specifically for the Sri Lankan context, leveraging WhatsApp and mobile-first shopping habits. So we built Tap2Buy."
                  : "우리는 시장의 거대한 공백을 인식했습니다. 스리랑카의 맥락을 위해 특별히 설계된 솔루션으로 WhatsApp과 모바일 우선 쇼핑 습관을 활용합니다. 그래서 우리는 Tap2Buy를 만들었습니다."}
              </p>
              <p>
                {lang === "en"
                  ? "Today, over 500 Sri Lankan businesses use Tap2Buy to manage their online stores, process orders, and grow their revenue. And we're just getting started."
                  : "오늘날 500명 이상의 스리랑카 사업가들이 Tap2Buy를 사용하여 온라인 스토어를 관리하고, 주문을 처리하고, 수익을 증대시키고 있습니다. 그리고 우리는 이제 막 시작했습니다."}
              </p>
            </div>
          </motion.section>

          {/* Values Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="mb-12 text-center text-3xl font-bold text-neutral-900">
              {lang === "en" ? "Our Core Values" : "우리의 핵심 가치"}
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {values.map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                    {value.title}
                  </h3>
                  <p className="text-stone-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Stats Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 rounded-xl bg-gradient-to-r from-primary to-primary-dark p-8 text-white sm:p-12"
          >
            <h2 className="mb-12 text-center text-3xl font-bold">
              {lang === "en" ? "By The Numbers" : "숫자로 보는 현황"}
            </h2>
            <div className="grid gap-8 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl font-bold">500+</div>
                <div className="mt-2 text-white/80">
                  {lang === "en" ? "Sellers" : "판매자"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">10K+</div>
                <div className="mt-2 text-white/80">
                  {lang === "en" ? "Orders" : "주문"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">5M+</div>
                <div className="mt-2 text-white/80">
                  {lang === "en" ? "LKR Revenue" : "LKR 수익"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">4.9★</div>
                <div className="mt-2 text-white/80">
                  {lang === "en" ? "Rating" : "등급"}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Mission Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 rounded-xl bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-12"
          >
            <h2 className="mb-6 text-3xl font-bold text-neutral-900">
              {lang === "en" ? "Our Mission" : "우리의 미션"}
            </h2>
            <p className="text-lg leading-relaxed text-stone-600">
              {lang === "en"
                ? "To democratize e-commerce and provide every small business owner in Sri Lanka with enterprise-grade tools at a fraction of the cost. We believe that location, resources, or technical expertise shouldn't determine your success online. With Tap2Buy, you get a platform designed by Sri Lankans, for Sri Lankans."
                : "스리랑카의 모든 소상공인에게 비용의 일부로 엔터프라이즈급 도구를 제공하여 전자상거래를 민주화합니다. 우리는 위치, 리소스 또는 기술 전문 지식이 온라인 성공을 결정해서는 안 된다고 믿습니다. Tap2Buy를 사용하면 스리랑카 사람들이 스리랑카 사람들을 위해 설계한 플랫폼을 얻을 수 있습니다."}
            </p>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="mb-6 text-3xl font-bold text-neutral-900">
              {lang === "en"
                ? "Ready to Get Started?"
                : "시작할 준비가 되셨나요?"}
            </h2>
            <p className="mb-8 text-lg text-stone-600">
              {lang === "en"
                ? "Join 500+ Sri Lankan businesses already selling with Tap2Buy"
                : "이미 Tap2Buy로 판매 중인 500명 이상의 스리랑카 사업가와 함께하세요"}
            </p>
            <a
              href="https://wa.me/94XXXXXXXXX?text=Hi!%20I'm%20interested%20in%20learning%20more%20about%20Tap2Buy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-primary px-8 py-3 font-bold text-white transition-all hover:shadow-lg hover:scale-105"
            >
              {lang === "en" ? "Get Started Today" : "오늘 시작하세요"}
            </a>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  );
}
