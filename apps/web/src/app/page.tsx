import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-amu-navy text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
            Asset Management University
          </h1>
          <p className="font-body text-xl md:text-2xl text-amu-sky mb-8 max-w-3xl mx-auto">
            AI-facilitated learning that makes asset management education
            radically accessible. Free forever. Learn at your own pace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="bg-amu-sky hover:bg-amu-sky/80 text-amu-navy font-heading font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Browse Courses
            </Link>
            <Link
              href="/register"
              className="bg-transparent border-2 border-white hover:bg-amu-sky hover:text-amu-navy hover:border-amu-sky text-white font-heading font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center text-amu-navy mb-12">
            Why Choose AMU?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Free Lifetime Learning"
              description="Access all courses for free, forever. No credit card required. Learn at your own pace with AI-facilitated guidance."
              icon="🎓"
            />
            <FeatureCard
              title="Competency-Based Assessment"
              description="No grades or exams. Demonstrate competency through natural conversation and practical application."
              icon="✓"
            />
            <FeatureCard
              title="AI-Powered Facilitation"
              description="Learn through Socratic dialogue with Claude, your personal AI learning facilitator available 24/7."
              icon="🤖"
            />
          </div>
        </div>
      </section>

      {/* Ubuntu Philosophy Section */}
      <section className="py-16 px-4 bg-amu-sky/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold text-amu-navy mb-6">
            Ubuntu Philosophy
          </h2>
          <p className="font-body text-xl text-amu-charcoal italic mb-4">
            &ldquo;I am because we are&rdquo;
          </p>
          <p className="font-body text-amu-charcoal">
            AMU is built on the African philosophy of Ubuntu - the belief in our
            interconnectedness. When you learn, you contribute to a community of
            practice. Your success enables others to succeed.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-amu-sky">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold text-amu-navy mb-6">
            Ready to Start Learning?
          </h2>
          <p className="font-body text-amu-charcoal mb-8">
            Join thousands of learners developing their asset management expertise.
          </p>
          <Link
            href="/register"
            className="bg-amu-navy hover:bg-[#153e70] text-white font-heading font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amu-navy text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-body text-amu-sky">
            © {new Date().getFullYear()} Asset Management University.
            Education for everyone.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-amu-sky/30 p-6 rounded-lg text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-heading text-xl font-semibold text-amu-navy mb-2">{title}</h3>
      <p className="font-body text-amu-charcoal">{description}</p>
    </div>
  );
}
