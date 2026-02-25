"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { COURSES } from "@/constants/courses";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function MeusCursosPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DashboardLayout>
      <div className="content-inner meus-cursos-inner mx-auto w-full max-w-6xl space-y-6 pl-1 pr-2 md:pl-2 md:pr-4">
        <section className="space-y-1">
          <h1 className={cn("text-3xl font-semibold tracking-tight", isDark ? "text-white" : "text-foreground")}>
            Meus cursos
          </h1>
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>
            Acesse suas formações
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              href={course.href}
              acronym={course.acronym}
              cover={course.cover}
              dark={isDark}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
