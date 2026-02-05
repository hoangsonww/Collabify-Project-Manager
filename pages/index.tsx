import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Layers,
  Lock,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import { Bebas_Neue, Sora } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function RevealGroup({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.12, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

function CountUp({
  value,
  duration = 1.8,
  formatter,
  suffix = "",
  prefix = "",
}: {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    let frame: number;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [duration, isInView, reduceMotion, value]);

  const formatted = formatter
    ? formatter(displayValue)
    : displayValue.toFixed(0);

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

function RealHome() {
  const { t } = useTranslation("collabify");
  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    [],
  );
  const percentFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }),
    [],
  );
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }),
    [],
  );

  const stats = [
    {
      id: "tasks",
      value: 2400000,
      label: t("statTasks"),
      formatter: (val: number) => compactFormatter.format(val),
      suffix: "+",
    },
    {
      id: "milestones",
      value: 98.7,
      label: t("statMilestones"),
      formatter: (val: number) => percentFormatter.format(val),
      suffix: "%",
    },
    {
      id: "teams",
      value: 310000,
      label: t("statTeams"),
      formatter: (val: number) => compactFormatter.format(val),
      suffix: "+",
    },
    {
      id: "cycle-time",
      value: 42,
      label: t("statCycleTime"),
      formatter: (val: number) => numberFormatter.format(val),
      suffix: "%",
    },
    {
      id: "uptime",
      value: 99.99,
      label: t("statUptime"),
      formatter: (val: number) => percentFormatter.format(val),
      suffix: "%",
    },
  ];

  const heroHighlights = [
    { id: "visibility", text: t("heroHighlight1") },
    { id: "automation", text: t("heroHighlight2") },
    { id: "governance", text: t("heroHighlight3") },
  ];

  const workflowSteps = [
    {
      id: "align",
      title: t("workflowStep1Title"),
      text: t("workflowStep1Text"),
    },
    {
      id: "plan",
      title: t("workflowStep2Title"),
      text: t("workflowStep2Text"),
    },
    {
      id: "execute",
      title: t("workflowStep3Title"),
      text: t("workflowStep3Text"),
    },
    {
      id: "report",
      title: t("workflowStep4Title"),
      text: t("workflowStep4Text"),
    },
  ];

  const capabilities = [
    {
      id: "workspace",
      icon: <Layers className="h-6 w-6 text-amber-600 dark:text-amber-300" />,
      title: t("capability1Title"),
      description: t("capability1Text"),
    },
    {
      id: "automation",
      icon: <Workflow className="h-6 w-6 text-amber-600 dark:text-amber-300" />,
      title: t("capability2Title"),
      description: t("capability2Text"),
    },
    {
      id: "stakeholders",
      icon: (
        <MessagesSquare className="h-6 w-6 text-amber-600 dark:text-amber-300" />
      ),
      title: t("capability3Title"),
      description: t("capability3Text"),
    },
    {
      id: "analytics",
      icon: (
        <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-300" />
      ),
      title: t("capability4Title"),
      description: t("capability4Text"),
    },
    {
      id: "goals",
      icon: <Target className="h-6 w-6 text-amber-600 dark:text-amber-300" />,
      title: t("capability5Title"),
      description: t("capability5Text"),
    },
    {
      id: "forecast",
      icon: <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-300" />,
      title: t("capability6Title"),
      description: t("capability6Text"),
    },
  ];

  const stories = [
    {
      id: "northwind",
      quote: t("story1Quote"),
      name: t("story1Name"),
      role: t("story1Role"),
      company: t("story1Company"),
      metric: t("story1MetricLabel"),
      value: 36,
      suffix: "%",
    },
    {
      id: "signalforge",
      quote: t("story2Quote"),
      name: t("story2Name"),
      role: t("story2Role"),
      company: t("story2Company"),
      metric: t("story2MetricLabel"),
      value: 2.7,
      suffix: "x",
    },
    {
      id: "everlane",
      quote: t("story3Quote"),
      name: t("story3Name"),
      role: t("story3Role"),
      company: t("story3Company"),
      metric: t("story3MetricLabel"),
      value: 91,
      suffix: "%",
    },
  ];

  const securityItems = [
    {
      id: "encryption",
      icon: (
        <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
      ),
      title: t("security1Title"),
      text: t("security1Text"),
    },
    {
      id: "access",
      icon: <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />,
      title: t("security2Title"),
      text: t("security2Text"),
    },
    {
      id: "reliability",
      icon: (
        <Gauge className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
      ),
      title: t("security3Title"),
      text: t("security3Text"),
    },
  ];

  const faqItems = [
    {
      id: "onboarding",
      question: t("faq1Question"),
      answer: t("faq1Answer"),
    },
    {
      id: "reporting",
      question: t("faq2Question"),
      answer: t("faq2Answer"),
    },
    {
      id: "workflows",
      question: t("faq3Question"),
      answer: t("faq3Answer"),
    },
    {
      id: "security",
      question: t("faq4Question"),
      answer: t("faq4Answer"),
    },
  ];

  return (
    <>
      <Head>
        <title>{t("title")}</title>
        <meta name="description" content={t("metaDesc")} />
      </Head>
      <div
        className={`${sora.className} dark relative min-h-screen overflow-hidden bg-[#0a0a0a] text-foreground`}
      >
        <div className="relative z-10">
          <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-16 pt-16 sm:px-8 lg:px-12">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col gap-6">
                <Reveal>
                  <div className="inline-flex items-center gap-2 self-start rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm dark:bg-card/60">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {t("heroBadge")}
                  </div>
                </Reveal>
                <Reveal delay={0.1}>
                  <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    <span className="block text-foreground">
                      {t("heroTitle")}
                    </span>
                    <span className="block bg-gradient-to-r from-foreground via-emerald-500 to-amber-500 bg-clip-text text-transparent dark:via-emerald-300 dark:to-amber-300">
                      {t("heroHeadline")}
                    </span>
                  </h1>
                </Reveal>
                <Reveal delay={0.15}>
                  <p className="max-w-xl text-lg text-muted-foreground">
                    {t("heroSubtitle")}
                  </p>
                </Reveal>
                <Reveal delay={0.2}>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href="/api/auth/login">
                      <Button className="bg-primary px-7 py-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90">
                        {t("getStarted")}
                      </Button>
                    </Link>
                    <Link href="#stories">
                      <Button
                        variant="outline"
                        className="border-border px-7 py-6 text-base font-semibold text-foreground/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground"
                      >
                        {t("heroSecondaryCta")}
                      </Button>
                    </Link>
                  </div>
                </Reveal>
                <RevealGroup className="grid gap-3 sm:grid-cols-2" delay={0.25}>
                  {heroHighlights.map((item) => (
                    <RevealItem key={item.id}>
                      <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 p-3 text-sm text-muted-foreground shadow-sm">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                        <span>{item.text}</span>
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
                <Reveal delay={0.3}>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                    {t("heroNote")}
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.2}>
                <div className="relative rounded-[32px] border border-border bg-card/80 p-6 shadow-2xl shadow-black/10 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t("heroCardTitle")}
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        {t("heroCardSubtitle")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {t("heroCardStatus")}
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-900 p-5 text-white dark:bg-slate-950">
                      <div
                        className={`${bebas.className} text-4xl tracking-wide`}
                      >
                        <CountUp
                          value={98.7}
                          formatter={(val) => percentFormatter.format(val)}
                          suffix="%"
                        />
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">
                        {t("heroCardMetric1")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <div
                        className={`${bebas.className} text-4xl tracking-wide text-foreground`}
                      >
                        <CountUp
                          value={1.2}
                          formatter={(val) => percentFormatter.format(val)}
                          suffix="M"
                        />
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {t("heroCardMetric2")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
                      <span>{t("heroCardMetric3")}</span>
                      <span className="text-foreground">72%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-muted">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: "72%" }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      {t("heroCardFootnote")}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card/70 px-6 py-4 text-sm text-muted-foreground shadow-sm">
                <span className="font-semibold text-foreground mr-2">
                  {t("trustedBy")}
                </span>
                <RevealGroup className="flex flex-wrap items-center gap-3">
                  {[
                    "Northwind",
                    "Apex",
                    "SignalForge",
                    "Everlane",
                    "Maven",
                    "Boreal",
                  ].map((brand) => (
                    <RevealItem key={brand}>
                      <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                        {brand}
                      </span>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </Reveal>
          </section>

          <section className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-8 lg:px-12">
            <Reveal>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-300">
                  {t("statsTitle")}
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                  {t("statsSubtitle")}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("statsNote")}
                </p>
              </div>
            </Reveal>
            <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {stats.map((stat) => (
                <RevealItem key={stat.id}>
                  <Card className="h-full border-border bg-card/90 shadow-lg shadow-black/5">
                    <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
                      <div
                        className={`${bebas.className} text-4xl tracking-wide text-foreground sm:text-5xl`}
                      >
                        <CountUp
                          value={stat.value}
                          formatter={stat.formatter}
                          suffix={stat.suffix}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>

          <section
            id="workflow"
            className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-8 lg:px-12"
          >
            <Reveal>
              <div className="flex flex-col gap-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">
                  {t("workflowTitle")}
                </p>
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  {t("workflowSubtitle")}
                </h2>
              </div>
            </Reveal>
            <RevealGroup className="mt-10 grid gap-6 md:grid-cols-2">
              {workflowSteps.map((step, index) => (
                <RevealItem key={step.id}>
                  <Card className="h-full border-border bg-card/90 shadow-lg shadow-black/5">
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                          0{index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-foreground">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.text}
                      </p>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>

          <section className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <Reveal>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {t("capabilitiesTitle")}
                  </p>
                </Reveal>
                <Reveal delay={0.05}>
                  <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                    {t("capabilitiesSubtitle")}
                  </h2>
                </Reveal>
                <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-2">
                  {capabilities.map((capability) => (
                    <RevealItem key={capability.id}>
                      <Card className="h-full border-border bg-card/90 shadow-lg shadow-black/5">
                        <CardContent className="flex h-full flex-col gap-3 p-5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
                            {capability.icon}
                          </div>
                          <h3 className="text-base font-semibold text-foreground">
                            {capability.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {capability.description}
                          </p>
                        </CardContent>
                      </Card>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
              <RevealGroup className="flex flex-col gap-6">
                <RevealItem>
                  <Card className="border-border bg-slate-900 text-white shadow-xl shadow-black/10 dark:bg-slate-950">
                    <CardContent className="flex flex-col gap-6 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                            {t("commandTitle")}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold text-white">
                            {t("commandSubtitle")}
                          </h3>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                          <ClipboardList className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {[
                          t("commandBullet1"),
                          t("commandBullet2"),
                          t("commandBullet3"),
                          t("commandBullet4"),
                        ].map((bullet) => (
                          <div
                            key={bullet}
                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                          >
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </RevealItem>
                <RevealItem>
                  <Card className="border-border bg-card/90 shadow-lg shadow-black/5">
                    <CardContent className="grid gap-4 p-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                          {t("commandMetricTitle")}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">
                          {t("commandMetricSubtitle")}
                        </h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[
                          {
                            value: 18,
                            label: t("commandMetricValue1Label"),
                            suffix: "%",
                          },
                          {
                            value: 22,
                            label: t("commandMetricValue2Label"),
                            suffix: "%",
                          },
                          {
                            value: 3.4,
                            label: t("commandMetricValue3Label"),
                            suffix: "x",
                          },
                        ].map((metric) => (
                          <div
                            key={metric.label}
                            className="rounded-2xl border border-border bg-muted/50 px-4 py-4"
                          >
                            <div
                              className={`${bebas.className} text-3xl text-foreground`}
                            >
                              <CountUp
                                value={metric.value}
                                formatter={(val) =>
                                  percentFormatter.format(val)
                                }
                                suffix={metric.suffix}
                              />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {metric.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </RevealItem>
              </RevealGroup>
            </div>
          </section>

          <section
            id="stories"
            className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-8 lg:px-12"
          >
            <Reveal>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-300">
                  {t("storiesTitle")}
                </p>
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  {t("storiesSubtitle")}
                </h2>
              </div>
            </Reveal>
            <Reveal>
              <div className="mt-8 overflow-x-auto overflow-y-visible">
                <RevealGroup className="flex min-w-full gap-6 px-2 py-6 sm:px-4">
                  {stories.map((story) => (
                    <RevealItem key={story.id}>
                      <Card className="min-w-[280px] flex-1 border-border bg-card/90 shadow-lg shadow-black/5 transition-transform duration-300 hover:-translate-y-1 lg:min-w-[320px]">
                        <CardContent className="flex h-full flex-col gap-4 p-6">
                          <p className="text-sm text-muted-foreground">
                            “{story.quote}”
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {story.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {story.role} · {story.company}
                              </p>
                            </div>
                            <div className="rounded-xl border border-amber-200/70 bg-amber-50 px-3 py-2 text-center dark:border-amber-500/40 dark:bg-amber-500/10">
                              <div
                                className={`${bebas.className} text-2xl text-amber-700 dark:text-amber-200`}
                              >
                                <CountUp
                                  value={story.value}
                                  formatter={(val) =>
                                    percentFormatter.format(val)
                                  }
                                  suffix={story.suffix}
                                />
                              </div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">
                                {story.metric}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </Reveal>
          </section>

          <section className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-8 lg:px-12">
            <Reveal>
              <div className="flex flex-col gap-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-300">
                  {t("securityTitle")}
                </p>
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  {t("securitySubtitle")}
                </h2>
              </div>
            </Reveal>
            <RevealGroup className="mt-10 grid gap-6 md:grid-cols-3">
              {securityItems.map((item) => (
                <RevealItem key={item.id}>
                  <Card className="h-full border-border bg-card/90 shadow-lg shadow-black/5">
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.text}
                      </p>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>

          <section className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-8 lg:px-12">
            <Reveal>
              <div className="flex flex-col gap-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {t("faqTitle")}
                </p>
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  {t("faqSubtitle")}
                </h2>
              </div>
            </Reveal>
            <RevealGroup className="mt-10 grid gap-6 lg:grid-cols-2">
              {faqItems.map((item) => (
                <RevealItem key={item.id}>
                  <Card className="h-full border-border bg-card/90 shadow-lg shadow-black/5">
                    <CardContent className="flex h-full flex-col gap-3 p-6">
                      <h3 className="text-base font-semibold text-foreground">
                        {item.question}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.answer}
                      </p>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>

          <section className="mx-auto w-full max-w-7xl px-6 pb-20 sm:px-8 lg:px-12">
            <Reveal>
              <div className="rounded-[32px] border border-border bg-slate-900 px-8 py-12 text-center text-white shadow-2xl shadow-black/20 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300 dark:text-emerald-200">
                  {t("finalCTA")}
                </p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  {t("finalCTASubtitle")}
                </h2>
                <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link href="/api/auth/login">
                    <Button className="bg-white px-7 py-6 text-base font-semibold text-slate-900 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                      {t("startCollabifying")}
                    </Button>
                  </Link>
                  <Link href="#workflow">
                    <Button
                      variant="outline"
                      className="border-white/40 px-7 py-6 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 dark:border-white/30 dark:hover:bg-white/15"
                    >
                      {t("heroSecondaryCta")}
                    </Button>
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>
        </div>
      </div>
    </>
  );
}
const Home = dynamic(() => Promise.resolve(RealHome), { ssr: false });
export { Home as default };
