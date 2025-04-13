import dynamic from "next/dynamic";
import Head from "next/head";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Briefcase,
  Users,
  CalendarCheck,
  CheckCircle2,
  Lock,
  Sliders,
  BarChart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useTranslation } from "react-i18next";

function RealHome() {
  const { t } = useTranslation("collabify");

  return (
    <>
      <Head>
        <title>{t("title")}</title>
        <meta name="description" content={t("metaDesc")} />
      </Head>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col items-center justify-center transition-colors duration-300">
        <div className="relative z-10 w-full max-w-6xl px-4 py-16 flex flex-col items-center">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-5xl md:text-6xl font-extrabold leading-[1.2] mb-6 bg-gradient-to-r from-pink-600 via-red-600 to-yellow-400 text-transparent bg-clip-text animate-gradient"
            >
              {t("heroTitle")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
              className="text-xl max-w-2xl mx-auto"
            >
              {t("heroSubtitle")}
            </motion.p>
          </div>

          {/* CTA Button */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            >
              <Link href="/api/auth/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/100 transform hover:scale-105 px-6 py-3 rounded-lg shadow-lg text-lg transition-all duration-300 cursor-pointer">
                  {t("getStarted")}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* How It Works Section */}
          <div className="w-full mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-2xl font-semibold mb-6 text-center"
            >
              {t("howItWorks")}
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              <HowItWorksStep
                title={t("createProjects")}
                text={t("createProjectsText")}
              />
              <HowItWorksStep
                title={t("inviteTeam")}
                text={t("inviteTeamText")}
              />
              <HowItWorksStep
                title={t("trackProgress")}
                text={t("trackProgressText")}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="w-full mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-2xl font-semibold mb-6 text-center"
            >
              {t("features")}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Briefcase className="w-8 h-8 text-primary" />}
                title={t("organizeProjects")}
                description={t("organizeProjectsText")}
              />
              <FeatureCard
                icon={<Users className="w-8 h-8 text-primary" />}
                title={t("collaborate")}
                description={t("collaborateText")}
              />
              <FeatureCard
                icon={<CalendarCheck className="w-8 h-8 text-primary" />}
                title={t("stayOnTrack")}
                description={t("stayOnTrackText")}
              />
              <FeatureCard
                icon={<Lock className="w-8 h-8 text-primary" />}
                title={t("secureAuth")}
                description={t("secureAuthText")}
              />
              <FeatureCard
                icon={<Sliders className="w-8 h-8 text-primary" />}
                title={t("customWorkflows")}
                description={t("customWorkflowsText")}
              />
              <FeatureCard
                icon={<BarChart className="w-8 h-8 text-primary" />}
                title={t("analytics")}
                description={t("analyticsText")}
              />
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-12 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-2xl font-semibold mb-4"
            >
              {t("finalCTA")}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            >
              <Link href="/api/auth/login">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transform hover:scale-105 px-6 py-3 rounded-lg shadow-md text-lg transition-all duration-300 cursor-pointer">
                  {t("startCollabifying")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Global Styles for Gradient Animation */}
        <style jsx global>{`
          @keyframes gradient-x {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-x 4s ease infinite;
          }
        `}</style>
      </div>
    </>
  );
}

/** Feature Card Component with hover effect */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="bg-card dark:bg-card backdrop-blur-md shadow-md border border-border transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
        <CardContent className="p-6 flex flex-col items-start space-y-4">
          <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** "How It Works" Step Component with white card styling */
function HowItWorksStep({ title, text }: { title: string; text: string }) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="bg-white shadow-lg border border-gray-200 transition-transform duration-300 hover:-translate-y-1 h-full">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-3 h-full">
          <CheckCircle2 className="w-10 h-10 text-primary mb-2" />
          <h4 className="font-semibold text-lg text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 flex-grow">{text}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// 2) Export a client-only version of RealHome
const Home = dynamic(() => Promise.resolve(RealHome), { ssr: false });
export { Home as default };
