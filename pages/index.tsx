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
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Collabify | Your Project Management Solution</title>
        <meta
          name="description"
          content="Manage system-wide settings, user roles, and view system logs with Collabify."
        />
      </Head>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col items-center justify-center transition-colors duration-300">
        <div className="relative z-10 w-full max-w-6xl px-4 py-16 flex flex-col items-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.2] mb-6 bg-gradient-to-r from-pink-600 via-red-600 to-yellow-400 text-transparent bg-clip-text animate-gradient">
              Collabify
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              The ultimate platform to seamlessly plan, organize, and
              collaborate on projects with your team – all in one place.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            className="mb-12"
          >
            <Link href="/api/auth/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/100 transform hover:scale-105 px-6 py-3 rounded-lg shadow-lg text-lg transition-all duration-300 cursor-pointer">
                Get Started
              </Button>
            </Link>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            className="w-full mb-12"
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">
              How Collabify Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <HowItWorksStep
                title="Create Projects"
                text="Set up new projects instantly and define tasks or milestones."
              />
              <HowItWorksStep
                title="Invite Your Team"
                text="Add collaborators, assign roles, and keep everyone aligned."
              />
              <HowItWorksStep
                title="Track Progress"
                text="Use real-time dashboards, charts, and tasks to ensure on-time delivery."
              />
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            className="w-full mb-12"
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Briefcase className="w-8 h-8 text-primary" />}
                title="Organize Projects"
                description="Manage multiple projects seamlessly with clear task assignments."
              />
              <FeatureCard
                icon={<Users className="w-8 h-8 text-primary" />}
                title="Collaborate"
                description="Invite team members, discuss tasks, and keep everyone in sync."
              />
              <FeatureCard
                icon={<CalendarCheck className="w-8 h-8 text-primary" />}
                title="Stay on Track"
                description="Monitor deadlines with built-in charts and real-time updates."
              />
              {/* Additional Card 1: Auth0 Integration */}
              <FeatureCard
                icon={<Lock className="w-8 h-8 text-primary" />}
                title="Secure Authentication"
                description="Leverage Auth0 for secure, seamless, and reliable user authentication."
              />
              {/* Additional Card 2: Customizable Workflows */}
              <FeatureCard
                icon={<Sliders className="w-8 h-8 text-primary" />}
                title="Customizable Workflows"
                description="Tailor workflows to suit your team’s unique project management needs."
              />
              {/* Additional Card 3: Analytics & Insights */}
              <FeatureCard
                icon={<BarChart className="w-8 h-8 text-primary" />}
                title="Analytics & Insights"
                description="Gain actionable insights through real-time analytics and reporting."
              />
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-semibold mb-4">
              Ready to transform your team’s productivity?
            </h2>
            <Link href="/api/auth/login">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transform hover:scale-105 px-6 py-3 rounded-lg shadow-md text-lg transition-all duration-300 cursor-pointer">
                Start Collabifying!
              </Button>
            </Link>
          </motion.div>
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
            animation: gradient-x 5s ease infinite;
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
    <Card className="bg-card dark:bg-card backdrop-blur-md shadow-md border border-border transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="p-6 flex flex-col items-start space-y-4">
        <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

/** "How It Works" Step Component with white card styling */
function HowItWorksStep({ title, text }: { title: string; text: string }) {
  return (
    <Card className="bg-white shadow-lg border border-gray-200 transition-transform duration-300 hover:-translate-y-1">
      <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-primary mb-2" />
        <h4 className="font-semibold text-lg text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 max-w-sm">{text}</p>
      </CardContent>
    </Card>
  );
}
